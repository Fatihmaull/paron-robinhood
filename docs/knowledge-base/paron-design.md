# Paron: design brief for a collateral-backed compute-unit marketplace

*Paron* is the Indonesian/Javanese word for **anvil**, the block a smith strikes every blade on. Paron is the anvil where every GPU, whatever its model, is forged into one standard, tradable unit of compute (see `names.md`).

Updated Tue 6 Oct 2026, ~4:55 PM WIB; chain decision applied ~8:15 PM WIB (§11).

ETHJKT 2026, RWA track ("Build the Real World Onchain"). Written Tue 6 Oct 2026, ~4:45 PM WIB. Build window: Fri 9 Oct 09:00 → Sat 10 Oct 12:00 WIB (27h).
Decisions Fatih has locked:
- **Name: Paron.**
- **Settlement: USDC only** for the MVP (MockUSDC on testnets). IDRX is a future option, not built. Long-term stablecoin per venue is an open question (§9, Q11).
- **Chain: Robinhood Chain Testnet (46630) primary, Arbitrum Sepolia (421614) fallback.** Go/no-go is at Fri 9 Oct 10:30 WIB (§11).
- **Bond floor: 1.5 × primary price per CU.**
- Institutional and serious, not a meme launchpad. "pump.fun" only describes how easy listing is.
- CU definition: 1 CU = 1 H100-equivalent GPU-hour, with GPU conversion factors (§1.1).
- The provider sets the primary price, then a secondary market takes over.
- Provisioning and redemption happen offchain at each provider. We are only the market.
- Collateral is mandatory and pays holders on proven default.
- Narrative: onchain infrastructure that complements Ornn, never implying a partnership.

Related files:
- `compute-unit.md`: Ornn research, Indonesian market data, and earlier delivery and default design notes.
- `names.md`: name candidates.

---

## 1. Concept

**One line:** *Any verified data center can list its GPU capacity as collateral-backed compute units in a few clicks. Anyone can buy, trade or redeem them, and if the provider fails to deliver, the contract pays holders from the provider's bond.*

- **Unit:** 1 CU = 1 H100-SXM-80GB-equivalent GPU-hour. Each series snapshots its GPU's conversion factor at listing: H100 1.00, H200 1.40, B200 2.50, GB200 3.50, A100 0.60, RTX4090 0.35. The factors and their public sources are in §1.1.
  - Example: an H200 provider listing 1,000 H200-hours issues 1,400 CU.
  - Redeeming 14 CU from that series gets 10 H200-hours.
  - Prices are quoted **per CU**, so every series is comparable on one curve.
- **Series:** one listing = one ERC-20 token, e.g. `CU-JKT-H100-2611` (provider, region, GPU class, redemption window). Each series carries:
  - an immutable spec hash (SLA, interconnect, region, access method, minimum redemption);
  - a redemption window, e.g. "redeemable 1–30 Nov 2026";
  - its own **isolated bond**.
