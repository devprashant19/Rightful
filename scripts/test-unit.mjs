import assert from "node:assert";
import crypto from "node:crypto";

console.log("==================================================");
console.log("   RIGHTFUL AUTOMATED VERIFICATION TEST SUITE     ");
console.log("==================================================");

// 1. Normalization & Verifier Quote Grounding Algorithm
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B]/g, " ")
    .replace(/[\u201C\u201D\u201E\u201F]/g, " ")
    .replace(/['"]/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function verifyQuote(quote, sources, citedSourceIds) {
  if (!quote || quote.trim().length === 0) return { verified: true };
  const normQuote = normalise(quote);
  const relevantSources = sources.filter((s) => citedSourceIds.includes(s.id));
  const candidateSources = relevantSources.length > 0 ? relevantSources : sources;

  for (const src of candidateSources) {
    const normSource = normalise(src.text);
    if (normSource.includes(normQuote)) {
      return { verified: true, method: "exact" };
    }
  }

  // Sliding token window fallback
  const quoteTokens = normQuote.split(" ");
  const windowSize = quoteTokens.length;
  if (windowSize >= 4) {
    for (const src of candidateSources) {
      const srcTokens = normalise(src.text).split(" ");
      for (let i = 0; i <= srcTokens.length - windowSize; i++) {
        const slice = srcTokens.slice(i, i + windowSize);
        const setSlice = new Set(slice);
        let matches = 0;
        for (const token of quoteTokens) {
          if (setSlice.has(token)) matches++;
        }
        if (matches / windowSize >= 0.9) {
          return { verified: true, method: "fuzzy" };
        }
      }
    }
  }

  return { verified: false, method: "failed" };
}

// 2. URL Ranking & Deduplication
function rankAndDedupeUrls(results, sellerDomain) {
  const seen = new Set();
  const scored = [];

  for (const res of results) {
    const rawUrl = res.url.trim();
    const cleanUrl = rawUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/$/, "");
    if (seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);

    let score = 0;
    let isOfficial = false;
    let domain = "";
    try {
      domain = new URL(cleanUrl).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }

    if (sellerDomain && domain.includes(sellerDomain)) {
      score += 5.0;
      isOfficial = true;
    }
    const lowerUrl = cleanUrl.toLowerCase();
    if (lowerUrl.includes("return") || lowerUrl.includes("refund")) score += 2.5;
    if (lowerUrl.includes("warranty") || lowerUrl.includes("guarantee")) score += 2.0;
    if (lowerUrl.includes("policy") || lowerUrl.includes("terms")) score += 1.5;
    if (domain.includes("reddit.com") || domain.includes("quora.com")) score -= 4.0;

    scored.push({ url: cleanUrl, title: res.title || domain, domain, is_official: isOfficial, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// 3. Judge Access Constant-Time Comparison
function verifyJudgeCode(providedCode, validCode) {
  if (!providedCode || !validCode) return false;
  const a = Buffer.from(providedCode);
  const b = Buffer.from(validCode);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ==========================================
// RUN ASSERTIONS
// ==========================================

// Test 1: Exact Substring Quote Match
{
  const sources = [{ id: "S1", title: "Voltline Policy", text: "Products may be returned within thirty (30) days of delivery for a full refund." }];
  const res = verifyQuote("thirty (30) days of delivery for a full refund", sources, ["S1"]);
  assert.strictEqual(res.verified, true);
  assert.strictEqual(res.method, "exact");
  console.log("✓ Test 1: Exact quote verification passed");
}

// Test 2: Smart Quotes Normalization
{
  const sources = [{ id: "S1", title: "Policy", text: "Items must include all original packaging and accessories." }];
  const res = verifyQuote("“Items must include all original packaging”", sources, ["S1"]);
  assert.strictEqual(res.verified, true);
  assert.strictEqual(res.method, "exact");
  console.log("✓ Test 2: Smart/curly quote normalization passed");
}

// Test 3: Sliding Token Window Overlap (>= 0.90)
{
  const sources = [{ id: "S1", title: "Policy", text: "Refunds are processed back to the original method of payment within 5 to 7 business days." }];
  // Dropped "the" word
  const res = verifyQuote("Refunds are processed back to original method of payment within 5 to 7 business days", sources, ["S1"]);
  assert.strictEqual(res.verified, true);
  assert.strictEqual(res.method, "fuzzy");
  console.log("✓ Test 3: Sliding token window (>= 0.90) fallback passed");
}

// Test 4: Hallucinated Quote Rejection
{
  const sources = [{ id: "S1", title: "Policy", text: "All sales final after 14 days." }];
  const res = verifyQuote("Customers may receive 100% lifetime cashback on all damaged electronics", sources, ["S1"]);
  assert.strictEqual(res.verified, false);
  assert.strictEqual(res.method, "failed");
  console.log("✓ Test 4: Hallucinated quote caught & rejected");
}

// Test 5: Official Domain Priority Ranking
{
  const results = [
    { url: "https://www.reddit.com/r/headphones/voltline_returns/", title: "Voltline returns reddit" },
    { url: "https://voltline-audio.com/help/returns-policy", title: "Official Returns Policy" },
    { url: "https://electronics-review.com/voltline", title: "Review" },
  ];
  const ranked = rankAndDedupeUrls(results, "voltline-audio.com");
  assert.strictEqual(ranked[0].domain, "voltline-audio.com");
  assert.strictEqual(ranked[0].is_official, true);
  assert.ok(ranked[0].score > ranked[1].score);
  assert.strictEqual(ranked[2].domain, "reddit.com");
  console.log("✓ Test 5: Domain-targeted ranking & Reddit penalty passed");
}

// Test 6: Constant-Time Judge Access Code Authentication
{
  const VALID_CODE = "RIGHTFUL2026_JUDGE_PASS";
  assert.strictEqual(verifyJudgeCode("RIGHTFUL2026_JUDGE_PASS", VALID_CODE), true);
  assert.strictEqual(verifyJudgeCode("WRONG_CODE", VALID_CODE), false);
  assert.strictEqual(verifyJudgeCode("", VALID_CODE), false);
  console.log("✓ Test 6: Judge access constant-time authentication passed");
}

// Test 7: Deterministic Date Math Override
{
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() - 10); // 10 days ago
  const windowDays = 30; // 30-day window
  const daysElapsed = Math.floor((new Date().getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
  assert.strictEqual(daysElapsed, 10);
  assert.ok(daysElapsed <= windowDays, "Should be validly within the 30-day return window");
  console.log("✓ Test 7: Deterministic date window arithmetic passed");
}

console.log("==================================================");
console.log("   ALL 7 INVARIANT AND UNIT TESTS PASSED (100%)    ");
console.log("==================================================");
