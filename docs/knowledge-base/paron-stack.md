# Paron: chain choice and full tech stack

ETHJKT 2026, RWA track. Written Tue 6 Oct 2026, ~5:30 PM WIB. Build window: Fri 9 Oct 09:00 → Sat 10 Oct 12:00 WIB (27h).
Companion to `paron-design.md` (design) and `paron-gaps.md` (gap analysis).

> **DECISION (Fatih, 6 Oct ~8 PM WIB):** primary **Robinhood Chain Testnet (46630)**, fallback **Arbitrum Sepolia (421614)**, replacing Base Sepolia. Settlement stays **USDC** (MockUSDC on both testnets). The long-term stablecoin per venue is an open question (USDG on Robinhood mainnet vs USDC on Arbitrum One). §3 and §4 below reflect this, and chain config, go/no-go, EAS and Safe details are in §3.1–§3.5 (mirrored in `paron-design.md` §11). §1–§2 keep the original comparison, including Base, as research context. All live checks below were run on 6 Oct 2026 between 5:25 and 5:35 PM WIB.

**Legend:** ✅ verified today (link, RPC call or registry lookup) · ⚠️ partly verified or inferred · ❓ unverified, check before relying on it.

---

## 0. TL;DR

- **The ETHJKT rule allows any EVM chain.** It requires "meaningful use of Ethereum or Ethereum-compatible onchain infrastructure". No chain is mandated and there are no sponsor bounties. Robinhood Chain qualifies: it's an Ethereum L2 built on Arbitrum. One caveat: HackQuest's judge console has a generic "Not deployed on designated ecosystem" disqualification reason. This event designates no ecosystem, so it shouldn't apply, but put the chain and explorer links at the top of the README anyway.
- **Robinhood Chain is ready enough for a 27h build.** Its mainnet has been live since 1 Jul 2026. The public testnet (chain 46630) answered RPC calls today, and the explorer is up. The faucet exists (it rate-limited my scripted check). viem ships it as a built-in chain, Safe{Wallet} lists it, and Goldsky indexes it. **Two gaps:** there is no EAS predeploy, so we deploy EAS ourselves, and there is no native USDC (the chain's dollar is Paxos USDG). Neither blocks the build, but the USDC gap affects the business plan.
- **27h build (decided):** primary **Robinhood Chain Testnet**, hot fallback **Arbitrum Sepolia**, from one chain-agnostic Foundry/Ponder/wagmi codebase. Hard go/no-go call at **Fri 9 Oct 10:30 WIB** (§3.2). Both chains are on Arbitrum technology, so the switch is config-only.
- **Recommendation for the long-term business:** **Robinhood Chain as the RWA home venue, but multi-venue by design.** The settlement token per venue is **open**: USDG on Robinhood mainnet, or USDC on Arbitrum One for USDC-native institutions. Prints are aggregated across chains. Don't make the business depend on one operator's chain (§3.6).
- **Honest view:** Robinhood Chain is the best *narrative* fit and a credible *technical* fit, with an Arbitrum stack, Chainlink, Safe, 4337/7702, Goldsky, Fireblocks and BitGo. But its hype doesn't transfer to Paron automatically. Stock Tokens are Robinhood-issued, KYB-minted debt securities, and third parties can't plug into that distribution. We must also never imply that Robinhood endorses Paron (§2.3).

---

## 1. Research findings

### 1.1 Robinhood Chain (detailed)

| Item | Finding | Status / source |
|---|---|---|
| What it is | Ethereum L2 built on Arbitrum technology (Arbitrum Orbit / "dedicated chain"), ETH as gas, permissionless, positioned for tokenized RWAs (equities, ETFs, private assets) | ✅ robinhood.com/us/en/support/articles/robinhood-chain-mainnet/ ; across.to/blog/bridge-to-robinhood-chain-with-across |
| Status | Public testnet opened Feb 2026; **mainnet live 1 Jul 2026** | ✅ same sources |
| Mainnet | Chain ID **4663**; RPC `https://rpc.mainnet.chain.robinhood.com`; explorer `robinhoodchain.blockscout.com` | ✅ RPC returned `0x1237` (=4663) today |
| Testnet | Chain ID **46630**; RPC `https://rpc.testnet.chain.robinhood.com`; explorer `explorer.testnet.chain.robinhood.com`; faucet `faucet.testnet.chain.robinhood.com` | ✅ RPC returned `0xb626` (=46630) and block ~129.8M; explorer HTTP 200; faucet answered **HTTP 429** to my script. That's a Vercel Security Checkpoint (JS bot check, `x-vercel-mitigated: challenge`, re-checked ~8:54 PM WIB). Drip and cooldown aren't published ❓. Third-party faucets: see §3.1 |
| Permissionless deploy | Yes: "anyone can … build applications". Docs cover Foundry `forge create` and Blockscout verification | ✅ support article; docs.robinhood.com/chain |
| Gas snapshot | Mainnet 0.02 gwei, testnet 0.01 gwei (`eth_gasPrice`, 5:27 PM WIB). For comparison: Base 0.006, Arbitrum One 0.02, Ethereum 3.69 gwei | ✅ live RPC |
| Latency / finality | Sequencer soft confirmations with preconfirmations (~100 ms claimed in docs, FCFS ordering). L1 finality follows batch posting. Canonical-bridge withdrawal ~7 days | ⚠️ docs claim; not measured |
| Bridging | Arbitrum canonical bridge (ETH plus supported ERC-20s), LayerZero OFT/Stargate, Chainlink CCIP/Transporter, Relay, Across, LiFi/0x | ✅ docs.robinhood.com/chain/bridging/ |
| **USDC** | **No native Circle USDC.** Circle's official USDC address list has no Robinhood Chain entry. The chain's dollar is **Paxos USDG**. Across turns USDC from 13 chains into USDG on arrival and back into USDC on exit. Testnet USDG: `0x7E955252E15c84f5768B83c41a71F9eba181802F`; testnet WETH: `0x7943e237c7F95DA44E0301572D358911207852Fa` | ✅ developers.circle.com/stablecoins/usdc-contract-addresses ; across.to blog ; docs.robinhood.com/chain/contracts/ |
| **EAS** | **Not deployed.** The official `eas-contracts` README lists Ethereum, OP, Base, Arbitrum One/Nova, Polygon, Scroll, zkSync, Celo, Linea, Ink, Unichain and others, plus Sepolia, Base Sepolia and Arbitrum Sepolia. Robinhood Chain isn't listed, so there's no EASScan either | ✅ github.com/ethereum-attestation-service/eas-contracts (README) |
| Oracles | Chainlink Data Feeds, including Stock Token feeds. Docs advise checking the L2 Sequencer Uptime Feed. Paron doesn't need an oracle in its core (payouts come from bonds, not prices) | ✅ docs.robinhood.com/chain (from the previous session) |
| Indexing | **Goldsky**: mainnet and testnet, with Subgraphs, Turbo Pipelines, Edge RPC and Compose. **The Graph**: Substreams (via The Graph Market, Pinax and Data Nexus), not a hosted-subgraph listing. **Ponder**: works with any EVM RPC, and viem has the chain built in | ✅ goldsky.com/chains/robinhood ; thegraph.com/docs/en/supported-networks/robinhood/ ; viem 2.57.3 `chains/definitions/robinhoodTestnet.js` |
| Safe | **Safe{Wallet} supports both chains.** The Safe config service returns `Robinhood Chain` (tx-service `/robinhood`) and `Robinhood Testnet` (tx-service `/robinhood-testnet`). Safe v1.4.1 singletons are in `safe-deployments` for 4663 and 46630. The Safe 4337 Module v0.3.0 is deployed | ✅ safe-config.safe.global/api/v1/chains/{4663,46630} ; safe-deployments repo |
| Wallets / AA | Robinhood Wallet (native), any EVM wallet (manual add). ERC-4337 EntryPoints v0.6/v0.7/v0.8 and EIP-7702. Alchemy, ZeroDev, Privy and Dynamic are supported | ✅ support article + docs (previous session) |
| RPC providers | Alchemy (recommended in docs), Goldsky Edge, Chainstack, QuickNode, dRPC and others | ✅ docs + goldsky.com |
| Ecosystem | Entropy Advisors, Alchemy, LayerZero, Chainlink, Fireblocks, BitGo, Allium, CoinGecko, Uniswap, Rialto, Morpho, Lighter, Arcus, Paxos USDG, Zerion, TRM Labs. Goldsky says Uniswap, Privy, Rainbow, LI.FI and others pull its data | ✅ docs ecosystem page (previous session); goldsky.com blog |
| Grants | **No standing Robinhood Chain grants portal.** Robinhood committed **$1M to builders** through 2026 **Arbitrum Open House** buildathons and founder houses (e.g., a Singapore pool). Alchemy runs a Robinhood Chain startup program (credits plus engineering support). There's also an official Robinhood Chain interest form | ⚠️ blog.arbitrum.foundation (Builder's Block #011); go.robinhood.com/chain-interest-form; alchemy.com/startup-program/robinhood-chain. Amounts and eligibility ❓ |
| Stock Tokens / RWA policy | ERC-20 (18 decimals, ERC-8056 multiplier) **tokenized debt securities issued by Robinhood Assets (Jersey) Ltd**. They give economic exposure only, with no shareholder rights. **Minting is limited to KYB'd Authorized Participants.** Not available to US persons. Availability varies by jurisdiction (restricted list includes Canada, UK, Switzerland, UAE and sanctioned countries; **Indonesia's status ❓**). EU Stock Tokens started on **Arbitrum One** in June 2025 | ✅ docs.robinhood.com/chain/stock-tokens/ ; robinhood.com/rhj/stocktokens/ ; RHJ base prospectus |
| Third-party token / RWA listing policy | **No published policy found** on third-party RWA issuers, or on whether Robinhood Wallet/app surfaces arbitrary tokens. Deployment is permissionless, but distribution isn't | ❓ assume no app-level distribution |
| Revenue share | Returns 10% of protocol net revenue to the Arbitrum ecosystem (AEP) | ⚠️ previous session |

