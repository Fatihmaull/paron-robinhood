# Agents

Keeper and trader bot for Robinhood Chain Testnet (`46630`) and Arbitrum Sepolia (`421614`). Any other chain id refuses to start. Keys stay in environment variables. Nothing in this directory is a key.

## Railway

Set the service root to `agents`.

Install:

```bash
npm install
```

Keeper start command:

```bash
npm run keeper
```

Trader bot start command:

```bash
npm run trader-bot
```

Those scripts run `node src/keeper/run.mjs` and `node src/trader-bot/run.mjs`. `SIGINT` and `SIGTERM` stop the poll loop and exit 0.

## Required env

Both services:

| Name | Notes |
| --- | --- |
| `CHAIN_ID` | `46630` or `421614`. Anything else exits 2. |
| `AGENT_RPC_URL` | HTTPS RPC. Required before a process will send. Omit it and the process stays idle. |
| `DEPLOY_LABEL` | Optional. Default `stage-1`. |

Addresses are read from `deployments/<CHAIN_ID>/<DEPLOY_LABEL>.json`. The settlement token is read from `deployments/<CHAIN_ID>/infra.json` (`mockUsdc`). Override with `SERIES_FACTORY_ADDRESS`, `PRIMARY_SALE_ADDRESS`, `ORDER_BOOK_ADDRESS`, `REDEMPTION_MANAGER_ADDRESS`, or `SETTLEMENT_TOKEN_ADDRESS`.

Keeper:

| Name | Notes |
| --- | --- |
| `KEEPER_PRIVATE_KEY` | Env var that holds the key. Required only when `KEEPER_DRY_RUN=false` and the kill switch is off. |
| `KEEPER_DRY_RUN` | Default `true`. `false` is the only value that may sign. |
| `KEEPER_POLL_SECONDS` | Default `60`. |
| `KEEPER_KILL_SWITCH` | `on` stops every keeper send. |

Trader bot:

| Name | Notes |
| --- | --- |
| `TRADER_BOT_PRIVATE_KEY` | Env var that holds the key. Required only when `TRADER_BOT_DRY_RUN=false` and the kill switch is off. |
| `TRADER_BOT_DRY_RUN` | Default `true`. `false` is the only value that may sign. |
| `TRADER_BOT_TRIGGER` | `auto` (default) or `manual`. `node src/trader-bot/run.mjs --manual` runs the three steps once. |
| `TRADER_BOT_SERIES_ID` | Default `4`. |
| `TRADER_BOT_POLL_SECONDS` | Default `15`. |
| `TRADER_BOT_KILL_SWITCH` | `on` stops every trader send. |
| `W_BUY` | Buyer address the bot watches. |
| `W_TRD` | Trader address. Its own buy does not arm the bot. |

`AGENT_KILL_SWITCH=on` and `PROVIDER_AGENT_KILL_SWITCH=on` also stop sends for whichever process has the flag set. `on`, `true`, and `1` mean on.

## Dry run and kill switch

Dry run plans the same actions and signs nothing. The signer is not constructed.

The kill switch is off-chain. An env flag above stops all sending. The process also reads `SeriesFactory.getSeries(seriesId).paused` (already on the contract). A paused series, or a failed pause read, stops sends for that series. No contract change is required. Restart the service to pick up a new env value.

Logs are one JSON object per line. A 32-byte hex key is replaced with `[redacted]`, and the RPC URL is not printed.

## Tests

From `agents/`:

```bash
npm test
```

Do not point `AGENT_RPC_URL` at a chain when you only want the unit tests. The tests do not dial the network.
