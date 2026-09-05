---
name: frontend-design
description: Guidelines for crafting distinct, editorial, production-grade frontend user interfaces. Avoids generic AI templates, emphasizes bespoke layouts, thoughtful typography, and authentic material feel.
---

# Frontend Design: Editorial & Authentic Interfaces

## 1. Anti-Slop Principles
- **Reject the generic AI aesthetic:** Avoid purple/indigo gradients, floating blurry glassmorphism cards, identical 3-column feature grids, and overuse of emojis as icons.
- **Embrace an authentic physical metaphor:** For Rightful, the interface is an official **investigator's case file** (paper surfaces, carbon blue ink, crisp ruling lines, authentic rubber stamps).

## 2. Typography Hierarchy
- Use at most two typefaces:
  - **Primary Sans:** Clean, legible editorial sans-serif (e.g. *Public Sans*) for all UI copy, headers, and form inputs.
  - **Data Mono:** Crisp monospaced font (e.g. *Fragment Mono*) strictly reserved for verbatim receipt excerpts, cited policy lines, and code reference numbers.
- Enforce sentence case across all headings and buttons. Never use all-caps eyebrows.

## 3. Visual Weight & Hierarchy
- The **hero element** must command immediate attention (in Rightful, this is the **Proof Ledger**).
- Supporting elements (facts definition list, source URLs) must be visually quieter using subdued borders and neutral tones.
- High-contrast states: Status badges must have bold color distinction, unmistakable icons/stamps, and clear textual meaning.

## 4. Layout Discipline
- Standard desktop layout ($\ge 1024\text{px}$): Two distinct asymmetric columns (Intake vs. Case File).
- Standard mobile layout ($< 1024\text{px}$): Natural vertical stack with sticky action triggers.
- Margins and gutters: Consistent 8px baseline grid (8px, 16px, 24px, 32px).
