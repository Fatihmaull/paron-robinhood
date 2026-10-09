# Paron brand identity v1

Paron Product Designer · Fri 9 Oct 2026 · status: **v1, recommended direction applied** (Fatih can override anything in "Decisions for Fatih").
Sources: `paron-product-knowledge.md` §1, §2, §10.3; `06-screens-wireframes.md` §0.2–§0.3; `research.md`.

## 1. Positioning

**Paron is the clearing floor for GPU compute.** Every GPU-hour is forged into one standard, bonded unit (CU) that anyone can buy, trade, or redeem. If the provider fails, code pays the holder.

- Primary tagline (app `/`, README, slides): **"Where compute is forged into one standard."**
- Secondary (slides only): "Every GPU, one anvil, one unit." · "Strike once. Trade anywhere." · ID: "Ditempa jadi satu standar."
- Feel: exchange + clearing house. Calm, exact, auditable. Think settlement terminal, not launchpad.
- Proof points we design around: **bond locked before CU exist**, **public prints**, **claim default from any wallet** ("No admin, no oracle.").

## 2. Voice and copy rules

UI copy is English (06 §0.1, P6-01). Copy in 06 is **final**. These rules are for new strings (toasts, empty states, landing) and for reviewing L2's output.

| Rule | Do | Don't |
|---|---|---|
| State facts with numbers and units | "Bond $2,250.00 locked." · "$3.20/CU" | "Huge bond!" · "$3.2" |
| Say who can act | "Anyone can claim the default." | "Claim available" |
| Use Paron's nouns exactly | CU, series, bond, print, PrintIndex, redemption, default, provider, holder | "token pack", "GPU coin", "insurance", "pool" (we have no insurance pool) |
| Use the forge metaphor only for the act of listing | "Forge a series" (slides, landing CTA), "List capacity" (in-app, as 06) | "Forging your gains 🔥", anvil puns in error messages |
| Plain verbs, sentence case | "Request redemption", "Claim default" | "REDEEM NOW!!", "Smash that button" |
| No hype, no emoji in product UI | "Default paid. $45.00 sent to 0x2222…2222." | "🚀 Paid out!!" |
| Be honest about demo status | "Paron demo verifier", "Spot reference (synthetic demo data)", "Testnet demo: tokens have no monetary value." | "Audited by…", "Live price feed", "OCPI price" |
| Chain wording | "Deployed on Robinhood Chain Testnet." | "Built for / backed by / partnered with / powered by Robinhood" |
| Benchmarks | "could ingest benchmarks like OCPI" (pitch only) | "feeds OCPI", "Ornn partner", any OCPI number in the app |

## 3. Color system: "forged graphite + ember"

**Rationale.** An anvil is dark iron; the only light in a forge is hot metal. So the UI is cool graphite neutrals (iron) with **one** warm accent, ember, used only for primary actions, focus, and the brand mark. Market semantics (bid/ask, OK/THIN/DISRUPTED, redemption states) get their own hues and never borrow the accent. Everything stays far from Robinhood's black + Robin Neon (`#CCFF00`) system (research #1).

### Key tokens (dark default)

| Role | Token | Hex | Use |
|---|---|---|---|
| Canvas | `--color-bg-canvas` | `#0A0C0F` | page background |
| Surface | `--color-bg-surface` | `#101317` | panels, tables |
| Raised | `--color-bg-raised` | `#161A21` | modals, drawers |
| Border | `--color-border-default` | `#2A313C` | panel edges |
| Input edge | `--color-border-input` | `#646E7E` | ≥ 3:1 vs surface |
| Text | `--color-text-primary` / `-secondary` / `-tertiary` | `#E6E9EE` / `#A3ABB8` / `#838C9B` | 15.3 / 8.1 / 5.5 :1 on surface |
| **Ember accent** | `--color-accent` | `#F07A2A` | primary button, focus ring, brand unit square, own-order dot |
| Bid / up / OK | `--color-bid`, `--color-ok` | `#3CC68A` | bids, Buy, PrintIndex OK, Completed, "Covers … ✓" |
| Ask / down | `--color-ask` | `#F2646A` | asks, Sell |
| Warn / THIN | `--color-warn` | `#E8B64C` | PrintIndex THIN, "Delivered · review", countdown ≤ 10 s |
| Danger | `--color-danger` / `-fill` | `#F2575C` / `#D93036` | DISRUPTED, "Deadline missed", **Claim default** button, under-covered |
| Info | `--color-info` | `#6AA8F5` | in-progress states, links |
| Dispute | `--color-dispute` | `#B09CFB` | "In dispute", arbitration |

### Semantic maps

- **PrintIndex**: OK = ok green pill · THIN = amber pill · DISRUPTED = red pill. The word is always inside the pill.
- **Redemption badge** (06 §5.4 copy): Waiting for provider ack / Provider acknowledged = info · Delivered · review = warn · Deadline missed = danger (plus a 3 px red left rule on the card) · In dispute = violet · Defaulted · paid $X = ember (the bond did its job) · Completed = ok · Refunded · CU returned = neutral.
- **Bond health**: bar fill = ok while `balance ≥ bond_per_cu × total_supply`; danger if under-covered. Optional segments to the right of the fill: released (graphite) and paid to holders (ember), since balance + released + slashed = deposited ($2,169 + $36 + $45 = $2,250).
- **Buttons**: one ember primary per panel. Claim default is the only red filled button in the product.
- **Light theme** (optional, `data-theme="light"`): same roles, darker hues for AA on white (ember text `#B4500F`, bid `#0B7F55`, ask `#C02E37`). See `tokens.css`.

