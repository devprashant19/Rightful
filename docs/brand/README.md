# Brand assets

The mark is four quadrants: two squares and two quarter-circles — a form
that reads as a seal or a stamp at small sizes, which is the product's
central motif. It lives in the app as inline SVG in `components/Header.tsx`;
these are exports of the same geometry.

## Colours

| Token | Hex | Use |
| :--- | :--- | :--- |
| `ink-primary` | `#2a1a12` | Default mark on light backgrounds |
| `bg-paper` | `#f6f0e7` | Page, and the mark on dark backgrounds |
| `accent-gold` | `#d4612f` | Caramel accent |
| `stamp-green` | `#2e7d4f` | SUPPORTED |
| `stamp-amber` | `#b7791f` | AMBIGUOUS |
| `stamp-red` | `#b3261e` | NOT MET |

Type: **Inter Tight** (sans) · **Fragment Mono** (data, quotes, model IDs).

## Files

| File | Size | Alpha | Use |
| :--- | :--- | :--- | :--- |
| `png/logo.png` | 1024² | yes | **Default.** Espresso mark, transparent. |
| `png/logo-ink-512.png` / `-1024.png` | 512² / 1024² | yes | Espresso, for light backgrounds |
| `png/logo-paper-512.png` / `-1024.png` | 512² / 1024² | yes | Cream, for dark backgrounds |
| `png/logo-gold-512.png` / `-1024.png` | 512² / 1024² | yes | Caramel accent variant |
| `png/logo-square-1024.png` | 1024² | **no** | Mark on paper. For avatars and app icons that reject transparency. |
| `png/lockup-1600x400.png` | 1600×400 | yes | Mark + wordmark + "Evidence Agent" |
| `logo.svg` / `logo-paper.svg` / `logo-gold.svg` | vector | yes | Scalable source |

## Generated, not drawn

`thumbnail.html` and `og.html` are the sources for the 3:2 submission
thumbnail (`docs/screenshots/00-thumbnail.png`) and the Open Graph image
(`app/opengraph-image.png`). Edit the HTML and re-render rather than
redrawing:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,800 --screenshot=out.png --virtual-time-budget=6000 \
  file:///abs/path/docs/brand/thumbnail.html
```

Add `--default-background-color=00000000` for a transparent PNG.

The favicon is `app/icon.svg`, served by the Next.js App Router file
convention — there is no `public/favicon.ico`.
