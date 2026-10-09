// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Ruling} from "../libraries/ParonTypes.sol";

interface IArbitrator {
    function onDisputeOpened(uint256 reqId, uint64 rulingDeadline) external;

    function rule(uint256 reqId, Ruling outcome) external;
}

interface IRedemptionCallbacks {
    function onRuling(uint256 reqId, Ruling ruling) external;

    function openRequestCount(uint256 seriesId) external view returns (uint256);

    function rulingWindow() external view returns (uint64);
}
