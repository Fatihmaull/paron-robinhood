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

- Never-cut: built 3/3; proven on-chain by script 3/3; proven by a UI click on live 0/3. **HISTORICAL (21:08 WIB 9 Oct).** Production UI on `d3081be` later proved 3/3. See the 10 Oct section.
- Keeper bot and trader bot are merged (CI green; D-42 off-chain kill switch; dry-run; they refuse a chain that is not testnet). They are not running on Railway yet. **HISTORICAL for the dry-run intent.** D-96 approves live mode once the bot wallet is funded. Until that is proven they are **not active**.
- The kill switch and G4 are not tested yet.
- `/arbiter` `ruleWithSignatures` may still be a stub.
- The Revoke button is missing.

## Hosting (Sat 10 Oct 2026; no secrets, no account names, no token values)

- Production: https://paron.vercel.app. Git-connected. Auto-builds on merge to `main` only. Current production commit is `783b6be` (PR #76). Scout confirmed READY, and `/docs` returns 200. **HISTORICAL as the "current" line:** "Current production commit is `1f33f2f` (PR #74)." That deploy stays the commit for the `/admin` "Ready at" check below. Earlier UI checks that name `d3081be` were made on that older commit.
- Backup: https://paron-bay.vercel.app, on a second Vercel account. No Git connection. Manual deploy from `main`. The account is not named here.
- The origin `https://paron.vercel.app` stays allowed in API CORS.
- The Railway indexer is healthy. Its RPC backup env vars are set. Values are not written here. **HISTORICAL as the general line.** Current line: the second RPC (PublicNode) is already set as `INDEXER_RPC_URL_BACKUP` and `NEXT_PUBLIC_RPC_URL_BACKUP`. The URL and the key are not written. An RPC key that was in git history still needs rotation by Fatih (owner: Fatih).

## Route and chart (observed in the repo)

- Page `/index` moved to `/h100-index` because static `/index` collided with `/` on Vercel. `/index` redirects 307. API path `/index/H100` is unchanged.
- The TradingView chart logo is off via the library option `attributionLogo: false` in `web/components/charts.tsx`. The plain-text licence credit is on `/legal/risk` (`web/app/legal/risk/page.tsx`). The no-third-party-logos and no-third-party-links rule stays, with this licence-credit exception only.

## Estimates (handler, 15:55 WIB 10 Oct 2026)

These figures are **estimates from the handler as of 15:55 WIB on 10 Oct 2026**. They were not recomputed item by item. They are not a new audit. The 21:08 WIB 9 Oct table above stays as history.

| Group | A (built) | B (proven) |
|---|---|---|
| Overall | ~97% built | ~85% proven |
| S0 | ~100% | ~100% |
| S1 | ~95% | ~60% |
| S2 | ~95% | ~70% |

- At 15:55 WIB, S0 B was recorded as ~95%. That ~95% figure is **HISTORICAL**. Faucet success and the faucet cooldown text were later proven on production `d3081be`, so S0 B is ~100%.
- S1 B ~60%: the keeper bot and the trader bot are not running on Railway, and the kill switch is untested. D-96 approves live mode once the bot wallet is funded. Until that run is proven, the bots are **not active**.
- Never-cut: built 3/3; proven via the UI on production 3/3.
- **HISTORICAL as the current built line:** S1 ~95% built and S2 ~95% built. See the 19:12 WIB estimate below. The proven column at 15:55 stays the live figure until a production check.

## Estimates (19:12 WIB 10 Oct 2026)

These figures are estimates as of 19:12 WIB on 10 Oct 2026. They were not recomputed item by item. They are not a new audit. The 15:55 table stays as history.

| Group | A (built) | B (proven) |
|---|---|---|
| Overall | ~99% built | ~85% proven |
| S0 | ~100% | ~100% |
| S1 | ~100% | ~60% |
| S2 | ~100% | ~70% |

