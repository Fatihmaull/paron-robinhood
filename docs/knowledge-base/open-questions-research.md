# Paron: open-questions research (6 Oct 2026, from ~8:52 PM WIB)

Scope: research + local anvil-fork checks only. No Paron product code, no public-testnet deploys, no accounts, no outreach.
Legend: ✅ verified (link / RPC / local test) · ⚠️ partly verified or inferred · ❓ unverified.
Throwaway scripts and logs: `checks/eas/`, `checks/safe/`, `checks/anvil-*.log`.

Housekeeping: found 2 leftover anvil processes from the earlier attempt (RH fork pid 238862, ARB fork pid 239556) and killed them; started fresh forks (RH Testnet @ block 129905264 on :8545, Arbitrum Sepolia @ ~316384575 on :8546) for re-runs. First RH fork start failed with "fork from an older block with a non-archive node" (latest-block race on the public RPC); pinning `--fork-block-number = latest-20` fixed it. All anvils were killed at the end (~9:15 PM WIB; `pgrep anvil` empty).


## Summary (sections below are in the order they were completed: 3, 4, 1, 2, 5, 6)

| # | Item | Result |
|---|---|---|
| 1 | RH Testnet faucet | Official faucet is behind a **Vercel bot check**; drip and cooldown **not published** ❓. Alchemy 0.1 ETH/24h, QuickNode 12h, Chainstack top-up to 1 ETH/24h ✅ |
| 2 | Bridging | Canonical **Ethereum Sepolia → 46630** via portal.arbitrum.io ✅, deposit ~10 min (docs). No Arbitrum Sepolia route. No Relay/Across testnet route ✅ |
| 3 | EAS 1.9.0 vs v1.3.0 | **PASS** on both forks. ABI selectors match ✅. Package 1.9.0 = contract 1.4.0. **Exact `pragma 0.8.29` breaks a solc-0.8.37-pinned Foundry build → use auto-detect + optimizer** ✅ |
| 4 | Safe | **PASS**: 1.4.1 byte-identical on 421614/46630/4663; protocol-kit 2-of-3 deploy + execute on both forks without app/tx-service ✅ |
| 5 | ETHJKT rules | Quoted. Env prep + research allowed. My read: funding + smoke checks OK, no Paron-shaped deploys before kickoff ⚠️. Indonesian question drafted (not sent) |
| 6 | Stablecoin | Robinhood: USDG only (~$709M), no USDC/CCTP. Arbitrum One: USDC ~$2.65B + CCTP V2. Recommend USDC on Arbitrum One first, USDG on Robinhood Chain ⚠️ |

---

## 3. EAS compatibility (1.9.0 package vs deployed v1.3.0) — DONE locally

Local fork tests (re-run 6 Oct ~8:53 PM WIB, `checks/eas/eas-fork-test.cjs`, log `checks/eas/eas-run.log`, results `eas-fork-results.json`): **PASS on both forks.**

| Step | RH Testnet fork (self-deployed from `eas-contracts` 1.9.0) | Arbitrum Sepolia fork (existing `0x2521…E1dE`) |
|---|---|---|
| Deploy SchemaRegistry + EAS(registry) via ethers ContractFactory from package artifacts | ✅ | n/a (existing) |
| `version()` | **1.4.0** | **1.3.0** |
| SDK `SchemaRegistry.register` + `getSchema` read-back | ✅ | ✅ |
| SDK `attest` → `getAttestation` (recipient match, decode `bytes32,uint8,bytes2,uint64,string`) | ✅ | ✅ |
| `isAttestationValid` | ✅ | ✅ |
| EIP-712 delegated attestation: SDK sign + verify + `attestByDelegation` | ✅ | ✅ |
| `revoke` → `revocationTime > 0` | ✅ | ✅ |

