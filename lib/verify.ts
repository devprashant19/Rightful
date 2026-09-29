import { Requirement, VerifiedRequirement, PolicySource, DocumentInput, VerificationResult, Facts } from "@/lib/types";
import { computeDeadlineClock } from "@/lib/deadline";

/**
 * Standardizes text: lowercases, collapses whitespace, normalizes quotes/dashes, strips punctuation
 */
export function normalise(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B']/g, " ") // All single quotes to space
    .replace(/[\u201C\u201D\u201E\u201F"]/g, " ") // All double quotes to space
    .replace(/[\u2013\u2014]/g, "-") // En/em dashes
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ") // Punctuation to space
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Checks verbatim quote grounding using exact substring match with sliding token fallback (>= 0.90)
 */
export function verifyQuote(
  quote: string | null,
  sources: PolicySource[],
  citedSourceIds: string[]
): { verified: boolean; method?: "exact" | "fuzzy" | "failed" } {
  if (!quote || quote.trim().length === 0) return { verified: true }; // No quote claimed

  const normQuote = normalise(quote);
  const targetSources = sources.filter((s) => citedSourceIds.includes(s.id));
  const candidateSources = targetSources.length > 0 ? targetSources : sources;

  // Pass 1: Exact substring match
  for (const s of candidateSources) {
    const normSource = normalise(s.text);
    if (normSource.includes(normQuote)) {
      return { verified: true, method: "exact" };
    }
  }

  // Pass 2: Sliding-window token overlap (>= 90%)
  const quoteTokens = normQuote.split(" ").filter(Boolean);
  if (quoteTokens.length >= 4) {
    for (const s of candidateSources) {
      const sourceTokens = normalise(s.text).split(" ").filter(Boolean);
      const windowSize = quoteTokens.length;

      for (let i = 0; i <= sourceTokens.length - windowSize; i++) {
        const slice = sourceTokens.slice(i, i + windowSize + 1);
        const sliceSet = new Set(slice);
        let matches = 0;
        for (const qt of quoteTokens) {
          if (sliceSet.has(qt)) matches++;
        }
        if (matches / quoteTokens.length >= 0.9) {
          return { verified: true, method: "fuzzy" };
        }
      }
    }
  }

  return { verified: false, method: "failed" };
}

/**
 * Executes complete deterministic verification suite
 */
export function verifyRequirements(
  rawReqs: Requirement[],
  facts: Facts,
  docs: DocumentInput[],
  sources: PolicySource[],
  now: Date = new Date()
): VerificationResult {
  const docIdSet = new Set(docs.map((d) => d.id));
  const sourceIdSet = new Set(sources.map((s) => s.id));
  const officialSourceIds = new Set(sources.filter((s) => s.is_official).map((s) => s.id));

  const verifiedList: VerifiedRequirement[] = [];

  for (const req of rawReqs) {
    const notes: string[] = [];
    let finalStatus = req.status;

    // 1. Citation validity check
    const validDocIds = req.doc_ids.filter((id) => docIdSet.has(id));
    const validSourceIds = req.source_ids.filter((id) => sourceIdSet.has(id));

    if (validDocIds.length < req.doc_ids.length || validSourceIds.length < req.source_ids.length) {
      notes.push("Removed non-existent citation IDs.");
    }
    if (validDocIds.length === 0 && validSourceIds.length === 0 && req.status === "supported") {
      finalStatus = "ambiguous";
      notes.push("Downgraded: Row lost all valid citations.");
    }

    // 2. Quote verification
    const quoteCheck = verifyQuote(req.policy_quote, sources, validSourceIds);
    if (!quoteCheck.verified) {
      if (finalStatus === "supported") {
        finalStatus = "ambiguous";
        notes.push("Downgraded: Policy quote could not be grounded in retrieved page text.");
      }
    } else if (req.policy_quote) {
      notes.push(`Quote verified via ${quoteCheck.method} match.`);
    }

    // 3. Official source authority check
    const hasOfficialSource = validSourceIds.some((id) => officialSourceIds.has(id));
    if (!hasOfficialSource && validSourceIds.length > 0 && finalStatus === "supported") {
      finalStatus = "ambiguous";
      notes.push("Downgraded: Supported claim relies solely on third-party sources.");
    }

    // 4. Date arithmetic validation
    let dateCheckResult: VerifiedRequirement["date_check"] = undefined;
    if (req.window_days && req.window_days > 0) {
      const basisDateStr =
        req.window_start === "delivery" && facts.delivery_date?.value
          ? facts.delivery_date.value
          : facts.purchase_date?.value;

      if (basisDateStr) {
        const basisDate = new Date(basisDateStr);
        const elapsedDays = Math.floor((now.getTime() - basisDate.getTime()) / (1000 * 60 * 60 * 24));
        const isWithin = elapsedDays <= req.window_days;

        let overridden = false;
        if (isWithin && finalStatus === "not_met") {
          finalStatus = "supported";
          overridden = true;
          notes.push(`Code override: Within window (${elapsedDays}d elapsed <= ${req.window_days}d allowed).`);
        } else if (!isWithin && finalStatus === "supported") {
          finalStatus = "not_met";
          overridden = true;
          notes.push(`Code override: Window expired (${elapsedDays}d elapsed > ${req.window_days}d allowed).`);
        }

        dateCheckResult = {
          days_elapsed: elapsedDays,
          window_days: req.window_days,
          is_within: isWithin,
          overridden,
        };
      }
    }

    verifiedList.push({
      ...req,
      doc_ids: validDocIds,
      source_ids: validSourceIds,
      model_status: req.status,
      final_status: finalStatus,
      quote_verified: quoteCheck.verified,
      quote_match_method: quoteCheck.method,
      citation_valid: validDocIds.length > 0 || validSourceIds.length > 0,
      date_check: dateCheckResult,
      verifier_notes: notes,
    });
  }

  // 5. Calculate Claim Strength Score (0 to 100)
  let totalWeight = 0;
  let earnedScore = 0;

  for (const vr of verifiedList) {
    // Window & eligibility requirements carry 2x weight
    const isCritical = Boolean(vr.window_days || /eligib|defect|proof of purchase|order/i.test(vr.requirement));
    const weight = isCritical ? 2 : 1;
    totalWeight += weight;

    if (vr.final_status === "supported") earnedScore += 1.0 * weight;
    else if (vr.final_status === "ambiguous") earnedScore += 0.5 * weight;
  }

  const strengthScore = totalWeight > 0 ? Math.round((earnedScore / totalWeight) * 100) : 0;
  let verdict: VerificationResult["verdict"] = "Weak claim - gather the missing evidence first";
  if (strengthScore >= 75) verdict = "Strong claim";
  else if (strengthScore >= 50) verdict = "Reasonable claim - address the gaps";

  // 6. Compute Deadline Clock
  const deadline = computeDeadlineClock(verifiedList, facts, now);

  return {
    requirements: verifiedList,
    strength_score: strengthScore,
    verdict,
    deadline,
  };
}
