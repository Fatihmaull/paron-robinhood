# Paron design.md

Direction file for every UI, copy and asset decision in Paron. Written to the anti-slop `DESIGN.md` convention (R-31: each decision has a one-line reason; R-37: dials declared). Status: v2 proposal, ready to drop into the repo root. Tokens: `tokens.v2.css` + `theme.v2.css` (v1 files stay valid; v2 is additive).

**Design Read:** Reading this as: a dense institutional trading and clearing terminal for verified providers, holders, traders and async hackathon judges, in a *forged graphite + ember* language.
**Dial: ENERGY 2 / RHYTHM 1 / MOTION 1** (landing `/` may use RHYTHM 2).
Reason: data screens must be uniform and scannable (RHYTHM 1); motion only confirms state change (MOTION 1); one ember accent is the single deliberate "hello" (ENERGY 2).

## 1. Core principles

1. **Numbers are the interface.** Every screen leads with the figure the user acts on (price, bond, coverage, countdown). Reason: Paron is a market, not a brochure.
2. **One focal point per screen, one ember primary per panel.** Reason: the demo has one wow action (Claim default); everything else must defer to it.
3. **Density over air.** Apple's craft (spacing rigor, hierarchy, motion) yes; Apple's empty space no. Reason: tables, book, tape, timelines. Empty panels are defects.
4. **Borders, not shadows.** 1px graphite borders define panels; shadow only on popovers, drawers, modals. Reason: terminal clarity, zero "floating card" slop.
5. **Color is semantic.** Ember = action and brand only. Green/red = bid/ask. Amber = review/thin. Red fill = Claim default only. Blue = info/link. Violet = dispute. Reason: users read state from hue at a glance.
6. **Honest data.** No invented numbers, no fake logos, no testimonials. Demo data is labelled. Empty beats deceptive (R-17, R-36, R-38).
7. **Identity motif: the unit square.** One ember square (the CU struck on the anvil) in the logo, own-order dot, active tab underline. Reason: the one repeated, product-specific mark.

## 2. Typography

| Role | Font | Size / line | Weight | Notes |
|---|---|---|---|---|
| Page title | IBM Plex Sans | 26/32 | 600 | tracking -0.015em, `text-wrap: balance` |
| Panel title | Plex Sans | 12/16 | 500 | uppercase, tracking 0.06em, `--color-text-tertiary`. Only for panel titles |
| Body, buttons, inputs | Plex Sans | 14/22 | 400/600 | |
| Table cell | Plex Sans | 13/20 | 400 | numbers right-aligned in Plex Mono |
| Column header | Plex Sans | 12/16 | 500 | sentence case, tertiary |
| Book and tape rows | Plex Mono | 12/16 | 400 | tabular |
| Hero amounts | Plex Mono | 36/40 | 500 | bond balance, payout |
| Countdown | Plex Mono | 56 (mobile hero), 14 inline | 500 | `m:ss` |

Rules: Plex Mono for every number a user compares or copies, plus addresses, hashes, series symbols, block numbers. Never mix mono and sans inside one number. Always `tabular-nums`. Max 4 text sizes per screen region. Paragraph max 68ch. Reason for the pair: one engineered family so numbers and labels match; kept from v1 (written reason in brand.md §4). Typeface is a deliberate brand choice, not a default pick (R-06).

## 3. Layout

- Grid: 4px base, 8px rhythm. Spacing tokens `--space-1..16` only. Content max 1440px, gutters 32px (16px under 860px).
- Header 56px, index strip 32px, rows: table 32px, book/tape 24px, controls 36px (28 compact, 44 touch, 56 mobile Claim default).
- **Series page is a terminal, one viewport at 1440x900:** top = symbol, status pills, key stats ribbon; row 1 = chart (6 of 12 cols) | order book (3) | ticket tabs Buy / Place order (3); full spec in audit/04-actions.md; row 2 = tabs Tape, Bond, Terms, Redemptions, Reputation. Panels top-aligned (`align-items: start`), never stretched to equal height.
- No page may leave a panel mostly empty: collapse it or fill it with the state's real content.
- Tables: sticky header, horizontal scroll wrapper on narrow screens (`overflow-x: auto`), first column sticky, symbol never truncated.
- Mobile (390px): no horizontal page scroll (verified defect today on `/` and `/markets`), tables become stacked rows with symbol, price, coverage; Claim default full width 56px.