### 1.2 Alternatives (checked only for the items Paron needs)

| Item | Base / Base Sepolia | Arbitrum One / Arbitrum Sepolia | Ethereum / Sepolia | Plume (RWA L2) |
|---|---|---|---|---|
| Testnet live | ✅ Base Sepolia 84532 (RPC returned `0x14a34`) | ✅ Arbitrum Sepolia 421614 (RPC returned `0x66eee`, 8:05 PM) | ✅ Sepolia | ⚠️ viem has `plumeSepolia`/`plumeTestnet`; testnet USDC is listed by Circle |
| Native USDC (Circle) | ✅ mainnet + Base Sepolia `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | ✅ mainnet + Arb Sepolia `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | ✅ mainnet + Sepolia `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | ✅ mainnet `0x2223…a7aF`, testnet `0xcB5f…9D18` |
| EAS | ✅ predeploy `0x4200…0021`, EASScan | ✅ deployed, EASScan | ✅ deployed, EASScan | ❌ not in official list |
| Chainlink | ✅ | ✅ | ✅ | ❓ (Plume promotes its own Nexus/partners) |
| Indexer (Ponder/Goldsky/Graph) | ✅ all | ✅ all | ✅ all | ⚠️ Ponder via RPC; Goldsky ❓ |
| Safe{Wallet} UI | ✅ (config service 84532, 8453) | ⚠️ Arbitrum One yes; **Arbitrum Sepolia returned 404** on the Safe config service today | ✅ | ❓ |
| Gas (5:27 PM WIB) | 0.006 gwei | 0.02 gwei | 3.69 gwei | 1000 gwei, but gas is paid in PLUME (a different token, so not directly comparable) |
| RWA narrative | Medium (Coinbase distribution, onchain finance) | Medium-high (Robinhood EU Stock Tokens started here) | High credibility, but costs make an order book impractical | High (RWA-only chain) |

Avalanche, Polygon and ZKsync weren't checked in depth: they add nothing Paron needs that Base or Arbitrum don't already cover, and each has its own RWA story. ❓

---

## 2. Comparison table

Scores: ●●● strong · ●● ok · ● weak.

| Criterion | **Robinhood Chain** (testnet 46630 / mainnet 4663) | **Base** (Sepolia / mainnet) | **Arbitrum One** (Sepolia) | **Ethereum** (Sepolia / mainnet) | **Plume** |
|---|---|---|---|---|---|
| Testnet readiness for 27h | ●●● live RPC, explorer, faucet (rate-limited), viem built-in, Blockscout verify, Safe UI | ●●● most mature tooling; Circle faucet for test USDC | ●●● mature (but no Safe UI on Sepolia) | ●● slow blocks, faucet friction | ●● less tooling; EAS absent |
| USDC | ● **no native USDC**; USDG is native (MockUSDC on testnet is fine) | ●●● native | ●●● native | ●●● native (gas cost aside) | ●●● native |
| EAS | ● **self-deploy** (~20 min); no EASScan | ●●● predeploy + EASScan | ●●● | ●●● | ● self-deploy |
| Oracles | ●●● Chainlink (incl. Stock Token feeds, sequencer feed) | ●●● | ●●● | ●●● | ●● |
| Indexer | ●●● Goldsky, Ponder; Graph via Substreams | ●●● | ●●● | ●●● | ●● |
| Safe | ●●● Safe{Wallet} on both chains | ●●● | ●● | ●●● | ❓ |
| Fees / finality | ●●● ~0.01–0.02 gwei; fast soft-confirms; 7-day canonical exit | ●●● ~0.006 gwei; 7-day canonical exit | ●●● ~0.02 gwei | ● L1 gas kills an onchain order book | ●● |
| Institutional / RWA fit | ●●● built for tokenized securities; Fireblocks, BitGo, Paxos, Morpho, TRM | ●● | ●● (EU Stock Tokens origin) | ●●● settlement credibility | ●●● RWA-native, smaller brand |
| Ornn / ICE fit | ●●● "TradFi brokerage chain hosts the physical compute leg" lines up with the futures/benchmark story | ●● neutral | ●● neutral | ●● neutral | ●● |
| Hype / distribution | ●●● strongest brand at the moment; the Arbitrum Open House buildathon is a follow-on path. **But** Robinhood's app distribution isn't open to third-party tokens (❓) | ●●● large builder base, Coinbase | ●● | ●● | ● |
| Key risks | Single operator (Robinhood runs the sequencer); policy can change; no USDC; no EAS; brand-endorsement confusion; young chain | Coinbase-operated sequencer; crowded | Fewer reasons to pick it over Robinhood or Base for this story | Cost | Small ecosystem, gas token |

### 2.3 Honest view on Robinhood Chain

**For it:**
- It's real, live, permissionless and Arbitrum-grade. Every tool Paron needs works there today, except EAS (self-deployable) and Circle USDC (USDG instead).
- It's the one chain where judges instantly get the line "tokenized TradFi assets live here, so tokenized compute belongs here too".
- The custody and compliance vendors institutions ask about (Fireblocks, BitGo, TRM) are already there.

**Against, or at least overrated:**
1. **The hype doesn't come with it.** Stock Tokens are minted only by Robinhood's KYB'd Authorized Participants and sold through Robinhood's own app. A third-party CU token doesn't appear in the Robinhood app (❓), so Robinhood users won't discover Paron by default.
2. **Operator concentration.** One company runs the sequencer and decides chain policy. Institutions will ask about that, so answer it with the multi-venue design.
3. **USDC vs USDG is a real business decision.** Settlement stays USDC for the hackathon (MockUSDC). Robinhood mainnet has no native USDC, though, so the long-term stablecoin per venue is an open question (§3.6). The settlement token is already a constructor parameter, so the code is ready either way.
4. **Endorsement risk.** As with Ornn, never say "built for", "backed by" or "partnered with Robinhood". Say "deployed on Robinhood Chain (testnet)", and add *"Not affiliated with or endorsed by Robinhood Markets, Inc."* in slides only `[D-64]`.
5. **Indonesia.** Stock Token availability in Indonesia isn't confirmed (❓). That's irrelevant to Paron's contracts but worth knowing if a judge asks "can Indonesians use this chain's flagship assets?".

---

## 3. Decision and recommendation

### 3.1 Chain config (live checks 6 Oct 2026, ~8:05 PM WIB)

| Item | **Robinhood Chain Testnet (primary)** | **Arbitrum Sepolia (fallback)** |
|---|---|---|
| Chain ID | **46630** (`0xb626`) ✅ | **421614** (`0x66eee`) ✅ |
| Public RPC | `https://rpc.testnet.chain.robinhood.com` ✅ | `https://sepolia-rollup.arbitrum.io/rpc` ✅ (Arbitrum docs + live call) |
| Explorer | `https://explorer.testnet.chain.robinhood.com` (Blockscout) ✅ | `https://sepolia.arbiscan.io` ✅; `https://arbitrum-sepolia.blockscout.com` (up, behind a bot check) |
| Faucet | Official `faucet.testnet.chain.robinhood.com`: Vercel bot check (open in a real browser); drip and limits not published ❓. Alchemy `alchemy.com/faucets/robinhood-testnet` 0.1 ETH / 24h (≥ 0.001 mainnet ETH + activity) ✅; QuickNode `faucet.quicknode.com/robinhood/testnet` 12h ✅; Chainstack top-up to 1 ETH / 24h (0.08 mainnet ETH + account) ✅. Backup: canonical bridge **from Ethereum Sepolia** `portal.arbitrum.io/bridge?sourceChain=sepolia&destinationChain=robinhood-chain-testnet` ✅ (deposit ~10 min per docs; no Arbitrum Sepolia route; Relay/Across have no testnet route) | Chainlink `faucets.chain.link/arbitrum-sepolia` (0.5 ETH), QuickNode `faucet.quicknode.com/arbitrum/sepolia` (12h cooldown, no mainnet balance), Alchemy (needs mainnet activity); `bridge.arbitrum.io` from Sepolia |
| Verify | `--verifier blockscout --verifier-url https://explorer.testnet.chain.robinhood.com/api/ --chain-id 46630` (Robinhood deploy docs) ✅ | `--chain 421614 --verifier etherscan --etherscan-api-key $ETHERSCAN_API_KEY` (Etherscan V2 chainlist includes 421614 ✅; free tier ❓); keyless Blockscout `https://arbitrum-sepolia.blockscout.com/api/` ❓ |
| EAS | Not deployed, so **we deploy our own** (`eas-contracts` 1.9.0: `SchemaRegistry` then `EAS(registry)`) | **Existing v1.3.0** EAS `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE`, SchemaRegistry `0x45CB6Fa0870a8Af06796Ac15915619a0f22cd475`, EIP712Proxy `0x8E807011c16E538B2dEEf1dc652EFe7724E09397` (official README; `version()` = 1.3.0 onchain ✅) |
| Safe | Safe{Wallet} UI + tx service ✅; SafeL2 1.4.1 / ProxyFactory / 4337 Module bytecode found ✅ | Contracts at canonical addresses ✅ (SafeL2 1.4.1 `0x29fc…C762`, ProxyFactory `0x4e1D…ec67`); **no Safe{Wallet} UI or tx service** (config service 404) ✅, so use §3.4 |
| Settlement | MockUSDC (ours); USDG test token `0x7E95…802F` exists ✅ (unused) | MockUSDC (ours); Circle test USDC `0x75fa…AA4d` exists ✅ (unused) |
| viem | `robinhoodTestnet` ✅ | `arbitrumSepolia` ✅ |
| Multicall3 / CREATE2 deployer | present ✅ | present ✅. The same salts give the same Paron addresses on both chains |
| Gas snapshot | 0.01 gwei | ~0.083 gwei |

