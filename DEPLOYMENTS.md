# Paron deployments

Generated from `deployments/`. Do not edit addresses by hand.

Active chain: **Deployed on Robinhood Chain Testnet (46630). Explorer: https://explorer.testnet.chain.robinhood.com**

Go/no-go: **GO** on 2026-10-09T04:26:15.171Z (read-only). Evidence: `deployments/46630/go-nogo.json`.

No stage or rehearsal deployment is in this repository yet. Contract addresses appear here after `DeployAll` (contracts lane) and `ops/scripts/seed.mjs` run with a testnet key.

## Address table

| Chain | Label | Contract | Address | Verified | Explorer |
|---|---|---|---|---|---|
| 46630 | — | — | pending deploy | — | https://explorer.testnet.chain.robinhood.com |

## Roles the hackathon deployment records

- `VERIFIER_ROLE` and the EAS attester are `W-VERIFIER` (D-54).
- Timelock proposers are the Safe and `W-ADMIN`. Executor is the zero address, so any account can execute after the delay.
- `MINTER_ROLE` on MockUSDC stays with `W-DEP` until after Demo Day.

Series `CU-JKT-H100-2610` is forged live on stage. It is absent from the stage manifest on purpose.
