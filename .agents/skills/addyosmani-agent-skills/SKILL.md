---
name: addyosmani-agent-skills
description: Production-grade web engineering practices: performance optimization, WCAG accessibility, web vitals, bundle budgets, and deploy readiness.
---

# Addy Osmani Engineering Practices: Performance, A11y & Quality

## 1. Accessibility (WCAG 2.1 AA Compliance)
- **Contrast Ratios:** Text must have at least 4.5:1 contrast against surface backgrounds (3:1 for large headings $\ge 24\text{px}$).
- **Screen Reader Announcements:** Dynamic async updates (e.g. step transitions in the live tracker) must use `aria-live="polite"`.
- **Keyboard Traps & Navigation:** Ensure users can complete the entire claim pipeline using `Tab`, `Enter`, `Space`, and `Esc`.

## 2. Performance & Bundle Economics
- Zero bloated UI frameworks (no heavy component libraries, no 500KB CSS bundles).
- Keep initial JavaScript bundle under $100\text{KB}$ gzipped.
- Use native browser capabilities wherever possible:
  - Form validation via native HTML5 attributes.
  - Print optimization via `@media print` instead of heavy PDF rendering engines.
  - Streaming via native `ReadableStream` and `fetch`.

## 3. Serverless Execution Economics
- Bound serverless function duration explicitly: `export const maxDuration = 60;`.
- Stream NDJSON events immediately so Time-To-First-Byte (TTFB) is $< 500\text{ms}$, preventing user churn during long reasoning steps.
