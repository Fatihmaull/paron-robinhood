// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IArbitrator, IRedemptionCallbacks} from "../../src/interfaces/IArbitrator.sol";
import {Ruling} from "../../src/libraries/ParonTypes.sol";

contract MockArbitrator is IArbitrator {
    IRedemptionCallbacks public immutable rm;

    constructor(address rm_) {
        rm = IRedemptionCallbacks(rm_);
    }

    function onDisputeOpened(uint256, uint64) external {}

    function rule(uint256 reqId, Ruling outcome) external {
        rm.onRuling(reqId, outcome);
    }
}
