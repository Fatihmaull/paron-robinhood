# Paron gap analysis: what's needed to credibly be onchain infrastructure for Ornn's compute market

Companion to `paron-design.md` (where this is also appended as §10). Not affiliated with or endorsed by Ornn AI Inc.

Researched Tue 6 Oct 2026, ~5:20 PM WIB. Every claim about Ornn, ICE or the regulations below links to a public source fetched today; anything not confirmed is marked **[unverified]**. This is not legal advice.

## 1 What Ornn's ecosystem actually runs on (research findings)

**How OCPI is built.** Sources: methodology v1.0 (July 2026), https://data.ornn.com/ocpi_methodology.pdf ; the methodology page, https://data.ornn.com/methodology ; the FAQ, https://data.ornn.com/faq ; the risk disclosure, https://data.ornn.com/risk-disclosure
- **Inputs are executed trades only.** Every observation is a tuple `(price USD/GPU-hour, number of GPUs, region, GPU type)` with a millisecond Unix timestamp. Regions are six continents. Offers and indicative prices are excluded.
- **Scope is on-demand rentals only.** Quote: "Reserved-capacity, long-term, and forward contracts are outside the scope of the indices… bespoke and bilaterally negotiated." **So Paron's forward/prepaid CU trades would not be eligible OCPI inputs as currently defined.**
- **Eligibility filters:**
  - Compute must be "successfully transferred between two different counterparties" (anti-wash).
  - GPU model, CUDA version and VRAM are verified at onboarding *and at the point of clearing*.
  - Providers are periodically re-verified against thresholds (reliability, network throughput, driver/CUDA currency, memory, host CPU/RAM/storage per GPU, interconnect).
  - Unreliable reporters are excluded.
- **Calculation:**
  - Volume-weighted winsorized mean over a rolling 1-hour window, published to $0.001.
  - The winsorization percentile α is **not published**.
  - The daily reference print is a 24-hour window ending 4:00 PM ET (FAQ, partially truncated in the fetch: **[unverified detail]**).
