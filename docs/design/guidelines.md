# Paron UI guidelines v1 (per screen)

Paron Product Designer · Fri 9 Oct 2026. Layout and component guidance mapped to `tokens.css`. **Scope and copy come from `06-screens-wireframes.md` and are not changed here.** Any change I'd suggest is in `spec-change-requests.md`. Component names = 06 §12.

## 0. Global rules

**Grid and density**
- Desktop target 1440 px; content max `--size-content-max` (1440), side padding `--space-8` (32). Gutters between panels `--space-4` (16).
- 4 px spacing grid (`--space-*` / Tailwind `p-1..p-16`). Panel padding `--card-pad` (16). Data tables: row `--table-row-height` 36 (S1, S4, S5), dense `--table-row-height-dense` 28 (order book, tape).
- Panels: `--card-bg` + 1 px `--card-border` + `--card-radius` (6). Panel title = uppercase overline (`label-overline` utility: 12 px, 0.08em, tertiary). No gradients or glows on panels (L2's current `.panel` gradient + 40 px shadow should go).
- Base body: `--font-sans` 14 px; data cells 13 px. **Every number in mono** (`--font-mono`, right-aligned in tables). The L2 scaffold sets the whole body to monospace; switch body to sans and use mono only for numbers/ids.

**Color discipline**
- One ember primary button per panel (`--btn-primary-*`). Secondary actions are outlined (`--btn-secondary-*`).
- Red filled (`--btn-danger-*`) is reserved for **Claim default** (and Decline & pay in S5, which pays from the bond). Nothing else is red-filled.
- Status always = word + color (pill). Never color-only (research #4).
- Bid/ask colors only for market sides and price deltas. Don't use green for "success" decoration outside states.

**Shell (`AppShell`, every page)**
- Header 56 px (`--size-header`), `--header-bg`, bottom border. Left: `logo/paron-lockup.svg` at 24 px. Nav 13 px, secondary text; active item = primary text + 2 px ember underline. Right: `ChainBadge` (chip with ok dot) and `WalletButton` chip (mono address + balance).
- `IndexStrip` 32 px (`--size-strip`) on `--strip-bg`: "H100 index" + PrintIndex pill + mono value · tertiary meta · divider · "Spot reference (synthetic demo data)" + mono value. Pill colors: `--index-ok-*`, `--index-thin-*`, `--index-disrupted-*`.
- Banner slot (`DataStatusBanner`, `NetworkGuard`): full-width 36 px bars under the strip; warn = `--color-warn-subtle` bg + `--color-warn` text; danger = `--color-danger-subtle` + `--color-danger`; mock = `--color-info-subtle` + `--color-info` (not accent, so mock doesn't look like a CTA). `z-index: var(--z-banner)`.
- **`UtilityBar` (replaces the old DisclaimerFooter; no legal copy):** 11 px, `--footer-fg` on `--footer-bg`, top border; links row (Docs · API · GitHub · Verifier · Admin · Keepers) + right-aligned mono "Build · Chain · Block". Rendered by the layout, not by pages. No "not affiliated" text anywhere (Fatih decision; goes in the pitch deck).
- Toasts (`TxToast`): bottom-right, `--bg-raised`, `--shadow-2`, 4 px left rule in state color (info pending, ok success, danger revert), `z-index: var(--z-toast)`. Tx hash in mono with ↗.
- Modals: `--bg-raised`, `--radius-lg`, `--shadow-3`, max-width 480, scrim `rgba(0,0,0,.6)`, enter `--duration-base` `--ease-standard`. Footer buttons right-aligned: secondary "Cancel", then primary/danger.
- Focus: `--shadow-focus` (2 px canvas gap + 2 px ember) on all interactive elements. Never remove outlines without this.
- Motion: hover/press `--duration-fast`; bond bar `--duration-slow`; new print flash `--duration-print-flash` (Tailwind `animate-print-flash`). Respect `prefers-reduced-motion` (handled in tokens).

## 1. S1 Market (`/markets`, also `/`)

- Page title row: "Market" (26 px semibold, `--tracking-tight`) + subtitle in secondary text; ember primary `[+ List capacity]` on the right (the only primary on the page).
- Filters: a row of 32 px selects (`--input-*`, `--size-control-sm`+4) + checkbox "Show finalized"; count "4 series" right-aligned, tertiary, mono digits.
- `SeriesTable`: header 28 px, `--table-header-fg`, sticky (`--z-sticky`). Rows 36 px, hover `--table-row-hover`, whole row clickable (cursor pointer, focusable).
  - Series = mono 13 px primary + optional pill ("Sale open" ember-subtle, "Paused" warn, "Finalized" neutral).
  - Provider = ✓ in `--color-ok` + mono address; status ≠ Active → danger pill "Suspended"/"Banned".
  - GPU (factor) = "H100" sans + mono "1.00×" tertiary.
  - Last/CU, 24h vol, Bond/CU, Coverage = mono, right-aligned; "—" in tertiary.
  - `200% backed` badge: outline pill (`--color-border-strong`, secondary text) after Bond/CU. It's a fact, not a promo, so no ember.
  - Record "8 / 10 / 0" mono; the defaulted number in `--color-danger` when > 0.
- Footnote "Record = delivered CU / …" 12 px tertiary under the table.
- Empty/error states (`EmptyState`, `ErrorState`): centered in the table body, 13 px secondary, one secondary button. Skeleton rows: `--color-bg-hover` blocks, 1.2 s pulse.
- Mobile (`SeriesCard`): one card per series, `--card-*`, 4 lines as 06 §2.3, mono numbers.

## 2. S2 List capacity wizard (`/provider/series/new`)

- Two columns: form 7/12, `ListingPreviewCard` 5/12 sticky (top = header + strip + 16).
- Stepper at top: three steps "(1) Capacity → (2) Terms → (3) Bond & launch". Done = ok check + secondary text; current = primary text + 2 px ember underline; upcoming = tertiary. Right side: secondary button "Load demo preset: CU-JKT-H100-2610".
- Fields: label 12 px tertiary above; input 36 px `--input-*`; suffix units ("USDC per CU", "CU") in `--input-suffix-fg`; helper 12 px tertiary below; invalid = `--input-border-invalid` + danger helper text. Derived read-only values ("= 500 CU", "factor 1.00×", "min $4.50 (1.5×)") are mono, secondary, inline.
- Preview card: series symbol mono 20 px; summary line mono; "✓ Verified by Paron demo verifier"; a `BondHealthBar` at 100% (fill = ok) with "$2,250.00 of $2,250.00"; "Max proceeds $1,485.00 after 1% fee" in secondary.
- Step 3 review: key/value grid (tertiary keys, mono values). USDC check line uses ok ✓ or danger text. Primary ember `[Sign & launch series]` full-width of the form column, 44 px (`--size-control-lg`); helper below in 12 px tertiary. Disabled state uses `--btn-disabled-*` with the reason text from 06 shown under the button (not only in a tooltip).
- Success card: `--color-ok-subtle` bg, ok border-left 3 px, title "Series is live", token mono, button "Open series page".
- `DemoStopwatch`: top-right overlay chip, mono 14 px, `--bg-raised`, `--z-overlay`. Only with presets.

## 3. S3 Series page (`/markets/{id}`)

- **Header card** (full width): left = symbol mono 20 px semibold + pills; meta lines 13 px secondary with mono numbers ("Primary $3.00/CU = $3.00 per H100-hour", "Default compensation: $4.50 per CU (fixed)", with the $4.50 emphasised in primary text). Right = key/value grid: Provider ✓ address, "Verified by Paron demo verifier" (opens `AttestationDrawer`), record, token + created tx as `--color-text-link` mono with ↗.
- **Three columns** (desktop): Order book + order form | Trades tape | Buy at primary + Bond. Suggested widths 4/12 · 4/12 · 4/12 (or 0.95 / 1.45 / 0.95 if the tape's "Index" column wraps, as in `preview.html`).
- `OrderBookLadder`: dense rows 28 px. Asks on top (ascending toward spread), bids below. Price mono colored `--book-ask-fg` / `--book-bid-fg`; qty + orders mono primary, right-aligned. Depth = row background `linear-gradient(to left, var(--book-ask-depth) X%, transparent X%)` where X = qty / max qty on screen. Spread row 26 px on `--color-bg-sunken`, tertiary 12 px "spread —". Own order = 6 px ember dot (`--book-own-dot`) before the price. Clicking a level fills the form price.
- `OrderForm`: Buy/Sell segmented control (active Buy = bid-subtle bg + bid border/text; active Sell = ask-subtle + ask). Price + qty inputs side by side; estimate line 12 px secondary with mono numbers. Submit "Place bid"/"Place ask" = filled `--btn-buy-*` / `--btn-sell-*`, or secondary if the panel already has an ember primary in view. `SelfMatchCallout` = danger-subtle card under the form with danger title "Blocked: self-trade" (big enough for the projector: 16 px title).
- `TradesTape`: columns Time (mono secondary) · Type (Buy = bid text, Sell = ask text, Primary = secondary) · Price · Qty · Value (mono right) · Index (12 px: ok "✓ Index-eligible" or tertiary "Not eligible: …"). New row = `animate-print-flash`. No wrapping (`white-space: nowrap`).
- `PrimaryBuyBox`: qty input + secondary "Max"; key/value rows (Price, You pay, Remaining) mono; helper "The provider pays the 1% fee." tertiary; **ember primary full width** "Buy 20 CU for $60.00" (the page's main CTA, amount in mono).
- `BondHealthBar`: big balance mono 36 px (`--text-3xl`), "of $2,250.00" mono secondary; bar 8 px (`--bond-bar-*`), fill = `--bond-bar-fill` (or `--bond-bar-fill-under`), optional released/paid segments after the fill; legend rows "Released to provider $36.00" / "Paid to holders $45.00" (06 §4.6 line 2 copy may be split into two rows); "Covers 12 CU outstanding ✓" in ok; "Coverage 1.50× vs spot reference (synthetic demo data)" secondary with the number in primary mono. Animate width old → new over `--duration-slow` (the $2,214 → $2,169 moment). Percent "96.4%" mono in the card header.
- Bottom row: `RedemptionTermsCard` (key/value, durations mono "1:00") + `ProviderReputationCard` (Delivered highlighted with ok text during the Confirm #1 scene, Defaulted > 0 in danger).
- Mobile order: header → buy → bond → book → form → tape → terms → reputation (06 §4.9).

## 4. S4 Portfolio & redemptions (`/portfolio`, `/redemptions`, `/claims`, `/redemptions/{id}`)

- Title row: "Portfolio" + mono address + ✓; right: secondary "View statement", secondary "Export CSV".
- Tabs (Holdings / Redemptions / Claims / Statement): underline tabs (active = primary text + 2 px ember bottom border), not filled pills. L2's `.tabs` filled-lime pills should become this.
- `HoldingsTable`: 36 px rows, mono numbers, "Default comp." "$4.50/CU" mono; row actions "Redeem" (secondary small 28 px) and "Trade" (text link).
- `RedemptionCard` (R-CARD): stacked list inside one panel, 16/20 px padding, divider `--color-border-subtle`.
  - Line 1: "#2" mono semibold · "CU-JKT-H100-2610 · 10 CU · claim $45.00" (mono numbers) · state pill (`--state-*` tokens; copy from 06 §5.4).
  - Line 2: countdown sentence; the `Countdown` value in mono, colors: normal `--countdown-fg`, ≤ 10 s `--countdown-warn-fg`, overdue `--countdown-overdue-fg`; "(server time)" tertiary 12 px.
  - Line 3: `RedemptionTimeline`: 8 px dots (done = filled primary; current = ember ring; missed = danger filled; future = tertiary ring), labels 12 px with mono times and ↗.
  - Actions right-aligned, vertically centered: "Confirm delivery" (ember primary), "Dispute" (secondary), "Finalize" / "Refund (no ruling)" (secondary).
  - **DEFAULTABLE card:** 3 px danger left rule (`box-shadow: inset 3px 0 0 var(--color-danger)`), pill "Deadline missed", and **"Claim default" = `--btn-danger-*`, 44 px tall, ≥ 160 px wide**. It must be the most visible element on screen at the WOW moment.
- `ClaimDefaultSheet` (M-CLAIM): modal per 06 §5.6; amounts mono; the "No admin, no oracle." line in primary text (not tertiary); danger button "Claim default"; "Checking on-chain…" = spinner inside the button, width locked.
- `ClaimSuccessCard`: big card on `--color-ok-subtle` with ok left rule: "Default paid. $45.00 sent to 0x2222…2222." (20 px), then mono "Bond CU-JKT-H100-2610: $2,214.00 → $2,169.00" (arrow in tertiary), "Provider strike recorded.", buttons "View series" (primary) + "View on explorer" (secondary).
- **S4-R mobile (judge's phone, 360–430 px):** header = mark + "PARON" lockup 20 px + wallet chip; strip hidden. Countdown `--countdown-size-hero` (56 px) mono, centered, with the label under it. Claim default full width, `--size-control-touch` (56 px) tall; disabled = `--btn-disabled-*` + helper "Unlocks when the deadline passes."; enabled = danger fill. Success card fills the screen. Footer disclaimer still present (truncated + expand).

## 5. S5 Provider console (`/provider`) — short

- Four summary cards in a row (`ProviderSummaryCards`): overline title, big mono value 20 px, mono sub-rows. "Next deadline 0:41" uses the countdown colors.
- `IncomingRequestsTable`: state as pill (provider wording from 06), deadline mono with countdown colors; actions "Acknowledge" (ember primary small), "Mark delivered" (ember primary small), "Decline & pay" (danger outline: danger text + danger border, not filled, because it's a voluntary choice; filled red stays exclusive to Claim default).
- `ProviderSeriesTable`: "Sold 30/500" mono, mini bond bar (4 px) next to "$2,169.00 / $2,250".

## 6. /verifier

- Purpose: KYB queue + live issue/approve (**never-cut**). Header: "Verifier" + chip "Paron demo verifier (team-operated)" (outline pill, always visible: honesty guardrail D-04/D-54).
- Layout: left 8/12 applications/attestations table (36 px rows; status pills per 03 E20: Pending = info, Approved = ok, Expired = warn, Revoked = danger, Withdrawn = neutral; no "Rejected" in MVP (D-41 NICE)); right 4/12 detail / "Issue attestation" form card.
- Approve = ember primary; Reject = secondary; Revoke = danger outline. Form fields as S2. Result toast shows the attestation UID mono with ↗.
- Read-only view for non-verifier wallets: same layout, action buttons replaced by tertiary text "Requires the verifier wallet".

## 7. /admin

- Purpose: timelock governance; **one execute from UI is never-cut**.
- Top row of three cards: "Ready to execute" (count, ok), "Waiting for delay" (count + countdown, warn), "Timelock delay" (mono "5:00" demo).
- Proposals table: Target, decoded call (mono, e.g. `setFactor(H200, 1.40×)`), ETA (countdown colors), status pill (Pending = warn, Ready = ok, Done = neutral, Cancelled = neutral outline). Row action **"Execute" = ember primary** when Ready (anyone may press it, D-54); disabled with reason "Timelock delay has not passed yet." otherwise.
- `/admin/conversion-table`: factors table, mono 2 dp + ×; draft revisions shown as outline "Draft" pill, never as live values.
- Non-admin wallets: read-only with tertiary "Requires a Safe owner" where 06/sitemap say so; Execute stays available (open executor).

## 8. Leverage tab (`/trade/leverage`)

Tab label "Leverage" + outline pill "Coming soon". Page = one panel with the exact 06 copy, secondary text, no inputs, no numbers, no buttons.

## 9. Implementation checklist for L2 (via Principal Engineer)

1. Add `paron-design/tokens.css` + `theme.css` to `web/app/paron/`, import in `globals.css` after `@import "tailwindcss"` (see README).
2. Delete the scaffold `:root{...}` palette block (lime `--accent: #d6ff4a` and green-tinted bg). The legacy aliases in tokens.css keep every existing class working.
3. Load IBM Plex Sans + Mono with `next/font/google` (variables `--font-plex-sans`, `--font-plex-mono`); body → `var(--font-sans)`.
4. Replace the scaffold text "PARON" brand link with `logo/paron-lockup.svg` (as `next/image` or inline SVG); add `favicon.svg` as `app/icon.svg`.
5. Restyle `.btn` (radius 4, ember), `.tabs` (underline), `.panel` (flat), `.chip` (radius 4) per the tokens above; add `.pill` variants from `preview.html`.
6. Check: utility bar on every route, and `grep -ri "affiliated\|endorsed by" web/` returns nothing; Claim default is the only red-filled button; no lime anywhere (`grep -i "d6ff4a\|ccff00\|00c805" web/`).