`chains.json` holds `{chainId, rpc, explorer, verifier, verifierUrl, eas, schemaRegistry, safeMode}` per chain. `CHAIN=robinhoodTestnet|arbitrumSepolia` drives `DeployAll.s.sol`, Ponder and the frontend (`NEXT_PUBLIC_CHAIN_ID`).

### 3.2 Go/no-go: Fri 9 Oct 10:30 WIB

All five checks run on Robinhood Chain Testnet between 09:00 and 10:30. Any hard fail means switching to Arbitrum Sepolia.
1. The deployer is funded.
2. `forge script DeployAll --broadcast --verify` deploys MockUSDC + SchemaRegistry + EAS, and they verify on Blockscout.
3. Register the `ParticipantVerified` schema and make one attestation, read via `EASGate.isVerified`.
4. Create a 2-of-3 Safe in Safe{Wallet} and execute one transaction.
5. Ponder syncs one event.

**Soft fails:** if only check 3 fails, use `RegistryGate` and stay. If only check 4 fails, use §3.4 option B and stay.

**Switch (about 30–45 minutes):**
- Set `CHAIN=arbitrumSepolia`.
- `DeployAll` uses the existing EAS instead of deploying one.
- Verify on Arbiscan.
- Flip the frontend and Ponder chain.
- Switch to the Safe fallback mode.
- Update the README chain line.

