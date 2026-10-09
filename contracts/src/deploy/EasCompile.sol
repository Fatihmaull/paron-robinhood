// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import {EAS} from "@ethereum-attestation-service/eas-contracts/EAS.sol";
import {SchemaRegistry} from "@ethereum-attestation-service/eas-contracts/SchemaRegistry.sol";

/// @notice Pulls EAS 1.9.0 into this build so `contracts/out/EAS.sol` and
/// `contracts/out/SchemaRegistry.sol` exist for `ops/scripts/deploy.mjs`.
/// Kept on solc 0.8.29, separate from the 0.8.37 contracts.
contract EasCompile {
    function names() external pure returns (string memory, string memory) {
        return (type(EAS).name, type(SchemaRegistry).name);
    }
}
