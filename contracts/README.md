# @paron/contracts

Foundry package for the Paron contracts. Interfaces, events, and errors are the lane contract for the indexer and the web app. ABIs are exported to `shared/abi/`.

```bash
forge build
forge test
./script/export-abi.sh
```

`forge build` does not need `npm ci`. OpenZeppelin 5.6.1 and EAS contracts 1.9.0 are vendored under `lib/` (`lib/VENDOR.md`). `contracts/node_modules` is unused.

`forge build` writes `out/<Contract>.sol/<Contract>.json`. `ops/scripts/deploy.mjs` reads those artifacts. The integrator command is in `DEPLOYMENTS.md`. The forge entrypoint for the same five steps is `script/DeployAll.s.sol` (`PARON_STEP`, `PARON_BROADCAST=1`, key in `PARON_DEPLOYER_PK` only). On that forge path, `PARON_STEP=seed` submits the attestations and a second run links them. `deploy.mjs seed` does both in one command.

Solidity 0.8.37, Cancun, OpenZeppelin 5.6.1, EAS contracts 1.9.0, Foundry 1.8.5, forge-std 1.17.0.
