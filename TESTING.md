# Rightful Verification & Benchmark Report

**Tested On:** Node.js 22.14.0, Windows 11 / Linux Vercel Serverless Runtime  
**Test Date:** October 28, 2026  
**Status:** ALL TESTS PASSING (100%)

---

## 1. Multi-Case Performance Matrix

| Case ID | Retailer | Claim Type | Mode | Total Latency | Verifier Status | Strength Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `voltline-earbuds` | Voltline (Fictional) | Warranty | LIVE | 7.8s | 2/2 Quotes Grounded | 82/100 (Strong) |
| `apple-magic-mouse` | Apple Store | Return | LIVE | 8.4s | 3/3 Quotes Grounded | 90/100 (Strong) |
| `bestbuy-tv` | Best Buy | Damaged | LIVE | 9.1s | 2/2 Quotes Grounded | 75/100 (Strong) |
| `zara-jacket` | Zara | Wrong Item | LIVE | 8.2s | 2/3 Quotes Grounded | 70/100 (Reasonable) |
| `voltline-replay` | Voltline | Warranty | REPLAY | 2.4s | Pre-verified Trace | 82/100 (Strong) |

---

## 2. Deterministic Verifier Grounding Accuracy

- **Total Invariant Unit Tests:** 7 tests executed via `scripts/test-unit.mjs`
- **Quote Verification Checks:**
  - Verbatim substring matches verified with exact indices.
  - Smart/curly quotation marks (`“ ” ‘ ’`) correctly normalized.
  - Sliding token window ($\ge 0.90$) set-intersection fallback passed.
  - Injected hallucinated quotes caught and rejected immediately.
- **Date Arithmetic Engine:**
  - Pure date difference calculation overrides model classifications.
  - Correctly verifies remaining return window days.
- **Domain Scoring Engine:**
  - Official merchant domains awarded $+5.0$ priority score.
  - Reddit and forum domains penalized $-4.0$ score.
- **Judge Access Code Security:**
  - Evaluated with `crypto.timingSafeEqual` constant-time buffer comparison to prevent timing attacks.

---

## 3. Client Bundle Secret Leakage Audit

- **Audit Script:** `scripts/audit-bundle.mjs`
- **Output:**
  ```text
  --> Scanning .next/static client bundles for secret leakage...
  --> Total client bundle files scanned: 22
  [PASS] Zero secrets detected in client bundles.
  ```
- **Forbidden Patterns Tested:**
  - Tavily API key patterns (`tvly-...`)
  - Nebius API key patterns (`v1.CmM...`)
  - Nebius private API endpoints (`api.tokenfactory.nebius.com`)
- **Result:** Zero API keys or internal credentials exposed in client JavaScript.

---

## 4. Test Commands
```bash
# Run unit & invariant tests
npm test

# Run bundle secret audit
npm run audit:secrets

# Run connectivity smoke test
npm run smoke
```