## 4. Color and contrast

Palette is `tokens.v2.css` (colors unchanged from v1). Ratios in `contrast-report.md`; 0 failures.

- Body and data text >= 4.5:1 (AA). Primary, secondary, accent and bid text pass AAA on canvas and surface. Tertiary text 5.5:1 (AA), use only for captions and column headers.
- Non-text (input edge, focus ring, bond bar) >= 3:1.
- Never convey state by hue alone: pills always contain the word; overdue says "Deadline passed 0:12 ago."
- No pure black or white backgrounds in dark mode, except the landing `/` hero, which may use black `#000` (D-91). No purple/cyan accents. No gradients, except the landing hero and its numbers panel (D-91). No glow. Lime/neon is banned (guardrail).
- Light theme (`data-theme="light"`) must work in every component if shipped (R-34); default and judged theme is dark.
- **Landing tokens (D-91, APPROVED).** Black `#000`, text `#f3f3f3`, secondary text `#a6a6a6` and `#8c8c8c`, amber-100 `#f1d3a6`, amber-300 `#d9a066`, amber-500 `#bc854d`, amber-800 `#5a3515`. Lines are 1px `rgba(255,255,255,.16)`, soft variant `rgba(255,255,255,.09)`. Dashboard amber is limited to numbers, small tags, active states, and 1px lines. The dashboard gets no gradient and no full glass. Semantic amber for review/thin stays on data screens.

## 5. Components (short form)

- **Buttons:** one ember primary per panel. Header Connect wallet is secondary (`--btn-chrome-*`). Claim default is the only red-filled button. "Decline & pay" is danger outline. Radius 4px. Hover/press/focus/disabled states all defined.
- **Pills:** 20px, 2px radius, word inside. Never capsule-with-glow.
- **Panels:** `--card-bg`, 1px border, 6px radius, 16px padding, no shadow.
- **Tables:** status pill inline with the symbol (not stacked), `200% backed` is a pill in its own column or after the value without overlapping it.
- **Charts:** colors from `--chart-*` tokens only (no hex in JS). One series, ember line, dashed tertiary reference. Always an `aria-label` summary and the data table beneath.

## 6. Motion

| Use | Duration | Easing |
|---|---|---|
| Hover, press | 140ms | `--ease-standard` |
| Drawer, modal, popover | 220ms, enter and exit on the same path, `transform-origin` at the trigger | standard / exit |
| Bond bar old to new | 600ms | standard |
| New print row flash | 2000ms fade of `--table-row-new` | standard |
| Skeleton pulse | 1200ms opacity only | ease-in-out |

Rules: animate `transform` and `opacity` only; never `transition: all`; critically damped feel (no overshoot) everywhere because nothing here is a flick gesture; animations interruptible. `prefers-reduced-motion`: tokens drop to 0ms, flash shortens to 600ms, no slide, keep color and opacity changes. No parallax, no floating, no scroll-jacking.

**Landing hero motion (D-91, APPROVED).** The landing `/` hero may run one motion of 38–64 seconds. That motion is off under `prefers-reduced-motion` (it does not run). The durations in the table above stay.

## 7. Accessibility and web-interface rules (Vercel guidelines applied)

- Every interactive element is a real `<button>`/`<a>`; icon-only buttons get `aria-label`; decorative icons `aria-hidden`.
- Visible `:focus-visible` ring (`--shadow-focus`, ember 2px, offset by canvas). Never remove outline without that replacement.
- Skip link to `<main id="main">`; headings hierarchical; one `<h1>`; per-route `<title>` ("Markets · Paron").
- Every input has a label; `autocomplete="off"` and `spellCheck={false}` on addresses and numeric fields; correct `inputmode`; never block paste; errors inline, focus first error.
- Async updates (toasts, banners, countdown expiry) in `aria-live="polite"`.
- Tables: `<th scope>`, `<caption class="sr-only">`; touch targets >= 44px on mobile; `touch-action: manipulation`; `overscroll-behavior: contain` in modals and drawers.
- Destructive or irreversible actions (Claim default, Decline & pay) show a confirm step with exact amounts.
- `color-scheme: dark`, `<meta name="theme-color" content="#0A0C0F">`.
- Use `Intl.NumberFormat` and `Intl.DateTimeFormat` (timeZone Asia/Jakarta, label "WIB"); `…` not `...`; non-breaking space between number and unit.
- URL reflects state (series, tab, filters, snapshot) so judges can deep-link.

