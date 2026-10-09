// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IArbitrator} from "../interfaces/IArbitrator.sol";
import {ISeriesFactoryView, ICUToken, IBondVault, IProviderRegistryWrite, IPrintIndexWrite} from "../interfaces/IWiring.sol";
import {ParonConstants, ParonMath} from "../libraries/ParonConstants.sol";
import {RedemptionState, Request, Ruling, Series} from "../libraries/ParonTypes.sol";

contract RedemptionManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    ISeriesFactoryView public immutable factory;
    IBondVault public immutable bondVault;
    IProviderRegistryWrite public immutable registry;
    IPrintIndexWrite public printIndex;
    IERC20 public immutable settlementToken;
    uint64 public immutable rulingWindow;

    uint256 public nextReqId = 1;
    mapping(uint256 reqId => Request) private _requests;
    mapping(uint256 seriesId => uint256 count) public openRequestCount;
    mapping(uint256 reqId => uint256 oldReqId) public reopenedFrom;

    error ZeroAddress();
    error UnknownSeries(uint256 seriesId);
    error UnknownRequest(uint256 reqId);
    error OutsideRedemptionWindow();
    error ZeroAmount();
    error InvalidLot();
    error BelowMinRedemption(uint256 min);
    error NotProvider();
    error NotHolder();
    error NotArbitrator();
    error InvalidState(RedemptionState current);
    error AckDeadlinePassed();
    error ZeroReceipt();
    error DisputeWindowOpen();
    error DisputeWindowClosed();
    error NotDefaultable();
    error RulingDeadlinePassed();
    error RulingDeadlineNotReached();
    error InvalidRuling();

    event RedemptionRequested(
        uint256 indexed reqId,
        uint256 indexed seriesId,
        address indexed holder,
        uint256 amount,
        bytes32 deliveryRef,
        uint64 ackDeadline
    );
    event Acknowledged(uint256 indexed reqId, uint64 deliveryDeadline);
    event Delivered(uint256 indexed reqId, uint256 indexed seriesId, bytes32 receiptHash, uint64 disputeDeadline);
    event RedemptionFinalized(
        uint256 indexed reqId, uint256 indexed seriesId, uint256 amount, uint256 bondReleased, bool auto_
    );
    event Disputed(uint256 indexed reqId, uint256 indexed seriesId, uint256 disputeBond, uint64 rulingDeadline);
    event Ruled(uint256 indexed reqId, Ruling ruling, address arbitrator);
    event Defaulted(
        uint256 indexed reqId,
        uint256 indexed seriesId,
        address indexed holder,
        uint256 amount,
        uint256 payout,
        bool voluntary,
        bool viaDispute,
        address caller
    );
    event Refunded(uint256 indexed reqId, uint256 indexed seriesId, uint256 amount, uint256 disputeBondReturned);
    event RedemptionReopened(
        uint256 indexed oldReqId, uint256 indexed newReqId, uint256 indexed seriesId, uint64 ackDeadline
    );
    event IndexUpdateFailed(bytes32 indexed gpuModel, uint256 indexed seriesId, uint256 refId);

    constructor(
        address factory_,
        address bondVault_,
        address registry_,
        address printIndex_,
        address settlementToken_,
        uint64 rulingWindow_
    ) {
        if (
            factory_ == address(0) || bondVault_ == address(0) || registry_ == address(0) || printIndex_ == address(0)
                || settlementToken_ == address(0)
        ) revert ZeroAddress();
        factory = ISeriesFactoryView(factory_);
        bondVault = IBondVault(bondVault_);
        registry = IProviderRegistryWrite(registry_);
        printIndex = IPrintIndexWrite(printIndex_);
        settlementToken = IERC20(settlementToken_);
        rulingWindow = rulingWindow_;
    }

    function requestRedemption(uint256 seriesId, uint256 amount, bytes32 deliveryRef)
        external
        nonReentrant
        returns (uint256 reqId)
    {
        Series memory s = factory.getSeries(seriesId);
        if (block.timestamp < s.windowStart || block.timestamp >= s.windowEnd) revert OutsideRedemptionWindow();
        if (amount == 0) revert ZeroAmount();
        if (amount % ParonConstants.CU_LOT != 0) revert InvalidLot();
        if (amount < s.minRedemption) revert BelowMinRedemption(s.minRedemption);

        ICUToken(s.token).lockFrom(msg.sender, amount);
        reqId = nextReqId++;
        _requests[reqId] = Request({
            seriesId: seriesId,
            holder: msg.sender,
            amount: amount,
            deliveryRef: deliveryRef,
            receiptHash: bytes32(0),
            state: RedemptionState.Requested,
            requestedAt: uint64(block.timestamp),
            ackDeadline: uint64(block.timestamp) + s.ackWindow,
            deliveryDeadline: 0,
            disputeDeadline: 0,
            rulingDeadline: 0,
            disputeBond: 0
        });
        openRequestCount[seriesId] += 1;
        emit RedemptionRequested(reqId, seriesId, msg.sender, amount, deliveryRef, _requests[reqId].ackDeadline);
    }

    function acknowledge(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        Series memory s = factory.getSeries(r.seriesId);
        if (msg.sender != s.provider) revert NotProvider();
        if (r.state != RedemptionState.Requested) revert InvalidState(stateOf(reqId));
        if (block.timestamp > r.ackDeadline) revert AckDeadlinePassed();
        r.state = RedemptionState.Acknowledged;
        r.deliveryDeadline = uint64(block.timestamp) + s.deliveryWindow;
        emit Acknowledged(reqId, r.deliveryDeadline);
    }

    function markDelivered(uint256 reqId, bytes32 receiptHash) external nonReentrant {
        if (receiptHash == bytes32(0)) revert ZeroReceipt();
        Request storage r = _existing(reqId);
        Series memory s = factory.getSeries(r.seriesId);
        if (msg.sender != s.provider) revert NotProvider();
        if (r.state != RedemptionState.Acknowledged) revert InvalidState(stateOf(reqId));
        r.state = RedemptionState.Delivered;
        r.receiptHash = receiptHash;
        r.disputeDeadline = uint64(block.timestamp) + s.disputeWindow;
        emit Delivered(reqId, r.seriesId, receiptHash, r.disputeDeadline);
    }

    function confirm(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        if (msg.sender != r.holder) revert NotHolder();
        if (r.state != RedemptionState.Delivered) revert InvalidState(stateOf(reqId));
        _finalize(r, reqId, false);
    }

    function finalizeRedemption(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        if (r.state != RedemptionState.Delivered) revert InvalidState(stateOf(reqId));
        if (block.timestamp <= r.disputeDeadline) revert DisputeWindowOpen();
        _finalize(r, reqId, true);
    }

    function dispute(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        if (msg.sender != r.holder) revert NotHolder();
        if (r.state != RedemptionState.Delivered) revert InvalidState(stateOf(reqId));
        if (block.timestamp > r.disputeDeadline) revert DisputeWindowClosed();
        Series memory s = factory.getSeries(r.seriesId);
        uint256 claim = _claim(s, r.amount);
        uint256 bond = _disputeBond(claim);
        r.state = RedemptionState.Disputed;
        r.disputeBond = bond;
        r.rulingDeadline = uint64(block.timestamp) + rulingWindow;
        settlementToken.safeTransferFrom(msg.sender, address(this), bond);
        IArbitrator(s.arbitrator).onDisputeOpened(reqId, r.rulingDeadline);
        emit Disputed(reqId, r.seriesId, bond, r.rulingDeadline);
    }

    function claimDefault(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        if (stateOf(reqId) != RedemptionState.Defaultable) revert NotDefaultable();
        _default(r, reqId, false, false, msg.sender);
    }

    function declineAndPay(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        Series memory s = factory.getSeries(r.seriesId);
        if (msg.sender != s.provider) revert NotProvider();
        RedemptionState st = stateOf(reqId);
        if (st != RedemptionState.Requested && st != RedemptionState.Acknowledged) revert InvalidState(st);
        _default(r, reqId, true, false, msg.sender);
    }

    function onRuling(uint256 reqId, Ruling ruling) external nonReentrant {
        Request storage r = _existing(reqId);
        Series memory s = factory.getSeries(r.seriesId);
        if (msg.sender != s.arbitrator) revert NotArbitrator();
        if (r.state != RedemptionState.Disputed) revert InvalidState(stateOf(reqId));
        if (block.timestamp > r.rulingDeadline) revert RulingDeadlinePassed();
        if (ruling != Ruling.Delivered && ruling != Ruling.NotDelivered) revert InvalidRuling();

        uint256 bond = r.disputeBond;
        r.disputeBond = 0;
        if (ruling == Ruling.Delivered) {
            if (bond > 0) settlementToken.safeTransfer(s.provider, bond);
            _finalize(r, reqId, false);
        } else {
            if (bond > 0) settlementToken.safeTransfer(r.holder, bond);
            registry.recordDisputeLost(s.provider);
            _default(r, reqId, false, true, msg.sender);
        }
        emit Ruled(reqId, ruling, msg.sender);
    }

    function resolveNoRuling(uint256 reqId) external nonReentrant {
        Request storage r = _existing(reqId);
        if (r.state != RedemptionState.Disputed) revert InvalidState(stateOf(reqId));
        if (block.timestamp <= r.rulingDeadline) revert RulingDeadlineNotReached();
        Series memory s = factory.getSeries(r.seriesId);
        uint256 grace =
            uint256(s.ackWindow) + s.deliveryWindow + s.disputeWindow + rulingWindow;
        bool reopen = block.timestamp >= s.windowEnd && block.timestamp < uint256(s.windowEnd) + grace
            && reopenedFrom[reqId] == 0;

        uint256 bond = r.disputeBond;
        address holder = r.holder;
        uint256 amount = r.amount;
        uint256 seriesId = r.seriesId;
        r.disputeBond = 0;
        r.state = RedemptionState.Refunded;
        if (bond > 0) settlementToken.safeTransfer(holder, bond);
        emit Refunded(reqId, seriesId, amount, bond);

        if (reopen) {
            uint256 newId = nextReqId++;
            _requests[newId] = Request({
                seriesId: seriesId,
                holder: holder,
                amount: amount,
                deliveryRef: r.deliveryRef,
                receiptHash: bytes32(0),
                state: RedemptionState.Requested,
                requestedAt: uint64(block.timestamp),
                ackDeadline: uint64(block.timestamp) + s.ackWindow,
                deliveryDeadline: 0,
                disputeDeadline: 0,
                rulingDeadline: 0,
                disputeBond: 0
            });
            reopenedFrom[newId] = reqId;
            emit RedemptionRequested(newId, seriesId, holder, amount, r.deliveryRef, _requests[newId].ackDeadline);
            emit RedemptionReopened(reqId, newId, seriesId, _requests[newId].ackDeadline);
        } else {
            openRequestCount[seriesId] -= 1;
            IERC20(s.token).safeTransfer(holder, amount);
        }
    }

    function stateOf(uint256 reqId) public view returns (RedemptionState) {
        Request storage r = _requests[reqId];
        if (r.holder == address(0)) return RedemptionState.None;
        if (r.state == RedemptionState.Requested && block.timestamp > r.ackDeadline) {
            return RedemptionState.Defaultable;
        }
        if (r.state == RedemptionState.Acknowledged && block.timestamp > r.deliveryDeadline) {
            return RedemptionState.Defaultable;
        }
        return r.state;
    }

    function getRequest(uint256 reqId) external view returns (Request memory) {
        return _requests[reqId];
    }

    function setPrintIndex(address printIndex_) external {
        if (msg.sender != address(factory)) revert ZeroAddress();
        if (printIndex_ == address(0)) revert ZeroAddress();
        printIndex = IPrintIndexWrite(printIndex_);
    }

    function _finalize(Request storage r, uint256 reqId, bool auto_) private {
        Series memory s = factory.getSeries(r.seriesId);
        uint256 claim = _claim(s, r.amount);
        r.state = RedemptionState.Finalized;
        openRequestCount[r.seriesId] -= 1;
        ICUToken(s.token).burn(r.amount);
        bondVault.release(r.seriesId, claim, reqId);
        registry.recordDelivered(s.provider, r.amount);
        _indexDelivery(s, r.amount, reqId);
        emit RedemptionFinalized(reqId, r.seriesId, r.amount, claim, auto_);
    }

    function _default(Request storage r, uint256 reqId, bool voluntary, bool viaDispute, address caller) private {
        Series memory s = factory.getSeries(r.seriesId);
        uint256 claim = _claim(s, r.amount);
        address holder = r.holder;
        uint256 amount = r.amount;
        r.state = RedemptionState.Defaulted;
        openRequestCount[r.seriesId] -= 1;
        ICUToken(s.token).burn(amount);
        bondVault.slash(r.seriesId, holder, claim, reqId);
        registry.recordDefault(s.provider, amount, voluntary);
        _indexDefault(s, amount, reqId);
        emit Defaulted(reqId, r.seriesId, holder, amount, claim, voluntary, viaDispute, caller);
    }

    function _claim(Series memory s, uint256 amount) private pure returns (uint256) {
        return ParonMath.floorMulDiv(amount, s.bondPerCU);
    }

    function _disputeBond(uint256 claim) private pure returns (uint256) {
        uint256 scaled = (claim * ParonConstants.DISPUTE_BOND_BPS) / ParonConstants.BPS;
        return scaled > ParonConstants.MIN_DISPUTE_BOND ? scaled : ParonConstants.MIN_DISPUTE_BOND;
    }

    function _existing(uint256 reqId) private view returns (Request storage r) {
        r = _requests[reqId];
        if (r.holder == address(0)) revert UnknownRequest(reqId);
    }

    function _indexDelivery(Series memory s, uint256 amount, uint256 reqId) private {
        try printIndex.recordDelivery(s.gpuModel, amount) {}
        catch {
            emit IndexUpdateFailed(s.gpuModel, 0, reqId);
        }
    }

    function _indexDefault(Series memory s, uint256 amount, uint256 reqId) private {
        try printIndex.recordDefault(s.gpuModel, amount) {}
        catch {
            emit IndexUpdateFailed(s.gpuModel, 0, reqId);
        }
    }
}
