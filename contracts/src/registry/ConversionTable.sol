// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IConversionTableView} from "../interfaces/IWiring.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";

contract ConversionTable is IConversionTableView, AccessControl {
    mapping(bytes32 gpuModel => uint32 factor) private _factor;
    bytes32[] private _models;

    error UnknownGpuModel(bytes32 gpuModel);
    error ZeroFactor();
    error ZeroAddress();

    event FactorSet(bytes32 indexed gpuModel, uint32 oldFactor, uint32 newFactor);

    constructor(address admin) {
        if (admin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _write(ParonConstants.H100, 10_000);
        _write(ParonConstants.H200, 14_000);
        _write(ParonConstants.B200, 25_000);
        _write(ParonConstants.GB200, 35_000);
        _write(ParonConstants.A100, 4_500);
    }

    function setFactor(bytes32 gpuModel, uint32 factor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (factor == 0) revert ZeroFactor();
        _write(gpuModel, factor);
    }

    function removeGpuModel(bytes32 gpuModel) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint32 old = _factor[gpuModel];
        if (old == 0) revert UnknownGpuModel(gpuModel);
        _factor[gpuModel] = 0;
        uint256 n = _models.length;
        for (uint256 i; i < n; ++i) {
            if (_models[i] == gpuModel) {
                _models[i] = _models[n - 1];
                _models.pop();
                break;
            }
        }
        emit FactorSet(gpuModel, old, 0);
    }

    function factorOf(bytes32 gpuModel) external view returns (uint32) {
        uint32 factor = _factor[gpuModel];
        if (factor == 0) revert UnknownGpuModel(gpuModel);
        return factor;
    }

    function listGpuModels() external view returns (bytes32[] memory models, uint32[] memory factors) {
        uint256 n = _models.length;
        models = new bytes32[](n);
        factors = new uint32[](n);
        for (uint256 i; i < n; ++i) {
            models[i] = _models[i];
            factors[i] = _factor[_models[i]];
        }
    }

    function _write(bytes32 gpuModel, uint32 factor) private {
        uint32 old = _factor[gpuModel];
        if (old == 0) _models.push(gpuModel);
        _factor[gpuModel] = factor;
        emit FactorSet(gpuModel, old, factor);
    }
}