## 8. Content and number formatting

Binding formats are in `brand.md` §6 (price `$3.20/CU`, CU `20 CU`, factor `1.40×`, address `0x2222…2222`, time `10:00:40 WIB`, countdown `m:ss`). Copy rules:

- English, sentence case, plain verbs, specific labels ("Claim default", "Request redemption"). No emoji, no hype, no em dashes in UI text (R-02).
- State who can act: "Anyone can claim the default."
- Use Paron nouns exactly: CU, series, bond, print, PrintIndex, redemption, default, provider, holder.
- **No "not affiliated" or disclaimer copy anywhere in the product** (Fatih decision; pitch deck only). Page bottom is a quiet utility bar.

## 9. States

- **Loading:** skeleton rows with the final row count and column widths (no spinner-only pages); text states end with `…`.
- **Empty:** one line saying what is missing and the action that fixes it ("No prints yet. Place the first bid."), never a blank panel.
- **Error:** inline, says what failed and the next step; onchain fallback shows real onchain values, never fake numbers.
- **Indexer syncing:** full-width info banner (info color, `role="status"`), exact text `Indexer syncing, data may be delayed.`, polls `/health` every 15s, disappears when synced. Lists show skeleton or real onchain data only.
- **Mock/fixtures:** the "Mock data (fixtures)" banner and snapshot switcher render only in development builds.
- **Wrong network / low gas:** warn banner with the one action (Switch).

## 10. Do and Don't (project specific)

| Do | Don't |
|---|---|
| Lead with price, bond, coverage, countdown | Hero slogans on data screens |
| Mono tabular numbers, right aligned | Proportional digits in columns |
| One ember primary per panel | Ember on headers, borders, icons "for flavor" |
| Top-aligned panels with real content | Stretched cards with blank space |
| Skeleton, empty, error for every list | "Empty" dumped in a panel |
| Show real series data and "synthetic demo data" label | Invented stats, logos, testimonials |
| Squared pills with words | Capsules, glow, sparkles, gradient text (except the 1.5× number on the landing hero, D-91) |
| Confirm Claim default with amounts | One-click irreversible actions |

Hard bans: purple or cyan accents, glassmorphism, gradient blobs or particle backgrounds, generic icon-in-circle feature grids, fake terminals, "AI powered" badges, Robinhood logo/colors/style, the words "partner" or "powered by Ornn", any OCPI value, leverage beyond a "Coming soon" tab.

**D-91 exception (APPROVED).** Gradient and glass are allowed only on the landing `/` hero and its numbers panel. Glass there uses radius 8px, sits under text that overlays amber light, and has no box-shadow. The dashboard gets no gradient and no full glass. Purple or cyan, blobs, gradient on text (except the 1.5× number), heavy shadows, fake cards, and fake stats stay banned. Content rules are unchanged (no third-party logos, no forbidden words). Source: Designer's `/workspace/paron-landing/design.md` on Designer's computer. A review must not flag that hero as a regression against the older gradient and glass ban.

**Licence-credit exception.** The no-third-party-logos and no-third-party-links rule stays. One exception: the TradingView chart logo is off via the library option `attributionLogo: false` in `web/components/charts.tsx`. The plain-text licence credit is on `/legal/risk` (`web/app/legal/risk/page.tsx`). That credit is the only exception.

## 11. Delivery checklist (run before each merge)

- CI grep `affiliated|endorsed by`: cancelled (D-81). Status: APPROVED (Fatih, direct, 2026-10-09 17:01 WIB). This is not a CI check. `web/lib/copy-guard.test.ts` stays and is not that grep.
- [ ] No hex colors in components or JS; tokens only
- [ ] No horizontal scroll at 390px on any route
- [ ] Every route: unique `<title>`, one `<h1>`, skip link, visible focus
- [ ] Loading, empty, error, syncing states exist for lists
- [ ] Contrast script run if any color token changed
- [ ] Claim default is the only red-filled button
- [ ] Reduced-motion variant verified
