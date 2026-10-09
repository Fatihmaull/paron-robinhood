// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";

contract ReferenceFeed is AccessControl {
    bytes32 public constant FEED_SIGNER_ROLE = ParonConstants.FEED_SIGNER_ROLE;

    struct Ref {
        int256 value;
        uint80 roundId;
        uint64 updatedAt;
        uint64 observedAt;
    }

    string public label;
    mapping(bytes32 gpuModel => Ref) private _refs;

    error ZeroAddress();
    error StaleObservation();
    error NoData();

    event ReferenceUpdated(bytes32 indexed gpuModel, int256 value, uint64 observedAt, uint80 roundId);
    event LabelUpdated(string label);

    constructor(address admin, address feedSigner, string memory label_) {
        if (admin == address(0) || feedSigner == address(0)) revert ZeroAddress();
        label = label_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FEED_SIGNER_ROLE, feedSigner);
    }

    function push(bytes32 gpuModel, int256 value, uint64 observedAt) external onlyRole(FEED_SIGNER_ROLE) {
        Ref storage r = _refs[gpuModel];
        if (observedAt > block.timestamp || observedAt <= r.updatedAt) revert StaleObservation();
        r.value = value;
        r.observedAt = observedAt;
        r.updatedAt = uint64(block.timestamp);
        r.roundId += 1;
        emit ReferenceUpdated(gpuModel, value, observedAt, r.roundId);
    }

    function setLabel(string calldata label_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        label = label_;
        emit LabelUpdated(label_);
    }

    function latestRoundData(bytes32 gpuModel)
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        Ref storage r = _refs[gpuModel];
        if (r.updatedAt == 0) revert NoData();
        return (r.roundId, r.value, r.observedAt, r.updatedAt, r.roundId);
    }

    function decimals() external pure returns (uint8) {
        return 6;
    }

    function description() external view returns (string memory) {
        return label;
    }

    function isSynthetic() external pure returns (bool) {
        return true;
    }
}
