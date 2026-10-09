# Approved UI changes for Principal Engineer (Fatih approved 9 Oct 2026 14:40 WIB, "setujui semua sesuai rekomendasi")
Scope: visual and layout only. No change to flows, routes, or contract/API behavior. Copy changes are listed explicitly. Tokens: `tokens.v2.css` / `theme.v2.css` (additive, no renames). Full component specs: `audit/04-actions.md` ("Key component specs"). Latest `design.md` is in the same folder.

Map: spec-change-requests.md #9-#13 and live-review LR-5, LR-6, LR-8.

## #9 + LR-5  Series page `/markets/[id]` as one-viewport terminal
- Layout per `audit/04-actions.md` "S3 Series page": header (symbol 20/28 mono, status pill, verified pill, stats ribbon Last | 24h vol | Bond/CU | Coverage | Record); 12-col grid gap 16, `align-items:start`: chart+tape cols 1-6, order book cols 7-9, ticket cols 10-12 (tabs Buy primary | Place order); Bond | Terms | Redemptions | Reputation tabs below, full width. <1280px: ticket, chart, book, tabs. <860px: one column.
- Remove the blank gap between Prints/Book and Market/Bond (panels `align-self:start`, no stretched heights).
- Heading metadata: render "ID {id} · window {yyyy-mm}". If id is missing, omit the whole "ID" token (never a bare "ID").
- Verified pill: `white-space:nowrap`; on narrow widths drop to the next line as its own pill, not mid-text wrap.
- Redeem link and every other in-app link/action text: use `--color-accent-text` for ember actions or `--color-text-primary` for neutral; no browser-blue (`--color-text-link` only for external docs links).
- Empty book copy: "No orders. Place the first bid." with the Place order tab as the action. Empty tape: "No prints yet."

## #10  S4 Redemption detail
- Left card: state amount 36px mono (ember when Defaulted, ok when Completed), key-facts row (CU, holder, provider, deadline), one action row (Confirm / Dispute / Claim default, red fill, 56px tall on mobile). Right card: timeline unchanged. Card height = content, no empty space.
- The line "Default paid. $45.00 sent to 0x2222...2222." must be the largest text on the page.

## #11  Header "Connect wallet" secondary
- Use `--btn-chrome-*` (outlined dark). Ember only for the page's single primary action. Snapshot switcher uses neutral selected state, not ember.

## #12  Mobile tables, no page-level horizontal scroll (`/`, `/markets`, viewport 390)
- Wrap every `<table>` in `.table-scroll{overflow-x:auto}`; `min-width:0` on grid children. Acceptance: `document.documentElement.scrollWidth <= innerWidth` at 390px on `/`, `/markets`, `/markets/1`.
- Also: `.btn.menu-toggle{display:none}` above 860px (Menu button must not show on desktop).

## #13  Dev-only banners
- Mock banner and snapshot switcher render only when `NEXT_PUBLIC_DATA_SOURCE=mock` AND not a production build. Production Vercel must show neither.

## LR-6  Contrast of small text
- Token values already pass (`contrast-report.md`: tertiary `#838C9B` on `#0A0C0F` >= 4.5:1). The live app looks dimmer, so something overrides them. Find and replace any hard-coded or opacity-dimmed text (footer/utility bar, "Spot reference (synthetic demo data)", table headers, helper text) with `--color-text-tertiary` (minimum) or `--color-text-secondary`; no `opacity` below 1 on text.
- Acceptance: computed color vs computed background >= 4.5:1 for all text <= 13px (check with `scripts/contrast.py` values or any contrast checker); do not use `--color-text-disabled` for readable text.

## LR-8  Provider console tabs
- Tab labels Title Case ("Requests", "Series", "Bond", "Agent"), 13px, medium weight; active tab has ember underline and primary text, inactive secondary text; keyboard focus ring per tokens; 44px min target on mobile.

## Also adopt (low risk, from the audit)
- Import `tokens.v2.css` instead of `tokens.css` in `globals.css` (legacy aliases preserved). Markets row height 32px with status pill inline.
- Per-route `<title>` and a skip link (`<a class="skip" href="#main">`).
- CI grep guard `affiliated|endorsed by`: cancelled (D-81). Status: APPROVED (Fatih, direct, 2026-10-09 17:01 WIB). There is no such grep in CI. `web/lib/copy-guard.test.ts` is unchanged and is not that grep.

## Verification (Designer will re-check on live after deploy)
Screenshots at 1280 and 390 for `/`, `/markets`, `/markets/1`, `/portfolio`, `/provider`, redemption detail; no horizontal scroll at 390; no blue links; contrast >= 4.5:1.

## Decision map (07 §15, APPROVED by Fatih 9 Oct 2026 14:40 WIB)
#9 + LR-5 = D-67, #10 = D-68, #11 = D-69, #12 = D-70, #13 = D-71, LR-6 (contrast) = D-72, LR-8 (Provider tabs) = D-73, "Also adopt" (tokens.v2.css, per-route title, skip link) = D-74. The CI grep item formerly listed under D-74 is cancelled by D-81.
If time is short, implement in this order: D-70, D-71, D-72, D-69, D-73, D-68, D-67.
Status: D-67..D-74 APPROVED. The grep item stays cancelled, and that cancellation is APPROVED (D-81, Fatih direct, 2026-10-09 17:01 WIB). Designer verification on live waits until the site on `main` is up (04 hosting).

