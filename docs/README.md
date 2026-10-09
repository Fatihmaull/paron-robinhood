# Paron docs: project knowledge base for agents and contributors

This folder is the full written context of Paron (collateral-backed GPU compute-unit marketplace on Robinhood Chain testnet, built for Ethereum Jakarta Hackathon 2026). It is documentation only. No product code lives here. Code is in `contracts/`, `indexer/`, `web/`, `ops/`.

## How to read it (in this order)

1. `knowledge-base/SESSION_HANDOFF_HACKATHON.md`: current state, who owns what, env var names (no secret values), known issues, first tasks per role.
2. `knowledge-base/CONTEXT-INDEX.md`: which docs are canonical and the latest approved decisions.
3. `knowledge-base/` canonical docs: `paron-product-knowledge.md` (product map), `paron-product-plan.md` (full plan), `paron-sitemap.md` (routes), `paron-design.md` (design brief), `paron-stack.md` (stack + versions), `paron-gaps.md`, `open-questions-research.md`, `notes.md` (hackathon rules/timeline, WIB), `HANDOFF-BRIEF.md`.
4. `dev-docs/01` to `09`: the developer specs, read in number order (contracts, invariants, data contract, repo config, demo seed, screens, decisions log, team tasks, submission checklist). `07-decisions-log.md` is the authority on decisions (D-numbers); if two docs disagree, 07 wins.
5. `design/`: brand and design system (`README.md` first, then `approved-ui-changes.md`, `brand.md`, `guidelines.md`, `design.md`, `research.md`, `contrast-report.md`, `spec-change-requests.md`, plus CSS tokens/themes `tokens.css`, `tokens.v2.css`, `theme.css`, `theme.v2.css`).
6. `build/STATUS.md`: chronological build log from the Principal Engineer.

## Folder map

| Path | What |
|---|---|
| `knowledge-base/` | Product, stack, research, and the session handoff |
| `dev-docs/` | Specs 01 to 09 (write-ups of contracts, API, config, seed, screens, decisions, tasks, submission) |
| `design/` | Brand v1, guidelines, review findings, change requests |
| `build/STATUS.md` | Build/merge/deploy timeline |

## Status: drafted vs approved

- Decisions are marked `APPROVED` (Fatih decided) or `PENDING`/`USULAN` (proposal) inside the docs. Trust only APPROVED items as binding.
- Designer findings (`design/spec-change-requests.md` #9 to #13 and live-review items LR-5, LR-6, LR-8) were approved by Fatih on 9 Oct 2026 14:40 WIB and are recorded as D-67 to D-74 (APPROVED) in `dev-docs/07-decisions-log.md` §15, with UI details in `dev-docs/06-screens-wireframes.md` §0.6 and `design/approved-ui-changes.md`.
- Not verified at export time: live contrast ratios and the D-66 skeleton visuals.
- Open item: backup RPC URL (`INDEXER_RPC_URL_BACKUP`).

## Notes

- Some docs mention working files that are not in the repo (`tokens.css` / `tokens.v2.css` live in `docs/design/` and are implemented in `web/app/paron/`; `compute-unit.md`, `names.md` and other early-stage notes were left out on purpose). Treat those references as historical.
- Docs were written before and during the hackathon. Product code was written from scratch during the hackathon period (starting Fri 9 Oct 2026 09:00 WIB); these docs are research/design context.
- Addresses and hashes in the docs (`0x1111...`, `0xe1e1...`) are placeholders. No private keys, API keys, or `.env` contents are committed. Env vars appear by name only.
- `web/lib/copy-guard.test.ts` scans `web/` and the root `README.md` only; `docs/` is outside its scope.
