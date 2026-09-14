---
name: superpowers
description: Core software engineering workflows including structured planning, test-driven development (TDD), systematic debugging, and verification-before-completion. Use in every phase to verify changes with real commands before asserting completion.
---

# Superpowers: High-Discipline Engineering Workflows

## 1. Structured Planning Workflow
- Always break complex tasks into numbered, bite-sized phases with measurable acceptance criteria.
- State explicitly: (1) what will change, (2) which files are created or modified, and (3) exact commands to verify.
- Never move to the next phase until the current phase's acceptance tests pass.

## 2. Test-Driven Development (TDD) Workflow
- **Red:** Write the pure test or verification script *first* (e.g. for deterministic verifier quote matching and date math).
- **Green:** Write the minimal implementation required to make the test pass.
- **Refactor:** Clean up code, remove duplication, and optimize while keeping all tests passing.

## 3. Systematic Debugging Workflow
- When a bug occurs:
  1. **Do not guess or apply random patches.**
  2. Reproduce the failure with a minimal standalone command or test case.
  3. Trace the root cause through logs, stack traces, and data contracts.
  4. Fix the root cause with surgical precision.
  5. Verify that the reproduction command now succeeds.

## 4. Verification-Before-Completion (Mandatory Rule)
- **Never claim a phase is done based on assertion or hope.**
- Before stating completion, run real commands (`npm run build`, `npm run lint`, test runners, smoke scripts).
- Quote the real terminal output proving that:
  - Exit code is 0.
  - Zero TypeScript or lint errors exist.
  - The expected data structure or endpoint response is returned.
