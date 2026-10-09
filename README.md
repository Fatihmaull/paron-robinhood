Chain: Robinhood Chain Testnet (chain ID 46630) · explorer https://explorer.testnet.chain.robinhood.com

Approved fallback if the go/no-go checks are not green: Arbitrum Sepolia (chain ID 421614) · explorer https://sepolia.arbiscan.io. Addresses for both chains live in `config/chains.json`.

Paron is a demo market for GPU compute-hour certificates (CU). This repository is the hackathon monorepo. Lane L1 owns `contracts/`, the root scaffold, and the ABIs in `shared/abi/`.

Built by Fatih Maulana with help from Grok Bot.
Dibangun oleh Fatih Maulana dengan bantuan Grok Bot.

## Contracts

```bash
cd contracts
npm ci
forge build
forge test
./script/export-abi.sh
```

Pins: Solidity 0.8.37 (Cancun, `via_ir`, optimizer 200, `auto_detect_solc`), OpenZeppelin 5.6.1, eas-contracts 1.9.0, Foundry 1.8.5, forge-std 1.17.0. Node 24.21.0 is recorded in `.nvmrc`. Contract tests install from `contracts/package-lock.json`.

ABIs for the other lanes are the JSON files in `shared/abi/`. Regenerate them with `contracts/script/export-abi.sh` after any interface change.

## Isolated choices

- `maxFillsPerTx` working value is 10 (constructor argument; T-02).
- CREATE2 salt is `keccak256(abi.encode(seriesId))`.
- GB200 model id is `keccak256("GB200-NVL72")`.
- Continent order is AF, AN, AS, EU, NA, OC, SA, so AS = 2.
- `soldSupply` is filled from `PrimarySale.sold` inside `getSeries`.
- `PrintRecorded` is emitted. `DISRUPTED` stays until an admin clears it.
- Attestation tests use a mock EAS. The 0.8.37 build does not import eas-contracts sources pinned to 0.8.29.

Not affiliated with Robinhood, NVIDIA, or the Ethereum Attestation Service. OpenZeppelin and EAS contracts are third-party dependencies under their own licenses.
