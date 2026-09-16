import { Facts } from "@/lib/types";

export interface ResearchPlan {
  queries: string[];
  official_domain: string | null;
  policy_types: ("return" | "refund" | "warranty")[];
}

export const PLAN_RESEARCH_SYSTEM = `You are an expert consumer rights researcher.
Given extracted purchase facts, plan 2 to 3 targeted web search queries to locate the seller's OFFICIAL policy page.
RULES:
1. Generate between 2 and 3 queries max.
2. Queries must name the seller, product category, and specific policy needed (e.g. "Apple return policy electronics days US").
3. Determine official_domain if identifiable (e.g. "apple.com", "bestbuy.com", "zara.com").
4. Return ONLY a valid JSON object matching the schema.`;

export function buildPlanPrompt(facts: Facts): string {
  return `SELLER: ${facts.seller.value}
PRODUCT: ${facts.product.value}
CLAIM TYPE: ${facts.claim_type}
COUNTRY: ${facts.country || "Unspecified"}
SELLER DOMAIN GUESS: ${facts.seller_domain_guess || "None"}

Generate the research plan JSON:
{
  "queries": string[],
  "official_domain": string | null,
  "policy_types": ("return" | "refund" | "warranty")[]
}`;
}

export function validatePlan(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["Root is not an object"] };

  if (!Array.isArray(data.queries) || data.queries.length === 0) {
    errors.push("Missing or empty queries array");
  } else if (data.queries.length > 4) {
    data.queries = data.queries.slice(0, 3);
  }

  return { valid: errors.length === 0, errors };
}