## P1–P6 and demo series name (07 §16, Fatih via handler, 9 Oct 2026 ~15:34 WIB)

| ID | Decision | Status |
|---|---|---|
| D-75 | P1 Syncing banner shows only when `/v1/health` is `synced:false` or lag is over 20 blocks. Info color, not amber. Live sentence is D-84. | APPROVED |
| D-76 | P2 Skeleton uses a pulse opacity animation, not a shimmer, per design.md §6. "0 series." stays hidden while loading (D-66). | APPROVED |
| D-77 | P3 Leverage tab on `/markets/[id]` is labeled "Coming soon", with no action. | APPROVED |
| D-78 | P4 Buy ticket: remove implementation copy. Product copy only. | APPROVED |
| D-79 | P5 Numbers: money as `$3,240.00` (thousands separator, 2 decimals). Max cost uses 2 decimals. | APPROVED |
| D-80 | P6 Home: fill the page, less empty space, especially at 390 px. Connect wallet stays on one line. | APPROVED |
| D-81 | CI grep `affiliated` / `endorsed by` (last item of D-74) is cancelled. No such grep in CI. `copy-guard.test.ts` is unchanged. | APPROVED (Fatih, direct, 2026-10-09 17:01 WIB) |
| D-82 | Live demo series name was recorded as `CU-JKT-H100-2611`. Contract seed series 1 is unchanged. Clarified by D-92 (APPROVED 18:10 WIB): seed = 2611; stage/demo series = 2610 (series 4). D-19/D-25 stage rows stay in force. | APPROVED, clarified by D-92 |

## D-84..D-88 (07 §18, APPROVED by Fatih directly 2026-10-09 16:39 WIB)

| ID | Decision | Status |
|---|---|---|
| D-84 | Syncing banner, info color. Exact sentence: "Indexer is catching up to the latest blocks; data may lag briefly." Shows only when `synced:false` or lag is over 20 blocks. UI copy is English. | APPROVED |
| D-85 | Series tabs follow D-67: Bond, Terms, Redemptions, Reputation. If that is not done before the UI freeze Sat 2026-10-10 09:00 WIB, the old tabs (Overview, Buy, Trade, Leverage) stay and the leftover is noted in the docs. On `main` `93f8e60` those old tabs are still the ones on the series page. That 09:00 condition is superseded (D-90). | APPROVED |
| D-86 | Not-found message, exact copy: "Request not found." on `/redemptions/1` and `/disputes/1`. | APPROVED |
| D-87 | The synthetic demo data ribbon stays. Ribbon text: "Reference price (demo data)". | APPROVED |
| D-88 | PR #47 (homepage) preview was not reviewed. Designer checks production after rebase and merge. | APPROVED |

**Status 2026-10-09 17:01 WIB:** UI PRs #47, #51, #53, and #54 are merged to `main` (CI green). They are not live on the web yet. UI checks happen only after merge to `main`, and the latest `main` stays offline until Fatih resolves the Vercel build quota (04 hosting, CONTEXT-INDEX). The 09:00 UI freeze named in D-85 is superseded (D-90).

## RPC failure tone (07 §19, D-89, APPROVED by handler)

Public RPC failure is dim text, not a red error. Retries wait 400 ms, then 800 ms, then 1600 ms. `INDEXER_RPC_URL_BACKUP` and `NEXT_PUBLIC_RPC_URL_BACKUP` are final names. An empty value means the primary URL only. The URL value is not written in this doc.

## Landing hero (07 §21, D-91, APPROVED)

Fatih approved the prototype. Recorded via Paron Designer and Scout. Source: Designer's `/workspace/paron-landing/design.md` on Designer's computer.

The hero on landing `/` is gold and glass, plus limited amber accents on the dashboard (numbers, small tags, active states, 1px lines). The dashboard gets no gradient and no full glass.

Tokens: black `#000`, text `#f3f3f3`, secondary text `#a6a6a6` and `#8c8c8c`, amber-100 `#f1d3a6`, amber-300 `#d9a066`, amber-500 `#bc854d`, amber-800 `#5a3515`. Lines are 1px `rgba(255,255,255,.16)`, soft variant `rgba(255,255,255,.09)`. Glass is only on the landing hero and the numbers panel (radius 8px, under text that overlays amber light), with no box-shadow. Motion runs 38 to 64 seconds and is off under `prefers-reduced-motion`.

The earlier ban on gradient and glass in `design.md` is allowed only on the landing hero and its numbers panel. Still banned: purple or cyan, blobs, gradient on text (except the 1.5× number), heavy shadows, fake cards or fake stats. Content rules are unchanged (no third-party logos, no forbidden words). Review must not flag this hero as a regression.

## Series names (07 §22, D-92, APPROVED 2026-10-09 18:10 WIB)

Fatih approved the recommendation for the demo series ("rekomendasimu saja"). Scout recorded it at 18:10 WIB. This clarifies D-82: seed = 2611, stage/demo series = 2610 (series 4).

Live facts: seed series 1–3 are `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`. Series 4 `CU-JKT-H100-2610` was created by the S0 test and matches D-19. The series for the demo and the recording is series 4. `2611` stays seed data on Markets.

Impact: the wizard preset (PR #53) fills `2611`. The handler will change it to `2610` in a later UI PR. The recording uses a new run on series 4.
