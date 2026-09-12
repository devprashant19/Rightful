---
name: ponytail
description: Deliberate algorithmic thinking before acting. Forces deep contemplation of edge cases, mathematical correctness, boundary conditions, and formal verification.
---

# Ponytail: Deliberate Algorithmic Thinking

## 1. Think Before Coding
- Before writing a single line of implementation for complex logic (such as the deterministic verifier or date arithmetic), write down:
  1. All possible edge cases and boundary conditions.
  2. The exact mathematical formulas and truth tables.
  3. What happens when inputs are missing, corrupted, or contradictory.

## 2. Edge Cases for Deterministic Policy Verification
- **Quotes:**
  - What if the model outputs smart/curly quotes (`“ ”`) while the source text has straight quotes (`" "`)? -> *Normalized first.*
  - What if the model paraphrases slightly? -> *Sliding-window token overlap fallback ($\ge 0.90$).*
  - What if the quote is completely hallucinated? -> *Downgraded to ambiguous with explanation.*
- **Dates:**
  - What if delivery date is missing? -> *Fallback to purchase date.*
  - What if today is on a month boundary or leap year? -> *Use UTC timestamp difference.*
  - What if the return window expired yesterday? -> *Flag as not_met and compute days elapsed.*
