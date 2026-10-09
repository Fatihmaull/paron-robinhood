# @paron/indexer

Ponder indexer and Hono read API for Paron (`/v1`). Testnet only (Robinhood Chain Testnet 46630, fallback Arbitrum Sepolia 421614). The API is not a separate service: it runs inside the Ponder process.

The frontend is deployed on Vercel. This package is the indexer and API, deployed on Railway.

## Local development (no Postgres)

From this directory:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Leave `DATABASE_URL` empty. Ponder uses PGlite and does not need Postgres. `DATABASE_SCHEMA` is ignored in that mode.

`pnpm dev` serves the API on port 42069. `GET /v1/health` reports sync status.

`pnpm test` replays the dev-doc 03 demo through the same reducer the chain handlers use. It does not need a chain or a database.

## Railway

Create one Railway service from this monorepo.

| Setting | Value |
|---|---|
| Root Directory | `indexer` |
| Builder | Dockerfile (`indexer/Dockerfile`) |
| Start command | `pnpm start` |
| Port | `$PORT` (Railway sets this; the start script passes it to `ponder start`) |
| Healthcheck path | `/v1/health` |
| Healthcheck timeout | 300 seconds |

Ponder reserves `GET /health`, `/ready`, `/status`, `/metrics`, and `/client`, so this API does not register those paths. Railway's healthcheck is `GET /v1/health`. That route stays up while the indexer is backfilling (`synced: false`, HTTP 200) so Railway does not kill the process. Other `/v1/*` routes return `503 INDEXER_SYNCING` until the indexed head is within 5 blocks of the chain head. If the RPC head check fails, an indexed block greater than 0 still counts as synced so a local process without a working RPC can serve. Ponder's own `GET /health` is an empty 200 and does not report sync.

Attach a Railway Postgres plugin. It injects `DATABASE_URL` at deploy time. Do not commit that URL.

`ponder start` (production) requires Postgres. `ponder dev` (local) does not.

### `DATABASE_SCHEMA`

Ponder writes its tables into the Postgres schema named by `DATABASE_SCHEMA`. Set it on the Railway service to a fixed value, for example `paron`, and keep that value for every redeploy of the same service.

If the variable is missing while `DATABASE_URL` is set, this package refuses to boot. If the value changes, Ponder backfills into a different schema and the API looks empty until that finishes. Do not rotate it as part of a normal deploy.

The schema has to stay stable per deployment. One Railway service, one schema name.

### Environment

| Variable | Required on Railway | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Railway Postgres connection string, injected by the plugin |
| `DATABASE_SCHEMA` | yes | Stable Ponder schema, e.g. `paron` |
| `INDEXER_RPC_URL` | yes | Archive-capable RPC (Alchemy or Goldsky). Secret |
| `INDEXER_RPC_URL_BACKUP` | no | Second RPC URL |
| `CHAIN` | no | `robinhoodTestnet` (default) or `arbitrumSepolia` |
| `DEPLOY_LABEL` | no | Manifest label, default `stage-1` |
| `PARAM_SET` | no | `demo` or `prod` |
| `PORT` | set by Railway | Listen port |
| `API_CORS_ORIGIN` | no | Comma-separated browser origins. Unset, blank, or `*` allows every origin |
| `API_PUBLIC_BASE_URL` | no | Public base, no custom domain |
| `API_NOW_SOURCE` | no | `server` (wall clock) or `chain` (last indexed block, anvil) |
| `TIMELOCK_INDEXED` | no | Index timelock and role events |

`API_CORS_ORIGIN` is read when the process starts. A single origin or a comma-separated list is reflected back on matching requests (`https://paron.vercel.app,http://localhost:3000`). Any other `Origin` gets `Access-Control-Allow-Origin: null`, which replaces the `*` Ponder's own server adds. Leave the variable unset to allow every origin.

`pnpm install` needs `pnpm-workspace.yaml` in the build context. pnpm 12.9.1 does not read `onlyBuiltDependencies` from `package.json`; it allows build scripts only through `allowBuilds` in that file. esbuild is listed because Vite's postinstall selects the platform binary. `@electric-sql/pglite` has no install script.

Chain metadata is read from `config/chains.json` at the repo root when that file exists, otherwise from `indexer/config/chains.json`. Contract addresses and `startBlock` are read from `deployments/<chainId>/<DEPLOY_LABEL>.json` and `deployments/<chainId>/infra.json` when lane L4 has written them. Until then the service boots against placeholder addresses and `startBlock: "latest"`.

## Root repo notes (not changed here)

- Add `indexer` to the root `pnpm-workspace.yaml`.
- `config/chains.json` and `deployments/` belong to L1/L4. This package ships a chain file and reads the root copies when they exist.
- Replace `src/abi/temporary-event-abis.ts` with L1's `shared/abi` export. The temporary file is derived from dev doc 01.
- `fixtures/v1/` at the repo root is the frontend mock (dev doc 03 §4). API tests live in `indexer/test`.
- `METHODOLOGY.md` at the repo root is where the winsorization alpha belongs (T3-04). The API reports `alpha: null` and `methodology: "METHODOLOGY.md"`.

## Spec choices

- Bond health is floored to 3 decimal places (`2169/2250` → `"0.964"`). Coverage is floored to 2 (P3-30). `default_rate` is half-up to 3 because the approved example is `"0.556"` for 10/18.
- A series with no reference of its own uses the H100 reference (coverage is in H100-equivalent units).
- The offchain headline is a trailing `window_secs` VWAP. With alpha unset, winsorized VWAP equals VWAP. `IndexUpdated` does not carry a tumbling `windowStart`, so a true onchain tumbling window is not reconstructed. One eligible print makes both readings match.
- Timelock rows are stored as `operationId-index` because one batch has several indexes. The stored column is `timelockId` because Ponder reserves the SQL name `operation_id`. The API field `operation_id` is still the `CallScheduled` id.
- D-45 through D-58 are applied as the proposed text. `OrderPlaced` is only the resting remainder (D-51). `declineAndPay` actions disappear once `now_s > deadline` (D-47). A same-transaction `RedemptionReopened` removes the refund's `REDEMPTION_UNLOCK` (D-46). `Defaulted.caller` is stored as emitted, which is the arbitrator address when `via_dispute` is true (D-56). `GET /v1/health` includes `index_update_failures`, the count of `IndexUpdateFailed` logs (D-53).
- E10 `state` and `actions` use the contract's strict `now_s > deadline`. The extra 2 seconds before the client enables Claim default is a UI rule on top of `meta.server_now_ms` (D-48). The approved DEFAULTABLE example is only 1 second past the deadline and already lists `CLAIM_DEFAULT`.
- `event_log` stays on so redemption timelines work.
- Error bodies have no `meta`. Every success envelope includes `meta.server_now_ms`.
- Sync lag threshold is 5 blocks until T4-03 is measured.
- `ARBITER_ROLE` remains in the role-name map. The contract no longer grants it.
- `refunded_after_window` is informational (`ts >= window_end`), not a contract field.
- `ReferenceUpdated` rows are labeled `"synthetic demo data"` until a label feed is joined. That is the label API-14 requires.
