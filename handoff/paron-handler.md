# Handoff: Paron handler (Principal Engineer)

Status per Sat 10 Oct 2026, 18:05 WIB. Hard deadline 23:59 WIB. Testnet only (Robinhood Chain Testnet, id 46630).

## What was done
- Took over the project from the master prompt, read the docs, verified live health (`/v1/health`, `/v1/series`, Markets table).
- Ran all code work through cloud agents and merged approved PRs after CI was green: web, indexer, keeper and trader bots, RPC retry and backoff, landing redesign, navbar fixes, information architecture (user, provider, operator, isolated `/demo`), per-provider dashboard, tx status and simulation fix (#70), never-cut UI fixes (#72), "Ready at" label (#74), `/docs` tutorial page (#76), landing Docs nav (#78), refreshed tutorial screenshots (#80). Docs PRs from the Spec Writer merged through #79.
- Proved the S0 demo path on-chain, and the three never-cut flows through the production UI (claim default, KYB approve from `/verifier`, Timelock execute from `/admin`).
- Fixed the GPU model id bug (keccak256 of the name), the `/index` route collision (now `/h100-index`), and the navbar clipping with a connected wallet.
- Verified all 13 deployed contracts on Sourcify (exact match). Blockscout does not support solc 0.8.37 yet, so it shows them as not verified.
- Recorded demo videos: `paron-walkthrough.mp4`, `paron-final.mp4`, and a backup `paron-final-v2.mp4` (production, no wallet, 1:53) on the handler's box under `/workspace/recordings/`.

## Where things stand now
- Production: https://paron.vercel.app, built from `main` (last app change #80). Indexer: https://paron-robinhood-production.up.railway.app/v1/health.
- No open PRs from the handler. Handoff PRs from other bots may be open.
- Hero rework of the landing page (CRM style, requested by Fatih to the Designer) is a prototype only. Merge deadline agreed in the room: about 20:00 WIB. If it misses, use the backup video and the current hero.

## What is next
1. If the hero rework is approved: cloud agent builds it, Designer re-checks 1024, 1280 and 390, Scout confirms deploy READY, then re-record only the landing part and splice it into `paron-final-v2.mp4`.
2. Send the final video to Fatih in the 1:1 chat (he asked for all videos there).
3. Fatih's own items: pitch deck, HackQuest submit, rotate the RPC key that appeared in git history, and optionally a second RPC (`INDEXER_RPC_URL_BACKUP`).
4. Keeper and trader bots on Railway are not running; Scout waits for Fatih's decision (dry-run only or live with funded bot wallets).

## Rules to keep
- Testnet only. Secrets only through the 1:1 secret form with Fatih, never in group chat, docs or commits.
- No messages to organizers, judges or outsiders, no HackQuest submit, no messages on Fatih's behalf without an approved draft.
- No changes to scope, contracts, flows or approved decisions without Fatih's approval; new proposals stay PENDING.
- Content rules: no "not affiliated" text outside the pitch deck, no words "partner" or "feeds", no third-party logos, no old project name or former team members.

## Useful pointers
- Repo: https://github.com/Fatihmaull/paron-robinhood (start at `docs/README.md`, decisions in `docs/knowledge-base/CONTEXT-INDEX.md`, submission URLs and contract list in checklist 09).
- Local clone on the handler's box: `/workspace/paron-robinhood`. Tutorial sources: `/workspace/docs-tutorial/`. Contract verification args: `/tmp/args.json` (may be gone).
