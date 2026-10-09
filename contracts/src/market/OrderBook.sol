// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IParticipantGate} from "../interfaces/IParticipantGate.sol";
import {ISeriesFactoryView, IPrintIndexWrite} from "../interfaces/IWiring.sol";
import {ParonConstants, ParonMath} from "../libraries/ParonConstants.sol";
import {Order, Series, Side} from "../libraries/ParonTypes.sol";

contract OrderBook is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant MAX_LEVELS = ParonConstants.MAX_LEVELS;
    uint16 public constant MAX_TAKER_FEE_BPS = 100;

    struct Queue {
        uint256 head;
        uint256 tail;
        uint256 qty;
    }

    ISeriesFactoryView public immutable factory;
    IERC20 public immutable settlementToken;
    IParticipantGate public gate;
    IPrintIndexWrite public printIndex;
    address public treasury;
    uint16 public takerFeeBps;
    uint16 public immutable maxFillsPerTx;

    uint256 public nextOrderId = 1;
    mapping(uint256 orderId => Order) private _orders;
    mapping(uint256 orderId => uint256 usdc) public escrowOf;
    mapping(uint256 seriesId => mapping(uint8 side => uint256[])) private _prices;
    mapping(uint256 seriesId => mapping(uint8 side => mapping(uint256 price => Queue))) private _queues;

    error ZeroAddress();
    error UnknownSeries(uint256 seriesId);
    error SeriesPaused();
    error OrderBookClosed(uint64 windowEnd);
    error TraderNotVerified(address trader);
    error InvalidTick();
    error ZeroQty();
    error InvalidLot();
    error TooManyPriceLevels(uint16 max);
    error SelfMatch();
            error OrderNotFound(uint256 orderId);
    error NotOrderOwner();
    error FeeTooHigh();
    error InsufficientEscrow();

    event OrderPlaced(
        uint256 indexed orderId, uint256 indexed seriesId, address indexed maker, Side side, uint256 price, uint256 qty
    );
    event OrderCancelled(uint256 indexed orderId, uint256 indexed seriesId, uint256 qtyReturned);
    event Trade(
        uint256 indexed seriesId,
        uint256 indexed makerOrderId,
        address indexed taker,
        address maker,
        bytes32 makerEntity,
        bytes32 takerEntity,
        Side takerSide,
        uint256 cuPrice,
        uint256 qty,
        uint256 nativePrice,
        uint256 takerFee,
        bool eligible
    );
    event IndexUpdateFailed(bytes32 indexed gpuModel, uint256 indexed seriesId, uint256 refId);
    event GateUpdated(address indexed oldGate, address indexed newGate);
    event TakerFeeUpdated(uint16 bps);
    event TreasuryUpdated(address treasury);

    constructor(
        address factory_,
        address settlementToken_,
        address gate_,
        address printIndex_,
        address treasury_,
        uint16 takerFeeBps_,
        uint16 maxFillsPerTx_,
        address admin
    ) {
        if (
            factory_ == address(0) || settlementToken_ == address(0) || gate_ == address(0) || printIndex_ == address(0)
                || treasury_ == address(0) || admin == address(0)
        ) revert ZeroAddress();
        if (takerFeeBps_ > MAX_TAKER_FEE_BPS) revert FeeTooHigh();
        if (maxFillsPerTx_ == 0) revert ZeroQty();
        factory = ISeriesFactoryView(factory_);
        settlementToken = IERC20(settlementToken_);
        gate = IParticipantGate(gate_);
        printIndex = IPrintIndexWrite(printIndex_);
        treasury = treasury_;
        takerFeeBps = takerFeeBps_;
        maxFillsPerTx = maxFillsPerTx_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function placeOrder(uint256 seriesId, Side side, uint256 price, uint256 qty, bool immediateOrCancel)
        external
        nonReentrant
        returns (uint256 orderId, uint256 filledQty)
    {
        Series memory s = _openSeries(seriesId);
        if (!gate.isVerified(msg.sender)) revert TraderNotVerified(msg.sender);
        if (price == 0 || price % ParonConstants.TICK != 0) revert InvalidTick();
        if (qty == 0) revert ZeroQty();
        if (qty % ParonConstants.CU_LOT != 0) revert InvalidLot();

        bytes32 takerEntity = gate.entityId(msg.sender);
        filledQty = _match(s, seriesId, side, price, qty, takerEntity, msg.sender);
        uint256 rest = qty - filledQty;
        if (rest == 0 || immediateOrCancel || _stillCrosses(seriesId, side, price)) {
            return (0, filledQty);
        }

        orderId = nextOrderId++;
        _orders[orderId] = Order({
            seriesId: seriesId,
            maker: msg.sender,
            makerEntity: takerEntity,
            side: side,
            price: price,
            qtyRemaining: rest,
            createdAt: uint64(block.timestamp),
            prev: 0,
            next: 0
        });
        _enqueue(seriesId, side, price, orderId, rest);
        if (side == Side.Bid) {
            uint256 escrow = ParonMath.ceilMulDiv(rest, price);
            escrowOf[orderId] = escrow;
            settlementToken.safeTransferFrom(msg.sender, address(this), escrow);
        } else {
            IERC20(s.token).safeTransferFrom(msg.sender, address(this), rest);
        }
        emit OrderPlaced(orderId, seriesId, msg.sender, side, price, rest);
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage o = _orders[orderId];
        if (o.maker == address(0)) revert OrderNotFound(orderId);
        if (msg.sender != o.maker) revert NotOrderOwner();
        uint256 qty = o.qtyRemaining;
        uint256 seriesId = o.seriesId;
        Side side = o.side;
        uint256 price = o.price;
        address maker = o.maker;
        address token = factory.getSeries(seriesId).token;

        _unlink(seriesId, uint8(side), price, orderId, qty);
        uint256 escrow = escrowOf[orderId];
        delete _orders[orderId];
        if (escrow != 0) delete escrowOf[orderId];

        if (side == Side.Bid) {
            if (escrow > 0) settlementToken.safeTransfer(maker, escrow);
        } else if (qty > 0) {
            IERC20(token).safeTransfer(maker, qty);
        }
        emit OrderCancelled(orderId, seriesId, qty);
    }

    function bestBid(uint256 seriesId) public view returns (uint256 price, uint256 qty) {
        uint256[] storage prices = _prices[seriesId][uint8(Side.Bid)];
        if (prices.length == 0) return (0, 0);
        price = prices[prices.length - 1];
        qty = _queues[seriesId][uint8(Side.Bid)][price].qty;
    }

    function bestAsk(uint256 seriesId) public view returns (uint256 price, uint256 qty) {
        uint256[] storage prices = _prices[seriesId][uint8(Side.Ask)];
        if (prices.length == 0) return (0, 0);
        price = prices[0];
        qty = _queues[seriesId][uint8(Side.Ask)][price].qty;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return _orders[orderId];
    }

    function getLevels(uint256 seriesId, Side side, uint256 depth)
        external
        view
        returns (uint256[] memory prices, uint256[] memory qtys)
    {
        uint256[] storage src = _prices[seriesId][uint8(side)];
        uint256 n = src.length;
        if (depth < n) n = depth;
        prices = new uint256[](n);
        qtys = new uint256[](n);
        if (side == Side.Ask) {
            for (uint256 i; i < n; ++i) {
                prices[i] = src[i];
                qtys[i] = _queues[seriesId][uint8(side)][src[i]].qty;
            }
        } else {
            uint256 len = src.length;
            for (uint256 i; i < n; ++i) {
                uint256 px = src[len - 1 - i];
                prices[i] = px;
                qtys[i] = _queues[seriesId][uint8(side)][px].qty;
            }
        }
    }

    function setTakerFeeBps(uint16 bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bps > MAX_TAKER_FEE_BPS) revert FeeTooHigh();
        takerFeeBps = bps;
        emit TakerFeeUpdated(bps);
    }

    function setTreasury(address treasury_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function setGate(address gate_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (gate_ == address(0)) revert ZeroAddress();
        address old = address(gate);
        gate = IParticipantGate(gate_);
        emit GateUpdated(old, gate_);
    }

    function setPrintIndex(address printIndex_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (printIndex_ == address(0)) revert ZeroAddress();
        printIndex = IPrintIndexWrite(printIndex_);
    }

    function _match(
        Series memory s,
        uint256 seriesId,
        Side takerSide,
        uint256 limit,
        uint256 qty,
        bytes32 takerEntity,
        address taker
    ) private returns (uint256 filled) {
        uint8 opp = takerSide == Side.Bid ? uint8(Side.Ask) : uint8(Side.Bid);
        uint256 left = qty;
        uint256 fills;
        while (left > 0 && fills < maxFillsPerTx) {
            (uint256 bestPrice, uint256 bestQty) =
                takerSide == Side.Bid ? bestAsk(seriesId) : bestBid(seriesId);
            if (bestQty == 0) break;
            if (takerSide == Side.Bid) {
                if (limit < bestPrice) break;
            } else if (limit > bestPrice) {
                break;
            }

            uint256 makerId = _queues[seriesId][opp][bestPrice].head;
            Order storage maker = _orders[makerId];
            if (takerEntity != bytes32(0) && maker.makerEntity == takerEntity) revert SelfMatch();

            uint256 fillQty = left < maker.qtyRemaining ? left : maker.qtyRemaining;
            _settle(s, seriesId, takerSide, makerId, bestPrice, fillQty, takerEntity, taker);
            fills += 1;
            filled += fillQty;
            left -= fillQty;
        }
    }

    function _settle(
        Series memory s,
        uint256 seriesId,
        Side takerSide,
        uint256 makerId,
        uint256 price,
        uint256 fillQty,
        bytes32 takerEntity,
        address taker
    ) private {
        Order storage maker = _orders[makerId];
        address makerAddr = maker.maker;
        bytes32 makerEntity = maker.makerEntity;
        bool takerBuys = takerSide == Side.Bid;
        uint256 notional = takerBuys ? ParonMath.ceilMulDiv(fillQty, price) : ParonMath.floorMulDiv(fillQty, price);
        uint256 fee = (notional * takerFeeBps) / ParonConstants.BPS;
        bool eligible = takerEntity != bytes32(0) && makerEntity != bytes32(0) && takerEntity != makerEntity;

        maker.qtyRemaining -= fillQty;
        uint8 makerSide = uint8(maker.side);
        _queues[seriesId][makerSide][price].qty -= fillQty;
        bool filledOut = maker.qtyRemaining == 0;
        if (filledOut) _popHead(seriesId, makerSide, price, makerId);

        if (takerBuys) {
            IERC20(s.token).safeTransfer(taker, fillQty);
            if (fee > 0) settlementToken.safeTransferFrom(taker, treasury, fee);
            settlementToken.safeTransferFrom(taker, makerAddr, notional);
        } else {
            uint256 escrow = escrowOf[makerId];
            if (escrow < notional) revert InsufficientEscrow();
            escrowOf[makerId] = escrow - notional;
            IERC20(s.token).safeTransferFrom(taker, makerAddr, fillQty);
            if (fee > 0) settlementToken.safeTransfer(treasury, fee);
            settlementToken.safeTransfer(taker, notional - fee);
            if (filledOut && escrowOf[makerId] > 0) {
                uint256 dust = escrowOf[makerId];
                escrowOf[makerId] = 0;
                settlementToken.safeTransfer(makerAddr, dust);
            }
        }

        if (filledOut) delete _orders[makerId];

        emit Trade(
            seriesId,
            makerId,
            taker,
            makerAddr,
            makerEntity,
            takerEntity,
            takerSide,
            price,
            fillQty,
            (price * uint256(s.factor)) / ParonConstants.BPS,
            fee,
            eligible
        );
        _notifyIndex(s, seriesId, price, fillQty, eligible, makerEntity, takerEntity, makerId);
    }

    function _notifyIndex(
        Series memory s,
        uint256 seriesId,
        uint256 price,
        uint256 qty,
        bool eligible,
        bytes32 makerEntity,
        bytes32 takerEntity,
        uint256 makerId
    ) private {
        try printIndex.recordTrade(seriesId, price, qty, eligible, makerEntity, takerEntity) {}
        catch {
            emit IndexUpdateFailed(s.gpuModel, seriesId, makerId);
        }
    }

    function _stillCrosses(uint256 seriesId, Side side, uint256 price) private view returns (bool) {
        if (side == Side.Bid) {
            (uint256 ask, uint256 qty) = bestAsk(seriesId);
            return qty > 0 && price >= ask;
        }
        (uint256 bid, uint256 qtyBid) = bestBid(seriesId);
        return qtyBid > 0 && price <= bid;
    }

    function _openSeries(uint256 seriesId) private view returns (Series memory s) {
        s = factory.getSeries(seriesId);
        if (s.paused) revert SeriesPaused();
        if (block.timestamp >= s.windowEnd) revert OrderBookClosed(s.windowEnd);
    }

    function _enqueue(uint256 seriesId, Side side, uint256 price, uint256 orderId, uint256 qty) private {
        uint8 s = uint8(side);
        _ensureLevel(seriesId, s, price);
        Queue storage q = _queues[seriesId][s][price];
        if (q.head == 0) {
            q.head = orderId;
            q.tail = orderId;
        } else {
            _orders[q.tail].next = orderId;
            _orders[orderId].prev = q.tail;
            q.tail = orderId;
        }
        q.qty += qty;
    }

    function _ensureLevel(uint256 seriesId, uint8 side, uint256 price) private {
        uint256[] storage prices = _prices[seriesId][side];
        uint256 n = prices.length;
        for (uint256 i; i < n; ++i) {
            if (prices[i] == price) return;
        }
        if (n >= MAX_LEVELS) revert TooManyPriceLevels(MAX_LEVELS);
        prices.push(price);
        for (uint256 i = n; i > 0; --i) {
            if (prices[i - 1] <= prices[i]) break;
            (prices[i - 1], prices[i]) = (prices[i], prices[i - 1]);
        }
    }

    function _popHead(uint256 seriesId, uint8 side, uint256 price, uint256 orderId) private {
        Queue storage q = _queues[seriesId][side][price];
        uint256 nextId = _orders[orderId].next;
        q.head = nextId;
        if (nextId == 0) q.tail = 0;
        else _orders[nextId].prev = 0;
        if (q.qty == 0) _removeLevel(seriesId, side, price);
    }

    function _unlink(uint256 seriesId, uint8 side, uint256 price, uint256 orderId, uint256 qty) private {
        Queue storage q = _queues[seriesId][side][price];
        uint256 prevId = _orders[orderId].prev;
        uint256 nextId = _orders[orderId].next;
        if (prevId != 0) _orders[prevId].next = nextId;
        else q.head = nextId;
        if (nextId != 0) _orders[nextId].prev = prevId;
        else q.tail = prevId;
        q.qty -= qty;
        if (q.qty == 0) _removeLevel(seriesId, side, price);
    }

    function _removeLevel(uint256 seriesId, uint8 side, uint256 price) private {
        uint256[] storage prices = _prices[seriesId][side];
        uint256 n = prices.length;
        for (uint256 i; i < n; ++i) {
            if (prices[i] == price) {
                for (uint256 j = i; j + 1 < n; ++j) {
                    prices[j] = prices[j + 1];
                }
                prices.pop();
                return;
            }
        }
    }
}
