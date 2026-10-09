Robinhood Chain Testnet · chain ID 46630 · [explorer.testnet.chain.robinhood.com](https://explorer.testnet.chain.robinhood.com)

App URL and API URL are not live yet. The web app uses the default Vercel URL once that project exists. The indexer host is a separate sign-in (see below).

# Paron

Paron turns GPU capacity into collateral-backed compute units. Any verified data center can list in a few clicks, anyone can trade them, and code pays holders if a provider doesn't deliver.

*Paron* means anvil: the block a smith strikes every blade on.

## Problem and solution

GPU hours that can actually be delivered are still sold in private deals. There is no public price and no bond that pays the holder when delivery fails. Paron lists a standard compute unit (1 CU = 1 H100-SXM-80GB-equivalent GPU-hour), locks a bond of at least 1.5× the primary price before any unit exists, and lets anyone claim that bond after a missed deadline. Trades land on a public order book.

## Go / no-go

**Verdict: GO on Robinhood Chain Testnet (46630).** Measured 2026-10-09 11:26 WIB (04:26 UTC). The active entry in `config/chains.json` stays `robinhoodTestnet`. Arbitrum Sepolia was measured the same minute and is healthy as a fallback. It is not the active chain.

| Check | Result |
|---|---|
| Public RPC `https://rpc.testnet.chain.robinhood.com` | Reachable in 192 ms. `eth_chainId` = `0xb626` = **46630**. `eth_syncing` returned null. |
| Block production | Tip block **131,452,016**, tip age **1 second**. In a 2.103 s watch the chain advanced **16 blocks** (131,452,016 → 131,452,032). Over the previous 19 blocks, timestamps spanned 2 seconds (**9.5 blocks/s**). Median timestamp delta **0 s**, maximum **1 s** (17 of 19 deltas were 0 because the timestamp resolution is 1 second). |
| Gas | `eth_gasPrice` = **10,000,000 wei = 0.01 gwei**. Max priority fee **0**. Base fee on the tip block **10,000,000 wei**. |
| Finality cadence | Soft confirmation is the sequencer receipt, inside about **1 second** on this sample. `ArbSys.arbOSVersion()` = **116**. Ponder's event-to-row lag is not measured yet, so `confirmations` stays null (T4-03) until check 5. Suggested starting point for the indexer: 1 confirmation. L1 batch finality was not measured. |
| EAS | **Not predeployed.** `eth_getCode` at the Arbitrum Sepolia EAS address `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE` is `0x` (0 bytes). SchemaRegistry and the EIP-712 proxy at the Arbitrum addresses are also empty. Deploy `SchemaRegistry` then `EAS` from `@ethereum-attestation-service/eas-contracts` 1.9.0 (`version()` **1.4.0**). Do not hardcode the EIP-712 domain version. |
| Safe 1.4.1 | Bytecode present. SafeL2 **24,421** bytes, Safe **23,579**, ProxyFactory **3,054**, at the canonical addresses. Safe config service HTTP **200** ("Robinhood Testnet"). Transaction service HTTP **200**, version **6.11.0**. Creating the 2-of-3 Safe still needs a Safe{Wallet} sign-in. That remainder is a soft check (D-54). |
| Shared infra | Multicall3 `0xcA11bde05977b3631167028862bE2a173976CA11` has code (3,808 bytes). CREATE2 deployer `0x4e59b44847b379578588920cA78FbF26c0B4956C` has code (69 bytes). Block `latest − 500,000` was readable. `eth_getLogs` over 2 blocks returned in **101 ms**. |
| Reference token (unused) | USDG `0x7E955252E15c84f5768B83c41a71F9eba181802F`: `name()` = "Global Dollar", `symbol()` = "USDG", `decimals()` = 6. Settlement is MockUSDC. |
| Anvil dev key | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` has EIP-7702 code (`0xef0100…`, 23 bytes) on Robinhood Testnet. Do not use it. On Arbitrum Sepolia the same address had **no code** at this measurement. |
| Official faucet | `https://faucet.testnet.chain.robinhood.com` returned HTTP **429** with `x-vercel-mitigated: challenge` at 04:21 UTC. A script cannot pass it. Fatih already holds testnet ETH on two accounts, so this does not block the chain. |

Fallback spot-check, same run, not selected: Arbitrum Sepolia chain id **421614**, gas **0.073154 gwei** (73,154,000 wei), tip advancing (9 blocks in 2.027 s), EAS `version()` = **1.3.0** and `getSchemaRegistry()` = `0x45CB6Fa0870a8Af06796Ac15915619a0f22cd475`, Circle test USDC `name()` = "USD Coin", decimals 6. Safe config and tx-service both **404**. Arbiscan returned HTTP 403 to this client.

Evidence: `deployments/46630/go-nogo.json` and `deployments/421614/go-nogo.json`. Re-run with `node ops/scripts/go-nogo.mjs`.

**Choice recorded here.** Where docs 01, 02, 03, 05, 06, and 08 still print `[USULAN D-xx, PENDING]` beside older text, D-45 through D-58 are approved and the proposed text is the one in force. That drops `refundedAfterWindow` (D-46), `declineAndPay` after the deadline (D-47), the block-timestamp countdown (P5-16 / P6-18, replaced by D-48), `ARBITER_ROLE` (D-55c), an `OrderPlaced` event on a fully filled IOC (D-51), and a relayer or zero `Defaulted.caller` (D-56). Hosting and the on-chain fallback are required before 19:14 WIB (D-58).

Dev doc 04 §8 says a check that is not done by 11:59 WIB is a hard fail, which would switch the chain. Checks 1, 2, 3, and 5 cannot be finished without the deployer key, a Safe{Wallet} session, or a deployed contract. The task for this lane is read-only, and the deployer key is intentionally not available yet. Those signed steps are scripts below. They are not treated as a Robinhood outage. If a later broadcast reverts or Ponder cannot sync, set `config/chains.json` `active` to `arbitrumSepolia` and follow the switch list in 04 §8. Check 4 stays a soft fail: the demo path uses `W-VERIFIER` and an open timelock executor (D-54).

## Demo walkthrough

Stage series is forged live: `CU-JKT-H100-2610`, 500 CU at $3.00, bond $2,250. The seed leaves three forward series and an H100 index with status THIN.

1. Open the market. Three seeded series are listed. The H100 strip is THIN. The reference line is labeled "Spot reference (synthetic demo data)" at $3.00.
2. The Jakarta provider lists `CU-JKT-H100-2610` in one transaction (permit to BondVault, then `createSeriesWithPermit`). Target under 40 seconds.
3. The buyer buys 20 CU. The trader bot, armed on `PrimaryBuy` from that buyer on series 4, buys 10 CU, approves 5 CU to the order book, and posts an ask of 5 CU at $3.20. The second buyer wallet lifts the ask. The index moves from THIN to OK at 3.20.
4. The buyer redeems 8 CU. The provider agent acknowledges within 3 seconds and marks delivery. The holder confirms. Bond falls by $36, to $2,214.
5. The kill switch stops the agent. The buyer redeems 10 CU. The ack countdown is 60 seconds.
6. Anyone, including a wallet with no KYB, calls claim default after the deadline. The holder receives $45. Bond ends at **$2,169**. Coverage stays **1.50**.

The claim-default button follows wall clock past `meta.server_now_ms` plus 2 seconds (D-48). The keeper uses that same clock. The transaction is what decides. A quiet ArbOS chain may not mine empty blocks, so neither the button nor the keeper waits for a new block timestamp. If the API is down, the clock falls back to the HTTP `Date` header, then the device clock. A simulated `NotDefaultable` does not hide the button.

## Architecture

```
wallets → contracts (bond, sale, book, redemption) → events
events → Ponder + Hono /v1 → web
W-P-JKT agent acknowledges and marks delivery
keeper (dry-run on stage) watches deadlines
trader bot posts the $3.20 ask after the buyer's primary purchase
```

`docs/architecture.md` is a later write-up. Contract source is the contracts lane. The indexer is the indexer lane. This repository's ops lane is `ops/` and `agents/`.

## Deployed contracts

No stage deployment yet. The address table is `DEPLOYMENTS.md`, generated from `deployments/`. `CU-JKT-H100-2610` is forged on stage and is absent from the submission manifest on purpose.

## Demo parameters and production values

Demo windows: ack 60 seconds, delivery 60 seconds, dispute 90 seconds, ruling 120 seconds, timelock 5 minutes. Production targets: ack minimum 1 hour, delivery minimum 1 hour, dispute minimum 24 hours, ruling 7 days, timelock 48 hours. The demo deployment sets `allowOpenWindow` so the October series can be redeemed during the hackathon. `SERIES_TERMS.md` will carry the full pair of sets.

## Data and index

Public reads, once the API is up: `/v1/prints`, `/v1/index/{gpu}`, `/v1/series/{id}`, `/v1/accounts/{addr}/statement`. The onchain index is a VWAP. The winsorized index is published by the API under `METHODOLOGY.md`. The reference strip is synthetic demo data. It is never an input to a payout.

## Governance

Hackathon deployment (D-54): the KYB attester is the team EOA `W-VERIFIER`, labeled "Paron demo verifier (team-operated)". Timelock proposers are the Safe and `W-ADMIN`. The executor role is open, so any account can execute after the 5-minute demo delay. Admin and pauser stay with the Safe on Robinhood. Fees go to the team Safe. The production target remains a team multisig attester (D-04). On the Arbitrum Sepolia fallback the Safe has no wallet UI, so the mode is an allowlist plus the timelock: "multisig on Robinhood Chain; role allowlist + timelock on the fallback."

`PanelArbitrator.rule` is members-only. There is no `ARBITER_ROLE`.

## Run locally

Prerequisites the contracts and web lanes install: Foundry v1.8.5, Node 24.21.0, pnpm 12.9.1. These ops scripts run on Node 22 or newer with no install for the dry run.

```bash
node --test ops/test/*.mjs agents/test/*.mjs
node ops/scripts/go-nogo.mjs
node ops/scripts/deploy.mjs mock-usdc
node ops/scripts/verify-deployment.mjs
node agents/src/keeper/run.mjs
node agents/src/trader-bot/run.mjs
```

The five signing commands, in order, are in `DEPLOYMENTS.md`. Dry-run is the default. `PARON_SIMULATE=1` does not broadcast. `PARON_BROADCAST=1` signs on the integrator machine.

Copy `ops/.env.example` to `ops/.env` and `agents/.env.example` to `agents/.env` when keys exist. Neither `.env` is committed. `PARON_BROADCAST` defaults off. `KEEPER_DRY_RUN` defaults on. The trader bot defaults to `auto` (P5-26). Pass `--manual` on the bot for the one-shot fallback. It uses the same three transactions and the same one-shot check.

`node ops/scripts/deploy.mjs seed` prints phases 1–2 only. It refuses `SEED_MODE=rehearsal` when `DEPLOY_LABEL` starts with `stage-`. Phase 3 (the live 2610 series, the default, the claim) is not seeded onto the stage deployment.

Broadcast installs `viem@2.57.3` inside `ops/` (`npm install`). The deployer key is `PARON_DEPLOYER_PK` in the environment, 64 hex characters, with or without `0x`. It is not written to the manifest.

Contract artifacts are `contracts/out/<Contract>.sol/<Contract>.json`. From `contracts/`, run `forge build`. That does not need `npm ci`: OpenZeppelin and the EAS contracts are vendored in `contracts/lib` (see `contracts/lib/VENDOR.md` and `contracts/README.md`). Signing waits until those artifacts exist.

## Tests

Unit tests here cover the go/no-go decision, seed amounts, the manifest shape, keeper actions, and the trader bot trigger. Foundry (147 tests in dev doc 02, including 40 that must pass, plus 75 invariant checks and 17 API tests) lives in the contracts lane.

## Known limitations

- Testnet only. Settlement is MockUSDC. The mock faucet drips 5,000 mUSDC per hour.
- Demo deadlines are 60/60/90/120 seconds. Production values are longer.
- `allowOpenWindow` is on so the current calendar month can be redeemed. Production keeps it off.
- The price reference is labeled synthetic data. OCPI is not shown in the product.
- The winsorized index is an API figure. The contract stores a VWAP.
- KYB for the hackathon is a team-operated verifier, not an independent auditor.
- Delivery evidence is a hash. The demo agent's GPU report is a labeled mock.
- `declineAndPay` is only valid before the ack or delivery deadline (D-47). After that, only `claimDefault` pays, and it records a strike.
- A dispute with no ruling can reopen once after the window ends (`reopenedFrom`, T12b, D-46). There is no `refundedAfterWindow` flag.
- The order book keeps at most 10 price levels per side.
- A production deployment needs a legal structure. This hackathon build does not provide one.

## What was built during the hackathon

Product code in this repository is written during ETHJKT 2026, starting Friday 9 October 2026. Research and design notes, when copied in, belong under `docs/dev/` and are labeled as pre-hackathon research. The first product commit is after 09:00 WIB on that Friday.

## Steps that need Fatih

Nothing below has been signed. No private key is in git.

1. **Deployer key, on the integrator machine only.** Export `PARON_DEPLOYER_PK` there (64 hex characters, no `0x` required). Do not send it to this agent. The commands in `DEPLOYMENTS.md` read that variable and nothing else.
2. **Distribute testnet ETH** from the two Robinhood accounts that already have a balance to `W-DEP` and the demo wallets in dev doc 05 §1 (`W-P-JKT`, `W-P-BTM`, `W-P-SGP`, `W-BUY`, `W-BUY2`, `W-TRD`, `W-JUDGE`, `W-VERIFIER`, `W-ADMIN`, `W-ARB-1..3`, `W-KEEP`, `W-FEED`). Script step A-1 in `ops/scripts/seed.mjs`. The official faucet is behind a browser check.
3. **Smoke deploy and verify** (go/no-go check 2). `forge script` `DeployAll` with scope `smoke`, `--broadcast --verify`, Blockscout URL `https://explorer.testnet.chain.robinhood.com/api/`. This script is the contracts lane's file. It deploys MockUSDC, SchemaRegistry, and EAS.
4. **Schema and one attestation** (check 3). `W-VERIFIER` signs EAS `multiAttest` for `ParticipantVerified`, then anyone calls `linkAttestation`. Soft fail: `GATE_KIND=registry` and stay on Robinhood.
5. **Safe{Wallet} sign-in** (check 4). Create a 2-of-3 Safe on Robinhood Testnet with three EOAs Fatih controls, and execute one test transaction (0 ETH to self). Record the address in `deployments/46630/infra.json`. Soft fail: `safe.mode` = `allowlist`.
6. **Alchemy or Goldsky RPC key** as `RH_TESTNET_RPC` / `INDEXER_RPC_URL`. The public RPC is for browsers and this read-only check, not for the demo indexer.
7. **Ponder sync** (check 5) after the indexer lane is up and the smoke deployment has a start block. Needs the RPC secret. No second signature if the event is already onchain.
8. **Full deploy and seed phases 0–2.** Signatures from `W-DEP` (mint and gas), `W-VERIFIER` (attestations), `W-P-JKT`, `W-P-BTM`, `W-P-SGP` (register and `createSeries`), `W-BUY2` (the resting ask), and `W-FEED` if `ReferenceFeed` is deployed.
9. **Indexer host, 18:44–19:14 WIB (D-58).** Fatih creates the Railway, Render, or Fly account and a Postgres database that stays awake from Saturday 12:00 WIB through Sunday. Store the Alchemy URL as a platform secret. This agent does not create that account and does not hold the password. Postgres version is whatever that host provides (T4-02).
10. **Vercel sign-in** for the web app. Use the default `*.vercel.app` URL (D-10). A WalletConnect project id is only needed if RainbowKit requires one for the judge's phone (T4-04).
11. **Trader bot key** `W-TRD` on the demo laptop, armed before the show. **Keeper** stays `KEEPER_DRY_RUN=true` on stage, so the judge's wallet sends `claimDefault`. A keeper key is required only if dry-run is turned off.
12. **Etherscan API key** only if a later hard fail moves the deployment to Arbitrum Sepolia.

## Needed from other lanes

This lane does not edit the workspace root package, `contracts/`, `web/`, `indexer/`, or `LICENSE`.

- Root `package.json`, `pnpm-workspace.yaml`, `biome.json`, `.nvmrc`, and `.gitignore`: add workspaces `ops` and `agents`. Ignore `.env`, `.env.*`, `node_modules/`, Foundry `out/`, `cache/`, `broadcast/`, and `.ponder/`.
- Root `.env.example`: `CHAIN=robinhoodTestnet`, `DEPLOY_LABEL=stage-1`, `PARAM_SET=demo`.
- `LICENSE`: MIT, copyright Fatih Maulana. This README links that file.
- `contracts/script/DeployAll.s.sol`: smoke and full deploy. Ops calls it. Ops does not add Solidity.
- `config/params/demo.json` and `prod.json`: constructor sets from dev doc 04 §5. The seed plan in `ops/src/seed-plan.mjs` already uses the demo numbers.
- `shared/abi`: replaces the provisional fragments in `agents/src/abi.mjs`. `SeriesParams` field order in the seed plan follows dev doc 01 §5.1. If the struct order differs, update the seed encoder before broadcast.
- Indexer: read `config/chains.json` and `deployments/<chainId>/<label>.json`.
- Web: `NEXT_PUBLIC_CHAIN_ID=46630` and the onchain fallback for bond, levels, and redemption state before 19:14 WIB (P5-23, D-58).

## Built with

Paron was built during ETHJKT 2026. Third-party code: OpenZeppelin Contracts (MIT),
Ethereum Attestation Service, Foundry, wagmi/viem. GPU conversion factors are derived
from public NVIDIA datasheets and public rental-price benchmarks (sources in docs).
Deployed on Robinhood Chain Testnet (fallback: Arbitrum Sepolia).

Built by Fatih Maulana with help from Grok Bot.

Also used: Safe 1.4.1, Ponder, Hono, Next.js, React, RainbowKit, TanStack Query, Tailwind, shadcn/ui. Robinhood Chain is the network this build is deployed on.

## Team

Fatih Maulana. Solo.

## License

MIT. Copyright Fatih Maulana. See `LICENSE` (added by the contracts lane).
