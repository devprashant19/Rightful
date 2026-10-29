import { Facts, DocumentInput, PolicySource, Requirement } from "@/lib/types";

export const MATRIX_SYSTEM_PROMPT = `You are a meticulous consumer-claims legal analyst.
Your task is to analyze the user's purchase evidence (D ids) against the seller's official policy sources (S ids) and produce an itemized requirements checklist.

RULES:
1. Identify 3 to 7 explicit requirements set by the policy for this claim (e.g. return window, proof of purchase, condition of item, proof of defect, packaging requirements, exclusions).
2. For each requirement, determine status strictly:
   - "supported": Evidence exists in user documents fulfilling this requirement.
   - "ambiguous": Evidence is partial, contradictory, or policy terms are unclear.
   - "missing": Requirement exists in policy, but user has not yet provided proof.
   - "not_met": Evidence proves the requirement was violated (e.g. claim filed past deadline).
3. policy_quote: MUST BE COPIED VERBATIM from one of the policy sources (max 40 words). Never paraphrase or invent policy text. If no exact sentence applies, return null.
4. window_days & window_start: If the requirement specifies a time window, return window_days (integer) and window_start ("purchase" | "delivery"). Otherwise null.
5. doc_ids & source_ids: List the exact citation IDs (e.g. ["D1"], ["S1"]).
6. ask_user: If missing or ambiguous, provide one clear instruction on what evidence to provide.
7. Output ONLY a valid JSON object matching { "requirements": [...], "summary": string }.
8. Output the JSON minified on a single line: no pretty-printing, no markdown fences, and nothing whatsoever after the closing brace.`;

export function buildMatrixPrompt(facts: Facts, docs: DocumentInput[], sources: PolicySource[]): string {
  const formattedDocs = docs
    .map((d) => `[DOCUMENT ${d.id}]: ${d.name}\n${d.content}`)
    .join("\n\n");

  const formattedSources = sources
    .map((s) => `[SOURCE ${s.id}]: ${s.title} (${s.url})\nOfficial: ${s.is_official}\nText:\n${s.text.slice(0, 6000)}`)
    .join("\n\n");

  return `EXTRACTED FACTS:
${JSON.stringify(facts, null, 2)}

USER DOCUMENTS:
${formattedDocs || "No user documents attached."}

POLICY SOURCES:
${formattedSources || "No policy sources retrieved."}

Analyze every requirement and return the JSON matrix:
{
  "requirements": [
    {
      "id": "R1",
      "requirement": string,
      "status": "supported" | "ambiguous" | "missing" | "not_met",
      "evidence": string,
      "doc_ids": string[],
      "source_ids": string[],
      "policy_quote": string | null,
      "window_days": number | null,
      "window_start": "purchase" | "delivery" | null,
      "ask_user": string | null
    }
  ],
  "summary": string
}`;
}

export function validateMatrix(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["Root is not an object"] };

  if (!Array.isArray(data.requirements) || data.requirements.length === 0) {
    errors.push("Missing or empty requirements array");
  } else {
    for (const req of data.requirements) {
      if (!req.id || !req.requirement) errors.push("Requirement missing id or requirement title");
      if (!["supported", "ambiguous", "missing", "not_met"].includes(req.status)) {
        errors.push(`Invalid requirement status: ${req.status}`);
      }
      if (!Array.isArray(req.doc_ids)) req.doc_ids = [];
      if (!Array.isArray(req.source_ids)) req.source_ids = [];
    }
  }

  return { valid: errors.length === 0, errors };
}

