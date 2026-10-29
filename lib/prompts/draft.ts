import { Facts, VerifiedRequirement, PolicySource, ClaimDraft } from "@/lib/types";

export const DRAFT_SYSTEM_PROMPT = `You are an expert consumer advocacy writer.
Draft a concise, polite, yet legally firm claim email to the seller.

STRICT CONSTRAINTS:
1. Max length: under 220 words.
2. Cite policy terms ONLY from verified quotes in the provided requirements, including the source URL or title.
3. NEVER claim compliance with requirements stamped "missing" or "not_met".
4. If missing evidence exists, explicitly acknowledge it and ask the seller how they prefer it submitted.
5. Use placeholders for personal contact details: [Your Name], [Your Email].
6. Output ONLY a valid JSON object matching:
{
  "subject": string,
  "body": string,
  "form_fields": {
    "full_name": "[Your Name]",
    "email": "[Your Email]",
    "order_id": string,
    "product": string,
    "purchase_date": string,
    "issue_category": string,
    "requested_resolution": "refund" | "replacement" | "repair",
    "description": string
  },
  "missing": string[]
}
7. Output the JSON minified on a single line: no pretty-printing, no markdown fences, and nothing whatsoever after the closing brace.`;

export function buildDraftPrompt(facts: Facts, verifiedReqs: VerifiedRequirement[], sources: PolicySource[]): string {
  const verifiedTerms = verifiedReqs
    .filter((r) => r.quote_verified && r.policy_quote)
    .map((r) => `- ${r.requirement}: "${r.policy_quote}" (Status: ${r.final_status})`)
    .join("\n");

  const missingList = verifiedReqs
    .filter((r) => r.final_status === "missing" || r.final_status === "ambiguous")
    .map((r) => `- ${r.requirement}: ${r.ask_user || "Additional evidence needed"}`)
    .join("\n");

  return `FACTS:
Seller: ${facts.seller.value}
Product: ${facts.product.value}
Order ID: ${facts.order_id?.value || "N/A"}
Purchase Date: ${facts.purchase_date?.value || "N/A"}
Delivery Date: ${facts.delivery_date?.value || "N/A"}
Problem: ${facts.problem_summary}
Claim Type: ${facts.claim_type}

VERIFIED POLICY TERMS:
${verifiedTerms || "Standard statutory consumer rights apply."}

OUTSTANDING GAPS:
${missingList || "None. All requirements met."}

Generate the claim draft JSON:`;
}

export function validateDraft(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["Root is not an object"] };

  if (!data.subject) errors.push("Missing subject");
  if (!data.body) errors.push("Missing body");
  if (!data.form_fields || typeof data.form_fields !== "object") errors.push("Missing form_fields object");
  if (!Array.isArray(data.missing)) data.missing = [];

  return { valid: errors.length === 0, errors };
}