Fund wallets on both chains on Thursday (fresh keys; never the anvil dev keys, since `0xf39F…2266` carries an EIP-7702 delegation on both live testnets), and keep Paron code until after kickoff. No public-testnet deploys of anything Paron-related (including our EAS instance) before Fri 09:00 WIB. Rules wording and reasoning are in `open-questions-research.md` §5.

### 3.3 EAS
- **Robinhood (self-deploy):** about 20 minutes inside `DeployAll`. There's no EASScan, so show attestations in our UI (S1 verified badge plus an attestation drawer) and on Blockscout.
- **Arbitrum Sepolia (existing):** register schemas on `0x45CB…d475`, attest on `0x2521…E1dE`.
- **ABI parity ✅ (6 Oct, local):** package 1.9.0 deploys contracts reporting `version()` **1.4.0**. All 25 `EAS` and 3 `SchemaRegistry` selectors in its ABI exist in the live v1.3.0 bytecode on Arbitrum Sepolia. register → attest → getAttestation → isAttestationValid → delegated attest → revoke passed with SDK 2.10.0 on a 46630 fork (self-deployed) and a 421614 fork (existing). The EIP-712 domain version differs (1.4.0 vs 1.3.0); the SDK reads it onchain, so never hardcode it.
- **Toolchain ✅:** EAS core files use exact `pragma solidity 0.8.29`, so a foundry.toml pinned to `solc = "0.8.37"` fails to compile them. Use `auto_detect_solc` (our files keep `pragma solidity 0.8.37`) and `optimizer = true` (unoptimized EAS runtime is 24,397 B, 179 B under the limit). Both chains execute Cancun opcodes and even CLZ (live `eth_call`), and the EAS artifacts use no post-Paris opcodes.
- **Fallback:** everything goes through `IParticipantGate` (`EASGate` | `RegistryGate`), so losing EAS costs one constructor argument, not a redesign.