Findings:
- **Version scheme:** npm package version ≠ contract version. `eas-contracts` **1.9.0** ships contracts whose `Semver(1, 4, 0)` → `version()` = "1.4.0" for EAS, SchemaRegistry and Indexer (`contracts/EAS.sol` line 81: `constructor(ISchemaRegistry registry) Semver(1, 4, 0) EIP1271Verifier("EAS", "1.4.0")`). The Arbitrum Sepolia deployment is contract v1.3.0 (package deployment record: solc 0.8.27, evmVersion `paris`, optimizer 1,000,000 runs). ✅ (local package + onchain `version()`)
- **ABI parity:** all 25 `EAS` functions and all 3 `SchemaRegistry` functions in the 1.9.0 ABI have their 4-byte selectors in the **live v1.3.0 runtime bytecode** on Arbitrum Sepolia (`checks/eas/abi-parity.cjs` → `abi-parity-results.json`). Key ones: `attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))` 0xf17325e7, `getAttestation(bytes32)` 0xa3112a64, `isAttestationValid(bytes32)` 0xe30bb563, `attestByDelegation(...)` 0x3c042715, `revoke(...)` 0x46926267, `register(string,address,bool)` 0x60d7a278, `getSchema(bytes32)` 0xa2ea7c6e. So one `IEAS` interface works against both. ✅
- **EIP-712 domain differs** ("EAS","1.4.0" vs "EAS","1.3.0"). The SDK reads the version onchain, and delegated signatures passed on both forks; any hand-rolled signer must not hardcode the domain version. ✅
- **EVM version:** the 1.9.0 artifacts' runtime bytecode contains **no PUSH0/MCOPY/TLOAD/TSTORE/BLOB opcodes** (scanned, `checks/eas/opscan.cjs`), i.e. compiled for a pre-Shanghai target (pragma `0.8.29`), so EAS itself has no EVM-version dependency. ✅
- **Chain EVM support (live, read-only `eth_call` with raw init code, ~9:00 PM WIB):** Robinhood Testnet and Arbitrum Sepolia both executed PUSH0 + TSTORE/TLOAD (returned 1), MCOPY (returned 0x2a) and even Osaka's CLZ (returned 255). `ArbSys.arbOSVersion()` returns 116 on 46630, 421614 and 4663 (identical ArbOS on all three). So `evm_version = "cancun"` for Paron is safe on both chains. ✅
- **SDK 2.10.0** depends on `eas-contracts` **1.7.1** (typechain types) and `ethers ^6.13.2`; it worked against both 1.4.0 (self-deployed) and 1.3.0 (existing) contracts in the tests above. ✅
- **Foundry toolchain finding (important for `DeployAll`):** 15 core EAS files use an **exact** `pragma solidity 0.8.29;`. A throwaway Foundry project (`checks/forge-pragma/`, no Paron code) pinned to `solc = "0.8.37"` **fails**: "No compiler version exists that matches the version requirement: =0.8.29". With `auto_detect_solc = true` (no global pin), forge 1.8.5 compiles EAS with 0.8.29 and our own `pragma solidity 0.8.37` files with 0.8.37 in one build ✅. EAS sources compile against **OpenZeppelin 5.6.1** ✅. Size: unoptimized EAS runtime is **24,397 B (179 B under the 24,576 B limit)**; with `optimizer = true, runs = 200` it's 15,073 B, so enable the optimizer ✅. Upstream EAS builds with solc 0.8.29, optimizer 1,000,000 runs, `evmVersion: 'paris'` (`hardhat.config.ts` on master, https://github.com/ethereum-attestation-service/eas-contracts; the v1.9.0 tag path returned 404 ⚠️).
  - Two ways to handle it on Friday: (a) keep `pragma solidity 0.8.37` in Paron files and drop the global `solc` pin (auto-detect), or (b) deploy EAS from the npm artifact bytecode (as the ethers test did) and verify on Blockscout with the upstream settings. **(a) is simpler.** `forge create` of SchemaRegistry + EAS(registry) on both local forks → `version()` "1.4.0", `getSchemaRegistry()` matches ✅ (`checks/forge-eas-deploy.log`).
