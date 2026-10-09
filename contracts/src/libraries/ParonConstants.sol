// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

/// @title ParonConstants
/// @notice Canonical ids and numeric constants shared by the contracts.
/// @dev Isolated choices (recorded in the L1 PR):
///      - T-02 `maxFillsPerTx` working value is 10, passed in as a constructor
///        argument so tests can use a smaller cap. Pending a `forge snapshot`.
///      - CREATE2 salt is `keccak256(abi.encode(seriesId))`.
///      - GB200 model id is `keccak256("GB200-NVL72")`.
///      - Continent codes follow AF, AN, AS, EU, NA, OC, SA so AS = 2.
library ParonConstants {
    uint256 internal constant CU_LOT = 1e18;
    uint256 internal constant USDC = 1e6;
    uint256 internal constant TICK = 10_000;
    uint16 internal constant BOND_FLOOR_BPS = 15_000;
    uint16 internal constant BPS = 10_000;
    uint16 internal constant MAX_LEVELS = 10;
    uint16 internal constant MAX_FILLS_PER_TX = 10;
    uint16 internal constant DISPUTE_BOND_BPS = 500;
    uint256 internal constant MIN_DISPUTE_BOND = 5_000_000;

    bytes32 internal constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 internal constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 internal constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 internal constant FEED_SIGNER_ROLE = keccak256("FEED_SIGNER_ROLE");
    bytes32 internal constant MINTER_ROLE = keccak256("MINTER_ROLE");

    bytes32 internal constant H100 = keccak256("H100-SXM-80GB");
    bytes32 internal constant H200 = keccak256("H200-SXM-141GB");
    bytes32 internal constant B200 = keccak256("B200-SXM-180GB");
    bytes32 internal constant GB200 = keccak256("GB200-NVL72");
    bytes32 internal constant A100 = keccak256("A100-SXM-80GB");

    uint8 internal constant CONTINENT_AF = 0;
    uint8 internal constant CONTINENT_AN = 1;
    uint8 internal constant CONTINENT_AS = 2;
    uint8 internal constant CONTINENT_EU = 3;
    uint8 internal constant CONTINENT_NA = 4;
    uint8 internal constant CONTINENT_OC = 5;
    uint8 internal constant CONTINENT_SA = 6;

    uint8 internal constant ROLE_PROVIDER = 1;
    uint8 internal constant ROLE_BUYER = 2;
    uint8 internal constant ROLE_TRADER = 3;
    uint8 internal constant ROLE_ARBITER = 4;
}

library ParonMath {
    function ceilMulDiv(uint256 qty, uint256 price) internal pure returns (uint256) {
        if (qty == 0 || price == 0) return 0;
        return (qty * price + 1e18 - 1) / 1e18;
    }

    function floorMulDiv(uint256 qty, uint256 price) internal pure returns (uint256) {
        return (qty * price) / 1e18;
    }
}