- S1 and S2 built move to ~100% in the working tree: issued attestations on `/verifier` (`GET /v1/participants`, revoke uid from that list), `/legal/disclaimer`, faucet cooldown read from `lastFaucetAt` with a countdown, and the tour step 4 card framed before the camera move. This is not on production yet.
- Proven stays at the 15:55 column. The keeper bot and the trader bot are still not running, the kill switch is still untested, and the new pages are not proven on https://paron.vercel.app. D-96 still says the bots are **not active** until the bot wallet is funded.
- Never-cut stays 3/3 built and 3/3 proven via the UI on production.

## Deadline

Hard deadline remains Saturday 10 Oct 2026 23:59 WIB (D-93). Submission, the deck, and the HackQuest button are Fatih's. Suggested submit by about 21:00 WIB for buffer. **HISTORICAL:** "The handler records the final demo video from production." The final demo video is recorded from `d3081be` and does not show `/admin`. The existing evergreen video editor handles editing, per Fatih.

## D-96 bots (APPROVED, not active)

D-96 APPROVED (Fatih, Sat 10 Oct 2026 ~15:00 WIB). The keeper bot and the trader bot on Railway go live with a dedicated bot wallet (not dry-run), once Fatih funds that wallet from the faucet. Status: **PENDING FUNDING**. Docs say **not active** until proven. The bots refuse a chain that is not testnet and keep the D-42 off-chain kill switch. The wallet is not named and its address is not written.

## Production checks (https://paron.vercel.app)

Checked with a real testnet wallet. No wallet address is written here.

**Commit `20ff4b1`**, after fix #70 that passed `account` into transaction simulation:

- Buy 1 CU shows Pending, then Success, with an explorer link.
- A failed Buy shows red Failed with the step name.
- Wrong network (chain 421614) shows a red banner and Switch, and disables faucet, Buy, and Place order.
- Header address format is the `0xA1FA…95DF` style: first 6 characters including `0x`, last 4.

**Commit `d3081be` (production):**

- Faucet success is **verified**. Pending, then Success, with the message "5,000 test USDC added." and an explorer link. Tx `0xcdca…660f`.
- Faucet cooldown text is **verified**. The status row shows "Failed · faucet · Faucet cooling down. Try again at the next hour." once. The duplicate "Transaction failed." is gone. The wallet is not prompted (blocked at simulation). Minor note: the text says "next hour" and has no countdown.

