---
name: taste-skill
description: Aesthetic taste and restraint rules for coding agents. Guides color palette curation, motion restraint, copy tone, and elimination of decorative clutter.
---

# Taste: Restraint and Intentionality in Digital Products

## 1. Color Restraint
- One dominant neutral surface, one crisp text ink, one primary purposeful accent (`carbon-blue`), and semantic status colors.
- Status stamps must feel stamped:
  - `Supported`: Natural forest green (`#2E7D4F`)
  - `Ambiguous`: Dark honey amber (`#B7791F`)
  - `Missing`: Dashed cardinal red (`#B3261E`)
  - `Not met`: Solid cardinal red fill (`#B3261E`)
- Never introduce decorative accent colors that do not carry semantic meaning.

## 2. Motion Restraint
- Exactly **one intentional kinetic moment** per user interaction.
- In Rightful: the rubber stamp landing effect (`scale(1.15) -> 1.0` with $-2^\circ$ tilt over 180ms).
- Everything else transitions subtly ($< 150\text{ms}$) or renders instantly.
- Always implement `@media (prefers-reduced-motion: reduce)` to disable rotations and scaling.

## 3. Human Copywriting Voice
- Write like a thoughtful human advocate, not an AI model.
- Use plain, active verbs:
  - Good: *"Reading your receipt"*, *"Checking official return window"*, *"Verifying policy quotes"*.
  - Bad: *"Executing cognitive inference..."*, *"Synthesizing vector representations..."*.
- Error messages must always state: (1) what happened, and (2) exactly how to resolve it.
