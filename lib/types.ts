// Document and Evidence Intake Models
export interface DocumentInput {
  id: string; // e.g. "D1", "D2"
  name: string;
  type: "text" | "eml" | "pdf" | "image";
  content: string; // Truncated to max 12,000 chars
  sizeBytes?: number;
}

export interface ExtractedFact<T> {
  value: T;
  doc_id: string; // Must refer to an existing DocumentInput.id
}

export type ClaimType = "return" | "refund" | "warranty" | "wrong_item" | "damaged";

export interface Facts {
  seller: ExtractedFact<string>;
  seller_domain_guess: string | null;
  product: ExtractedFact<string>;
  order_id: ExtractedFact<string> | null;
  purchase_date: ExtractedFact<string> | null; // "YYYY-MM-DD"
  delivery_date: ExtractedFact<string> | null; // "YYYY-MM-DD"
  price: ExtractedFact<{ amount: number; currency: string }> | null;
  claim_type: ClaimType;
  problem_summary: string;
  country: string | null;
}

// Policy Sources (Tavily)
export interface PolicySource {
  id: string; // "S1", "S2", etc.
  url: string;
  title: string;
  domain: string;
  is_official: boolean;
  text: string; // Clean text up to 15,000 chars
  retrieved_at: string; // ISO 8601
}

// Evidence Matrix & Verification
export type RequirementStatus = "supported" | "ambiguous" | "missing" | "not_met";

export interface Requirement {
  id: string; // "R1", "R2", etc.
  requirement: string;
  status: RequirementStatus;
  evidence: string;
  doc_ids: string[];
  source_ids: string[];
  policy_quote: string | null; // Max 40 words, verbatim quote
  window_days: number | null;
  window_start: "purchase" | "delivery" | null;
  ask_user: string | null;
}

export interface VerifiedRequirement extends Requirement {
  model_status: RequirementStatus;
  final_status: RequirementStatus;
  quote_verified: boolean;
  quote_match_method?: "exact" | "fuzzy" | "failed";
  citation_valid: boolean;
  date_check?: {
    days_elapsed: number;
    window_days: number;
    is_within: boolean;
    overridden: boolean;
  };
  verifier_notes: string[];
}

export interface DeadlineClock {
  return_window_days: number | null;
  return_deadline: string | null; // "YYYY-MM-DD"
  days_left_return: number | null;
  warranty_months: number | null;
  warranty_end: string | null; // "YYYY-MM-DD"
  basis: "delivery" | "purchase" | null;
  source_ids: string[];
  is_confirmed: boolean;
}

export interface VerificationResult {
  requirements: VerifiedRequirement[];
  strength_score: number; // 0 to 100
  verdict: "Strong claim" | "Reasonable claim - address the gaps" | "Weak claim - gather the missing evidence first";
  deadline: DeadlineClock;
}

// Claim Draft & Form Fields
export interface ClaimDraft {
  subject: string;
  body: string;
  form_fields: {
    full_name: string;
    email: string;
    order_id: string;
    product: string;
    purchase_date: string;
    issue_category: string;
    requested_resolution: "refund" | "replacement" | "repair";
    description: string;
  };
  missing: string[];
}

// Telemetry & Streaming
export interface RunLogEntry {
  step: "extract_facts" | "plan_research" | "tavily_search" | "tavily_extract" | "evidence_matrix" | "verify" | "draft_claim" | "deep_review";
  model: string;
  latency_ms: number;
  tokens?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  timestamp: string;
}

export type NDJSONEvent =
  | { type: "step"; step: string; status: "running" }
  | { type: "step"; step: string; status: "done"; model: string; latency_ms: number; tokens?: { in: number; out: number } }
  | { type: "facts"; data: Facts }
  | { type: "sources"; data: PolicySource[] }
  | { type: "requirements"; data: Requirement[] }
  | { type: "verification"; data: VerificationResult }
  | { type: "claim"; data: ClaimDraft }
  | { type: "error"; step: string; message: string; recoverable: boolean }
  | { type: "done"; mode: "live" | "replay" };

