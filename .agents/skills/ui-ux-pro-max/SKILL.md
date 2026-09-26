---
name: ui-ux-pro-max
description: Design system intelligence for tokens, palettes, typography scales, responsive grids, and UX interaction states. Use in Phase 1 and Phase 7 for interface polish.
---

# UI/UX Pro Max: Design System Architecture

## 1. CSS Variable Tokens Architecture
All visual values must be bound to semantic CSS variables declared in `:root` and overridden in `[data-theme='dark']`.
- Never hardcode hex codes or pixel paddings in component CSS.
- Ensure light and dark themes share identical variable names so theme switching requires zero DOM recalculation.

## 2. Interaction State Coverage
Every interactive component must explicitly define:
- `default`: Resting state.
- `hover`: Subtle brightness/border shift ($< 150\text{ms}$).
- `focus-visible`: 2px solid carbon-blue outline with 3px offset for keyboard navigation.
- `active`: Slight 1px downward translation or darkening.
- `disabled`: Opacity 0.5, cursor `not-allowed`, tooltips explaining the disable condition.
- `loading`: Skeleton shimmer or localized spinner; never freeze the UI.

## 3. Responsive Breakpoints
- Mobile ($< 640\text{px}$): Single column, full-width buttons, $16\text{px}$ font to prevent iOS Safari auto-zoom.
- Tablet ($640\text{px} - 1023\text{px}$): Single column with comfortable margins ($32\text{px}$).
- Desktop ($\ge 1024\text{px}$): Dual-column split layout ($420\text{px}$ left intake column, fluid right case file column).
- Max-width boundary: $1440\text{px}$ centered container.
