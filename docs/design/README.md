# paron-design: Paron brand + design system v1

Owner: Paron Product Designer. Design files only, no product code. Fri 9 Oct 2026.
Direction: **"Forged graphite + ember"**: cool iron neutrals, one ember accent for actions, IBM Plex Sans + IBM Plex Mono, squared institutional components. Dark theme by default; light theme optional.

## Files

| File | What |
|---|---|
| `research.md` | 12 sourced industry findings (exchanges, RWA, compute markets, accessibility) + what Paron takes from each |
| `brand.md` | Positioning, voice/copy rules, color rationale + key hexes, typography, logo rules, number formatting, guardrails, **Decisions for Fatih** |
| `tokens.css` | **Source of truth.** CSS custom properties: primitives, semantic colors (bid/ask, PrintIndex, redemption states, bond), type, spacing, radius, borders, elevation, motion, z-index, component tokens, light theme, legacy aliases for the L2 scaffold |
| `theme.css` | Tailwind **v4** `@theme` registration (repo uses `tailwindcss@4.3.3`, CSS-first). Verified to compile with `@tailwindcss/cli@4.3.3` |
| `guidelines.md` | Per-screen layout + component guidance (shell/footer, S1, S2, S3, S4 + mobile S4-R, S5, /verifier, /admin, leverage tab) + L2 checklist |
| `spec-change-requests.md` | Suggested screen/copy changes for Paron Spec Writer (not applied) |
| `contrast-report.md` | WCAG contrast ratios for every text token (dark + light), pills, buttons, non-text; 0 failures |
| `scripts/contrast.py` | Regenerates the contrast report |
| `logo/` | `paron-mark.svg`, `paron-mark-mono.svg`, `paron-wordmark.svg`, `paron-lockup.svg`, `paron-lockup-light.svg`, `favicon.svg` (original anvil + unit-square mark; text drawn as paths) |
| `preview.html` / `preview.png` | Static preview using `tokens.css`: palette, pills, type, mock Series page (order book, tape, redemption card with Claim default, buy box, bond bar), footer |

## How L2 drops this into `web/` (Tailwind v4, Next.js 16)

1. Copy `tokens.css` and `theme.css` to `web/app/paron/`, and `logo/*.svg` to `web/public/brand/` (`favicon.svg` → `web/app/icon.svg`).
2. `web/app/globals.css`, top of file:
   ```css
   @import "tailwindcss";
   @import "./paron/tokens.css";
   @import "./paron/theme.css";
   ```
   Then **delete the scaffold `:root { --bg … --accent: #d6ff4a … }` block.** `tokens.css` defines the same legacy names (`--bg`, `--panel`, `--line`, `--text`, `--muted`, `--accent`, `--accent-ink`, `--danger`, `--warn`, `--ok`, `--shadow`) as aliases, so existing classes keep working and pick up the new palette immediately. Also remove the green radial gradient on `body`.
3. Fonts in `web/app/layout.tsx`:
   ```ts
   import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
   const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-plex-sans" });
   const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-plex-mono" });
   // <html lang="en" className={`${sans.variable} ${mono.variable}`}>
   ```
   and set `body { font-family: var(--font-sans); }` (the scaffold currently uses monospace for everything). Numbers: `font-family: var(--font-mono)` or the `tnum` utility.
4. Utilities now available: `bg-bg-surface`, `bg-bg-raised`, `text-text-secondary`, `border-border-default`, `bg-accent text-accent-ink`, `text-bid`, `text-ask`, `bg-ok-subtle text-ok`, `text-warn`, `bg-danger-fill`, `rounded-sm|md|lg`, `shadow-1|2|3`, `font-mono`, `text-sm` (13 px), `label-overline`, `tnum`, `animate-print-flash`, `ease-standard`. Component tokens (e.g. `--btn-danger-bg`, `--bond-bar-fill`, `--state-defaultable-fg`) are used as `bg-(--btn-danger-bg)` or in plain CSS.
   Note: `theme.css` overrides Tailwind's default `text-xs…text-3xl` sizes (data-dense scale; `text-sm` = 13 px).
5. Light theme: add `data-theme="light"` on `<html>`. Not needed for the demo.
6. Follow `guidelines.md` §9 checklist; reference markup/CSS for pills, order book, bond bar, redemption card is in `preview.html`.

## Guardrails (summary; full list in brand.md §7)
No disclaimer / "not affiliated" copy anywhere in the product (pitch deck only) · no Robinhood logo/feather/lime/green brand · no "built for/backed by/partnered with/powered by" · no OCPI in the app · no Stock Tokens · leverage only as "Coming soon".

## Design audit (Fri 9 Oct 2026)
`design.md` (repo-ready, not in repo yet) · `tokens.v2.css`, `theme.v2.css`, `preview.v2.html/png` · `audit/01-benchmark.md`, `02-design-language.md`, `03-existing-audit.md`, `04-actions.md`, `tokens-v2-diff.md`, `audit/screens/` · `_scratch/` (npx outputs, clones, probe data; safe to delete). v1 files unchanged except the removal of all "not affiliated" copy.