- **Fork gotcha:** the well-known anvil dev account `0xf39F…2266` has an **EIP-7702 delegation** (`0xef0100…`) on live Robinhood Testnet and Arbitrum Sepolia, so it inherits that code on forks. `forge create` from it failed with "Out of gas: gas required exceeds allowance: 0". Use freshly generated keys for fork tests (the scripts do), and never use anvil keys on a public network ✅.
- Caveat: fork tests are local simulations; a real Blockscout verification of the self-deployed EAS on 46630 is still a Friday go/no-go item (solc 0.8.29, check the package's compiler settings). ⚠️

---

## 4. Safe on Arbitrum Sepolia (and Robinhood Testnet) — DONE locally

Live `eth_getCode` via public RPCs (re-run ~8:55 PM WIB, `checks/safe/safe-addresses-check.cjs`, `safe-addresses-results.json`), addresses from `@safe-global/safe-deployments` 1.37.63 for version 1.4.1: **all 9 v1.4.1 contracts present with identical bytecode hash on Arbitrum Sepolia (421614), Robinhood Testnet (46630) and Robinhood mainnet (4663).** ✅

| Contract (1.4.1) | Address (same on all three) | Size / keccak prefix |
|---|---|---|
| SafeL2 | `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762` | 24,421 B / 0xb1f92697 |
| Safe | `0x41675C099F32341bf84BFc5382aF534df5C7461a` | 23,579 B / 0x1fe2df85 |
| SafeProxyFactory | `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67` | 3,054 B / 0x50c3cdc4 |
| CompatibilityFallbackHandler | `0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99` | 5,637 B |
| MultiSend | `0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526` | 629 B |
| MultiSendCallOnly | `0x9641d764fc13c8B624c04430C7356C1C7C8102e2` | 410 B |
| SignMessageLib | `0xd53cd0aB83D845Ac265BE939c57F53AD838012c9` | 966 B |
| CreateCall | `0x9b35Af71d77eaf8d7e40252370304687390A1A52` | 1,099 B |
| SimulateTxAccessor | `0x3d4BA2E0884aa488718476ca2FB8Efc291A46199` | 850 B |

Local fork test (`checks/safe/safe-fork-test.cjs`, log `checks/safe/safe-run.log`): protocol-kit 8.0.7 + viem 2.57.3, **no Safe{Wallet} app, no tx-service, no API key**: **PASS on both forks.**
- `Safe.init({ predictedSafe: {owners: 3, threshold: 2, safeVersion: '1.4.1'} })` → `createSafeDeploymentTransaction()` → sent by owner 0 → `isSafeDeployed` true, threshold/owners 2/3, `getContractVersion` 1.4.1. ✅
- Fund Safe 1 ETH → `createTransaction` (0.1 ETH out) → owner 0 `signTransaction` → owner 1 `signTransaction` → `executeTransaction` → status success, recipient balance 0.1. ✅
- Negative: executing with 1 signature is refused ("There is 1 signature missing"). ⚠️ This rejection is protocol-kit's client-side check, not an onchain GS020 revert.
- **Safe{Wallet} support:** config service `https://safe-config.safe.global/api/v1/chains/46630/` → 200 "Robinhood Testnet", tx-service `https://api.safe.global/tx-service/robinhood-testnet/api/v1/about/` → 200 (Safe Transaction Service 6.11.0) ✅. Arbitrum Sepolia: config 404, `tx-service/arbitrum-sepolia` 404, so no app or tx-service ✅ (~9:00 PM WIB).
- Conclusion: §3.4 "Option A" (scripted Safe without UI) is viable on Arbitrum Sepolia; protocol-kit resolves 1.4.1 addresses from safe-deployments for 421614 offline. Remaining risk: real-network signing UX (owners need keys in a script or EIP-712 signing in a wallet) ⚠️.


---

## 1. Robinhood Chain Testnet faucet

| Faucet | Drip | Cooldown | Requirements | Status |
|---|---|---|---|---|
| **Official** `https://faucet.testnet.chain.robinhood.com` | **not published** ❓ (test ETH + simulated Stock Tokens per a third-party write-up) | **not published** ❓ | Wallet address (per datawallet) ❓ | **Behind a Vercel Security Checkpoint (JS bot check).** My `curl` got HTTP 429 with `x-vercel-mitigated: challenge` (~8:54 PM WIB); WebFetch timed out. Needs a real browser. Linked from Robinhood's support page ✅ |
| **Alchemy** `https://www.alchemy.com/faucets/robinhood-testnet` | **0.1 ETH** | **24 h** per address | ≥ 0.001 ETH on Ethereum mainnet, "sufficient activity" on mainnet, low existing testnet balance; no Alchemy account | ✅ page fetched |
| **QuickNode** `https://faucet.quicknode.com/robinhood/testnet` | base amount shown only after entering an address ❓; doubled by an X post (optional) | **12 h** per wallet per network | Wallet connect + bot check. QuickNode's own text says "no minimum mainnet balance"; datawallet says 0.001 mainnet ETH ⚠️ (conflicting) | ✅ Robinhood/Testnet listed on the page |
| **Chainstack** `https://faucet.chainstack.com/robinhood-chain-testnet-faucet` | **tops up to 1 ETH** | **24 h** | ≥ 0.08 ETH on Ethereum mainnet with holding history + free Chainstack API key (account) | ✅ page text (account needed, so not for us to create) |
| ethfaucet.com | up to 0.1 ETH | 24 h | BringID identity check | ⚠️ datawallet only |
| Chainlink faucet | 25 test LINK, **no ETH** | n/a | wallet connect | ⚠️ datawallet only |

Sources: https://robinhood.com/us/en/support/articles/robinhood-chain-testnet/ ("You can get testnet tokens at faucet.testnet.chain.robinhood.com"); https://www.datawallet.com/crypto/get-robinhood-chain-testnet-tokens (updated 5 Sep 2026, third-party).
**Practical plan:** Thursday, Fatih opens the official faucet in a normal browser for each team wallet. Backup is Alchemy (0.1 ETH/day, needs a wallet with mainnet ETH and history) or QuickNode. Gas is ~0.01 gwei on 46630, so 0.1 ETH is far more than a full DeployAll needs ⚠️ (estimate). Last resort: bridge Sepolia ETH (item 2).

---

## 2. Bridging to Robinhood Chain Testnet

- **Parent chain is Ethereum Sepolia, not Arbitrum Sepolia.** Robinhood's Protocol Contracts page lists the testnet's L1 contracts (Rollup `0xdc5F8E399DBd8a9F5F87AeC4C23Beb12431b386D`, Delayed Inbox `0xF2939afA86F6f933A3CE17fCAB007907B6b0B7a4`, Bridge `0x96295BDad104eaD97cC08797b3dC68efF59CcF30`, L1 Gateway Router `0xF6F11aAEE80875776C264d93B37B34cE437382D1`, L1 WETH `0x7b79995e…E7f9` = Sepolia WETH). I confirmed the Rollup and Delayed Inbox have code on Sepolia (chain 11155111). ✅ https://docs.robinhood.com/chain/protocol-contracts/
- **Official route = Arbitrum canonical bridge, Sepolia → Robinhood Chain Testnet:** `https://portal.arbitrum.io/bridge?sourceChain=sepolia&destinationChain=robinhood-chain-testnet` serves a page titled "Bridge to Robinhood Chain Testnet" ("Bridge from Sepolia to Robinhood Chain Testnet using the Arbitrum Bridge"), keyed to chain 46630. ✅ (curl, ~8:58 PM WIB). Robinhood's bridging doc just says "use the Arbitrum canonical bridge" and doesn't name a testnet URL. ⚠️
- **Deposit time:** "Deposits typically confirm within 10 minutes"; L2 leg failures can be redeemed manually "within 7 days"; withdrawals take the 7-day challenge period plus an L1 claim. ✅ https://docs.robinhood.com/chain/bridging/ . Programmatic: Delayed Inbox on L1 (address above).
- **No direct Arbitrum Sepolia → 46630 canonical route** (different parent chains). ⚠️ (inferred from the contracts; not found in any doc)
- **Third-party testnet support (checked live ~9:00 PM WIB):**
  - Relay testnets API (`api.testnets.relay.link/chains`): **no 46630** ✅. Relay mainnet supports 4663 (USDG).
  - Across testnet API (`testnet.across.to/api/available-routes?destinationChainId=46630`): **empty, no routes** ✅. Across mainnet has routes to 4663 (ETH/WETH, USDC→USDG, USDG).
  - LayerZero: `robinhood-testnet` (46630) ACTIVE, EIDs 10451 (v1) / 40451 (v2) ✅ (metadata.layerzero-api.com). Messaging only; no test-ETH route.
  - Chainlink CCIP: "Robinhood Chain Testnet" in the CCIP testnet directory, 10 lanes, 2 tokens ✅ (https://docs.chain.link/ccip/directory/testnet/chain/robinhood-testnet). Test tokens only, not gas.
  - The Robinhood docs' bridge table (LayerZero/Stargate, CCIP/Transporter, Relay, Across, LiFi/0x) describes **mainnet**; none of them is a practical way to get testnet gas.
- **Sepolia context:** Glamsterdam activated on Sepolia today, 6 Oct 2026, 13:53:36 UTC (20:53 WIB) per the EF blog (https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement). Sepolia, RH Testnet and Arbitrum Sepolia were all producing blocks at 20:56 WIB ✅. Watch for bridge or faucet hiccups this week ⚠️. Sepolia's sunset is only a proposal (replacement network, full sunset Q2/Q3 2027) on Ethereum Magicians (https://ethereum-magicians.org/t/sepolia-testnet-replacement-sunsetting/28647), so it doesn't affect this hackathon ⚠️. Datawallet's "Sepolia retires around end of September" claim did not match any official source I found ❓.

---

## 5. ETHJKT rules (pre-event prep)

Source: HackQuest page https://www.hackquest.io/hackathons/Ethereum-Jakarta-Hackathon-2026 . Re-fetched live ~9:00 PM WIB: rules text is identical to `raw/nextf.txt` (14:15 copy) ✅.

Exact wording:
> **1. Build From Scratch** — Projects submitted to the hackathon must be **built from scratch during the official hackathon period**. Existing projects, previously launched products, or substantially pre-built solutions are **not eligible**. Participants may prepare their development environment, conduct research, attend the pre-hackathon workshops, form teams, and discuss ideas before the build phase. However, the submitted product itself must be developed during the hackathon.

> **2. New Features & Existing Projects** — Existing open-source tools, libraries, protocols, APIs, SDKs, and third-party infrastructure may be used as part of your project. However, the **core hackathon submission must represent new work created during the hackathon**. If you are building on top of an existing project, clearly identify what was newly developed for this hackathon.

> **10. Originality & Attribution** — … Any third-party code, APIs, datasets, models, assets, or infrastructure used in the project should be properly attributed where required. Plagiarism, fraudulent submissions, or misrepresentation of previously existing work may result in disqualification.

> **12. Disqualification** — … The organizers' decision regarding rule violations and eligibility is final.

> FAQ "Can I submit a project I built before the hackathon?" — **No.** Projects must be built from scratch during the hackathon period. Existing projects, previously deployed products, or substantially pre-built solutions are not eligible. You may prepare your development environment, research ideas, form a team, and attend the pre-hackathon workshops beforehand, but the submitted project itself should be built during the hackathon.

(The page has no clause using the exact phrase "newly developed" except rule 2's "clearly identify what was newly developed for this hackathon". Submission window per page JSON: opens 2026-10-09T02:00Z = Fri 09:00 WIB, closes 2026-10-10T05:00Z = Sat 12:00 WIB ✅.)

**Read (my interpretation, not an official ruling ⚠️):**
- **Funding wallets before kickoff: allowed.** It's "prepare your development environment" and creates no project code. Use fresh wallets that hold no Paron contracts.
- **Network smoke tests with no product code (RPC calls, faucet claims, anvil forks, deploying nothing public, or at most a throwaway hello-world from a separate scratch folder): allowed** as environment prep/research. The grey zone is anything that leaves **onchain artifacts that look like the product** (e.g., deploying EAS + MockUSDC + schemas named for Paron to the testnet before Friday). That reads as "pre-built" and is visible on the explorer with timestamps. **Recommendation:** no public-testnet deploys of anything Paron-related before Fri 09:00 WIB. Keep the pre-event checks local (as done here) and do the real deploys in the go/no-go window. Third-party contract deploys (our own EAS instance on 46630) should also wait until Friday and be attributed in the README (rule 10).
- Our research docs/designs are "conduct research … discuss ideas" ✅; repo must start Friday (first commit timestamp).

**Draft question to ETHJKT (NOT sent; send via Discord https://discord.gg/vqbKnhhSPR or mail@ethjkt.com only if Fatih approves):**

> Halo kak tim ETHJKT 👋
>
> Saya Fatih, peserta Ethereum Jakarta Hackathon 2026. Mau konfirmasi soal aturan "Build From Scratch" sebelum build mulai Jumat 9 Okt jam 09.00 WIB:
>
> 1. Sebelum kickoff, apakah boleh isi saldo wallet testnet (claim faucet / bridge) dan tes koneksi jaringan, misalnya cek RPC dan deploy kontrak "hello world" yang tidak berhubungan dengan project, di Robinhood Chain Testnet / Arbitrum Sepolia?
> 2. Untuk infrastruktur pihak ketiga yang open-source (misalnya kontrak EAS resmi yang belum ada di Robinhood Chain Testnet), boleh kami deploy saat hackathon dan cukup dicantumkan atribusinya di README?
>
> Semua kode project tetap baru kami mulai saat hackathon. Terima kasih banyak kak! 🙏

---

## 6. Long-term stablecoin: USDG on Robinhood Chain vs USDC on Arbitrum One

**Facts (checked 6 Oct ~9:00–9:05 PM WIB):**
- **USDG on Robinhood Chain mainnet (4663):** `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` ("Global Dollar", 6 decimals), the only stablecoin on Robinhood's token-contracts page (next to WETH) ✅ https://docs.robinhood.com/chain/contracts/ . Onchain `totalSupply` ≈ **$709.05M** ✅ (RPC); DefiLlama shows $707.4M on Robinhood Chain out of $3.08B total USDG ✅ (stablecoins.llama.fi). DefiLlama Robinhood Chain TVL ≈ $1.05B ✅. Paxos says it's "natively issued" there; cross-chain via **LayerZero OFT** (RH OFT `0x0d54755f5106BfdB43f7a35f5D49a23F940628d1`), supply-control `0xdf5F…25D4` ✅ https://docs.paxos.com/guides/stablecoin/usdg/mainnet . Launch partners: Robinhood Earn (Morpho USDG lending, ~7% est. APY, eligible US users), Arcus DEX settles everything in USDG, Uniswap ✅ (robinhood.com newsroom; paxoslabs.com). DEX depth for USDG pairs ❓ (not measured).
- **USDG regulatory status:** issued by **Paxos Digital Singapore** (MAS-supervised Major Payments Institution) and **Paxos Issuance Europe** (FIN-FSA, MiCA-compliant EMT) ✅ (globaldollar.com newsroom, 1 Jul 2026). In the US, the OCC conditionally approved Paxos Trust Company's conversion to a national trust bank on 12 Dec 2025 (charter 25379). Condition 4: the bank "must obtain a written determination of no objection from the OCC before the Bank offers, markets, issues, or otherwise makes available Global Dollar (USDG) within the 'Multi-Jurisdictional Stablecoin Issuance Platform'" ✅ (https://www.occ.treas.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/ca1358.pdf). Whether that no-objection has been granted, and USDG's final GENIUS Act status (OCC GENIUS rules were still at NPRM stage in 2026) ❓.
- **Circle USDC on Robinhood Chain:** **none.** It isn't on Circle's USDC address list, Robinhood Chain isn't a CCTP domain, and DefiLlama shows no USDC on Robinhood Chain ✅ (https://developers.circle.com/stablecoins/usdc-contract-addresses ; https://developers.circle.com/cctp/concepts/supported-chains-and-domains). No public Circle plan for Robinhood Chain found ❓. Robinhood's USDC work is on Circle's own Arc chain (news), not Robinhood Chain ⚠️. Bridges (Across, Relay) **convert USDC → USDG on arrival** and back on exit ✅ (Across API routes: USDC on Ethereum → USDG on 4663).
- **Native USDC on Arbitrum One:** `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` ✅ (Circle list). Onchain `totalSupply` ≈ **$2.65B** (plus ≈ $48.6M legacy bridged USDC.e) ✅ (RPC); DefiLlama $2.32B ✅. **CCTP V2: Arbitrum supports Standard + Fast Transfer, Hooks, Forwarding, upfront fees** ✅ (Circle CCTP page). Circle test USDC on Arbitrum Sepolia `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` ✅.

**Tradeoffs:**
| | USDG on Robinhood Chain | USDC on Arbitrum One |
|---|---|---|
| Native on venue | ✅ (only stablecoin; ecosystem default: Earn, Arcus, Morpho) | ✅ |
| Size | ~$0.7B on chain, ~$3.1B global | ~$2.3–2.65B on chain, ~$74B global |
| Cross-chain | LayerZero OFT (issuer-run), bridges convert USDC↔USDG | CCTP V2 burn/mint incl. Fast Transfer; universal |
| Regulation | MAS (SG) + MiCA (EU); US status pending OCC no-objection / GENIUS rules ❓ | Circle: broadly the institutional default ⚠️ (Circle's US licensing status not re-checked here ❓) |
| Institutional familiarity (GPU providers, AI buyers, Indonesian institutions) | lower; treasury teams will ask "what is USDG?" | highest |
| Fit with Robinhood RWA narrative | strongest | neutral |

**Recommendation:** keep the **settlement token a per-deployment constructor parameter** (already the design). **Default to USDC on Arbitrum One** as the first production venue for institutional GPU buyers and providers (deepest liquidity, CCTP, treasury familiarity). **Use USDG on Robinhood Chain** where Paron lists there, since fighting the chain's native dollar adds bridge/conversion risk and USDC isn't available natively. Pitch: "settles in the venue's native regulated dollar: USDC on Arbitrum, USDG on Robinhood Chain." Revisit if Circle launches native USDC/CCTP on Robinhood Chain or the OCC grants the USDG no-objection. For the hackathon: MockUSDC on both testnets (unchanged). Optional demo flourish: name the mock token per chain (mUSDC vs mUSDG). ⚠️ This is a judgement call; the commercial decision is Fatih's.
