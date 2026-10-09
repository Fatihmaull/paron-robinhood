# @paron/contracts

Foundry package for the Paron contracts. Interfaces, events, and errors are the lane contract for the indexer and the web app. ABIs are exported to `shared/abi/`.

```bash
forge build
forge test
./script/export-abi.sh
```

`forge build` does not need `npm ci`. OpenZeppelin 5.6.1 and EAS contracts 1.9.0 are vendored under `lib/` (`lib/VENDOR.md`). `contracts/node_modules` is unused.

`forge build` writes `out/<Contract>.sol/<Contract>.json` (`abi` and `bytecode.object`). `ops/scripts/deploy.mjs` reads those files. Produce them with `forge build` from this directory before the commands in `DEPLOYMENTS.md`.

Solidity 0.8.37, Cancun, OpenZeppelin 5.6.1, EAS contracts 1.9.0, Foundry 1.8.5, forge-std 1.17.0.