- **Governance:**
  - IOSCO-referenced; an independent Oversight Committee is "being established".
  - Market Disruption Event fallback: carry-forward, then suspension.
  - Conflicts policy: trades on Ornn-affiliated venues get no preferential treatment.
  - Contributors must keep records for 5 years and contribute under **written contribution agreements** (https://data.ornn.com/legal).
  - Provider identities are not disclosed.

**API and terms of use.**
- **API:** base URL `https://api.ornnai.com`, with endpoints such as `/api/daily-index?gpuType=`, `/api/gpu/{gpuName}/history-range`, `/volatility` and `/volume-metrics` (https://data.ornn.com/docs, https://data.ornn.com/docs/price-index).
- **Access tiers:**
  - The free tier (no key) serves the latest daily index for H100, H200, B200 and A100 plus 3 months of history.
  - Premium (`sk_prem_`) is $500/month, daily grain.
  - Full (`sk_live_`) adds hourly data and more forward curves.
- **Terms (https://data.ornn.com/terms, https://data.ornn.com/premium-data-use):**
  - Data is licensed for **internal use only**.
  - It may not be published, displayed or redistributed "through any website, application, API, feed, database, dashboard… trading system, financial product" without a signed agreement.
  - It may not be used for "benchmarking, settlement, reference, valuation" without one either.
  - Premium explicitly bars using it in "tokens or similar instruments" without an index license.
  - Ornn *does* license OCPI "for derivatives, structured products, oracles, analytics, and redistribution" (FAQ; contact data@ornn.com).
- **Consequence for Paron:** showing live OCPI values inside the Paron app, chart or API, or using OCPI for any coverage, margin or settlement logic, **requires a written license**. No public evidence shows OCPI available through Chainlink, Pyth or RedStone today.

**What exchanges list against.**
- **ICE OCPI H100 Future (HPR)** (https://www.ice.com/products/83050006/Ornn-Compute-Price-Index-OCPI-H100-Future):
  - Monthly and cash-settled. **Contract size = number of hours in the contract month.**
  - Final settlement = average of the daily OCPI H100 prices for the month; tick $0.001 per GPU-hour.
  - Up to 24 consecutive months listed; last trading day = last business day of the month.
- **CFTC Part 38 Appendix C** (https://www.ecfr.gov/current/title-17/chapter-I/part-38/appendix-Appendix%20C%20to%20Part%2038):
  - A cash-settled contract's index must reflect the underlying cash market and be "reliable, acceptable, publicly available and timely".
  - Susceptibility rises when "the volume of cash market transactions and/or the number of participants… are very low".
  - Physically delivered terms should "conform to the most common commercial practices… to promote convergence".
- **CFTC RFC on compute derivatives** (comments due 20 Oct 2026; see `compute-unit.md`) asks about cash-market liquidity and indexes built on "bilateral and privately priced" transactions.
- **IOSCO Principles 7–8** (https://www.iosco.org/library/pubdocs/pdf/IOSCOPD415.pdf): a benchmark should be anchored in an active market of bona fide arm's-length transactions, with a published input hierarchy.

**What makes a physical market a "physical leg."**
- **ICE Futures U.S. EFRP rules** (Rule 4.06 and the EFRP FAQ, https://www.ice.com/publicdocs/futures_us/EFRP_FAQ.pdf and https://www.ice.com/publicdocs/rulebooks/futures_us/4_Trading.pdf) require:
  - a **bona fide transfer of ownership** of the cash commodity, or a **legally binding contract** consistent with market conventions;
  - the underlying or a related product with "reasonable price correlation";
  - an **approximately equivalent quantity**;
  - opposite sides held by **independently controlled accounts with different beneficial ownership**;
  - no "transitory" offsetting;
  - documents producible on request.
- **Convergence** needs deliverable terms that match commercial practice and impose no impediments to delivery (Appendix C).
- **Whether a tokenized CU could ever qualify as an EFRP related position for HPR is [unverified] and would be the exchange's call.**

**What institutions expect.**
- **Permissioning:** ERC-3643 (https://eips.ethereum.org/EIPS/eip-3643) is an ERC-20-compatible permissioned token. Each transfer checks `IdentityRegistry.isVerified()` (ONCHAINID claims from trusted issuers) and `Compliance.canTransfer()` modules, with freeze and forced-transfer controls.
- **Wash-trade controls:** CEA §4c(a) prohibits wash sales, and CME Rule 534 covers wash results under common beneficial ownership (https://www.cmegroup.com/rulebook/files/cme-group-Rule-534.pdf). Venues provide **self-match prevention** keyed to an ID (https://www.cmegroup.com/solutions/market-access/globex/trade-on-globex/faq-self-match.html).
- **The rest:** custody via multisig or qualified custodians, an audit trail, account statements, programmatic APIs, a published fee schedule, governance with change control, and disruption fallbacks. These are general market practice, sourced from the documents above rather than one specific rule.

## 2 Gap table

| # | Needed capability | Why it matters for the Ornn narrative | Paron today | Proposed fix |
|---|---|---|---|---|
| G1 | **Machine-readable trade-print feed** with each print as `(price native USD/GPU-hour, CU qty, GPU count, region, GPU type, ms timestamp)` | Benchmarks are built from per-trade tuples like this (OCPI §2). "Prints out" is only credible if a third party can pull them | **Partial**: `Trade` events and an onchain `PrintIndex`, but no API or indexer, and prints are CU-normalized only | Ponder indexer and a REST `/v1/prints` endpoint plus CSV. Emit **native GPU type and native-hour price** alongside CU price |
| G2 | **Wash-trade and self-trade controls** at the venue | OCPI excludes non-arm's-length trades. CEA §4c(a) and CME 534 treat common beneficial ownership as wash. A feed full of self-trades is worthless | **No** | Self-match prevention in `OrderBook` keyed to the **KYB entity ID** (EAS attestation), not just the address. A per-print `eligible` flag; the index uses eligible prints only |
| G3 | **Manipulation-resistant print index** with a published method and thin-market fallback | Appendix C: low volume or few participants means high susceptibility. IOSCO 7–8 | **Partial**: plain VWAP | Volume-weighted winsorized mean over eligible prints (Paron's own published α), a minimum-volume/participant threshold, and an "insufficient data" status with carry-forward |
| G4 | **Standardized deliverable spec** (a schema, not a free-form hash) | Convergence and EFRP "related product" arguments need a defined deliverable. OCPI verifies GPU model, CUDA and VRAM at clearing | **Partial**: `specHash` of free-form JSON | A versioned `paron-spec/v1` JSON Schema: GPU type, VRAM, min CUDA/driver, interconnect, host CPU/RAM/disk per GPU, region (continent plus ISO-3166 country), access method, SLA, minimum lot. Validated in the UI, hash stored, referenced by the capacity attestation |
| G5 | **Delivery windows aligned to futures contract months** | HPR settles on the monthly average of daily OCPI H100. A calendar-month Paron series is the natural physical counterpart, and a basis vs futures is only meaningful for matching months | **Partial**: windows are arbitrary (open question 2) | Fixed **calendar-month windows** (`CU-JKT-H100-2026-11`), plus a "contract-month lot" helper (720 CU for a 30-day month, 744 for a 31-day month = hours in the month, the same size convention as HPR) |
| G6 | **Delivery guarantee and default resolution** | A physical leg needs enforceable delivery or compensation | **Yes**: 1.5× isolated bond, deadlines, permissionless default, disputes | Keep. Add **delivery records** (delivered GPU-hours per series and month) to the feed, which is the closest analogue to OCPI's "compute successfully transferred" |
| G7 | **Hardware verification at delivery** | OCPI checks hardware "at the point of clearing". Buyers and index providers need to trust the GPU is what the series claims | **No** (only offchain KYB plus an optional receipt hash) | MVP: the provider agent signs an EIP-712 delivery receipt with GPU model, UUID and VRAM from `nvidia-smi`. Roadmap: hardware attestation (e.g., NVIDIA confidential-computing attestation **[unverified fit]**) |
| G8 | **Participant permissioning (KYB) for holders, not only providers** | Institutions and regulated venues need to know who holds and trades. EFRP needs distinct beneficial owners | **Partial**: providers only; CU transfers are open | MVP: EAS-gated `ParticipantRegistry`, with a `CUToken` transfer hook allowing only verified holders on "institutional" series. Roadmap: full ERC-3643 (ONCHAINID, compliance modules, country rules, freeze/forced transfer) |
| G9 | **Licensed external reference feed** | The "Paron vs Ornn" basis story needs OCPI, but OCPI's terms bar display, reference or valuation use without a license | **Partial and non-compliant as written**: §6.1 and open question 6 assumed showing OCPI attributed was enough | `IReferenceFeed` adapter with **synthetic demo data** in the product. OCPI appears only as a cited number on slides. Roadmap: licensed OCPI via data@ornn.com, delivered by a push oracle (Chainlink/RedStone) |
| G10 | **Audit trail and statements** | Institutions reconcile. Ornn advises users to "maintain independent records" | **Partial**: events exist, no exports | Indexer-backed per-account statements (trades, fees, redemptions, defaults) as CSV, plus immutable event links to Basescan |
| G11 | **Programmatic trading API** | Market makers and desks won't click a UI. Liquidity is the cash-market depth the CFTC asks about | **No** | Read API (order book, prints) in the MVP. EIP-712 signed off-chain orders with onchain settlement as nice/roadmap (Seaport-style or a custom `fillSigned`) |
| G12 | **Governance and custody** | Credible admin keys, change control, institutional wallets | **Partial**: timelock designed, Safe only for the arbitrator | Safe multisig as admin, verifier and arbitrator. Contracts compatible with smart-contract wallets (EIP-1271 for signed orders) so custodians and MPC wallets work |
| G13 | **Market disruption and data governance** | Exchanges need fallbacks (OCPI has an MDE hierarchy) and a documented methodology with change control | **No** | `PrintIndex` status `{OK, THIN, DISRUPTED}` with carry-forward limits. `METHODOLOGY.md` versioned in the repo. Parameter changes through the timelock |
| G14 | **Legal series terms** | EFRP needs a "bona fide, legally binding contract". Holders need enforceable rights beyond the bond | **No** | Template series terms (PDF/Markdown) whose hash is stored in the series struct and shown at purchase. Roadmap: counsel-reviewed terms, OJK/Indonesia structuring |
| G15 | **Security assurance** | Institutions ask "who audited this?" | **Partial**: Foundry invariants planned | Add Slither in CI, the invariant suite and a short threat model. Roadmap: external audit |
| G16 | **Data-contribution readiness** | The only route into an external benchmark is a written contribution agreement, and OCPI currently takes on-demand trades only | **No** | Roadmap: a delivered-rental data export (delivered hours, realized price per GPU-hour, region, GPU type, verified counterparties) in a contributor-friendly format. Pitch it as "ready to contribute to any benchmark that accepts physical-delivery data", **not** as feeding OCPI |

## 3 Tech stack additions (concrete)

| Layer | Tool / standard | Use in Paron | Phase |
|---|---|---|---|
| Indexing | **Ponder** (https://ponder.sh; TypeScript, Postgres, GraphQL/SQL; Base Sepolia chain 84532). Alternative: The Graph subgraph (Base supported; Base Sepolia support **[check]**) | Index `Trade`, `Redeemed`, `Delivered`, `Defaulted`, `SeriesCreated` events → prints, statements, delivered-hours | MUST |
| Data API | Ponder's built-in HTTP/GraphQL, or a thin Hono/Next.js API route | `GET /v1/prints?gpu=H100&region=AS&from=&to=` (JSON + CSV), `GET /v1/index/{gpu}`, `GET /v1/series/{id}`, `GET /v1/accounts/{addr}/statement` | MUST |
| Identity / KYB | **EAS** (Base Sepolia, predeployed at `0x4200…0021`) | Schemas `ParticipantVerified(entityId, role, country, expiry)`, `CapacityAttested(seriesId, specHash, gpuHours)`, `DeliveryReceipt` | MUST (participant and capacity), NICE (receipt) |
| Permissioning | EAS-gated allowlist hook now; **ERC-3643** (T-REX: ONCHAINID, IdentityRegistry, ModularCompliance) later | `CUToken._update` checks `ParticipantRegistry.isVerified(to)` on institutional series | MUST (allowlist), ROADMAP (ERC-3643) |
| Market integrity | Custom: self-match prevention by `entityId`, per-print eligibility flags, winsorized VWAP, min-volume threshold | `OrderBook` + `PrintIndex` | MUST |
| Signed orders | **EIP-712** typed orders (+ EIP-1271 for Safe/MPC wallets) | Gasless maker quotes, settled onchain by `fillSigned` | NICE / ROADMAP |
| Reference feed | `IReferenceFeed` adapter: MVP `SyntheticReferenceFeed` (demo data); later a **licensed** OCPI push via **Chainlink** Data Feeds/Functions or **RedStone**, or Silicon Data if licensed | Basis and coverage display only, never payouts | NICE (synthetic), ROADMAP (licensed) |
| Delivery evidence | Provider agent (Node + viem) reads `nvidia-smi` and signs an EIP-712 receipt; hash goes onchain | Hardware conformance at delivery | NICE |
| Governance / custody | **Safe** multisig (2-of-3) as admin, verifier and arbitrator; OZ `TimelockController` | Change control | MUST (config only) |
| Testing / security | **Foundry** fuzz and invariant tests (`bond ≥ bondPerCU × (supply + locked)`, no self-match prints, index ignores ineligible prints); **Slither** in GitHub Actions | Assurance | MUST (invariants), NICE (Slither) |
| Analytics | Next.js dashboard on the Paron API (forward curve across monthly series, PrintIndex, delivered hours, default rate, basis vs reference); optionally a public **Dune** dashboard | Demo and "data product" story | NICE |
| Docs | `METHODOLOGY.md` (PrintIndex rules, eligibility, fallback), `paron-spec/v1.schema.json`, `SERIES_TERMS.md` | Benchmark and legal credibility | MUST (methodology + schema), NICE (terms) |

## 4 Features: MUST (27h), NICE, ROADMAP

**MUST: 4 additions to the existing MVP**, chosen because each closes a gap a judge or an Ornn person would probe first, and each is ≤ about 3 dev-hours:
1. **Paron Prints API.** A Ponder indexer and `/v1/prints` JSON/CSV. Each print carries native GPU type, native USD/GPU-hour, CU price, quantity, region (continent + ISO country), ms timestamp, series, eligibility flag and tx hash. A `/v1/index/H100` endpoint returns the PrintIndex with its status. *(G1, G10)*
2. **Market-integrity layer.** Self-match prevention by KYB `entityId` in `OrderBook`, an `eligible` flag on each print, and a `PrintIndex` that uses a volume-weighted winsorized mean over eligible prints with a minimum-volume threshold and `THIN` status. *(G2, G3, G13)*
3. **Standard deliverable spec and contract-month series.** `paron-spec/v1` JSON Schema enforced by the listing wizard. Series windows are fixed calendar months. A lot helper offers "720 CU = one H100 GPU for November", the same hours-in-month size convention as ICE HPR. *(G4, G5; resolves open question 2)*
4. **Participant KYB gate.** An EAS `ParticipantVerified` attestation for buyers and traders, checked in a `CUToken` transfer hook (ERC-3643-lite) and used as the `entityId` for self-match prevention. A Safe multisig is the verifier. *(G8, G12)*

**NICE (demo polish):**
- Synthetic `IReferenceFeed` and a basis chart.
- Forward-curve chart across monthly series.
- Agent-signed EIP-712 delivery receipts with `nvidia-smi` data.
- Per-account CSV statements.
- Slither in CI.
- `SERIES_TERMS.md` template with its hash in the series.
- Public Dune dashboard.

**ROADMAP (pitch only):**
- Full ERC-3643 compliance.
- Licensed OCPI reference via a push oracle.
- EIP-712 signed orders and a market-maker program.
- Hardware attestation at delivery.
- External audit.
- Counsel-reviewed series terms and Indonesian (OJK) structuring.
- Benchmark-contribution export of delivered-rental data under a written contribution agreement.
- EFRP-ready documentation (title records, confirmations, beneficial-owner separation), subject to any exchange's own eligibility decision.
- Independent methodology oversight for PrintIndex (IOSCO-style statement).
- USDC/IDRX multi-settlement.

**Build-plan impact:** about 10–12 extra dev-hours. Absorb it by dropping order-book extras (keep ≤ 10 price levels), building the Ponder indexer on Fri 16–20 in parallel with the frontend, and moving "real EAS for providers" from nice to must (it's now shared with the participant gate).

## 5 How to show the Ornn link in the demo, without implying partnership or breaching terms

1. **"Paron Prints" live call (15 s).** On stage, run `curl https://<paron-api>/v1/prints?gpu=H100&limit=3` and show JSON whose fields mirror the *public* OCPI observation tuple: price per GPU-hour, GPU count, region, GPU type, millisecond timestamp. Add Paron extras: `eligible`, `series`, `delivery_window`, `tx_hash`. Line: *"Every Paron fill is a public, verifiable transaction print in the same shape benchmark methodologies already use. Any index provider could ingest it."* Never say "Ornn-compatible" or "feeds OCPI".
2. **"Forward vs spot" chart.** In the product, the PrintIndex for `H100 2026-11` (forward, physically deliverable) is plotted against a reference line labelled **"Spot reference (synthetic demo data)"** plus the basis. On one slide, outside the product, cite the public fact as text: *"OCPI H100 settled at $2.52/GPU-hour on 5 Oct 2026 (source: data.ornn.com)."* Don't pull OCPI into the app, API or chart without a written license (terms in §10.1).
3. **Contract-month lot card.** Next to a November H100 series, show "720 CU = 1 H100 for November (720 hours)". On a slide, cite ICE's public HPR spec: *"contract size = number of hours in the contract month; final settlement = average of daily OCPI H100."* Line: *"A Paron monthly series is the deliverable counterpart of a cash-settled compute month."*
4. **Physical-leg explainer slide (hypothetical, clearly labelled).** "A Jakarta provider sells November capacity on Paron (physical forward, bonded at 1.5×). A buyer that also trades cash-settled compute futures can manage price risk there, while Paron guarantees delivery or compensation." Footnote: *"Illustrative. EFRP eligibility is determined by the relevant exchange's rules."*
5. **Integrity callout (10 s).** Try to self-trade with two wallets under the same KYB entity. `OrderBook` rejects it with `SelfMatch()`, and the print never enters the index. Line: *"Prints are arm's-length by construction."*
6. **Footnote on every slide that names Ornn, ICE or OCPI:** *"Not affiliated with or endorsed by Ornn AI Inc. or ICE. OCPI and HPR are trademarks of their respective owners; figures cited from public sources."*

**Optional (Fatih's call; external action, not taken):** email data@ornn.com before Friday to ask whether a non-commercial hackathon display license for OCPI is possible. That would allow a live OCPI line in the chart. Keep the wording to a license inquiry only, with no partnership language.
