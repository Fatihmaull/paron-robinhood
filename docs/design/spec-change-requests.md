# Spec change requests from Paron Product Designer (for Paron Spec Writer)

Fri 9 Oct 2026. Suggestions only. Nothing here is applied; 06 stays the source of truth until Spec Writer/Fatih approve. Ordered by value for the demo.

| # | Screen | Change | Reason |
|---|---|---|---|
| 1 | Global header `ChainBadge` (06 §1.1, §12) | Chip text "RH Testnet ●" → **"Robinhood Chain Testnet"** (or "Testnet · 46630" if space is tight). | "RH" next to a green dot reads like a co-brand mark. Writing the chain name in full matches the approved wording "Deployed on Robinhood Chain Testnet" and avoids implying a relationship (PK §10.3). |
| 2 | S3 Bond health bar (06 §4.6, line 2) | Allow line 2 to render as two legend rows ("Released to provider $36.00" / "Paid to holders $45.00") with color keys matching optional bar segments (released = graphite, paid = ember). Same words, split layout. | Makes "where did the bond go" readable at a glance on the projector during the $2,214 → $2,169 moment (WOW scene). Also fits the narrow right column without wrapping. |
| 3 | `/` landing (06 §0.5: "not wireframed") | Use **"Where compute is forged into one standard."** as the landing H1, with the existing S1 subtitle ("Physical GPU compute, sold forward. 1 CU = 1 H100-equivalent GPU-hour. Every CU is bonded.") under it, then the strip + top-3 series table + "List capacity" CTA. | Gives the brand story one place in the app (judges reviewing async see it first) without touching any wireframed screen. |
| 4 | S5 Provider console, "Decline & pay" (06 §6.3) | Style as danger **outline**, not filled. (Visual only; no copy change.) | Keeps the red-filled button exclusive to "Claim default", so the WOW action is unmistakable. Listed here because 06 doesn't specify the style and L2 may default to red fill. |
| 5 | `/verifier` status pills (sitemap §4.7) | RESOLVED by Spec Writer: use 03 E20 statuses Pending, Approved, Expired, Revoked, Withdrawn (no Rejected in MVP). | Matches attestation enum. |

## Added by design audit, Fri 9 Oct 2026 (13:5x WIB). Suggestions for Spec Writer / Fatih

| # | Screen | Change | Reason |
|---|---|---|---|
| 6 | Global footer, 06 §0.2 / §1 / §5.7, dev-docs 09 (README disclaimer block), CONTEXT-INDEX never-cut list, product-knowledge §10.3 and §11.1 (close scene) | **Remove the DisclaimerFooter and all "not affiliated" copy from the product** (Fatih decision). Replace with a `UtilityBar` (links + Build · Chain · Block). Footnote moves to the pitch deck. Docs 06/09, CONTEXT-INDEX and PK §10.3 still call the footer "wajib/never-cut" and must be updated. Decide separately whether the README keeps an attribution block. | Fatih: disclaimers look like advertising the other products and undercut independence |
| 7 | `/legal/disclaimer` | Remove or rename to `/legal/risk` content only (testnet, no monetary value, not financial advice) with no affiliation statements | Same decision |
| 8 | Header `ChainBadge` | "RH Testnet" to "Testnet · 46630" (supersedes #1 wording) | With no disclaimer, "RH" must not read as co-brand |
| 9 | S3 Series page | Terminal layout in one viewport (chart, book, ticket, tabs below); see `audit/04-actions.md` S3 | Demo flow fits one screen; matches terminals |
| 10 | S4 Redemption detail | Replace single-line panel with result summary + action row; payout amount 36px mono | The default payout is the wow moment |
| 11 | Header "Connect wallet" | Secondary style; ember reserved for the page's one primary | One focal action per screen |
| 12 | Mobile `/`, `/markets` | Tables scroll in a wrapper or collapse to stacked rows; no page-level horizontal scroll | Judges use phones |
| 13 | Dev-only banners | Mock banner and snapshot switcher must not appear on the production build | Judges see Vercel build |