- **Compute is a flow good** (Ornn's own framing, `compute-unit.md`), so series are **time-bounded**. After the window closes, unredeemed CU expire, like reserved capacity or a hotel night. Expiry gives every obligation a known end and makes the bond releasable. It also means there's **no perpetual oracle-priced cash claim**: an always-open cash redemption at an oracle price would let anyone buy below the reference and drain collateral.
- **What's onchain vs offchain:**

  | Onchain (enforced by code) | Offchain (provider's business) |
  |---|---|
  | Provider verification attestations, conversion factors, series terms | KYB documents, contracts, the actual servers |
  | Minting capped by bond, primary sale, order book, trade prints | Provisioning: SSH, API keys, Kubernetes namespaces |
  | Redemption requests, acknowledgment and delivery deadlines, disputes, default payouts from the bond | Running the workload, support, SLA operations |
  | Bond custody, release and slashing | Legal recourse beyond the bond (provider terms) |

- **Two failure modes ruled out by construction:**
  1. **No unbacked minting.** A series can't exist without a bond of `bondPerCU × maxSupply` deposited in the same transaction. The invariant `bond[s] ≥ bondPerCU × (circulating + inRedemption)` is checked in Foundry invariant tests.
  2. **No oracle-priced cash redemption and no shared pool.** Payouts happen only on proven default, at a fixed `bondPerCU` set at listing, and only from that series' own bond. No external price feed is ever used to pay anyone.

### 1.1 GPU conversion factors and public sources

**Method.** Start from a spec-only capability score relative to H100 SXM: `0.70 × (dense BF16 Tensor TFLOPS ratio) + 0.30 × (memory bandwidth ratio)`. Then sanity-check it against observed market rental-price ratios. Memory capacity and NVLink domain size carry real price premia that throughput alone misses. The factor is a **policy value** in `ConversionTable`: timelocked, and snapshotted per series, so a later change never re-prices existing units.

| GPU | Dense BF16 Tensor | Memory BW | Spec score | Market ratio vs H100 | **Paron factor** | Review note |
|---|---|---|---|---|---|---|
| H100 SXM 80GB | 989.5 TFLOPS (1,979 sparse) | 3.35 TB/s | 1.00 | 1.00 | **1.00** | Definition |
| H200 SXM 141GB | 989.5 TFLOPS (1,979 sparse) | 4.8 TB/s | 1.13 | 1.35 (AIMultiple Sep-26 median) to 2.08 (OCPI 5 Oct 26) | **1.40** | Within range; the extra memory capacity (141 vs 80 GB) is priced by the market |
| B200 SXM 180GB | 2.25 PFLOPS (4.5 sparse) | ~8 TB/s | 2.31 | 2.01 (AIMultiple) to 3.00 (OCPI) | **2.50** | Within range |
| GB200 (per GPU, NVL72) | 2.5 PFLOPS (360 PF sparse ÷ 72) | 8 TB/s (576 ÷ 72) | 2.49 | ~4.4 (thin on-demand listings) | **3.50** | Premium for the 72-GPU NVLink domain; few market data points |
| A100 SXM 80GB | 312 TFLOPS (624 sparse) | 2.039 TB/s | 0.40 | 0.37 (OCPI) to 0.54 (AIMultiple) | **0.60** | ⚠ Above both spec and market; consider 0.45 |
| RTX 4090 24GB | 165.2 TFLOPS (FP32 accumulate; 330.4 sparse) | 1.008 TB/s | 0.21 | 0.135 (AIMultiple) | **0.35** | ⚠ Above both; consider 0.20, or don't list consumer GPUs in the MVP |

**Sources** (fetched 6 Oct 2026):
- NVIDIA datasheets:
  - H100: https://www.nvidia.com/en-us/data-center/h100/
  - H200: https://www.nvidia.com/en-us/data-center/h200/
  - HGX B200 (36 PF BF16 sparse per 8 GPUs): https://www.nvidia.com/en-us/data-center/hgx/ and https://images.nvidia.com/aem-dam/Solutions/documents/HGX-B200-PCF-Summary.pdf
  - B200 per-GPU memory bandwidth: https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html
  - GB200 NVL72: https://www.nvidia.com/en-us/data-center/gb200-nvl72/
  - A100: https://www.nvidia.com/en-us/data-center/a100/
  - RTX 4090 (Ada whitepaper): https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf
- Market ratios:
  - Ornn's public OCPI settlements, 5 Oct 2026 (H100 $2.52, H200 $5.23, B200 $7.55, A100 $0.92): https://data.ornn.com/gpu-cloud-price-comparison
  - AIMultiple's September 2026 on-demand medians (H100 $3.25, H200 $4.40, B200 $6.52, A100 $1.76, RTX 4090 $0.44): https://aimultiple.com/gpu-index
  - GB200 listing floor $8.00 vs H100 $1.80: https://gpurentalprices.com/gpus

  Market ratios move week to week. Treat them as a sanity band, not a formula input.

## 2. Roles and flows

| Role | Who | Can do |
|---|---|---|
| **Provider** | Data center or GPU cloud (e.g., a Jakarta colo, a Batam AI campus tenant) | Get verified, list a series (post bond), set primary price, acknowledge and deliver redemptions, withdraw bond after expiry |
| **Verifier** | Allowlisted credential issuer (in the MVP, our team multisig; later auditors or KYB firms) | Issue or revoke `ProviderVerified` and optional `CapacityAttested` EAS attestations |
| **Buyer / holder** | AI startup, lab, enterprise | Buy at primary, trade, request redemption, confirm or dispute delivery, claim default |
| **Trader / market maker** | Funds, hedgers, provider market-making desks | Place limit orders, provide liquidity, run basis trades vs external indices |
| **Arbitrator** | Chosen per series at listing from an allowlist (MVP: a 2-of-3 panel; later Kleros or UMA adapters) | Rule on disputed redemptions only |
| **Keeper (anyone)** | Any wallet | Trigger `claimDefault` after missed deadlines, finalize expired series |

### Flow A: list a series in a few clicks (the pump.fun analogy)
1. Provider connects a wallet. The UI checks for a `ProviderVerified` EAS attestation (KYB done offchain by a verifier).
2. **Step 1 of the wizard, Capacity:** GPU model (the factor auto-fills), GPU-hours offered, region, redemption window, spec form (hashed to `specHash`, JSON pinned to IPFS).
3. **Step 2, Terms:**
   - Primary price per CU.
   - Bond per CU: the protocol minimum is **1.5 × primary price**, and providers can post more to earn a "200% backed" badge.
   - Acknowledgment window (default 24h), delivery window (default 48h after ack), dispute window (72h), arbitrator.
4. **Step 3, Bond and launch:** a single transaction approves USDC and calls `SeriesFactory.createSeries(...)`. This deploys the ERC-20 clone, locks the bond and opens the primary sale. **Under a minute end to end.**

### Flow B: primary buy → secondary trading
1. Buyer pays `qty × primaryPrice` in USDC. `PrimarySale` mints CU directly to the buyer, up to `maxSupply`. There's no pre-minted inventory.
2. Proceeds, minus a 1% protocol fee, go to the provider immediately. The holder is protected by the bond, not by escrowed proceeds; see §4.4 for why that's sufficient.
3. Holders can sell on the **order book** at any time before the window closes. Every fill emits `Trade(series, price, qty, cuPrice)` and updates `PrintIndex`.

### Flow C: redemption (happy path)
1. Holder calls `requestRedemption(series, amount, deliveryRef)` during the window. `deliveryRef` is the hash of offchain access details (e.g., an SSH public key or account email, encrypted to the provider's published key and pinned to IPFS). The CU are **locked**, not burned.
2. Provider calls `acknowledge(reqId)` within the ack window.
3. Provider provisions offchain and calls `markDelivered(reqId, receiptHash)` within the delivery window. The receipt can be a usage report hash, or optionally signed GPU heartbeats (a nice-to-have).
4. Holder calls `confirm(reqId)`. If the holder does nothing, it auto-finalizes after the dispute window. CU are burned, `bondPerCU × amount` is released back to the provider, and the provider's `deliveredCU` reputation counter goes up.

### Flow D: default (see §4)
A missed acknowledgment or delivery deadline lets anyone call `claimDefault(reqId)`, which pays `bondPerCU × amount` to the holder from that series' bond. Disputed deliveries go to the series' arbitrator.

### Flow E: expiry
After `windowEnd`, plus a grace period for open requests, anyone calls `finalizeSeries(s)`. Unredeemed CU are void and token transfers are blocked. The provider's remaining bond (for CU never redeemed or already delivered) becomes withdrawable.

## 3. Contracts and what each enforces

Foundry v1.8.5, Solidity 0.8.37 (`pragma solidity 0.8.37` in our files, `evm_version = cancun`, optimizer on; **no global `solc` pin in foundry.toml**, because the EAS 1.9.0 sources need exact 0.8.29 and forge auto-detect builds both, as tested 6 Oct, see `open-questions-research.md` §3), OpenZeppelin 5.6.1 (AccessControl, ERC20, Clones, SafeERC20, ReentrancyGuard, Pausable, EIP712, TimelockController). **Chain-agnostic.** Primary is Robinhood Chain Testnet (46630), using EAS we deploy ourselves. Fallback is Arbitrum Sepolia (421614), using the existing EAS at `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE`. Full chain config is in §11.

| # | Contract | Enforces | 27h priority |
|---|---|---|---|
| 1 | `ProviderRegistry` | A provider can list only if it holds a non-revoked `ProviderVerified` EAS attestation from an allowlisted verifier (MVP fallback: a verifier-role mapping). Status: Active, Suspended or Banned. Reputation counters `deliveredCU`, `defaultedCU`, `disputesLost` are written only by `RedemptionManager` | Must |
| 2 | `ConversionTable` | GPU model → factor (1e4 precision). Changes are **timelocked** (`TimelockController`, 48h; demo 5 min) and only affect *new* series, because the factor is snapshotted at listing | Must (simple) |
| 3 | `SeriesFactory` | `createSeries` validates the terms: window in the future, `bondPerCU ≥ 1.5 × primaryPrice`, positive supply, allowlisted arbitrator, ack/delivery/dispute windows within bounds. It **pulls the full bond in the same transaction** and deploys a `CUToken` clone (EIP-1167). The series struct is immutable except for `primaryPrice`, which can only go **up** while the sale is open, and `pause` | Must |
| 4 | `CUToken` (ERC-20 clone per series) | Mint only by `PrimarySale`. Burn only by `RedemptionManager`. **Transfers blocked after `windowEnd`** so dead tokens can't be traded. Locked redemption balances are held by `RedemptionManager`. 18 decimals; the UI shows CU with 2 decimals | Must |
| 5 | `BondVault` | Per-series isolated USDC accounting. `release` and `slash` are callable only by `RedemptionManager`; `withdrawRemaining` only by the provider after `finalizeSeries`. Invariant: `bond[s] ≥ bondPerCU × (totalSupply + locked)`. **There is no cross-series path**, so one provider's default can't touch another's bond, and there's no shared insurance pool to drain | Must |
| 6 | `PrimarySale` | Fixed price from the series. Mints up to `maxSupply`. `maxCost` is **required** (passing 0 can never disable slippage protection). Sends fee to treasury and the rest to the provider. Closes at `windowEnd − leadTime` | Must |
| 7 | `OrderBook` (CLOB-lite) | Per-series limit orders in USDC on fixed ticks (0.01). Price-time priority within a tick, partial fills, cancel. Resting orders escrow the asset. Taker fee to treasury. Rejects orders after `windowEnd`. Emits `Trade` | Must (minimal: ≤ 20 active price levels per side; matching loop bounded) |
| 8 | `RedemptionManager` | The state machine in §4: deadlines, minimum redemption size, dispute bonds, a permissionless `claimDefault`, the arbitrator callback, reputation updates. ReentrancyGuard on all value transfers; checks-effects-interactions | **Must, the core** |
| 9 | `IArbitrator` + `PanelArbitrator` | `rule(reqId, outcome)` from an allowlisted panel (2-of-3 signatures, or a Safe). Ruling deadline; if the panel misses it, the fallback **refunds the holder's CU and dispute bond, with no slash** (neutral) | Must (panel). Kleros or UMA adapter is nice-to-have |
| 10 | `PrintIndex` | VWAP and TWAP of fills per GPU class in **CU terms** (price ÷ factor normalizes across GPUs), plus delivered-CU and default-rate counters. Exposes an `AggregatorV3Interface`-style `latestRoundData()` so any protocol or index provider can read it | Must (VWAP). TWAP is nice-to-have |
| 11 | `ReferenceFeed` | Signed push of an *external* reference price (e.g., a public H100 benchmark), **for display and coverage ratio only, never for payouts**. Labelled "reference, manually updated" in the MVP | Nice |
| 12 | `MockUSDC` | Testnet settlement token (6 decimals, like USDC) with a faucet, deployed on both chains for parity. **USDC only in the MVP**; the settlement token is a constructor parameter, so IDRX, USDG or another stablecoin can be added later without a redesign | Must |
| 13 | `IParticipantGate` + `EASGate` / `RegistryGate` | One interface for KYB checks (`isVerified(addr)`, `entityId(addr)`). `EASGate` reads `ParticipantVerified` attestations from whichever EAS address the chain config gives (self-deployed on Robinhood, existing on Arbitrum Sepolia). `RegistryGate` is a role-managed allowlist that we switch to if EAS fails on Friday | Must |

**Order book vs AMM: use the order book (CLOB-lite).**
- **Expiring assets break AMMs.** CU lose all value after the window closes, so x·y=k liquidity providers would be steadily left holding decaying CU, and the bonding-curve "graduation" model only fits perpetual meme tokens.
- **Institutional flow is discrete and price-aware.** Providers and market makers want to post limit prices, like quoting capacity.
- **Prints are the product.** Each fill is a real, attributable transacted price, which is exactly what benchmark builders need: the CFTC's RFC worries about indexes built on "bilateral and privately priced" deals (`compute-unit.md` §1).
- **The cost:** on-chain matching is gas-heavy, so it's acceptable on an L2 (Robinhood Chain or Arbitrum) with a bounded number of price levels.
- **Later:** an RFQ desk for block trades, and optionally a Uniswap v4 hook pool whose fee curve rises near expiry.

## 4. Default and dispute mechanism (minimal but credible)

**The principle: we never verify delivery ourselves.** We make *non-performance* provable using three things: (a) deadlines the provider has to meet onchain, (b) the holder's own confirmation or dispute, and (c) a narrow arbitration path only when the two sides disagree. Silence from the provider counts as proof of default.

### 4.1 State machine (`RedemptionManager`)
```
requestRedemption ──► REQUESTED ──(provider ack ≤ ackDeadline)──► ACKNOWLEDGED
        │                   │                                         │
        │          ackDeadline passes                     markDelivered ≤ deliveryDeadline
        │                   ▼                                         ▼
        │            DEFAULTABLE ◄──── deliveryDeadline passes ── DELIVERED
        │                   │                                    │         │
        │        claimDefault (anyone)               holder confirm /   holder dispute (+bond)
        │                   ▼                        disputeWindow ends       ▼
        │              DEFAULTED                         ▼                DISPUTED ──► arbitrator.rule()
        │     holder paid bondPerCU×amt            FINALIZED                     ├─ Delivered → FINALIZED (holder's dispute bond → provider)
        │     CU burned, provider strike           CU burned, bond released      ├─ NotDelivered → DEFAULTED (+ dispute bond refunded)
        │                                                                        └─ no ruling by deadline → REFUNDED (CU unlocked, no slash)
        └── provider can also call declineAndPay(reqId) → DEFAULTED voluntarily (graceful, smaller reputation hit)
```

### 4.2 Parameters (set per series and bounded by the protocol)

| Parameter | Production default | Demo value | Bounds |
|---|---|---|---|
| `ackWindow` | 24h | 60s | 1h–72h |
| `deliveryWindow` (after ack) | 48h | 60s | 1h–7d |
| `disputeWindow` (after markDelivered) | 72h | 90s | 24h–7d |
| `disputeBond` | 5% of the claim (`bondPerCU × amount`), min $5 | same | prevents griefing |
| `minRedemption` | provider-set (e.g., 8 CU = one 8-GPU node-hour) | 1 CU | ≥1 CU |
| `bondPerCU` | ≥ 1.5 × primary price | 1.5× ($4.50 on a $3.00 CU) | provider can post more |
| Arbitrator ruling deadline | 7d | 120s | — |

### 4.3 Why each piece exists
- **Ack deadline:** proves the provider is alive and accepts the request. Missing it is objective and needs no arbitration, which covers most real defaults (the provider ghosts, goes bankrupt, or sold the capacity twice).
- **`markDelivered` and the receipt hash:** the provider commits on-chain to having delivered and anchors evidence (usage logs, an optional EAS `DeliveryReceipt` attestation from a third-party monitor, or provider-agent signed heartbeats). It's optimistic: if the holder stays silent, delivery is accepted.
- **Dispute plus a dispute bond:** the only subjective path. The holder must put money at risk, so false disputes cost money, and an honest holder gets the bond back plus the default payout.
- **Panel arbitrator now, decentralized courts later:** credible for a hackathon, with an upgrade path (Kleros or UMA's optimistic oracle via the `IArbitrator` interface). The provider picks the arbitrator at listing and the holder sees it before buying, so it's priced into the series.
- **Neutral fallback if the arbitrator doesn't rule:** no party can win by stalling, and a captured arbitrator can't slash by inaction.

### 4.4 Why paying out of the bond only (with proceeds going straight to the provider) is enough
- **Defaulting is never profitable at the primary price.** The provider received `p` per CU and forfeits `1.5p` per defaulted CU, so the holder is made whole at primary plus 50%. Defaulting costs the provider 0.5p per CU more than it ever received.
- **The remaining risk is strategic default.** If market prices rise far above `1.5p` during a compute shortage, a provider could profit by defaulting and reselling elsewhere. Mitigations:
  1. Reputation and KYB: a verified legal entity with a public on-chain record of strikes.
  2. The `PrintIndex` / `ReferenceFeed` **coverage ratio** (`bondPerCU ÷ (reference × factor)`) shown on every series, so buyers can see under-coverage.
  3. **v2: index-linked margin calls.** If coverage drops below 1.0 using an external reference such as an Ornn or Silicon Data index (licensing permitting), the provider must top up or its primary sale freezes. This is the one place a reference index could matter, and even then it only gates new minting. It never sets payouts.
- **Secondary buyers who paid above `1.5p` carry basis risk.** This is disclosed in the UI as "Default compensation: $X per CU (fixed)".

## 5. Fees and business model

| Fee | Level (proposal) | Who pays | Notes |
|---|---|---|---|
| Listing fee | $0 in the MVP; later a flat ~$250 per series or waived for high-reputation providers | Provider | Keep listing frictionless (the pump.fun lesson) |
| Primary sale fee | 1.0% of proceeds | Provider (deducted) | Main revenue while volume is mostly primary |
| Secondary taker fee | 0.15% (maker 0%) | Taker | Rewards liquidity providers |
| Dispute fee | Arbitrator fee from the losing side's dispute bond | Losing party | Covers the panel or court |
| Data | Free onchain prints; paid analytics API (curves, provider risk scores, default stats) | Funds, index providers, lenders | Where the long-term value is: the transacted-price dataset |
| Later | Bond yield sharing (bonds parked in tokenized T-bills), credit lines against CU receivables, RFQ desk | — | Not in the MVP |

**Rough unit economics** (illustration, not a forecast): a 100 MW AI campus has on the order of 60,000+ H100-class GPUs, or more than 500M GPU-hours a year. Pre-selling even **1%** of that at about $2.81/hour (Silicon Data's H100 index, 5 Oct 2026) is roughly $14M of primary volume, which means about $140k in primary fees, plus secondary fees on turnover.

## 6. Narrative: onchain infrastructure for the compute economy Ornn is building (no partnership claim)

**Facts to cite** (sources in `compute-unit.md`):
- Ornn publishes OCPI, "the first compute index built only from printed transactions".
- It has cash-settled H100 and B200 futures announced on ICE (pending CFTC).
- It sells physical capacity (Ornn Compute) and raised $5.7M (Oct 2025) plus a $33M seed led by a16z crypto (Jun 2026).
- It chose cash settlement deliberately: "financial parties have no interest in managing SLAs, API endpoints, SSH details."

**Our role in one sentence:** *Ornn is building the regulated trading floor and the benchmark. We're building the open, onchain physical market underneath, where any verified provider anywhere can turn capacity into a collateral-backed, deliverable, tradable unit.*

Three ways we expand the market Ornn leads, all without a partnership:
1. **Reference price in:** every series page shows an external spot reference next to our onchain price and **basis**. *Correction (§10.1): OCPI's terms bar display or reference use without a written license, so the MVP uses a synthetic reference labelled as such and cites OCPI only as text on slides. A licensed feed is roadmap.* Buyers price against the benchmark Ornn is establishing.
2. **Prints out:** every fill, delivery and default is a public, timestamped, attributable record. That's the "printed transactions" data a benchmark needs. **Any** index provider can ingest it permissionlessly, Ornn included. Say "could ingest", never "feeds".
3. **A physical leg for hedgers:** a hedger long Ornn/ICE futures (cash-settled) can hold or deliver CU tokens as the physical leg of a basis trade, and long-tail providers (Indonesia, SEA) that would never list on a US DCM get a path to global liquidity.

**Wording rules:**
- ✅ "complements", "built for the market Ornn is creating", "compatible with benchmarks like Ornn's OCPI".
- ❌ "partner", "powered by Ornn", "Ornn's onchain arm", the Ornn logo, Ornn's taglines or website copy.
- `[SUPERSEDED D-64 untuk UI/README; tetap berlaku untuk slide]` Put a footnote on the pitch (slides only) and ~~the site~~: *"Not affiliated with or endorsed by Ornn AI Inc. Ornn and OCPI are trademarks of their owners."*
- The same rule applies to the chain. Say "deployed on Robinhood Chain Testnet", never "built for", "backed by" or "partnered with Robinhood", and don't use the Robinhood logo. Footnote (slides only; `[SUPERSEDED D-64]` for site and README): *"Not affiliated with or endorsed by Robinhood Markets, Inc. Robinhood and Arbitrum are trademarks of their respective owners."*
- Ornn's actual legal, funding and credential work is theirs. Don't claim we rely on it. The pitch line is: *"Regulated venues handle the derivatives layer; we focus on making the physical unit open, collateralized and printable."*

## 7. 27-hour MVP

### 7.1 Scope

**Must-have (demo-critical)**
- Contracts 1–10, 12 and 13 from §3 on **Robinhood Chain Testnet**, verified on its Blockscout explorer. If the Fri 10:30 go/no-go fails, deploy on **Arbitrum Sepolia** instead, verified on Arbiscan (§11).
- Foundry tests:
  - Happy path.
  - Missed ack → default.
  - Missed delivery → default.
  - Dispute → both rulings.
  - Arbitrator timeout.
  - Expiry blocks transfers.
  - Bond isolation across two series.
  - Invariant `bond ≥ bondPerCU × (supply + locked)`.
  - `maxCost` required.
  - Factor timelock.
- Frontend: Next.js + wagmi/viem + RainbowKit (or Scaffold-ETH 2), screens S1–S5.
- Seed script: three verified providers and series:
  - `CU-JKT-H100-2611` at $3.00/CU.
  - `CU-BTM-H200-2611`: H200 at $4.06/CU, i.e. $5.69 per H200-hour.
  - `CU-SGP-B200-2612`.
- A **provider agent** script (Node, viem) that auto-acknowledges and marks delivered, with a kill switch for the default demo.
- README with architecture, contract addresses, the attribution block (§7.5), and ~~the "not affiliated" footnotes~~ `[SUPERSEDED D-64: README has no "not affiliated" text; footnotes only in slides]`. The chain, chain ID and explorer links go at the top.

**Nice-to-have (in order)**
1. Real EAS attestations (`ProviderVerified`, `DeliveryReceipt`) instead of a role mapping.
2. `ReferenceFeed` plus the coverage-ratio badge.
3. PrintIndex chart (VWAP per GPU class vs the reference line) and a CSV/JSON export.
4. Signed heartbeats in the provider agent (`nvidia-smi` UUID) as delivery evidence.
5. A Kleros or UMA arbitrator adapter, as a stub plus docs.
6. Gasless onboarding (Privy or a paymaster).

**Future, not in the MVP:** IDRX settlement (and other stablecoins), for rupiah-priced local series. Mention it in the pitch roadmap only.

**Explicitly out of scope:** leverage or perps, synthetic index vaults (not RWA, and they add oracle and insolvency risk), cash settlement at an oracle price, a governance token.

### 7.2 Screens
- **S1 Market.** A table of series: provider (verified badge), GPU and factor, region, window, last price per CU, 24h volume, bond per CU, coverage, delivered/defaulted record. The header strip shows the PrintIndex H100-equivalent VWAP vs the external reference.
- **S2 List capacity** (3-step wizard): Capacity → Terms → Bond & launch, with a live preview card ("1,000 H200-hours = 1,400 CU; at $3.00/CU and a 1.5× bond, $6,300 locked").
- **S3 Series page.** Primary buy box, order book (bids/asks), trades tape, bond health bar, redemption terms (ack/delivery/dispute windows, arbitrator), provider reputation.
- **S4 Portfolio & redemptions.** Holdings, a "Redeem" modal (amount + delivery ref), and a per-request timeline with live countdowns plus action buttons (Confirm / Dispute / **Claim default**).
- **S5 Provider console.** Incoming requests (Ack / Mark delivered), bond status, proceeds, reputation, and a "withdraw remaining bond" button after expiry.
- **S6 (nice) Prints & data.** PrintIndex chart, default-rate stats, export. **S7 (nice) Arbitration view** for the panel.

### 7.3 Build plan (WIB)

| Time | Contracts (dev A) | Frontend (dev B) | Product / pitch (C) |
|---|---|---|---|
| Fri 09–10:30 | **Chain smoke test (§11.3):** deploy MockUSDC + self-deployed EAS on Robinhood Testnet, verify, attest once, create a Safe. **Go/no-go at 10:30** | Scaffold, wallet (both chains configured) | Ponder skeleton syncing one event |
| Fri 10:30–12 | Registry, ConversionTable, Factory + BondVault + CUToken | Scaffold, wallet, S1 skeleton with mock data | Finalize name, deck skeleton, seed data |
| Fri 12–16 | PrimarySale, RedemptionManager (all states), tests | S2 wizard, S3 primary buy | Demo script, reference numbers |
| Fri 16–20 | OrderBook-lite, PrintIndex, PanelArbitrator, invariant tests | S3 order book + tape, S4 redemptions | Provider agent script (with dev A) |
| Fri 20–24 | Deploy and verify on the chosen chain (Robinhood Testnet, or Arbitrum Sepolia after a no-go), seed script | Wire to contracts, S5 console | README, architecture diagram |
| Sat 00–06 | Bug fixing, gas/limits, nice-to-have #1–2 | Polish, countdowns, empty and error states | Record a backup video |
| Sat 06–10 | Freeze contracts at 06:00 | Freeze UI at 09:00 | Rehearse the demo ×3 |
| Sat 10–12 | Submit by 11:30 (deadline 12:00) | — | — |

**HISTORICAL, superseded by D-90.** The Saturday 06:00 contract freeze, 09:00 UI freeze, and 11:30 internal submit in the two rows above are no longer binding. The hard deadline Sat 2026-10-10 12:00 WIB stays. The rows are kept.

### 7.4 Demo script (2:30), with the wow moment
- **0:00–0:20 Hook.** "Compute is becoming a commodity. Ornn built the first benchmark from printed trades, and futures are lining up at ICE and CME. But the deliverable GPU-hour itself is still sold in private deals. We made it an open, collateral-backed onchain unit." (S1, with the reference strip visible.)
- **0:20–0:50 List in 3 clicks.** A Jakarta provider (verified badge) forges `CU-JKT-H100-2611`: 500 CU at $3.00, bond **$2,250** locked ($4.50/CU × 500). Start a stopwatch on screen and launch in under 40 seconds. "Listing is as easy as pump.fun. The difference is that every unit is backed by collateral before it exists."
- **0:50–1:20 Buy and trade.** The buyer buys 20 CU at primary. A trader posts an ask at $3.20 and the buyer's second wallet lifts it. The trade prints on the tape and the PrintIndex ticks. Then the H200 series: "Prices are per H100-equivalent, so an H200 at $5.69/hour shows as $4.06/CU on one comparable curve."
- **1:20–1:45 Happy redemption.** Redeem 8 CU. The provider agent acknowledges in 3 seconds and marks delivered with a receipt hash. The holder confirms, CU burn, and the provider's reputation goes to "8 CU delivered".
- **1:45–2:15 WOW: the default.** "What if a provider ghosts you?" Flip the agent's kill switch on the projector. Redeem 10 CU, and the 60-second ack countdown hits zero. Hand a judge a phone, or use a third wallet: **anyone** taps "Claim default", and the holder instantly receives **$45 = 10 × $4.50** (bought at $30, so +50%) from *that provider's* bond. The Jakarta series shows a strike, the bond bar shrinks, and no other series is touched. "No admin, no oracle, no insurance pool. Code enforced the delivery promise."
- **2:15–2:30 Close.** "Indonesia is adding gigawatts of AI capacity in 2027: Batam 360MW, BDx 640MW, Zankore 1GW. Paron lets every one of those providers presell capacity to the world, and every trade prints publicly for the benchmarks Wall Street is building." Footnote slide: not affiliated with Ornn or Robinhood.

### 7.5 README attribution block (paste as-is)
```markdown
## Built with
Paron was built during ETHJKT 2026. Third-party code: OpenZeppelin Contracts (MIT),
Ethereum Attestation Service, Foundry, wagmi/viem. GPU conversion factors are derived
from public NVIDIA datasheets and public rental-price benchmarks (sources in docs).
Not affiliated with or endorsed by Ornn AI Inc. Ornn and OCPI are trademarks of their owners.
Deployed on Robinhood Chain Testnet (fallback: Arbitrum Sepolia). Not affiliated with or
endorsed by Robinhood Markets, Inc. Robinhood and Arbitrum are trademarks of their respective owners.
```

### 7.6 Pitch one-liners and taglines
- **EN (main):** *"Paron turns GPU capacity into collateral-backed compute units. Any verified data center can list in a few clicks, anyone can trade them, and code pays holders if a provider doesn't deliver."*
- **EN (meaning):** *"Paron means anvil, the block every blade is struck on. On Paron, every GPU, from H100 to B200, is forged into one standard unit of compute, backed by collateral and tradable onchain."*
- **EN (taglines):** *"Where compute is forged into one standard."* / *"Every GPU, one anvil, one unit."* / *"Strike once. Trade anywhere."*
- **ID (utama):** *"Paron mengubah kapasitas GPU menjadi unit komputasi berjaminan kolateral. Data center terverifikasi bisa listing dalam beberapa klik, siapa pun bisa memperdagangkannya, dan smart contract membayar pemegang jika provider gagal deliver."*
- **ID (makna):** *"Paron adalah landasan tempa, tempat setiap bilah dibentuk. Di Paron, setiap GPU, dari H100 sampai B200, ditempa menjadi satu unit komputasi standar yang berjaminan kolateral dan bisa diperdagangkan onchain."*
- **ID (tagline):** *"Ditempa jadi satu standar."* / *"Semua GPU, satu landasan, satu unit."*
- **Ornn line (pitch only, neutral, always with the footnote):** *"Ornn builds the benchmark and trading floor; Paron is the open onchain physical market underneath."* / ID: *"Ornn membangun benchmark dan lantai bursanya; Paron adalah pasar fisik onchain yang terbuka di bawahnya."* Footnote: *"Not affiliated with or endorsed by Ornn AI Inc."*
- **Tokenized stocks → tokenized compute (pitch only, with the Robinhood footnote):**
  - EN (main): *"Tokenized stocks proved Wall Street's assets can live onchain. Paron does it for the asset AI runs on: the GPU-hour, forged into a collateral-backed unit, on Robinhood Chain, the L2 built for tokenized real-world assets."*
  - EN (short): *"Stocks went onchain. Compute is next."*
  - ID: *"Saham tokenisasi membuktikan aset Wall Street bisa hidup onchain. Paron melakukannya untuk aset yang menggerakkan AI: jam GPU, ditempa menjadi unit berjaminan kolateral, di Robinhood Chain, L2 yang dibangun untuk aset dunia nyata yang ditokenisasi."* / short: *"Saham sudah onchain. Berikutnya komputasi."*
  - Guardrails: Stock Tokens live on Robinhood Chain **mainnet** and are KYB-minted securities. Our demo is on **testnet** and doesn't touch or compose with them, so don't show Stock Tokens in the product.
- **Arbitrum ecosystem link (verified, §11.5):** *"Robinhood Chain is built on Arbitrum Dedicated Blockchains, and our fallback is Arbitrum Sepolia, so Paron runs on one Arbitrum technology family with one codebase and no rewrite."* ID: *"Robinhood Chain dibangun di atas Arbitrum Dedicated Blockchains, dan fallback kami Arbitrum Sepolia, jadi Paron berjalan di satu keluarga teknologi Arbitrum, satu codebase, tanpa rewrite."*

## 8. Risks and judge Q&A

| Question | Answer |
|---|---|
| "Isn't this just a database? Why onchain?" | Four things code enforces that a database can't promise across companies: the bond exists before the units do, a permissionless default payout, transferable ownership with 24/7 secondary trading, and public, tamper-proof prints. Remove the chain and you need a trusted clearinghouse, which is exactly what doesn't exist for SEA compute today |
| "How do you know delivery happened if you don't run it?" | We don't need to know. We make *non-delivery* provable: missed onchain deadlines are objective defaults, delivery is optimistic with a holder dispute window, and only real disagreements go to an arbitrator the buyer saw before buying |
| "What if the provider lies and marks delivered?" | The holder disputes, puts 5% at risk, and the arbitrator rules on the evidence (receipt hash vs the holder's logs). A lying provider loses the bond and gets a public strike tied to a KYB'd entity |
| "What if holders falsely dispute?" | They lose the dispute bond to the provider, and repeat offenders are visible onchain |
| "Strategic default when GPU prices spike?" | Bond ≥ 1.5× primary and a visible coverage ratio now; index-linked margin calls in v2. Plus legal recourse, because providers are verified entities. This is the honest residual risk, so we show it rather than hide it |
| "Fake capacity?" | KYB attestation plus an optional capacity attestation, and the maximum harm is bounded by the bond. A fake provider can only sell what it fully collateralized at ≥150% |
| "Isn't this a security or a derivative? Indonesian regulation?" | CU are prepaid, deliverable service claims with no cash settlement against an index, which is closer to a voucher or forward than to a derivative. In Indonesia, digital financial assets moved from Bappebti to OJK supervision on 10 Jan 2025 (POJK 27/2024: https://ojk.go.id/id/regulasi/Pages/POJK-27-2024-AKD-AK.aspx). A production launch would need legal structuring and possibly a licensed venue. The derivatives layer is left to regulated venues such as Ornn or ICE |
| "How is this different from Akash or io.net?" | Those match spot workloads to hardware. We trade *forward capacity claims* from verified institutional providers: collateralized, transferable, time-bound units with public prices. A buyer can hold, hedge or resell without running anything |
| "How does it relate to Ornn? Are you partners?" | No. Ornn builds the benchmark and the regulated derivatives floor. We build an open physical market whose prints any benchmark could use and whose tokens can serve as a physical leg. Complementary, not affiliated |
| "Are you partnered with Robinhood? Why Robinhood Chain?" | No partnership. Robinhood Chain is a permissionless Ethereum L2 built on Arbitrum technology for tokenized real-world assets, so it's the natural venue for a tokenized compute unit. Anyone can deploy there, and we did. The contracts are chain-agnostic: the same code runs on Arbitrum Sepolia |
| "Why an order book and not an AMM?" | CU expire, so AMM liquidity providers would be left holding decaying tokens. Institutions quote limit prices, and every fill is a clean print |
| "Liquidity at launch?" | Providers have an incentive to make markets in their own series. Primary sales seed holders. In the long run, the basis vs external indices draws in arbitrageurs |

**Build risks:** order-book gas and complexity (mitigation: bounded levels; fall back to a simple "list at price, take" board if behind by Fri 20:00), and demo timing (use the 60s windows and pre-funded wallets, and record a backup video by Sat 06:00).

## 9. Decisions and open questions

**Resolved (6 Oct 2026):**
- ~~Name~~: **Paron** (anvil).
- ~~Settlement token~~: **USDC only** in the MVP (MockUSDC on both testnets); IDRX is listed as future.
- ~~Chain~~: **Robinhood Chain Testnet primary, Arbitrum Sepolia fallback** (6 Oct, ~8 PM WIB); go/no-go Fri 9 Oct 10:30 WIB (§11).
- ~~Bond floor~~: **1.5× primary price per CU**.
- ~~Conversion factors~~: Paron's own table, with NVIDIA datasheet and public market-ratio sources (§1.1).

**Still open:**
1. **Proceeds:** straight to the provider (the current design, more attractive to list), or partly escrowed until delivery (stronger for holders, more code)? At 1.5× the bond already makes default unprofitable, so I'd keep proceeds going straight to the provider.
2. **Window model:** proposed resolution in §10.4 MUST #3: fixed calendar-month windows aligned with monthly compute futures. Confirm?
3. **Arbitrator for the demo:** our team panel (fastest), or wire a Kleros or UMA stub to show the decentralized path?
4. **Verifier:** in the demo, who issues `ProviderVerified`? Our multisig labelled "demo verifier", or a mock "third-party auditor" persona?
5. **How much Ornn on stage:** name Ornn in the hook and narrative slides only (my recommendation, with the footnote), and keep it out of the product UI except attributed reference-price labels?
6. **Reference price:** superseded by §10.1 and §10.5. OCPI's terms require a written license for any in-app display or reference use. Decide whether to email data@ornn.com for a hackathon display license (external action), or ship the synthetic reference plus slide citation (default).
7. **Region focus:** keep the Jakarta, Batam and Singapore demo series, or go Indonesia-only for local judges?
8. **Team split:** who takes contracts, frontend and pitch/product among the ETHJKT team members?
9. **Factor review:** adopt the two flagged adjustments in §1.1 (A100 0.60 → 0.45; RTX 4090 0.35 → 0.20, or no consumer GPUs in the MVP)?
10. **Domain and handles:** paron.com, .io, .xyz, .ai and .app are taken. paron.exchange, .trade, .markets, .finance, .network and .fi, plus getparon.com and paronmarkets.com, looked free on 6 Oct (a signal only). Register paron.exchange or paron.markets plus @paron-style handles before Fri? That's branding prep, not product code.
11. **Long-term stablecoin per venue (researched 6 Oct ~9 PM WIB; decision is Fatih's):** Robinhood Chain mainnet has **no Circle USDC and no CCTP**. Its only listed stablecoin is Paxos **USDG** (`0x5fc5…d168`, ~$709M onchain supply; LayerZero OFT; MAS + MiCA regulated; US availability depends on an OCC no-objection ❓). Bridges convert USDC→USDG on arrival. Arbitrum One has native USDC (~$2.65B onchain, CCTP V2 with Fast Transfer). **Recommendation:** keep the per-deployment settlement-token parameter; **USDC on Arbitrum One as the first institutional venue; USDG on Robinhood Chain** if/when listing there ("the venue's native regulated dollar"). Revisit if Circle adds Robinhood Chain. Hackathon unchanged (MockUSDC). Details: `open-questions-research.md` §6.
12. **Ask ETHJKT about pre-kickoff funding and smoke tests?** The rules allow "prepare your development environment" and "conduct research" before the build phase. My read: funding wallets and RPC/fork checks are fine, and anything Paron-shaped onchain waits until Fri 09:00. A short Indonesian question is drafted (not sent) in `open-questions-research.md` §5. Send it via Discord or mail@ethjkt.com only with Fatih's OK.

## 10. Gap analysis: what Paron needs to credibly be onchain infrastructure for Ornn's market

Researched Tue 6 Oct 2026, ~5:20 PM WIB. Every claim about Ornn, ICE or the regulations below links to a public source fetched today; anything not confirmed is marked **[unverified]**. This is not legal advice.

### 10.1 What Ornn's ecosystem actually runs on (research findings)

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

### 10.2 Gap table

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
| G10 | **Audit trail and statements** | Institutions reconcile. Ornn advises users to "maintain independent records" | **Partial**: events exist, no exports | Indexer-backed per-account statements (trades, fees, redemptions, defaults) as CSV, plus immutable event links to the chain explorer (Blockscout on Robinhood Testnet, Arbiscan on Arbitrum Sepolia) |
| G11 | **Programmatic trading API** | Market makers and desks won't click a UI. Liquidity is the cash-market depth the CFTC asks about | **No** | Read API (order book, prints) in the MVP. EIP-712 signed off-chain orders with onchain settlement as nice/roadmap (Seaport-style or a custom `fillSigned`) |
| G12 | **Governance and custody** | Credible admin keys, change control, institutional wallets | **Partial**: timelock designed, Safe only for the arbitrator | Safe multisig as admin, verifier and arbitrator. Contracts compatible with smart-contract wallets (EIP-1271 for signed orders) so custodians and MPC wallets work |
| G13 | **Market disruption and data governance** | Exchanges need fallbacks (OCPI has an MDE hierarchy) and a documented methodology with change control | **No** | `PrintIndex` status `{OK, THIN, DISRUPTED}` with carry-forward limits. `METHODOLOGY.md` versioned in the repo. Parameter changes through the timelock |
| G14 | **Legal series terms** | EFRP needs a "bona fide, legally binding contract". Holders need enforceable rights beyond the bond | **No** | Template series terms (PDF/Markdown) whose hash is stored in the series struct and shown at purchase. Roadmap: counsel-reviewed terms, OJK/Indonesia structuring |
| G15 | **Security assurance** | Institutions ask "who audited this?" | **Partial**: Foundry invariants planned | Add Slither in CI, the invariant suite and a short threat model. Roadmap: external audit |
| G16 | **Data-contribution readiness** | The only route into an external benchmark is a written contribution agreement, and OCPI currently takes on-demand trades only | **No** | Roadmap: a delivered-rental data export (delivered hours, realized price per GPU-hour, region, GPU type, verified counterparties) in a contributor-friendly format. Pitch it as "ready to contribute to any benchmark that accepts physical-delivery data", **not** as feeding OCPI |

### 10.3 Tech stack additions (concrete)

| Layer | Tool / standard | Use in Paron | Phase |
|---|---|---|---|
| Indexing | **Ponder** (https://ponder.sh; TypeScript, Postgres, GraphQL/SQL; chains 46630 + 421614, both built into viem). Alternative: a Goldsky subgraph (supports Robinhood mainnet and testnet) | Index `Trade`, `Redeemed`, `Delivered`, `Defaulted`, `SeriesCreated` events → prints, statements, delivered-hours | MUST |
| Data API | Ponder's built-in HTTP/GraphQL, or a thin Hono/Next.js API route | `GET /v1/prints?gpu=H100&region=AS&from=&to=` (JSON + CSV), `GET /v1/index/{gpu}`, `GET /v1/series/{id}`, `GET /v1/accounts/{addr}/statement` | MUST |
| Identity / KYB | **EAS** (self-deployed on Robinhood Testnet; existing `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE` on Arbitrum Sepolia) behind `IParticipantGate` | Schemas `ParticipantVerified(entityId, role, country, expiry)`, `CapacityAttested(seriesId, specHash, gpuHours)`, `DeliveryReceipt` | MUST (participant and capacity), NICE (receipt) |
| Permissioning | EAS-gated allowlist hook now; **ERC-3643** (T-REX: ONCHAINID, IdentityRegistry, ModularCompliance) later | `CUToken._update` checks `ParticipantRegistry.isVerified(to)` on institutional series | MUST (allowlist), ROADMAP (ERC-3643) |
| Market integrity | Custom: self-match prevention by `entityId`, per-print eligibility flags, winsorized VWAP, min-volume threshold | `OrderBook` + `PrintIndex` | MUST |
| Signed orders | **EIP-712** typed orders (+ EIP-1271 for Safe/MPC wallets) | Gasless maker quotes, settled onchain by `fillSigned` | NICE / ROADMAP |
| Reference feed | `IReferenceFeed` adapter: MVP `SyntheticReferenceFeed` (demo data); later a **licensed** OCPI push via **Chainlink** Data Feeds/Functions or **RedStone**, or Silicon Data if licensed | Basis and coverage display only, never payouts | NICE (synthetic), ROADMAP (licensed) |
| Delivery evidence | Provider agent (Node + viem) reads `nvidia-smi` and signs an EIP-712 receipt; hash goes onchain | Hardware conformance at delivery | NICE |
| Governance / custody | **Safe** multisig (2-of-3) as admin, verifier and arbitrator; OZ `TimelockController` | Change control | MUST (config only) |
| Testing / security | **Foundry** fuzz and invariant tests (`bond ≥ bondPerCU × (supply + locked)`, no self-match prints, index ignores ineligible prints); **Slither** in GitHub Actions | Assurance | MUST (invariants), NICE (Slither) |
| Analytics | Next.js dashboard on the Paron API (forward curve across monthly series, PrintIndex, delivered hours, default rate, basis vs reference); optionally a public **Dune** dashboard | Demo and "data product" story | NICE |
| Docs | `METHODOLOGY.md` (PrintIndex rules, eligibility, fallback), `paron-spec/v1.schema.json`, `SERIES_TERMS.md` | Benchmark and legal credibility | MUST (methodology + schema), NICE (terms) |

### 10.4 Features: MUST (27h), NICE, ROADMAP

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

### 10.5 How to show the Ornn link in the demo, without implying partnership or breaching terms

1. **"Paron Prints" live call (15 s).** On stage, run `curl https://<paron-api>/v1/prints?gpu=H100&limit=3` and show JSON whose fields mirror the *public* OCPI observation tuple: price per GPU-hour, GPU count, region, GPU type, millisecond timestamp. Add Paron extras: `eligible`, `series`, `delivery_window`, `tx_hash`. Line: *"Every Paron fill is a public, verifiable transaction print in the same shape benchmark methodologies already use. Any index provider could ingest it."* Never say "Ornn-compatible" or "feeds OCPI".
2. **"Forward vs spot" chart.** In the product, the PrintIndex for `H100 2026-11` (forward, physically deliverable) is plotted against a reference line labelled **"Spot reference (synthetic demo data)"** plus the basis. On one slide, outside the product, cite the public fact as text: *"OCPI H100 settled at $2.52/GPU-hour on 5 Oct 2026 (source: data.ornn.com)."* Don't pull OCPI into the app, API or chart without a written license (terms in §10.1).
3. **Contract-month lot card.** Next to a November H100 series, show "720 CU = 1 H100 for November (720 hours)". On a slide, cite ICE's public HPR spec: *"contract size = number of hours in the contract month; final settlement = average of daily OCPI H100."* Line: *"A Paron monthly series is the deliverable counterpart of a cash-settled compute month."*
4. **Physical-leg explainer slide (hypothetical, clearly labelled).** "A Jakarta provider sells November capacity on Paron (physical forward, bonded at 1.5×). A buyer that also trades cash-settled compute futures can manage price risk there, while Paron guarantees delivery or compensation." Footnote: *"Illustrative. EFRP eligibility is determined by the relevant exchange's rules."*
5. **Integrity callout (10 s).** Try to self-trade with two wallets under the same KYB entity. `OrderBook` rejects it with `SelfMatch()`, and the print never enters the index. Line: *"Prints are arm's-length by construction."*
6. **Footnote on every slide that names Ornn, ICE or OCPI:** *"Not affiliated with or endorsed by Ornn AI Inc. or ICE. OCPI and HPR are trademarks of their respective owners; figures cited from public sources."* On slides that name Robinhood, add: *"Not affiliated with or endorsed by Robinhood Markets, Inc."*

**Optional (Fatih's call; external action, not taken):** email data@ornn.com before Friday to ask whether a non-commercial hackathon display license for OCPI is possible. That would allow a live OCPI line in the chart. Keep the wording to a license inquiry only, with no partnership language.

## 11. Chain decision and configuration (decided 6 Oct 2026, ~8 PM WIB)

**Fatih's decision:**
- **Primary: Robinhood Chain Testnet (46630). Fallback: Arbitrum Sepolia (421614).** Arbitrum Sepolia replaces Base Sepolia as the fallback.
- **Settlement stays USDC.** Both testnets use our own MockUSDC (6 decimals).
- The long-term stablecoin per venue is open question Q11 (§9).

The full chain comparison and the tech stack with versions are in `paron-stack.md`. Live checks below ran on 6 Oct 2026, ~8:05 PM WIB. ✅ = verified · ❓ = unverified.

### 11.1 Chain config

| Item | Robinhood Chain Testnet (primary) | Arbitrum Sepolia (fallback) |
|---|---|---|
| Chain ID | **46630** (`eth_chainId` → `0xb626`) ✅ | **421614** (`eth_chainId` → `0x66eee`) ✅ |
| Gas token | ETH (testnet) | ETH (SepoliaETH) |
| Public RPC | `https://rpc.testnet.chain.robinhood.com` ✅ | `https://sepolia-rollup.arbitrum.io/rpc` ✅ |
| RPC for indexer/demo | Env `INDEXER_RPC_URL` (optional `INDEXER_RPC_URL_BACKUP`). The URL value is not written in this doc [D-89] | Env name only; the value stays outside this doc |
| Explorer | `https://explorer.testnet.chain.robinhood.com` (Blockscout) ✅ | `https://sepolia.arbiscan.io` ✅; Blockscout mirror `https://arbitrum-sepolia.blockscout.com` (up, behind a bot check) |
| Faucet | Official `https://faucet.testnet.chain.robinhood.com`: behind a Vercel Security Checkpoint (needs a real browser); drip and cooldown not published ❓. Alternatives ✅: Alchemy `alchemy.com/faucets/robinhood-testnet` (0.1 ETH / 24h; ≥ 0.001 mainnet ETH + mainnet activity), QuickNode `faucet.quicknode.com/robinhood/testnet` (12h cooldown), Chainstack (top-up to 1 ETH / 24h; 0.08 mainnet ETH + account). Backup: canonical bridge **from Ethereum Sepolia** (the testnet's parent; no Arbitrum Sepolia route) at `portal.arbitrum.io/bridge?sourceChain=sepolia&destinationChain=robinhood-chain-testnet` ✅, deposit ~10 min. Relay/Across have no testnet route to 46630 ✅ | Chainlink `faucets.chain.link/arbitrum-sepolia` (0.5 ETH per drip), QuickNode `faucet.quicknode.com/arbitrum/sepolia` (12h cooldown, no mainnet balance needed), Alchemy (needs mainnet activity). Backup: `bridge.arbitrum.io` from Sepolia ✅ (listed in Arbitrum docs) |
| viem chain | `robinhoodTestnet` (viem 2.57.3) ✅ | `arbitrumSepolia` ✅ |
| Verify (Foundry) | `forge verify-contract <addr> src/X.sol:X --chain-id 46630 --rpc-url $RH_TESTNET_RPC --verifier blockscout --verifier-url https://explorer.testnet.chain.robinhood.com/api/` (from Robinhood's deploy docs) ✅ | `forge verify-contract <addr> src/X.sol:X --chain 421614 --verifier etherscan --etherscan-api-key $ETHERSCAN_API_KEY` (Etherscan V2 lists chain 421614 ✅; free-tier coverage ❓). Keyless alternative: `--verifier blockscout --verifier-url https://arbitrum-sepolia.blockscout.com/api/` ❓ |
| EAS | **None, so we deploy our own** `SchemaRegistry` + `EAS` (`@ethereum-attestation-service/eas-contracts` 1.9.0) in `DeployAll`. No EASScan, so attestations show in our UI and on Blockscout | **Existing v1.3.0:** EAS `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE`, SchemaRegistry `0x45CB6Fa0870a8Af06796Ac15915619a0f22cd475` (official README; bytecode present and `version()` = 1.3.0 checked onchain ✅). EASScan for Arbitrum Sepolia ❓. **ABI parity ✅:** every 1.9.0 `EAS`/`SchemaRegistry` function selector is in the live v1.3.0 bytecode, and register → attest → getAttestation → delegated attest → revoke passed on local forks of both chains with SDK 2.10.0 (self-deployed contracts report `version()` 1.4.0; the EIP-712 domain version differs, and the SDK handles it) |
| Safe | **Safe{Wallet} UI + transaction service supported** ("Robinhood Testnet" in Safe's config service) ✅. SafeL2 1.4.1, ProxyFactory and 4337 Module bytecode found at canonical addresses ✅ | **Contracts deployed** at canonical addresses (SafeL2 1.4.1 `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762`, ProxyFactory `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67`; all nine 1.4.1 contracts byte-identical to Robinhood Testnet) ✅, but **no Safe{Wallet} UI or transaction service** (config service and tx-service return 404 for 421614) ✅. protocol-kit 8.0.7 deploy + 2-of-3 execute passed on a local fork ✅. Workaround in §11.4 |
| Settlement | MockUSDC (ours). A Paxos USDG test token exists at `0x7E95…802F` (`name()` = "Global Dollar") ✅, not used | MockUSDC (ours) for parity. Circle test USDC exists at `0x75fa…AA4d` (`name()` = "USD Coin") ✅, not used, so demo wallets can be minted freely |
| Shared infra | Multicall3 `0xcA11…CA11` and the CREATE2 deployer `0x4e59…956C` present ✅ | Both present ✅. The same salts give the same Paron addresses on both chains (EAS addresses differ) |
| Gas snapshot | 0.01 gwei (5:27 PM) | ~0.083 gwei (8:05 PM) |

The repo gets `chains.json` holding `{chainId, rpc, explorer, verifier, verifierUrl, eas, schemaRegistry, safeMode}` for 46630 and 421614. `DeployAll.s.sol`, Ponder and the frontend all read the active chain from `CHAIN=robinhoodTestnet|arbitrumSepolia`.

### 11.2 Before Friday (setup only, no Paron code)
- Create a fresh deployer wallet and two or three demo wallets, and fund them on **both** chains on Thursday, since faucets have cooldowns and bot checks.
- Get an Alchemy key with both chains enabled, and an Etherscan V2 key.
- Rules (HackQuest, re-read 6 Oct ~9 PM WIB): "Participants may prepare their development environment, conduct research … before the build phase. However, the submitted product itself must be developed during the hackathon." Funding wallets and RPC/fork checks fit that ⚠️ (my read, not an official ruling). **No public-testnet deploys of anything Paron-related (including our EAS instance) before Fri 09:00.** Run §11.3 after kickoff. Optional: send the drafted question to ETHJKT (§9 Q12), only with Fatih's OK.
- Fund wallets with fresh keys, never the anvil dev keys. The well-known anvil account `0xf39F…2266` has an EIP-7702 delegation on both live testnets.
- Local pre-checks already passed (6 Oct): EAS self-deploy + attest on a 46630 fork, existing EAS on a 421614 fork, and a Safe 2-of-3 via protocol-kit on both forks (`open-questions-research.md` §3–§4).

### 11.3 Go/no-go: Fri 9 Oct 10:30 WIB

All five must pass on Robinhood Chain Testnet by 10:30. Otherwise switch to Arbitrum Sepolia.
1. The deployer is funded (faucet or bridge).
2. `forge script DeployAll --broadcast --verify` deploys `MockUSDC` + `SchemaRegistry` + `EAS`, and they verify on Blockscout. (EAS compiles with solc 0.8.29 via auto-detect and needs the optimizer: unoptimized runtime is 24,397 B, only 179 B under the limit.)
3. Register the `ParticipantVerified` schema and make one attestation, read back through `EASGate.isVerified`.
4. A 2-of-3 Safe is created in Safe{Wallet} on Robinhood Testnet and executes one test transaction.
5. Ponder syncs one event from the chain over the chosen RPC.

**Switch procedure (about 30–45 minutes):**
- Set `CHAIN=arbitrumSepolia`.
- `DeployAll` skips the EAS deploy and uses `0x2521…E1dE` / `0x45CB…d475`.
- Verify on Arbiscan.
- Set the frontend's `NEXT_PUBLIC_CHAIN_ID=421614` and Ponder's chain to `arbitrumSepolia`.
- Switch the Safe to the fallback mode in §11.4.
- Update the README chain line.

Partial failure: if only check 3 fails, stay on Robinhood and use `RegistryGate`. If only check 4 fails, stay on Robinhood and use §11.4 option B.

### 11.4 Safe on Arbitrum Sepolia (no UI)
- **Option A, Safe without the UI:** deploy a 2-of-3 Safe with `@safe-global/protocol-kit` 8.0.7 (`Safe.init({ predictedSafe })` → `createSafeDeploymentTransaction`). For each admin action, owners sign the Safe transaction hash offchain in a script, and one owner calls `executeTransaction`. Show it on Arbiscan. **Tested on a local Arbitrum Sepolia fork (6 Oct):** deploy, 2-of-3 sign, execute and the 1-signature rejection all passed, with no app, tx-service or API key ✅ (`checks/safe/safe-fork-test.cjs`). About an hour to adapt for the demo ⚠️.
- **Option B, admin allowlist (recommended under time pressure):** `AccessControl` roles (ADMIN, VERIFIER, ARBITER) granted to the three team EOAs, with `TimelockController` (5-minute demo delay) as the only holder of DEFAULT_ADMIN, and two team proposers. `PanelArbitrator` already takes 2-of-3 signatures, so arbitration stays multi-party. In the README, label it: "multisig on Robinhood Chain; role allowlist + timelock on the fallback".

### 11.5 Narrative: Arbitrum link and footnotes
- **Verified:** Robinhood's own docs say Robinhood Chain "is built on Arbitrum Dedicated Blockchains" (docs.robinhood.com/chain). Robinhood's EU Stock Tokens launched on Arbitrum One in June 2025 (Robinhood docs). Arbitrum docs list Arbitrum Sepolia as a Nitro rollup. So the line "one Arbitrum technology family, primary and fallback" is accurate. Pitch lines are in §7.6.
- Never claim support from Robinhood, Offchain Labs or the Arbitrum Foundation. The Robinhood footnote goes on any slide naming Robinhood `[SUPERSEDED D-64 for README and site footer]`: *"Not affiliated with or endorsed by Robinhood Markets, Inc. Robinhood and Arbitrum are trademarks of their respective owners."*
