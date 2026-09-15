import { Facts, DocumentInput } from "@/lib/types";

export const EXTRACT_FACTS_SYSTEM = `You are a forensic consumer claims intake agent.
Extract structured facts strictly from the provided user purchase documents.
CRITICAL RULES:
1. Use ONLY information explicitly stated in the documents. Never invent facts.
2. Every extracted fact MUST include the doc_id where it was found (e.g. "D1").
3. Format dates strictly as YYYY-MM-DD. If absent, set value to null. NEVER guess.
4. Infer claim_type from the user's problem: "return" | "refund" | "warranty" | "wrong_item" | "damaged".
5. seller_domain_guess: Provide ONLY if an official website/email domain is explicit or if it is an unmistakable global brand (e.g. "apple.com", "amazon.com"). Otherwise return null.
6. Return ONLY a valid JSON object matching the specified schema.`;

export function buildExtractPrompt(documents: DocumentInput[], problemSummary: string, sellerHint?: string): string {
  const formattedDocs = documents
    .map((doc) => `--- DOCUMENT [${doc.id}]: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT [${doc.id}] ---`)
    .join("\n\n");

  return `USER COMPLAINT:
${problemSummary}
${sellerHint ? `SELLER HINT: ${sellerHint}` : ""}

PURCHASE DOCUMENTS:
${formattedDocs || "No documents attached. Infer facts solely from user complaint."}

Extract all facts and return JSON adhering to:
{
  "seller": { "value": string, "doc_id": string },
  "seller_domain_guess": string | null,
  "product": { "value": string, "doc_id": string },
  "order_id": { "value": string, "doc_id": string } | null,
  "purchase_date": { "value": "YYYY-MM-DD", "doc_id": string } | null,
  "delivery_date": { "value": "YYYY-MM-DD", "doc_id": string } | null,
  "price": { "value": { "amount": number, "currency": string }, "doc_id": string } | null,
  "claim_type": "return" | "refund" | "warranty" | "wrong_item" | "damaged",
  "problem_summary": string,
  "country": string | null
}`;
}

export function validateFacts(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["Root is not an object"] };

  if (!data.seller?.value) errors.push("Missing seller.value");
  if (!data.product?.value) errors.push("Missing product.value");
  if (!["return", "refund", "warranty", "wrong_item", "damaged"].includes(data.claim_type)) {
    errors.push(`Invalid claim_type: ${data.claim_type}`);
  }

  return { valid: errors.length === 0, errors };
}

