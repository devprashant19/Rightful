import { callNemotron } from "@/lib/llm";
import { getEnv } from "@/lib/env";
import { VerifiedRequirement, PolicySource } from "@/lib/types";

export async function deepReviewAmbiguousRows(
  ambiguousRows: VerifiedRequirement[],
  sources: PolicySource[]
): Promise<VerifiedRequirement[]> {
  const env = getEnv();
  if (!env.ultraModel) return ambiguousRows;

  const prompt = `You are a high-level judicial consumer arbitrator.
The following requirements remain AMBIGUOUS due to conflicting or complex policy clauses:
${JSON.stringify(ambiguousRows, null, 2)}

Official Source Texts:
${sources.map((s) => `[SOURCE ${s.id}]:\n${s.text.slice(0, 6000)}`).join("\n\n")}

Perform a deep legal review. Can any of these ambiguities be decisively resolved in favor of the consumer based on standard statutory rules?
Return updated requirements JSON matching { "requirements": [...] }`;

  try {
    const result = await callNemotron<{ requirements: VerifiedRequirement[] }>({
      step: "deep_review",
      model: env.ultraModel,
      system: "You are the judicial arbitration pass. Resolve ambiguities with strict legal reasoning.",
      user: prompt,
      json: true,
    });
    return result.data.requirements || ambiguousRows;
  } catch (e) {
    console.warn("Ultra 550B deep review skipped or failed", e);
    return ambiguousRows;
  }
}

