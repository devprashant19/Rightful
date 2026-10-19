---
name: webapp-testing
description: Playwright-based end-to-end testing practices, visual assertions, user journeys, edge-case simulations, and network mock testing for modern web apps.
---

# WebApp Testing: Playwright E2E Best Practices

## 1. Test Real User Journeys
- Don't just test individual component units. Test the critical path that judges and real users will experience:
  1. Select a benchmark sample case.
  2. Click **Build my claim**.
  3. Verify all live steps complete.
  4. Verify Proof Ledger stamps render and display citations.
  5. Open the sandbox portal and verify typing animation.
  6. Confirm that the human-in-the-loop approval checkbox unlocks the submission button.

## 2. Flake-Free Assertions
- Use web-first assertions with automatic retries: `await expect(locator).toBeVisible({ timeout: 15000 })`.
- Never use arbitrary `sleep` or `waitForTimeout`. Wait for specific DOM elements or network event streams to finish.

## 3. Resilience & Rate-Limit Testing
- Test edge cases automatically:
  - Submit empty form inputs and assert validation guidance.
  - Test simulated API errors and verify that recoverable alerts appear without crashing the UI.
  - Verify that the judge authorization code bypasses rate limits under high request volume.
