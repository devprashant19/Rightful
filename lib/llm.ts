import { getEnv } from "@/lib/env";

export interface LlmCallOptions {
  step: string;
  model: string;
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  /** Hard ceiling for this call. Keeps a single step from eating the serverless budget. */
  timeoutMs?: number;
  validator?: (data: any) => { valid: boolean; errors?: string[] };
}

export interface LlmMeta {
  model: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface LlmCallResult<T> {
  data: T;
  meta: LlmMeta;
}

export class LlmError extends Error {
  constructor(public step: string, public statusCode: number, message: string) {
    super(`[${step}] LLM Error (${statusCode}): ${message}`);
    this.name = "LlmError";
  }
}

const MAX_ATTEMPTS = 3;
const TRANSIENT_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

/**
 * Strips <think>...</think> reasoning emitted by Nemotron reasoning models.
 *
 * A response truncated by max_tokens leaves an unclosed <think>, so everything
 * from that tag onward is incomplete reasoning rather than answer content and
 * must be discarded -- otherwise the opening tag survives into the JSON parse
 * and produces a misleading "No JSON object found" on what is really truncation.
 */
export function stripThinkingTags(text: string): string {
  let out = text.replace(/<think>[\s\S]*?<\/think>/gi, "");

  const orphanClose = out.lastIndexOf("</think>");
  if (orphanClose !== -1) out = out.slice(orphanClose + "</think>".length);

  const unclosed = out.search(/<think>/i);
  if (unclosed !== -1) out = out.slice(0, unclosed);

  return out.trim();
}

/**
 * Extracts the first complete JSON object using a brace-depth scan.
 *
 * Scanning to the *last* closing brace breaks whenever the model appends
 * commentary that contains braces, and counting braces naively breaks on
 * braces inside string literals -- so string and escape state are tracked.
 */
export function extractFirstJsonObject(text: string): string {
  const unfenced = text.replace(/```(?:json)?/gi, "");
  const start = unfenced.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in model output.");

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < unfenced.length; i++) {
    const ch = unfenced[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return unfenced.slice(start, i + 1);
    }
  }

  throw new Error("No JSON object found in model output (unterminated object).");
}

/** Repairs the malformed JSON these models actually emit: trailing commas. */
export function repairJson(jsonStr: string): string {
  return jsonStr.replace(/,(\s*[}\]])/g, "$1");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callNemotron<T>(options: LlmCallOptions): Promise<LlmCallResult<T>> {
  const env = getEnv();
  const startTime = Date.now();

  if (!env.nebiusKey) {
    throw new LlmError(options.step, 500, "NEBIUS_API_KEY is not configured.");
  }

  const budgetMs = options.timeoutMs ?? 45000;

  const executeCall = async (userPrompt: string, sendJsonFormat = true): Promise<any> => {
    const remaining = budgetMs - (Date.now() - startTime);
    if (remaining <= 1000) {
      throw new LlmError(options.step, 504, `Time budget exhausted (${budgetMs}ms).`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), remaining);

    const requestBody: any = {
      model: options.model,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: userPrompt },
      ],
      temperature: options.temperature ?? 0.1,
      max_tokens: options.maxTokens ?? 2048,
    };

    if (options.json && sendJsonFormat) {
      requestBody.response_format = { type: "json_object" };
    }

    try {
      const res = await fetch(`${env.nebiusBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.nebiusKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        // Fallback: if the model rejects response_format, retry without it.
        if (res.status === 400 && errorText.includes("response_format") && sendJsonFormat) {
          return executeCall(userPrompt, false);
        }
        throw new LlmError(options.step, res.status, errorText);
      }

      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  const parseAndValidate = (text: string): T => {
    if (!options.json) return text as unknown as T;

    const jsonStr = extractFirstJsonObject(text);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Second chance before burning a whole retry on a stray trailing comma.
      parsed = JSON.parse(repairJson(jsonStr));
    }

    if (options.validator) {
      const validation = options.validator(parsed);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join("; ")}`);
      }
    }
    return parsed as T;
  };

  let promptTokens = 0;
  let completionTokens = 0;
  let lastError: Error = new Error("No attempt was made.");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const userPrompt =
      attempt === 1
        ? options.user
        : `${options.user}\n\n[SYSTEM NOTICE]: Your previous response failed verification: ${lastError.message}. Output ONLY a valid JSON object matching the required schema, with zero conversational filler and no trailing commas.`;

    let apiResponse: any;
    try {
      apiResponse = await executeCall(userPrompt);
    } catch (err: any) {
      lastError = err;
      const transient =
        err instanceof LlmError ? TRANSIENT_STATUSES.has(err.statusCode) : err?.name === "AbortError";
      const timeLeft = budgetMs - (Date.now() - startTime) > 2000;

      if (transient && timeLeft && attempt < MAX_ATTEMPTS) {
        await sleep(Math.min(400 * attempt, 1200));
        continue;
      }
      throw err;
    }

    promptTokens += apiResponse.usage?.prompt_tokens || 0;
    completionTokens += apiResponse.usage?.completion_tokens || 0;

    const rawContent = apiResponse.choices[0]?.message?.content || "";

    try {
      const data = parseAndValidate(stripThinkingTags(rawContent));
      return {
        data,
        meta: {
          model: apiResponse.model || options.model,
          latency_ms: Date.now() - startTime,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
        },
      };
    } catch (parseErr: any) {
      lastError = parseErr;
      if (budgetMs - (Date.now() - startTime) <= 2000) break;
    }
  }

  throw new LlmError(
    options.step,
    422,
    `Model output failed verification after ${MAX_ATTEMPTS} attempts: ${lastError.message}`
  );
}