### 3.4 Safe on Arbitrum Sepolia (no UI)
- **Option A, Safe SDK without the UI:** `@safe-global/protocol-kit` 8.0.7, `Safe.init({ predictedSafe })` → deploy. Owners sign Safe transaction hashes offchain in a script, and one owner executes. **Passed on a local 421614 fork (6 Oct):** 2-of-3 deploy, two offchain signatures, execute, and 1-signature refusal; no app, tx-service or API key (`checks/safe/`). About an hour to adapt ⚠️.
- **Option B, admin allowlist (recommended if it comes to the fallback):** OZ `AccessControl` roles (ADMIN, VERIFIER, ARBITER) for the three team EOAs, with a `TimelockController` (5-minute demo delay, two proposers) holding DEFAULT_ADMIN. `PanelArbitrator` keeps its own 2-of-3 signature check. The README says "Safe multisig on Robinhood Chain; role allowlist + timelock on the fallback".

### 3.5 Narrative: Arbitrum link, pitch line, footnote
- **Verified:** docs.robinhood.com/chain says Robinhood Chain "is built on Arbitrum Dedicated Blockchains". Robinhood's EU Stock Tokens started on Arbitrum One (June 2025). Arbitrum Sepolia is a Nitro rollup (docs.arbitrum.io chain-info). So "primary and fallback are one Arbitrum technology family" is accurate.
- **Pitch lines** (full EN/ID set in `paron-design.md` §7.6):
  - *"Tokenized stocks proved Wall Street's assets can live onchain. Paron does it for the asset AI runs on: the GPU-hour."*
  - Short: *"Stocks went onchain. Compute is next."*
  - Keep Stock Tokens out of the product. They're KYB-minted securities on mainnet, and we're on testnet.
- **Footnote** (slides only; README and site footer removed `[SUPERSEDED D-64]`): *"Not affiliated with or endorsed by Robinhood Markets, Inc. Robinhood and Arbitrum are trademarks of their respective owners."*

