# Vendored Solidity

`forge build` reads these trees. It does not need `npm ci` or `contracts/node_modules`.

| Path | Package | Version | License |
| --- | --- | --- | --- |
| `openzeppelin-contracts/` | `@openzeppelin/contracts` | 5.6.1 | MIT |
| `openzeppelin-contracts-upgradeable/` | `@openzeppelin/contracts-upgradeable` | 5.6.1 | MIT |
| `eas-contracts/contracts/` | `@ethereum-attestation-service/eas-contracts` | 1.9.0 | MIT (`eas-contracts/LICENSE`) |

`contracts/package.json` records the same versions. Remappings are in `contracts/remappings.txt`.
