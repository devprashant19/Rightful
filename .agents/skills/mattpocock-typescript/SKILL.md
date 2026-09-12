---
name: mattpocock-typescript
description: Strict TypeScript engineering skills: narrow discriminated unions, runtime validators, zero `any`, inference-first patterns, and data contract integrity.
---

# Matt Pocock: Strict TypeScript Engineering

## 1. Zero `any` Policy
- Never use `any` to silence compiler errors. Use `unknown` with type narrowing, custom type guards, or validated schemas.
- Turn on TypeScript strict mode: `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`.

## 2. Discriminated Unions for State & Events
Model asynchronous states and streaming events using explicit discriminators:
```typescript
export type NDJSONEvent =
  | { type: "step"; step: string; status: "running" | "done" }
  | { type: "facts"; data: Facts }
  | { type: "sources"; data: PolicySource[] }
  | { type: "requirements"; data: Requirement[] }
  | { type: "verification"; data: VerificationResult }
  | { type: "error"; message: string; recoverable: boolean };
```

## 3. Pure Runtime Validation
- Don't assume API or LLM responses match TypeScript types at runtime.
- Always run lightweight, hand-crafted validator functions (`validateFacts(data)`, `validateRequirements(data)`) to guarantee structural integrity before downstream consumption.
