import { Facts, DocumentInput } from "@/lib/types";

export const EXTRACT_FACTS_SYSTEM = `You are a forensic consumer claims intake agent.
Extract structured facts strictly from the provided user purchase documents.
CRITICAL RULES:
1. Use ONLY information explicitly stated in the documents, with one exception: if a SELLER HINT is supplied, it is an authoritative source for the seller field even when no document names the merchant. Never invent any other fact.
2. Every extracted fact MUST include the doc_id where it was found (e.g. "D1"). If the seller came from the SELLER HINT rather than a document, set its doc_id to null.
3. Format dates strictly as YYYY-MM-DD. If absent, set value to null. NEVER guess.
4. Infer claim_type from the user's problem: "return" | "refund" | "warranty" | "wrong_item" | "damaged".
5. seller_domain_guess: Provide ONLY if an official website/email domain is explicit or if it is an unmistakable global brand (e.g. "apple.com", "amazon.com"). Otherwise return null.
6. Return ONLY a valid JSON object matching the specified schema.
7. Output the JSON minified on a single line: no pretty-printing, no markdown fences, and nothing whatsoever after the closing brace.`;

export function buildExtractPrompt(documents: DocumentInput[], problemSummary: string, sellerHint?: string): string {
  const formattedDocs = documents
    .map((doc) => `--- DOCUMENT [${doc.id}]: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT [${doc.id}] ---`)
    .join("\n\n");

  return `USER COMPLAINT:
${problemSummary}
${sellerHint ? `SELLER HINT: ${sellerHint}` : ""}

PURCHASE DOCUMENTS:
${formattedDocs || "No documents attached. Infer facts solely from user complaint."}

Extract all facts and return JSON adhering to this exact shape (minified, one line):
{"seller":{"value":string,"doc_id":string|null},"seller_domain_guess":string|null,"product":{"value":string,"doc_id":string},"order_id":{"value":string,"doc_id":string}|null,"purchase_date":{"value":"YYYY-MM-DD","doc_id":string}|null,"delivery_date":{"value":"YYYY-MM-DD","doc_id":string}|null,"price":{"value":{"amount":number,"currency":string},"doc_id":string}|null,"claim_type":"return"|"refund"|"warranty"|"wrong_item"|"damaged","problem_summary":string,"country":string|null}`;
}

export function validateFacts(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["Root is not an object"] };

  // seller is deliberately NOT required here. A receipt often does not name the
  // merchant, in which case the model correctly returns null and the route
  // backfills from the caller-supplied seller hint. Requiring it here failed
  // every attempt and collapsed the whole run to the replay trace.
  if (!data.product?.value) errors.push("Missing product.value");
  if (!["return", "refund", "warranty", "wrong_item", "damaged"].includes(data.claim_type)) {
    errors.push(`Invalid claim_type: ${data.claim_type}`);
  }

  return { valid: errors.length === 0, errors };
}

