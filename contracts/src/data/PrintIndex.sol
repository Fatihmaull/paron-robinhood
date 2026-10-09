// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IPrintIndexWrite, ISeriesFactoryView} from "../interfaces/IWiring.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";
import {IndexParams, IndexState, IndexStatus} from "../libraries/ParonTypes.sol";

contract PrintIndex is IPrintIndexWrite, AccessControl {
    bytes32 public constant ADMIN_ROLE = ParonConstants.ADMIN_ROLE;

    address public immutable orderBook;
    address public immutable redemptionManager;
    ISeriesFactoryView public immutable factory;
    IndexParams public params;

    mapping(bytes32 gpuModel => IndexState) private _state;
    mapping(bytes32 gpuModel => mapping(uint64 windowStart => mapping(bytes32 entity => bool))) public seenEntity;

    error ZeroAddress();
    error OnlyOrderBook();
    error OnlyRedemptionManager();
    error NoData();

    event PrintRecorded(
        uint256 indexed seriesId, bytes32 indexed gpuModel, uint256 cuPrice, uint256 qty, bool eligible
    );
    event IndexUpdated(bytes32 indexed gpuModel, uint80 roundId, int256 answer, IndexStatus status);
    event IndexStatusChanged(bytes32 indexed gpuModel, IndexStatus oldStatus, IndexStatus newStatus);
    event DeliveryRecorded(bytes32 indexed gpuModel, uint256 cu);
    event DefaultRecorded(bytes32 indexed gpuModel, uint256 cu);
    event IndexParamsUpdated(IndexParams params);

    constructor(
        address orderBook_,
        address redemptionManager_,
        address factory_,
        address admin,
        IndexParams memory params_
    ) {
        if (orderBook_ == address(0) || redemptionManager_ == address(0) || factory_ == address(0) || admin == address(0))
        {
            revert ZeroAddress();
        }
        orderBook = orderBook_;
        redemptionManager = redemptionManager_;
        factory = ISeriesFactoryView(factory_);
        params = params_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function recordTrade(
        uint256 seriesId,
        uint256 cuPrice,
        uint256 qty,
        bool eligible,
        bytes32 makerEntity,
        bytes32 takerEntity
    ) external {
        if (msg.sender != orderBook) revert OnlyOrderBook();
        if (qty == 0) return;
        bytes32 gpu = factory.getSeries(seriesId).gpuModel;
        IndexState storage st = _state[gpu];
        IndexStatus before = _observed(st);
        _tumble(st);
        if (eligible) {
            st.sumNotional += cuPrice * qty;
            st.sumQty += qty;
            st.printCount += 1;
            _count(gpu, st, makerEntity);
            _count(gpu, st, takerEntity);
            if (st.status != IndexStatus.DISRUPTED) _refresh(gpu, st, before);
            else if (st.status != before) emit IndexStatusChanged(gpu, before, st.status);
        } else if (st.status != before) {
            emit IndexStatusChanged(gpu, before, st.status);
        }
        emit PrintRecorded(seriesId, gpu, cuPrice, qty, eligible);
    }

    function recordDelivery(bytes32 gpuModel, uint256 cu) external {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        _state[gpuModel].deliveredCU += cu;
        emit DeliveryRecorded(gpuModel, cu);
    }

    function recordDefault(bytes32 gpuModel, uint256 cu) external {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        _state[gpuModel].defaultedCU += cu;
        emit DefaultRecorded(gpuModel, cu);
    }

    function poke(bytes32 gpuModel) external {
        IndexState storage st = _state[gpuModel];
        IndexStatus before = _observed(st);
        int256 beforeAnswer = st.answer;
        _tumble(st);
        if (st.status != before) emit IndexStatusChanged(gpuModel, before, st.status);
        if (st.answer != beforeAnswer || st.status != before) {
            emit IndexUpdated(gpuModel, uint80(st.roundId), st.answer, st.status);
        }
    }

    function setParams(IndexParams calldata params_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        params = params_;
        emit IndexParamsUpdated(params_);
    }

    function setDisrupted(bytes32 gpuModel, bool disrupted) external onlyRole(ADMIN_ROLE) {
        IndexState storage st = _state[gpuModel];
        IndexStatus next = disrupted ? IndexStatus.DISRUPTED : IndexStatus.THIN;
        IndexStatus old = st.status;
        st.status = next;
        emit IndexStatusChanged(gpuModel, old, next);
    }

    function latestRoundData(bytes32 gpuModel)
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        IndexState storage st = _state[gpuModel];
        if (st.roundId == 0) revert NoData();
        return (uint80(st.roundId), st.answer, st.updatedAt, st.updatedAt, uint80(st.roundId));
    }

    function statusOf(bytes32 gpuModel) external view returns (IndexStatus status, uint64 updatedAt) {
        IndexState storage st = _state[gpuModel];
        return (_observed(st), st.updatedAt);
    }

    function decimals() external pure returns (uint8) {
        return 6;
    }

    function description() external pure returns (string memory) {
        return "Paron PrintIndex";
    }

    function stateOf(bytes32 gpuModel) external view returns (IndexState memory) {
        return _state[gpuModel];
    }

    function _observed(IndexState storage st) private view returns (IndexStatus) {
        if (st.windowStart == 0 && st.roundId == 0) return IndexStatus.THIN;
        return st.status;
    }

    function _tumble(IndexState storage st) private {
        if (st.windowStart == 0) {
            st.windowStart = uint64(block.timestamp);
            if (st.status != IndexStatus.DISRUPTED) st.status = IndexStatus.THIN;
            return;
        }
        if (block.timestamp < uint256(st.windowStart) + params.windowLength) return;

        if (st.status != IndexStatus.DISRUPTED) {
            if (st.lastOkAt != 0 && block.timestamp > uint256(st.lastOkAt) + params.maxCarryForward) {
                st.status = IndexStatus.DISRUPTED;
            } else {
                st.status = IndexStatus.THIN;
            }
        }
        st.sumNotional = 0;
        st.sumQty = 0;
        st.participantCount = 0;
        st.printCount = 0;
        st.windowStart = uint64(block.timestamp);
    }

    function _refresh(bytes32 gpu, IndexState storage st, IndexStatus before) private {
        bool ok = st.sumQty >= params.minVolume && st.participantCount >= params.minParticipants;
        if (ok) {
            int256 vw = int256(st.sumNotional / st.sumQty);
            if (st.roundId == 0 || vw != st.answer || st.status != IndexStatus.OK) {
                st.roundId += 1;
                st.answer = vw;
                st.updatedAt = uint64(block.timestamp);
                emit IndexUpdated(gpu, uint80(st.roundId), vw, IndexStatus.OK);
            }
            st.status = IndexStatus.OK;
            st.lastOkAt = uint64(block.timestamp);
            if (before != IndexStatus.OK) emit IndexStatusChanged(gpu, before, IndexStatus.OK);
        } else if (st.status != IndexStatus.THIN) {
            IndexStatus old = st.status;
            st.status = IndexStatus.THIN;
            emit IndexStatusChanged(gpu, old, IndexStatus.THIN);
        }
    }

    function _count(bytes32 gpu, IndexState storage st, bytes32 entity) private {
        if (entity == bytes32(0)) return;
        if (seenEntity[gpu][st.windowStart][entity]) return;
        seenEntity[gpu][st.windowStart][entity] = true;
        st.participantCount += 1;
    }
}
