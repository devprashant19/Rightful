import { Facts, PolicySource, VerificationResult, ClaimDraft, RunLogEntry } from "@/lib/types";

export const MOCK_FACTS: Facts = {
  seller: { value: "Voltline Electronics", doc_id: "D1" },
  seller_domain_guess: "voltline.internal",
  product: { value: "AeroSound Pro Wireless Earbuds", doc_id: "D1" },
  order_id: { value: "DEMO-VL-89412", doc_id: "D1" },
  purchase_date: { value: "2026-10-09", doc_id: "D1" },
  delivery_date: { value: "2026-10-12", doc_id: "D1" },
  price: { value: { amount: 129.99, currency: "USD" }, doc_id: "D1" },
  claim_type: "warranty",
  problem_summary: "Right earbud stopped charging after 19 days of normal use.",
  country: "US",
};

export const MOCK_SOURCES: PolicySource[] = [
  {
    id: "S1",
    url: "/policies/voltline",
    title: "Voltline Electronics - Official Return & Warranty Policy",
    domain: "voltline.internal",
    is_official: true,
    text: `Voltline Electronics provides a 30-day return policy from the date of delivery for all consumer audio products. Items in original condition may be returned for a full refund or replacement. Proof of purchase is required. In addition, all hardware products carry a 1-year limited warranty against manufacturing defects from the date of purchase. For warranty claims on audio products failing to charge or maintain power, proof of defect via photo or short video is required before a return merchandise authorization (RMA) is generated. Original retail packaging is not required for verified warranty claims involving hardware defects.`,
    retrieved_at: new Date().toISOString(),
  },
];

export const MOCK_VERIFICATION: VerificationResult = {
  strength_score: 82,
  verdict: "Strong claim",
  deadline: {
    return_window_days: 30,
    return_deadline: "2026-11-11",
    days_left_return: 11,
    warranty_months: 12,
    warranty_end: "2027-10-09",
    basis: "delivery",
    source_ids: ["S1"],
    is_confirmed: true,
  },
  requirements: [
    {
      id: "R1",
      requirement: "Claim submitted within 30 days of delivery",
      status: "supported",
      model_status: "supported",
      final_status: "supported",
      evidence: "Delivered on 2026-10-12. Exactly 19 days have elapsed, leaving 11 days remaining.",
      doc_ids: ["D1"],
      source_ids: ["S1"],
      policy_quote: "Voltline Electronics provides a 30-day return policy from the date of delivery for all consumer audio products.",
      window_days: 30,
      window_start: "delivery",
      ask_user: null,
      quote_verified: true,
      quote_match_method: "exact",
      citation_valid: true,
      date_check: { days_elapsed: 19, window_days: 30, is_within: true, overridden: false },
      verifier_notes: ["Quote matches S1 verbatim.", "Date math recomputed: 19 days <= 30 days."],
    },
    {
      id: "R2",
      requirement: "Valid proof of purchase provided",
      status: "supported",
      model_status: "supported",
      final_status: "supported",
      evidence: "Order confirmation D1 contains order DEMO-VL-89412 and purchase date.",
      doc_ids: ["D1"],
      source_ids: ["S1"],
      policy_quote: "Proof of purchase is required.",
      window_days: null,
      window_start: null,
      ask_user: null,
      quote_verified: true,
      quote_match_method: "exact",
      citation_valid: true,
      verifier_notes: ["Quote verified in source S1."],
    },
    {
      id: "R3",
      requirement: "Proof of hardware defect provided",
      status: "missing",
      model_status: "missing",
      final_status: "missing",
      evidence: "User stated the earbud stopped charging, but no photo or video has been attached yet.",
      doc_ids: ["D1"],
      source_ids: ["S1"],
      policy_quote: "For warranty claims on audio products failing to charge or maintain power, proof of defect via photo or short video is required before a return merchandise authorization (RMA) is generated.",
      window_days: null,
      window_start: null,
      ask_user: "Add a photo or 10-second video showing the right earbud LED failing to light up while in the charging case.",
      quote_verified: true,
      quote_match_method: "exact",
      citation_valid: true,
      verifier_notes: ["Policy requirement is verified, but proof document is currently missing."],
    },
  ],
};

export const MOCK_DRAFT: ClaimDraft = {
  subject: "Warranty Claim: AeroSound Pro Earbuds - Order DEMO-VL-89412",
  body: `Dear Voltline Support Team,

I am writing to file a warranty claim for my AeroSound Pro Wireless Earbuds (Order #DEMO-VL-89412, delivered on October 12, 2026).

After 19 days of normal use, the right earbud ceased charging. Per your published warranty policy: "all hardware products carry a 1-year limited warranty against manufacturing defects." Furthermore, as this issue has arisen within the 30-day return window ("Voltline Electronics provides a 30-day return policy from the date of delivery"), I request a warranty replacement or refund.

Proof of purchase is confirmed from the attached order details. Please advise on how to submit the defect video note for authorization.

Sincerely,
[Your Name]`,
  form_fields: {
    full_name: "[Your Name]",
    email: "[Your Email]",
    order_id: "DEMO-VL-89412",
    product: "AeroSound Pro Wireless Earbuds",
    purchase_date: "2026-10-09",
    issue_category: "Hardware Defect / Failure to Charge",
    requested_resolution: "replacement",
    description: "Right earbud stopped charging after 19 days of normal use.",
  },
  missing: ["Proof of defect (photo/video of charging failure)"],
};

export const MOCK_RUN_LOG: RunLogEntry[] = [
  { step: "extract_facts", model: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B", latency_ms: 1240, tokens: { prompt_tokens: 850, completion_tokens: 180 }, timestamp: new Date().toISOString() },
  { step: "plan_research", model: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B", latency_ms: 890, tokens: { prompt_tokens: 420, completion_tokens: 95 }, timestamp: new Date().toISOString() },
  { step: "tavily_search", model: "tavily-search-v1", latency_ms: 610, timestamp: new Date().toISOString() },
  { step: "tavily_extract", model: "tavily-extract-v1", latency_ms: 1120, timestamp: new Date().toISOString() },
  { step: "evidence_matrix", model: "nvidia/nemotron-3-super-120b-a12b", latency_ms: 3410, tokens: { prompt_tokens: 2840, completion_tokens: 520 }, timestamp: new Date().toISOString() },
  { step: "verify", model: "code-deterministic-engine", latency_ms: 12, timestamp: new Date().toISOString() },
  { step: "draft_claim", model: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B", latency_ms: 1530, tokens: { prompt_tokens: 1100, completion_tokens: 310 }, timestamp: new Date().toISOString() },
];
