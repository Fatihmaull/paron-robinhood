# Paron deployments

Generated from `deployments/`. Do not edit addresses by hand.

Active chain: **Deployed on Robinhood Chain Testnet (46630). Explorer: https://explorer.testnet.chain.robinhood.com**

Go/no-go: **GO** on 2026-10-09T04:26:15.171Z (read-only). Evidence: `deployments/46630/go-nogo.json`.

No stage deployment has been written yet. The integrator runs the commands below from a trusted machine. This agent does not receive the deployer key.

## Commands

Set `PARON_DEPLOYER_PK` in the environment of that machine (64 hex characters, no `0x` prefix; a leading `0x` is accepted). Do not put the key on the command line. The scripts read it only from the environment and never print it.

The same command with `PARON_BROADCAST` unset is a dry run (no key read, nothing signed). Replace `PARON_BROADCAST=1` with `PARON_SIMULATE=1` to estimate gas and not broadcast.

Run in this order. Each line is one step. Timelock is deployed in the roles step, immediately before the grants, because no core constructor takes its address. `setArbitratorAllowed` stays in the core step, while the deployer is still admin.

1. `PARON_BROADCAST=1 node ops/scripts/deploy.mjs mock-usdc`
   MockUSDC. Writes `deployments/<chainId>/infra.json → mockUsdc`.
2. `PARON_BROADCAST=1 node ops/scripts/deploy.mjs eas-schema`
   EAS schema registration. Writes `deployments/<chainId>/infra.json → eas, schemas`.
3. `PARON_BROADCAST=1 node ops/scripts/deploy.mjs core`
   Core contracts. Writes `deployments/<chainId>/<label>.json → contracts`.
4. `PARON_BROADCAST=1 node ops/scripts/deploy.mjs roles`
   Roles, Safe, and timelock. Writes `deployments/<chainId>/<label>.json → roles, contracts.TimelockController`.
5. `PARON_BROADCAST=1 node ops/scripts/deploy.mjs seed`
   Seed. Writes `deployments/<chainId>/<label>.json → seed`.

Before step 4, create the 2-of-3 Safe in Safe{Wallet} and export `SAFE_ADDRESS`. If that soft-fails, set `PARON_SAFE_MODE=allowlist` instead. `maxFillsPerTx` is read from `config/params`. `MAX_FILLS_PER_TX` overrides it. Seed signers other than the deployer use `KEY_W_VERIFIER`, `KEY_W_P_JKT`, `KEY_W_P_BTM`, `KEY_W_P_SGP`, `KEY_W_BUY`, `KEY_W_TRD`, plus `KEY_W_BUY2` or `KEY_W_FEED` when that action is in the plan.

Then, read-only, no key: `node ops/scripts/verify-deployment.mjs`

L2 and L3 read `deployments/<chainId>/infra.json` and `deployments/<chainId>/<label>.json` (`paron-deployments/v1`).

## Address table

| Chain | Label | Contract | Address | Verified | Explorer |
|---|---|---|---|---|---|
| 46630 | — | — | pending deploy | — | https://explorer.testnet.chain.robinhood.com |

## Roles the hackathon deployment records

- `VERIFIER_ROLE` and the EAS attester are `W-VERIFIER` (D-54).
- Timelock proposers are the Safe and `W-ADMIN`. Executor is the zero address, so any account can execute after the delay.
- `MINTER_ROLE` on MockUSDC stays with `W-DEP` until after Demo Day.

Series `CU-JKT-H100-2610` is forged live on stage. It is absent from the stage manifest on purpose.
