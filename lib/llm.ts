import { getEnv } from "@/lib/env";

export interface LlmCallOptions {
  step: string;
  model: string;
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
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

/**
 * Strips <think>...</think> reasoning tags emitted by reasoning models
 */
export function stripThinkingTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * Extracts the first valid JSON object enclosed in {...}
 */
export function extractFirstJsonObject(text: string): string {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in model output.");
  }
  return text.substring(firstBrace, lastBrace + 1);
}

export async function callNemotron<T>(options: LlmCallOptions): Promise<LlmCallResult<T>> {
  const env = getEnv();
  const startTime = Date.now();

  if (!env.nebiusKey) {
    throw new LlmError(options.step, 500, "NEBIUS_API_KEY is not configured.");
  }

  const executeCall = async (userPrompt: string, sendJsonFormat = true) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s serverless timeout

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
        // Fallback: If model rejects response_format param, retry without it
        if (res.status === 400 && errorText.includes("response_format") && sendJsonFormat) {
          return executeCall(userPrompt, false);
        }
        throw new LlmError(options.step, res.status, errorText);
      }

      const json = await res.json();
      return json;
    } finally {
      clearTimeout(timeout);
    }
  };

  // Attempt 1
  const apiResponse = await executeCall(options.user);
  const rawContent = apiResponse.choices[0]?.message?.content || "";
  const cleanContent = stripThinkingTags(rawContent);

  const parseAndValidate = (text: string) => {
    if (!options.json) return text as unknown as T;
    const jsonStr = extractFirstJsonObject(text);
    const parsed = JSON.parse(jsonStr);
    if (options.validator) {
      const validation = options.validator(parsed);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join("; ")}`);
      }
    }
    return parsed as T;
  };

  try {
    const parsedData = parseAndValidate(cleanContent);
    const latency = Date.now() - startTime;
    return {
      data: parsedData,
      meta: {
        model: apiResponse.model || options.model,
        latency_ms: latency,
        prompt_tokens: apiResponse.usage?.prompt_tokens || 0,
        completion_tokens: apiResponse.usage?.completion_tokens || 0,
      },
    };
  } catch (firstError: any) {
    // Attempt 2: Self-repair retry
    const retryPrompt = `${options.user}\n\n[SYSTEM NOTICE]: Your previous response failed verification: ${firstError.message}. Please output ONLY a valid JSON object matching the required schema with zero conversational filler.`;

    const retryResponse = await executeCall(retryPrompt);
    const retryRaw = retryResponse.choices[0]?.message?.content || "";
    const retryClean = stripThinkingTags(retryRaw);
    const finalData = parseAndValidate(retryClean);
    const latency = Date.now() - startTime;

    return {
      data: finalData,
      meta: {
        model: retryResponse.model || options.model,
        latency_ms: latency,
        prompt_tokens: (apiResponse.usage?.prompt_tokens || 0) + (retryResponse.usage?.prompt_tokens || 0),
        completion_tokens: (apiResponse.usage?.completion_tokens || 0) + (retryResponse.usage?.completion_tokens || 0),
      },
    };
  }
}