### 3.6 Long-term business
- **Robinhood Chain mainnet as the RWA home venue**, if early providers and buyers are comfortable there. Its vendor set (Fireblocks, BitGo, Paxos, Morpho, TRM, Chainlink) matches what compliance teams ask about.
- **Arbitrum One as the natural second venue.** It has native Circle USDC and runs the same Arbitrum stack, and the EU Stock Tokens started there.
- **Stablecoin per venue (researched 6 Oct ~9 PM WIB; commercial call is Fatih's):** Robinhood mainnet has **no Circle USDC and no CCTP**. USDG `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` is its only listed stablecoin (~$709M onchain supply; DefiLlama $707M of $3.08B total USDG; LayerZero OFT; Paxos Digital Singapore (MAS) + Paxos Issuance Europe (MiCA). US: OCC conditional approval of Paxos's trust-bank conversion requires an OCC no-objection before USDG is offered through it ❓ status). Bridges (Across, Relay) convert USDC→USDG on arrival. Arbitrum One: native USDC `0xaf88…5831` ~$2.65B onchain, CCTP V2 incl. Fast Transfer. **Recommendation:** keep the constructor-param settlement token; **USDC on Arbitrum One as the first institutional venue, USDG on Robinhood Chain** when listing there. Revisit if Circle adds Robinhood Chain. Full table: `open-questions-research.md` §6.
- **Data layer is chain-neutral:** one Prints API / PrintIndex across venues. Ethereum mainnet is only for later anchoring (registry, title records).
- **Next steps after the hackathon (no outreach without Fatih's approval):** the Robinhood Chain interest form, the Arbitrum Open House buildathon track, and Alchemy's Robinhood Chain startup program.

---

## 4. Full tech stack by layer

Versions are registry/GitHub "latest" as of 6 Oct 2026, 5:30 PM WIB ✅ unless marked. **Pin exact versions on Friday morning** and don't upgrade mid-hackathon.

### 4.1 Contracts

| Piece | Choice | Version | Notes |
|---|---|---|---|
| Language | Solidity | **0.8.37** (latest release ✅). Pin via `pragma solidity 0.8.37` in our files, with **no global `solc` pin** (`auto_detect_solc = true`, since EAS 1.9.0 needs exact 0.8.29; tested ✅), `evm_version = "cancun"`, `optimizer = true` | Cancun is safe on Arbitrum-based chains (Robinhood Chain, Arbitrum Sepolia). If Blockscout verification or Slither has trouble with 0.8.37, drop to 0.8.30 ❓. Update paron-design §3 `^0.8.24` → exact pin |
| Framework | **Foundry** (forge, cast, anvil, chisel) | **v1.8.5** (released 6 Oct 01:46 WIB ✅); use `foundryup -i v1.8.5` | A day-old release. If anything breaks, use the previous stable ❓. `forge-std` latest via `forge install` (version ❓) |
| Library | **OpenZeppelin Contracts** + **Contracts Upgradeable** (for clone initializers) | **5.6.1** (npm `latest` ✅; 5.7.0 is tagged `dev`, so avoid it) | AccessControl, ERC20(Upgradeable) + Initializable for EIP-1167 clones, Clones, SafeERC20, ReentrancyGuard, Pausable, EIP712, SignatureChecker (EIP-1271), TimelockController |
| Series token | `CUToken`: ERC-20 clone per series (EIP-1167 via `Clones.cloneDeterministic`), 18 decimals, `_update` hook: (a) transfers blocked after `windowEnd`, (b) `IParticipantGate.isVerified(to)` on institutional series (ERC-3643-lite) | n/a | Full ERC-3643 is roadmap |
| Settlement token | `MockUSDC` (6 decimals) on testnet; constructor-param `settlementToken` | n/a | Mainnet per venue: recommended USDC on Arbitrum One, USDG on Robinhood Chain (§3.6; Fatih decides) |
| Typed data | **EIP-712** domain per deployment `{name:"Paron", version:"1", chainId, verifyingContract}` | n/a | Delivery receipts (agent-signed) in the MVP; signed maker orders are NICE/roadmap |
| Attestations | **EAS**: self-deployed on Robinhood (`eas-contracts` **1.9.0**); existing v1.3.0 `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE` on Arbitrum Sepolia. SDK `@ethereum-attestation-service/eas-sdk` **2.10.0** | ✅ | Schemas: `ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)`, `CapacityAttested(uint256 seriesId,bytes32 specHash,uint64 gpuHours)`, `DeliveryReceipt(uint256 reqId,bytes32 receiptHash)` |
| Admin / custody | **Safe** v1.4.1 (2-of-3) via Safe{Wallet} on Robinhood Testnet ✅ (config + tx-service 6.11.0 live). Arbitrum Sepolia has no Safe UI or tx-service, so use protocol-kit **8.0.7** scripted (fork-tested ✅), or a role allowlist + timelock (§3.4) | ✅ | The Safe holds admin, verifier and arbitrator-panel roles |
| Change control | OZ `TimelockController`: 48h in prod, 5 minutes in the demo, proposer = Safe | ✅ | Guards `ConversionTable`, fee params and allowlists |
| Oracles (optional) | Chainlink L2 Sequencer Uptime Feed check in `ReferenceFeed` only | ❓ testnet feed address | Never in the payout path |
| Contracts list | ProviderRegistry, ConversionTable, SeriesFactory, CUToken, BondVault, PrimarySale, OrderBook (CLOB-lite, ≤ 10 levels, self-match prevention), RedemptionManager, PanelArbitrator, PrintIndex (winsorized VWAP + THIN), ReferenceFeed (synthetic), MockUSDC, plus **`IParticipantGate` with EASGate/RegistryGate** (new) | n/a | Same as paron-design §3 and §10.4 |

### 4.2 Indexer and API

| Piece | Choice | Version | Notes |
|---|---|---|---|
| Indexer | **Ponder** (package `ponder`, not legacy `@ponder/core` 0.7) | **0.17.12** ✅ (peer: viem ≥ 2.35, hono ≥ 4.5, TypeScript ≥ 5.4) | Chain config for 46630 + 421614 (one active). Indexes `SeriesCreated`, `PrimaryBuy`, `Trade`, `RedemptionRequested`, `Delivered`, `Disputed`, `Defaulted`, `Attested` |
| Database | PGlite (dev) → **Postgres 16/17** (deployed) | ❓ exact | Ponder needs Postgres in production |
| API | Ponder's built-in **Hono** routes (`hono` **4.13.13** ✅) plus GraphQL/SQL-over-HTTP | n/a | `GET /v1/prints?gpu=&region=&from=&to=&format=csv`, `/v1/index/{gpu}` (with `status: OK|THIN`), `/v1/series/{id}`, `/v1/accounts/{addr}/statement` |
| Alternative | **Goldsky** subgraph (CLI **13.15.1**, Robinhood mainnet + testnet ✅) or `@graphprotocol/graph-cli` **0.98.1** | ✅ | Only if Ponder hosting fails. The Graph supports Robinhood via Substreams, not a hosted subgraph |
| RPC | Robinhood public RPC for dev; **Alchemy** (docs-recommended) or **Goldsky Edge** for the indexer | n/a | Public RPCs rate-limit, so don't run the indexer on them during the demo |

### 4.3 Frontend

| Piece | Choice | Version | Notes |
|---|---|---|---|
| Framework | **Next.js** (App Router) + **React** | **16.3.8** / **19.3.0** ✅ | |
| Chain libs | **viem** + **wagmi** + TanStack Query | viem **2.57.3** (has `robinhood`, `robinhoodTestnet`, `arbitrumSepolia` built in ✅); **wagmi 2.19.5** (pinned to 2.x, see the next row); `@tanstack/react-query` **5.104.1** | wagmi latest is 3.7.7, but RainbowKit doesn't support it yet |
| Wallet UX | **RainbowKit 2.2.11** (peer `wagmi ^2.9.0` ✅) for the hackathon: MetaMask, Rabby, WalletConnect, Safe app | ✅ | **Privy** (`@privy-io/react-auth` **3.47.0**, `@privy-io/wagmi` **4.0.18**, listed as a Robinhood Chain AA partner) is roadmap for provider onboarding (email login + embedded/smart wallets, 4337/7702). Don't run both in 27h |
| UI kit | **Tailwind CSS 4.3.3** + **shadcn/ui** (CLI **4.21.3**) | ✅ | Tables, forms, dialogs; dark "terminal" theme |
| Charts | **lightweight-charts 5.2.1** (prints/price series, depth) + **Recharts 3.10.1** (forward curve, coverage, default-rate bars) | ✅ | |
| Language / lint | **TypeScript 5.9.3** (don't use 7.0.2 yet; tooling compatibility ❓), **Biome 2.5.15** | ✅ | |
| ABIs | `wagmi` CLI or `forge inspect` → `abi.ts` generated in CI | n/a | Single source of truth from `out/` |

### 4.4 Backend and agents

| Piece | Choice | Notes |
|---|---|---|
| Runtime | **Node 24 LTS** (v24.21.0 "Krypton" ✅) + viem | One `agents/` package |
| **Default keeper** | Polls Ponder for redemptions past `ackDeadline`/`deliveryDeadline` with no state change. Calls permissionless `claimDefault` (holders can also call it from the UI). Runs as a cron worker every minute; dry-run mode for the demo | Shows that "silence = default" is enforced by anyone, not by Paron |
| **Delivery-receipt agent** | Runs on the provider's box: reads `nvidia-smi --query-gpu=name,memory.total,uuid`, builds an EIP-712 `DeliveryReceipt`, signs with the provider's key, pins JSON (IPFS or plain HTTPS in the MVP) and calls `markDelivered(reqId, receiptHash)` | NICE in 27h; the demo can run it on a laptop with mocked GPU output, clearly labelled |
| Seeder | `script/Seed.s.sol`: 3 providers, 4 monthly series (H100/H200/B200), orders, one default scenario (10 CU → $45 payout) | Demo numbers: $3.00/CU, $4.50 bond |
| Synthetic reference | Tiny signer script pushing labelled demo values to `ReferenceFeed` | Never OCPI data (licence) |

### 4.5 Infra and hosting

| Piece | Choice | Status |
|---|---|---|
| Frontend | Vercel (Next.js) | ❓ plan limits not checked |
| Indexer + DB + agents | Railway, Render or Fly.io (one Postgres + two services) | ❓ any one is fine; pick the one the team already has |
| RPC | Alchemy app for Robinhood Testnet + Arbitrum Sepolia; Goldsky Edge as backup (Robinhood) | ⚠️ free-tier limits ❓ |
| Explorer | Blockscout (Robinhood Testnet), Arbiscan (Arbitrum Sepolia) | ✅ |
| Secrets | `.env` locally, platform secrets in hosting; deployer key is a fresh hot wallet; admin roles move to the Safe right after deploy | n/a |

### 4.6 Testing and security

| Piece | Choice | Notes |
|---|---|---|
| Unit + fuzz | `forge test` with fuzzing on `createSeries` bounds, `buy` slippage and the dispute state machine | |
| **Invariants** | `forge` invariant tests with handlers: (1) `bond[s] ≥ bondPerCU × (supply + locked)`; (2) no cross-series bond movement; (3) no print where maker and taker share an `entityId`; (4) PrintIndex ignores ineligible prints; (5) CU can't move after `windowEnd`; (6) `claimDefault` pays exactly `bondPerCU × amount` once | MUST: these are the institutional pitch |
| Static analysis | **Slither 0.11.6** ✅ in GitHub Actions (`crytic/slither-action`), fail on high-severity findings | NICE. Aderyn is optional ❓ |
| Coverage / gas | `forge coverage`, `forge snapshot` (bound the OrderBook matching loop) | |
| Fork tests | `anvil --fork-url https://rpc.testnet.chain.robinhood.com` for the deploy script | Catches chain quirks early |
| E2E | **Playwright 1.63.0** on the demo path; **Vitest 5.0.3** for the API and agents | NICE |

### 4.7 Dev tooling

- Monorepo: `pnpm` workspaces (latest **12.9.1** ✅; any recent version works) with `contracts/` (Foundry), `indexer/` (Ponder), `web/` (Next.js), `agents/`, `docs/`.
- CI: GitHub Actions with `foundry-rs/foundry-toolchain` (pinned v1.8.5), forge build/test, Slither, Biome, typecheck.
- Verification: Robinhood Testnet `forge verify-contract <addr> src/X.sol:X --chain-id 46630 --rpc-url $RH_TESTNET_RPC --verifier blockscout --verifier-url https://explorer.testnet.chain.robinhood.com/api/` (✅ per Robinhood deploy docs). Arbitrum Sepolia `--chain 421614 --verifier etherscan --etherscan-api-key $ETHERSCAN_API_KEY` (Etherscan V2).
- Docs in repo: `README.md` (chain and explorer links first, architecture diagram, attribution; no "not affiliated" text [D-64]), `METHODOLOGY.md`, `paron-spec/v1.schema.json`, `SERIES_TERMS.md`, `DEPLOYMENTS.md` (addresses per chain).

---

## 5. Changes applied to paron-design.md (6 Oct ~8:15 PM WIB)

1. Locked decisions: added the chain line (Robinhood primary, Arbitrum Sepolia fallback, go/no-go).
2. §3 header: pinned toolchain, chain-agnostic deploy, EAS per chain. Added row 13 `IParticipantGate` (EASGate / RegistryGate). MockUSDC on both chains. Order-book note now says "Robinhood Chain or Arbitrum".
3. §6: endorsement rule and Robinhood footnote.
4. §7.1 / §7.3: deploy target and explorer; a new Fri 09:00–10:30 smoke-test + go/no-go row.
5. §7.4 / §7.5: Robinhood footnote added to the close slide and the README attribution block.
6. §7.6: "tokenized stocks → tokenized compute" lines (EN/ID) and the Arbitrum ecosystem line.
7. §8: new Q&A row "Are you partnered with Robinhood? Why Robinhood Chain?".
8. §9: chain resolved; new open question Q11 (stablecoin per venue).
9. §10: Ponder/EAS rows and explorer links switched to the two chains.
10. §11: rewritten as the full chain decision and config (replacing the earlier pointer).

## 6. Open items resolved by `open-questions-research.md` (6 Oct ~9:15 PM WIB)

1. Faucet: official one is behind a Vercel bot check, drip unpublished. Alchemy, QuickNode and Chainstack alternatives documented (§3.1).
2. Bridge: canonical route is Ethereum Sepolia → 46630 via portal.arbitrum.io; no Arbitrum Sepolia route; no Relay/Across testnet support (§3.1).
3. EAS: ABI parity and fork tests pass; solc 0.8.29 pragma needs auto-detect; optimizer needed (§3.3, §4.1).
4. Safe: v1.4.1 byte-identical on 421614/46630/4663; protocol-kit deploy + execute pass on forks (§3.4).
5. ETHJKT rules: quoted; funding and checks OK in my read; no Paron-shaped onchain deploys before kickoff; Indonesian question drafted, not sent (§3.2 note).
6. Stablecoin: recommendation recorded (§3.6).
Still open: official faucet drip/cooldown (needs a browser), USDG OCC no-objection status, ETHJKT answer (if Fatih sends the question), real Blockscout verification of EAS (Friday).

## Sources (accessed 6 Oct 2026)

- Robinhood Chain docs: https://docs.robinhood.com/chain/ (bridging, contracts, stock-tokens, building-with-stock-tokens, connecting)
- Robinhood support (mainnet / testnet): https://robinhood.com/us/en/support/articles/robinhood-chain-mainnet/ , https://robinhood.com/us/en/support/articles/robinhood-chain-testnet/
- Robinhood Stock Tokens: https://robinhood.com/rhj/stocktokens/ ; RHJ base prospectus https://cdn.robinhood.com/assets/robinhood/legal/rhj_base_prospectus.pdf
- Across on Robinhood Chain: https://across.to/blog/bridge-to-robinhood-chain-with-across
- Goldsky: https://goldsky.com/chains/robinhood ; https://goldsky.com/blog/robinhood-chain-data-live-on-goldsky
- The Graph: https://thegraph.com/docs/en/supported-networks/robinhood/
- Arbitrum Builder's Block #011 ($1M builders): https://blog.arbitrum.foundation/builders-block-011-robinhood-chain-launches-testnet-commits-1m-to-builders/
- Alchemy Robinhood Chain startup program: https://www.alchemy.com/startup-program/robinhood-chain ; interest form https://go.robinhood.com/chain-interest-form
- Circle USDC addresses: https://developers.circle.com/stablecoins/usdc-contract-addresses
- EAS deployments: https://github.com/ethereum-attestation-service/eas-contracts
- Safe config service: https://safe-config.safe.global/api/v1/chains/4663/ (and 46630, 84532; 421614 returns 404) ; https://github.com/safe-global/safe-deployments
- Robinhood deploy/verify docs: https://docs.robinhood.com/chain/deploy-smart-contracts/ ; "built on Arbitrum Dedicated Blockchains": https://docs.robinhood.com/chain/
- Arbitrum chain info and faucets: https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info ; https://faucets.chain.link/arbitrum-sepolia ; https://faucet.quicknode.com/arbitrum/sepolia
- Etherscan V2 chainlist: https://api.etherscan.io/v2/chainlist
- Onchain checks (~8:05 PM WIB): `eth_getCode` / `version()` / `name()` for EAS, SchemaRegistry, SafeL2, ProxyFactory, USDC, USDG, Multicall3 and the CREATE2 deployer on 46630 and 421614
- Versions: registry.npmjs.org (next, react, wagmi, viem, rainbowkit, privy, ponder, hono, tailwindcss, shadcn, charts, OZ, EAS, Safe, TS, Biome, Vitest, Playwright, pnpm), pypi (slither-analyzer), GitHub releases (foundry), binaries.soliditylang.org (solc), nodejs.org (Node LTS)
- Live RPC checks: `eth_chainId`, `eth_blockNumber`, `eth_gasPrice` on the RPCs above, 5:27 PM WIB
- ETHJKT rules: `raw/nextf.txt`, `notes.md` (rule 3 "Ethereum Integration"); live re-check https://www.hackquest.io/hackathons/Ethereum-Jakarta-Hackathon-2026 (~9 PM WIB, unchanged)
- Open-questions research (faucets, bridge, EAS/Safe fork tests, rules, stablecoin), with all URLs: `open-questions-research.md`; scripts and logs in `checks/`

*Not affiliated with or endorsed by Ornn AI Inc. or Robinhood Markets, Inc.*
