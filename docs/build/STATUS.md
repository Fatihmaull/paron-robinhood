# Paron build status
- T0 (go): Fri 9 Oct 2026 11:14 WIB
- Repo: https://github.com/Fatihmaull/paron-robinhood
- Lanes: L1 contracts, L2 frontend, L3 indexer/API, L4 ops/deploy (cloud agents)
- Deployer key: pending (Fatih 1:1)
- L1 contracts: bc-5a38d2cf-2b76-5f3f-811a-83733027dcbe
- L2 frontend: bc-89e8fbe8-e0b3-55cc-aa68-6a2c38bee038
- L3 indexer/API: bc-0d91ea75-c507-5cb9-947f-24d7191cb1e9
- L4 ops/deploy: bc-85f43bb6-7246-56c0-a646-9338d514f87d
- 11:17 final dev docs 01-09 (D-45..58 merged) steered into all 4 lanes with schedule: 11:59 G1+go/no-go, 14:14 contracts ckpt, 16:14 G2, 18:44-19:14 hosting + P5-23, 19:14 G3, Sat 01:14 S1, 06:00 contract freeze, 09:00 UI freeze, 11:30 submit. **HISTORICAL, superseded by D-90:** the 06:00 contract freeze, 09:00 UI freeze, and 11:30 internal submit are no longer binding. The hard deadline Sat 2026-10-10 12:00 WIB stays. **That 12:00 line is HISTORICAL, superseded by D-93.** The hard deadline is Saturday 10 Oct 2026 23:59 WIB. This schedule line is kept.
- 11:25 deployer key received on box as env PARON_DEPLOYER_PK (secret forwarding to cloud agents disabled) -> deploys run from box; L4 told to make env-driven scripts + DEPLOYMENTS.md
- 11:35 merged PR #1 (L4 ops: Robinhood GO, seed/keeper/bot, README) -> main 62140d4, per Fatih
- 11:47 PR #3 (L4 env-only deploy scripts, 33 tests) merged → main 3230747. Deploy order: mock-usdc, eas-schema, core (needs MAX_FILLS_PER_TX), roles (needs SAFE_ADDRESS or PARON_SAFE_MODE=allowlist), seed; then verify-deployment. Blocked on L1 contracts/out.
- 11:53 PR #4 (L3 Ponder+Hono indexer E1–E24, tsc + 23 vitest) merged → main 4789d5b. Scout told to create Railway indexer service (root indexer). TODO L1: root pnpm-workspace must include indexer; replace indexer/src/abi/temporary-event-abis.ts with shared/abi; indexer has its own config/chains.json copy (dedupe later).
- 11:58 Railway indexer service created by Scout (https://paron-robinhood-production.up.railway.app, port 42069); build failed ERR_PNPM_IGNORED_BUILDS esbuild → L3 follow-up fixing + API_CORS_ORIGIN. L1 still running at G1, nothing pushed.
- 2026-10-09 12:06 WIB — PR #5 (L1 contracts) merged to main 95a7115: forge build OK, 42/42 tests pass; resolved 4 add/add conflicts (README, agents/indexer package.json, config/chains.json) by keeping main's versions in merge commit c0fa5cc; authors OK; L1 follow-up NOT sent (no CloudAgent tool in executor) — parent to send.
- 12:12 PR #6 (L3 Railway esbuild fix + CORS list + ponder boot fixes, 24 tests) merged d59f79f. Scout notified to verify Railway redeploy /v1/health. L1 queued: DeployAll first, then ABI wiring. L2 steered to shared/abi.
- 12:20 PR #2 (L2 web, tokens adopted, shared/abi, not-affiliated footer) merged 840f6b2; next build green locally; frozen-lockfile warning sent to L2. Scout asked to create Vercel project (root web).
- 12:57 PR #7 (web vercel pnpm, 3221488) + PR #10 (indexer start schema/port, 7fa48f0) merged. Relayed to Scout/group. PR #8 (web deploy manifests) may need rebase.
- 13:05 PR #12 (web live default, syncing banner) c8b7e9a + PR #8 (deploy manifests) b18b3d4 merged. Scout to redeploy Vercel. Waiting L1 DeployAll.
- 13:25 DEPLOYED stage-1 on 46630 (core start 131496617), seeded 3 series, verify OK. PRs 9,11,13,14,15,16,17,18 merged (main 1ffd49f). Relayed to group: Railway needs DEPLOY_LABEL=stage-1 + INDEXER_RPC_URL + redeploy; Vercel redeploy. Deployer holds all roles (testnet). Role keys in <secrets-path-redacted>

## Estimates (handler, 21:08 WIB 9 Oct 2026)

These figures are estimates from the handler as of 21:08 WIB on 9 Oct 2026. They were not recomputed item by item for this note. They are not a new audit.

| Group | Items | A | B |
|---|---|---|---|
| S0 | 16 | ~100% | ~75% |
| S1 | 9 | ~90% | ~45% |
| S2 | 8 | ~80% | ~55% |

- Never-cut: built 3/3; proven on-chain by script 3/3; proven by a UI click on live 0/3.
- Keeper bot and trader bot are merged (CI green; D-42 off-chain kill switch; dry-run; they refuse a chain that is not testnet). They are not running on Railway yet.
- The kill switch and G4 are not tested yet.
- `/arbiter` `ruleWithSignatures` may still be a stub.
- The Revoke button is missing.

## Hosting (Sat 10 Oct 2026; no secrets, no account names, no token values)

- Production: https://paron.vercel.app. Git-connected. Auto-builds on merge to `main` only.
- Backup: https://paron-bay.vercel.app, on a second Vercel account. No Git connection. Manual deploy from `main`. The account is not named here.
- The origin `https://paron.vercel.app` stays allowed in API CORS.
- The Railway indexer is healthy. Its RPC backup env vars are set. Values are not written here.

## Route and chart (observed in the repo)

- Page `/index` moved to `/h100-index` because static `/index` collided with `/` on Vercel. `/index` redirects 307. API path `/index/H100` is unchanged.
- The TradingView chart logo is off via the library option `attributionLogo: false` in `web/components/charts.tsx`. The plain-text licence credit is on `/legal/risk` (`web/app/legal/risk/page.tsx`). The no-third-party-logos and no-third-party-links rule stays, with this licence-credit exception only.
