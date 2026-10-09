// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Series, SeriesBond} from "../libraries/ParonTypes.sol";

interface ISeriesFactoryView {
    function getSeries(uint256 seriesId) external view returns (Series memory);

    function isSaleOpen(uint256 seriesId) external view returns (bool);

    function isRedeemWindowOpen(uint256 seriesId) external view returns (bool);

    function leadTime() external view returns (uint64);

    function seriesIdOf(address token) external view returns (uint256);
}

interface ICUToken {
    function mint(address to, uint256 amount) external;

    function lockFrom(address holder, uint256 amount) external;

    function burn(uint256 amount) external;
}

interface IPrimarySaleView {
    function sold(uint256 seriesId) external view returns (uint256);
}

interface IBondVault {
    function deposit(uint256 seriesId, address provider, uint256 amount) external;

    function release(uint256 seriesId, uint256 amount, uint256 reqId) external;

    function slash(uint256 seriesId, address recipient, uint256 amount, uint256 reqId) external;

    function markFinalized(uint256 seriesId) external;

    function bondOf(uint256 seriesId) external view returns (SeriesBond memory);
}

interface IProviderRegistryWrite {
    function recordDelivered(address provider, uint256 cu) external;

    function recordDefault(address provider, uint256 cu, bool voluntary) external;

    function recordDisputeLost(address provider) external;
}

interface IPrintIndexWrite {
    function recordTrade(
        uint256 seriesId,
        uint256 cuPrice,
        uint256 qty,
        bool eligible,
        bytes32 makerEntity,
        bytes32 takerEntity
    ) external;

    function recordDelivery(bytes32 gpuModel, uint256 cu) external;

    function recordDefault(bytes32 gpuModel, uint256 cu) external;
}

interface IConversionTableView {
    function factorOf(bytes32 gpuModel) external view returns (uint32);
}

interface IProviderRegistryView {
    function isListable(address provider) external view returns (bool);

    function entityIdOf(address provider) external view returns (bytes32);
}
