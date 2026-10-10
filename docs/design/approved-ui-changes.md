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
- Also: `.btn.menu-toggle{display:none}` above 860px (Menu button must not show on desktop). **HISTORICAL** for a header with a connected wallet. Current header rule (PRs #64, with the wallet-connected header fix in D-94): the address shows as `0x3F8f…6ae9` (first 6 characters including `0x`, last 4). Check 1024, 1100, 1280, 1440, and 390 with a wallet connected. The nav is never clipped. The Menu button shows when the links do not fit. Every header control is at least 44px. The table-scroll rule above stays.

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

**HISTORICAL for the landing hero, superseded by D-98.** The gold-and-glass hero below was the approved look until 10 Oct 2026. D-91 stays APPROVED as that decision. The live hero is the D-98 section.

The hero on landing `/` is gold and glass, plus limited amber accents on the dashboard (numbers, small tags, active states, 1px lines). The dashboard gets no gradient and no full glass.

Tokens: black `#000`, text `#f3f3f3`, secondary text `#a6a6a6` and `#8c8c8c`, amber-100 `#f1d3a6`, amber-300 `#d9a066`, amber-500 `#bc854d`, amber-800 `#5a3515`. Lines are 1px `rgba(255,255,255,.16)`, soft variant `rgba(255,255,255,.09)`. Glass is only on the landing hero and the numbers panel (radius 8px, under text that overlays amber light), with no box-shadow. Motion runs 38 to 64 seconds and is off under `prefers-reduced-motion`.

The earlier ban on gradient and glass in `design.md` is allowed only on the landing hero and its numbers panel. Still banned: purple or cyan, blobs, gradient on text (except the 1.5× number), heavy shadows, fake cards or fake stats. Content rules are unchanged (no third-party logos, no forbidden words). Review must not flag this hero as a regression.

The absolute reading of "no third-party logos" and "no third-party links" stays the rule. **Licence-credit exception:** the TradingView chart logo is off via the library option `attributionLogo: false` in `web/components/charts.tsx`. The plain-text licence credit is on `/legal/risk` (`web/app/legal/risk/page.tsx`). That credit is the only exception.

## Series names (07 §22, D-92, APPROVED 2026-10-09 18:10 WIB)

Fatih approved the recommendation for the demo series ("rekomendasimu saja"). Scout recorded it at 18:10 WIB. This clarifies D-82: seed = 2611, stage/demo series = 2610 (series 4).

Live facts: seed series 1–3 are `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`. Series 4 `CU-JKT-H100-2610` was created by the S0 test and matches D-19. The series for the demo and the recording is series 4. `2611` stays seed data on Markets.

Impact: the wizard preset (PR #53) fills `2611`. The handler will change it to `2610` in a later UI PR. The recording uses a new run on series 4.

## Deadline (07 §23, D-93, APPROVED Sat 10 Oct 2026 10:16 WIB)

The hard deadline is Saturday 10 Oct 2026 23:59 WIB. The 12:00 deadline in D-90, and the 12:00 lines in 08 and 09, are **HISTORICAL**. The old freeze times 06:00, 09:00, and 11:30 stay **HISTORICAL** (D-90).

## Pre-demo list (07 §24, D-94, APPROVED)

Fatih approved the engineering and design list ("oke lanjut" / "masukin semua ke kerjaan"). No contract change in this decision. Anything that needs a contract change is reported to Fatih first.

- Wallet-connected header fix (address form and width checks are in the #12 note above).
- Empty and error states on the demo path: `/buy`, `/trade`, `/redemptions`.
- Visible transaction status: pending, success, failed, with an explorer link.
- Small S2 fixes: skip link, input heights, truncated tab at 390, Pending badge in amber, provider address shortened on `/markets/4`.
- Money format `$3,240.00` (same as D-79) and a uniform "Demo data" label. The approved ribbon sentence "Reference price (demo data)" (D-87, D-84..D-88) is kept until Fatih approves a replacement (D-95). The shorter label does not replace that sentence.
- Landing link checks.
- Provider page h1 text "Provider", with the address below it. Under D-95 this h1 is on `/provider/[address]`.
- `/arbiter`, and a Revoke button on `/verifier`, only if no contract change is needed.

## Information architecture (07 §25, D-95, APPROVED Sat 10 Oct 2026 ~11:07 WIB)

Later than D-94. Where they conflict, D-95 applies. Delivery is two product PRs, not this docs PR: PR-A nav, CTAs, and demo isolation; PR-B the per-provider dashboard.

The single user navbar that also held Provider and Demo is **HISTORICAL**.

1. The main user navbar, reached via "Launch app", shows the user side only: Markets, Buy, Trade, Portfolio, Redemptions, Faucet, Index, Data. No Provider, Operator, or Demo links.
2. Provider is a separate link outside the user nav. Each provider has a dashboard at `/provider/[address]` (series, redemptions, agents). Write actions only for the owning wallet. Other addresses are read-only. Old `/provider` redirects to the connected wallet's dashboard, or to `/onboarding/kyb` if that wallet is not KYB-verified. Landing CTAs: "Launch app" (user dashboard), "Become a provider" (provider dashboard or KYB).
3. Operator (verifier, admin, ops, arbiter) is one separate tab. Reachable only via a small CTA in the landing footer or bottom section, never in any navbar. Operator pages are titled "Operator tools".
4. `/demo` stays live. The only entry is the landing CTA "Launch demo". No links from navbars, dashboard footers, or other pages.
5. The production dashboard uses only the real indexer and on-chain testnet data. The label "Reference price (demo data)" stays until Fatih approves a replacement.

**HISTORICAL (nav correction below, PR #71).** Designer grouping, part of the same approval: user links centered. "For providers" and "Operator" are secondary text links (`#a6a6a6`) at the right. The "Operator" link is the footer or bottom CTA in rule 3, not a user-navbar item. "For providers" is the separate link in rule 2. Mobile menu groups Trade / Providers / Operators, with targets of at least 44px. KYB banner on `/provider`: neutral info for not-KYB and for pending, with "Start KYB"; amber for verified. "List capacity" is disabled, with the written reason "Complete KYB to list capacity".

**Nav correction (recorded Sat 10 Oct 2026, after PR #71). D-95 stays APPROVED.** The Designer sentence above that put a secondary "For providers" link in the app navbar (right side, and in the mobile menu) is **HISTORICAL**. PR #71 removed "For providers" from the app navbar. Fatih's revision: the user navbar (Launch app) has only user links: Markets, Buy, Trade, Portfolio, Redemptions, Faucet, Index, Data. Provider entry is only the landing CTA "Become a provider". Operator entry is only the small footer CTA on the landing page. `/demo` entry is only the landing CTA "Launch demo". Reading rule 2 as a secondary link inside the app navbar is **HISTORICAL**. The per-provider dashboard, the `/provider` redirect, the KYB banner, and the disabled "List capacity" reason stay. The Designer re-review of production `d3081be` is recorded in `docs/build/STATUS.md` and dev-docs/09 (green light for the final video; no S0 or S1). PR #74 (`1f33f2f`) relabeled Done ops on `/admin` to "Ready at". That label fix is merged and production is READY at `1f33f2f`. Execution time from the indexer is still not shown. **HISTORICAL:** "A Designer glance check of `/admin` is pending." That check **PASSED** at 1280 and 390 on `1f33f2f`: "Ready at 17:24:06 WIB", Done badge without Execute, clean console, one h1, no horizontal scroll, "Demo data" label. No open design S0, S1, or S2 except the faucet cooldown text with no countdown (minor S2, skippable).

Post-hackathon roadmap: role-based nav gating read from contracts.

## Tutorial page (07 §27, D-97, APPROVED 10 Oct 2026)

Fatih stated this directly in the group. Later than D-95. Chain stays testnet. The last decision number before this one was D-96. D-97 was unused. Designer writes the content. The engineer builds it. Build status: **LIVE** on production at `783b6be` (PR #76). Scout confirmed https://paron.vercel.app READY, and `/docs` returns 200. **HISTORICAL:** "Build status: PENDING, not done" and the target merge before about 19:00 WIB.

The user-navbar order that starts at Markets, with no Docs link, is **HISTORICAL** for that missing link. Provider, Operator, and Demo stay out of the navbar (D-95, including the #71 correction).

Navbar order, left to right: Docs, Markets, Buy, Trade, Portfolio, Redemptions, Faucet, Index, Data. Docs sits immediately left of Markets and opens `/docs`.

`/docs` is a complete start-to-finish tutorial for using Paron. Each step has one title, a short explanation, and one screenshot. No video.

Scout constraints:

- The tutorial covers the production app flow only.
- No link to `/demo`. `/demo` stays reachable only via "Launch demo" on the landing page (D-95).
- Screenshots come from real on-chain data, not "Demo data".
- The provider section and the operator section are short. They name the doors: "Become a provider" on the landing page, and the Operator tab in the footer, not the navbar.
- **HISTORICAL:** "Recheck the header at 1024, 1280, and 390" as still pending, and "re-shooting tutorial images 01, 02, and 05 is still pending." Designer re-check of production after `4639a4b` **PASSED** (no S0 or S1). Images 02 and 05 shipped in #80. Image 01 on production still shows the old hero. **Image 01 updated, PR pending merge** (`shots-v4/01-open-paron.png`, taken at `synced:true`, lag 2 blocks). Not live until that pull request merges. Images 02 and 05 are unchanged.

`/docs/methodology` and `/docs/contracts` stay separate routes. The older `/docs` purpose (public product write-up and README) is **HISTORICAL** for this page. **HISTORICAL:** "Target merge of the build is before about 19:00 WIB." The page is already live.

## Landing hero (07 §28, D-98, APPROVED 10 Oct 2026)

Fatih requested this in a Designer 1:1 on 10 Oct 2026. It supersedes the gold-and-glass hero above. Navbar, brand, and Launch app stay.

CRM-enterprise style: centered title, two buttons, a dashboard screenshot box, an ASCII city silhouette, and a dark brown/amber gradient.

Shipped in #86 (`ef4d797`) and #87 (`87c7d89`). The code centers the title, sends Become a provider to `/provider` and Browse markets to `/markets`, frames `/hero/markets.webp` over an ASCII Jakarta skyline, and uses a dark gradient from `#000` through `#0c0a08` to `#1a0f06` with amber radial color. The header brand "Paron", the navbar, and the header Launch app button stay. The landing Launch demo button is gone. The announcement bar still says "See the demo path" and links to `#demo`. #87 replaces only the hero image so the address in the frame is shortened (`0xA1FA…95DF`), still 2880×1880.

Designer re-check of production after `4639a4b` **PASSED**. No S0 or S1. Passed: the hero, buttons to `/provider` and `/markets`, images without full addresses, section order, navbar Docs first, the mobile menu at 390, one h1, no overflow, and the word "demo" only in the bar. Green light for the final video. Video v3 is about 2 minutes, recorded from production with the new hero, and it was sent to Fatih. Fatih uploads it.

Two minor S2 items remain: at 390 the ASCII city silhouette is covered by the card; `/provider` shows only a Connect wallet gate, with a "Demo data" label in the app top bar, outside the landing page.

## Verifier registration (07 §29, D-99, APPROVED 10 Oct 2026 ~19:50 WIB, not live)

Fatih said "ya setuju semua" in the group. The build is the handler's Verifier pull request. **PENDING** until that pull request merges and deploys. Do not write it as live. There is still no in-app KYB submission path. An attestation is issued manually on `/verifier`.

On `/verifier` provider registration:

1. "Register as provider" is disabled, with the neutral message "Link a provider attestation first" (not a red error), when the linked attestation is not role 1. A failed transaction states the reason.
2. "Attestation uid" is empty. It is not prefilled with the wallet address. Placeholder: "0x… (32-byte attestation uid)".
3. The "Connected wallet" line is shortened, `0x3F8f…` style.
4. The intro "Paron demo verifier (team-operated)" is replaced by "Paron verifier (team-operated, testnet)". The new wording does not use the word demo. **HISTORICAL:** "Verified by Paron demo verifier". Pending wording: "Verified by Paron verifier (team-operated, testnet)". That badge is recorded under D-04 and D-54. It is not in the D-84..D-88 table. D-87 is unchanged.
5. The buyer-attestation message stays, plus "Ask the verifier for a provider attestation (role 1), then link it here."

`/docs` "Good to know", approved and not live yet: "To register as a provider your wallet needs a provider attestation (role 1) issued on Verifier and linked here first. A buyer attestation can't register." The same sentence is in 06.

## Official logo (07 §30, D-100, APPROVED 10 Oct 2026 ~19:57 WIB)

Fatih approved this at about 19:57 WIB. Other decisions are unchanged.

The official Paron logo, as shown in the navbar at https://paron.vercel.app/markets: the anvil and the PARON text are off-white `#E6E9EE`. Only the small square above the anvil is orange `#F07A2A`. App assets: `/brand/paron-lockup.svg` (the text is already an outline) and `/brand/paron-mark.svg` (anvil only). Designer exports the SVG and sends it to Fatih in the 1:1 chat. That export does not change the design. The logo will appear in the README through the handler's docs pull request. **PENDING** until that pull request merges. This pull request does not edit `docs/README.md`.

## Index route

The built page is `/h100-index`. Static `/index` collided with `/` on Vercel, so `/index` redirects 307. API path `/index/H100` is unchanged.