All text pairs pass WCAG AA; most pass AAA. Full table: `contrast-report.md`.

## 4. Typography

Free, open-licensed (SIL OFL), on Google Fonts and `next/font/google`:

- **IBM Plex Sans** (400/500/600): all UI text, headings, labels. Engineered, industrial, neutral, which fits a clearing house.
- **IBM Plex Mono** (400/500/600): every number that a user compares or copies: prices, sizes, USDC amounts, coverage, countdowns, addresses, tx hashes, series symbols, block numbers. Mono gives tabular alignment for free (research #11).
- Scale (px): 11 legal · 12 labels/pills · **13 table/data default** · 14 body/buttons · 16 panel titles · 20 series symbol · 26 page title · 36 hero amounts · 56 mobile countdown (06 §5.7 asks ≥ 48).
- Panel titles: 12 px uppercase, tracking 0.08em, tertiary color ("ORDER BOOK", "BOND").
- Numeric table cells right-aligned; never mix mono and sans inside one number.

## 5. Logo and wordmark

Files in `logo/`: `paron-mark.svg`, `paron-mark-mono.svg`, `paron-wordmark.svg`, `paron-lockup.svg` (dark bg), `paron-lockup-light.svg`, `favicon.svg`.

- **Mark:** a flat, geometric anvil silhouette (horn left, face, waist, base) with one small **ember square** above the face: the single standard unit being struck. Hard edges only. No sparks, flames, hammers or gradients.
- **Wordmark:** "PARON" in custom monoline geometric caps, wide tracking, square cuts. Drawn as SVG paths, so it needs no font.
- **Colors:** mark + wordmark in text-primary (`#E6E9EE` on dark, `#12161C` on light). The unit square is always ember `#F07A2A`. Mono version: all one color.
- **Clear space:** the height of the unit square on every side. **Minimum size:** mark 16 px; lockup 96 px wide.
- **Never:** put the mark in green or lime, add a feather/arrow, outline it, put it on photos, or animate it beyond a 1-step fade.
- Header uses the lockup at 24 px tall. Mobile S4-R uses the mark + "PARON" lockup at 20 px.

## 6. Number and data formatting (mirrors 06 §0.3, binding)

| Thing | Format | Example |
|---|---|---|
| Price per CU | `$` + 2 dp + "/CU" in tables, "$x / CU" in buy box | `$3.20/CU` |
| Native GPU price | `$` + 2 dp + "/{GPU}-hour" | `$5.69/H200-hour` |
| USDC amount | `$` + thousands comma + 2 dp (up to 6 dp only if non-zero) | `$2,250.00`, `$0.024` |
| CU quantity | integer + " CU"; 2 dp if fractional | `20 CU`, `2.50 CU` |
| Factor / coverage | 2 dp + `×` (multiplication sign, not "x") | `1.40×`, `1.50×` |
| Backing badge | integer percent + " backed", only if bond ≥ 2 × primary | `200% backed` |
| Series symbol | mono, uppercase, never truncated | `CU-JKT-H100-2610` |
| Address / tx | `0x` + 4 + `…` (single ellipsis char) + 4, mono, click to copy, ↗ to explorer | `0x2222…2222` |
| Time | local + zone, mono | `10:00:40 WIB` |
| Countdown | `m:ss` / `h:mm:ss` / `{d}d {h}h`, mono, "(server time)" label | `0:41` |
| Negative / overdue | words, not just red | `Deadline passed 0:12 ago.` |

## 7. Guardrails (hard, from PK §10.3 and 06 §0.2)

1. **No "not affiliated" / disclaimer copy anywhere in the product** (Fatih decision, Fri 9 Oct 2026). No disclaimer footer. The non-affiliation statement lives in the pitch deck only. The page bottom is a quiet utility bar (links + mono "Build · Chain · Block", no legal text). Testnet status stays visible through the header chain chip ("Testnet · 46630") and `/legal/risk`.
2. No Robinhood logo, feather, Robin Neon/lime (`#CCFF00`-like), old Robinhood green (`#00C805`-like) as brand, Robinhood fonts, or Robinhood-style hero layouts. No "built for / backed by / partnered with / powered by".
3. No OCPI value, chart or logo anywhere in the app; reference prices are labelled "Spot reference (synthetic demo data)".
4. No "partner" / "powered by Ornn". Ornn is not named in the product UI at all (pitch deck only).
5. No Stock Tokens or other chain assets.
6. Out of scope: leverage/perps UI beyond the `/trade/leverage` "Coming soon" tab with the exact 06 copy, governance token, cash-settlement oracle.
7. Verifier is always "Paron demo verifier" (D-04), never presented as a third party.

## 8. Decisions for Fatih (max 2; recommendation applied if no answer)

1. **Accent color.** **A, ember orange `#F07A2A` (recommended):** carries the anvil/forge story, is distinct from bid green, ask red and warning amber, and is far from Robinhood lime. B, cold steel blue `#5B9BF0`: even more "bank", but generic, and it collides with info/link blue. → *Applied: A.*
2. **Type pairing.** **A, IBM Plex Sans + IBM Plex Mono (recommended):** one family, so the sans and the numbers match; industrial heritage; OFL. B, Inter + JetBrains Mono: very common in crypto UIs and slightly denser, but less distinctive. → *Applied: A.*
