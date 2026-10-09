# Paron web

Next.js app for the Paron testnet demo. Vercel project root is this directory (`web/`).

## Toolchain

- Node `24.21.0` (`.nvmrc`). `engines.node` is `>=22.18.0` so `pnpm test` can run TypeScript tests without `--experimental-strip-types`.
- pnpm `12.9.1` (`packageManager`).

From a checkout of this folder:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

`next build` throws when `VERCEL=1` and `NEXT_PUBLIC_DATA_SOURCE=mock` is set explicitly. Unset defaults to `live` when `NEXT_PUBLIC_API_BASE_URL` is set (or on Vercel).

## Environment

Copy `.env.example` to `.env.local`. Every value is public. Do not put keys here.

| Variable | Role |
|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | `46630` (Robinhood Chain Testnet) or `421614` (Arbitrum Sepolia fallback). |
| `NEXT_PUBLIC_RPC_URL` | HTTP RPC. Default `https://rpc.testnet.chain.robinhood.com`. |
| `NEXT_PUBLIC_API_BASE_URL` | Indexer API origin, no trailing path beyond `/v1` if that is the base. |
| `NEXT_PUBLIC_DATA_SOURCE` | Optional. `live` (or `api`) or `mock` (fixtures, transactions disabled). Unset: live if API base set, else mock. |
| `NEXT_PUBLIC_DEPLOY_LABEL` | Manifest name under `deployments/<chainId>/`. Default `stage-1`. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Set to enable RainbowKit. Empty uses the injected browser wallet. |
| `NEXT_PUBLIC_DEMO_PRESETS` | `true` shows the listing-wizard demo preset. |
| `NEXT_PUBLIC_SHOW_SYNTHETIC_LABEL` | `true` keeps the synthetic spot-reference label. |
| `NEXT_PUBLIC_AGENT_URL` | Agent base URL. Empty hides the kill-switch toggle. |
| `NEXT_PUBLIC_ADDR_USDC` | MockUSDC. |
| `NEXT_PUBLIC_ADDR_EAS` | EAS contract. |
| `NEXT_PUBLIC_ADDR_EAS_SCHEMA` | `ParticipantVerified` schema uid (bytes32). |
| `NEXT_PUBLIC_ADDR_PROVIDER_REGISTRY` | ProviderRegistry. |
| `NEXT_PUBLIC_ADDR_SERIES_FACTORY` | SeriesFactory. |
| `NEXT_PUBLIC_ADDR_PRIMARY_SALE` | PrimarySale. |
| `NEXT_PUBLIC_ADDR_ORDER_BOOK` | OrderBook. |
| `NEXT_PUBLIC_ADDR_REDEMPTION_MANAGER` | RedemptionManager. |
| `NEXT_PUBLIC_ADDR_BOND_VAULT` | BondVault. |
| `NEXT_PUBLIC_ADDR_PRINT_INDEX` | PrintIndex. |
| `NEXT_PUBLIC_ADDR_REFERENCE_FEED` | ReferenceFeed. |
| `NEXT_PUBLIC_ADDR_CONVERSION_TABLE` | ConversionTable. |
| `NEXT_PUBLIC_ADDR_TIMELOCK` | TimelockController. |
| `NEXT_PUBLIC_ADDR_PANEL` | PanelArbitrator. |
| `NEXT_PUBLIC_ADDR_CU_TOKEN_SERIES_4` | Optional CU token for the demo series. |

Leave `NEXT_PUBLIC_ADDR_*` empty until addresses are known. With `NEXT_PUBLIC_DATA_SOURCE=mock`, transactions stay disabled.