**Deploy `1f33f2f` (PR #74, merged to `main`, CI green).** https://paron.vercel.app was READY at `1f33f2f`. No indexer or contract change in that PR. **HISTORICAL:** "A Designer glance check of `/admin` on that deploy is pending" and "Current production commit: `1f33f2f`." The check **PASSED** at 1280 and 390: "Ready at 17:24:06 WIB", Done badge without Execute, clean console, one h1, no horizontal scroll, "Demo data" label.

**Current production commit:** `783b6be` (PR #76). Scout confirmed https://paron.vercel.app READY, and `/docs` returns 200. The D-97 tutorial is **LIVE**. **HISTORICAL:** "build status PENDING" and "not done." Designer header re-check at 1024, 1280, and 390 with a wallet connected is still **PENDING**. Re-shooting tutorial images 01, 02, and 05 is still **PENDING**.

## Never-cut, proven via the UI on production (3/3)

- KYB attestation issued from `/verifier` by the deployer role. Tx `0xb9ce…327d`. The indexer shows the address verified. The app has no KYB submit path and no pending applications, so in the demo the attestation is issued manually via the Issue attestation form on `/verifier`.
- Timelock execute from `/admin`. Tx `0x6823…f653`. The op shows Done.
- Claim default from `/redemptions/3`. Tx `0xcbf6…c21e`. The page shows "Defaulted · paid", $4.50 to the holder.

## PR #72 (`d3081be`) and the Designer re-review

#72 fixed, in code: Done ops show a green "Done" badge without Execute; the hardcoded 0.4500 fallback is removed (an empty factor shows "Not set" and Execute stops with a clear message); a shared TxStatus component is on `/verifier`, `/admin`, Keepers, and KYB; claim shows "Claimable now".

Designer re-review of production `d3081be` (#72) is **finished**. No S0 or S1 findings. Green light for the final video. The earlier open item "Designer re-reviews `/verifier`, `/admin`, `/redemptions/3` after #72" is **HISTORICAL** (done).

Passed on production:

- `/admin` Done op shows a "Done" badge without Execute and without 0.4500.
- `/redemptions/3` shows "Defaulted · paid" without "Not claimable yet".
- `.tx-status` is 14px and consistent.
- Action buttons are 44px.
- Clean console.
- Single h1.
- "Demo data" label.
- Clean navbar.

Not provable read-only on production (no data to exercise): "Claimable now", "Not set", Execute on a ready op, and TxStatus on `/verifier`, `/admin`, and `/ops/keepers`.

## Known issues

- Open: `/verifier` Applications list does not include already-issued attestations.
- Minor, still open: `/arbiter` `ruleWithSignatures` may be a stub.
- Minor, still open: Revoke button is missing.
- Minor, still open: tour card step 04 is clipped for one transition frame.
- S2, **FIXED** (PR #74, `1f33f2f`, merged to `main`, CI green; https://paron.vercel.app READY at `1f33f2f`). **HISTORICAL:** "fix pending, relabel to Ready at", "that PR is not merged", the timezone or chain-time guess, and "a Designer glance check of `/admin` is pending." The Done-op label is now "Ready at". Designer check of `/admin` at `1f33f2f` **PASSED** at 1280 and 390: "Ready at 17:24:06 WIB", Done badge without Execute, clean console, one h1, no horizontal scroll, "Demo data" label. The value is still `ready_at_ms` (schedule + delay = ready time) from `web/components/ops.tsx`. Execution time from the indexer is still not shown. No indexer or contract change.
- Not provable read-only on production (no data): "Claimable now", "Not set", Execute on a ready op, TxStatus on `/verifier`, `/admin`, `/ops/keepers`.
- Design status after the `/admin` check: no open design S0, S1, or S2, except the faucet cooldown text, which says "next hour" and has no countdown. That leftover is a minor S2 and is skippable.

## Recent PRs

- #64 navbar: wallet address shortened, Menu button when the links do not fit, targets at least 44px.
- #65 demo readiness.
- #66–#69 provider, operator, landing, and demo isolation, and the landing motion tour (hardcoded, illustrative; reduced motion is a static poster; static poster at 390).
- #70 transaction simulation fix (`account` passed into simulation).
- #71 landing S2 polish. This PR removed "For providers" from the app navbar (D-95 correction).
- #72 never-cut fixes (`d3081be`).
- #74 relabel Done ops on `/admin` from "Executed" to "Ready at" (`1f33f2f`). No indexer or contract change. The label is fixed. Execution time from the indexer is still not shown.
- #75 records D-97 (tutorial page on the user navbar). Docs-only.
- #76 adds the `/docs` tutorial and puts Docs left of Markets (`783b6be`). Production is READY at that deploy, and `/docs` returns 200.

## Open owner items

- Fatih funds the bot wallet and rotates the RPC key, builds the deck, and submits.
- **HISTORICAL:** "The handler records the final demo video from production." The final demo video is recorded from `d3081be` and does not show `/admin`. The evergreen video editor handles editing, per Fatih.
- Designer re-review after #72: done. See the re-review section. No S0 or S1 items remain from that review.
- **HISTORICAL:** "Designer glance check of `/admin` on production `1f33f2f` is pending." It **PASSED** at 1280 and 390 ("Ready at 17:24:06 WIB", Done badge without Execute, clean console, one h1, no horizontal scroll, "Demo data" label). No open design S0, S1, or S2 except the faucet cooldown text with no countdown (minor S2, skippable).
- **PENDING:** Designer header re-check of the live `/docs` navbar at 1024, 1280, and 390 with a wallet connected.
- **PENDING:** re-shoot tutorial images 01, 02, and 05.
- **TODO:** demo video file still needs upload by Fatih. Pitch deck is still Fatih's.
