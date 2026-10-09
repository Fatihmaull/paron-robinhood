// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IParticipantGate} from "../interfaces/IParticipantGate.sol";
import {ISeriesFactoryView, ICUToken, IPrimarySaleView} from "../interfaces/IWiring.sol";
import {ParonConstants, ParonMath} from "../libraries/ParonConstants.sol";
import {Series} from "../libraries/ParonTypes.sol";

contract PrimarySale is IPrimarySaleView, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant MAX_PRIMARY_FEE_BPS = 500;

    ISeriesFactoryView public immutable factory;
    IERC20 public immutable settlementToken;
    IParticipantGate public gate;
    address public treasury;
    uint16 public primaryFeeBps;

    mapping(uint256 seriesId => uint256 qty) private _sold;

    error ZeroAddress();
    error MaxCostRequired();
    error ZeroQty();
    error InvalidLot();
    error UnknownSeries(uint256 seriesId);
    error SeriesPaused();
    error SaleClosed();
    error BuyerNotVerified(address buyer);
    error SupplyExceeded(uint256 remaining);
    error SlippageExceeded(uint256 cost, uint256 maxCost);
    error FeeTooHigh();

    event PrimaryBuy(
        uint256 indexed seriesId, address indexed buyer, uint256 qty, uint256 price, uint256 cost, uint256 fee
    );
    event PrimaryFeeUpdated(uint16 bps);
    event TreasuryUpdated(address treasury);
    event GateUpdated(address indexed oldGate, address indexed newGate);

    constructor(
        address factory_,
        address settlementToken_,
        address gate_,
        address treasury_,
        uint16 primaryFeeBps_,
        address admin
    ) {
        if (
            factory_ == address(0) || settlementToken_ == address(0) || gate_ == address(0) || treasury_ == address(0)
                || admin == address(0)
        ) revert ZeroAddress();
        if (primaryFeeBps_ > MAX_PRIMARY_FEE_BPS) revert FeeTooHigh();
        factory = ISeriesFactoryView(factory_);
        settlementToken = IERC20(settlementToken_);
        gate = IParticipantGate(gate_);
        treasury = treasury_;
        primaryFeeBps = primaryFeeBps_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function buy(uint256 seriesId, uint256 qty, uint256 maxCost) external nonReentrant returns (uint256 cost) {
        return _buy(msg.sender, seriesId, qty, maxCost);
    }

    function buyWithPermit(
        uint256 seriesId,
        uint256 qty,
        uint256 maxCost,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256 cost) {
        (uint256 quoted,) = quote(seriesId, qty);
        try IERC20Permit(address(settlementToken)).permit(msg.sender, address(this), quoted, deadline, v, r, s) {}
            catch {}
        return _buy(msg.sender, seriesId, qty, maxCost);
    }

    function quote(uint256 seriesId, uint256 qty) public view returns (uint256 cost, uint256 fee) {
        Series memory s = factory.getSeries(seriesId);
        cost = ParonMath.ceilMulDiv(qty, s.primaryPrice);
        fee = (cost * primaryFeeBps) / ParonConstants.BPS;
    }

    function sold(uint256 seriesId) external view returns (uint256) {
        return _sold[seriesId];
    }

    function setPrimaryFeeBps(uint16 bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bps > MAX_PRIMARY_FEE_BPS) revert FeeTooHigh();
        primaryFeeBps = bps;
        emit PrimaryFeeUpdated(bps);
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

    function _buy(address buyer, uint256 seriesId, uint256 qty, uint256 maxCost) private returns (uint256 cost) {
        if (maxCost == 0) revert MaxCostRequired();
        if (qty == 0) revert ZeroQty();
        if (qty % ParonConstants.CU_LOT != 0) revert InvalidLot();

        Series memory s = factory.getSeries(seriesId);
        if (s.paused) revert SeriesPaused();
        if (s.finalized || block.timestamp >= uint256(s.windowEnd) - factory.leadTime()) revert SaleClosed();
        if (!gate.isVerified(buyer)) revert BuyerNotVerified(buyer);

        uint256 soldNow = _sold[seriesId];
        if (soldNow + qty > s.maxSupply) revert SupplyExceeded(s.maxSupply - soldNow);

        cost = ParonMath.ceilMulDiv(qty, s.primaryPrice);
        if (cost > maxCost) revert SlippageExceeded(cost, maxCost);
        uint256 fee = (cost * primaryFeeBps) / ParonConstants.BPS;

        if (fee > 0) settlementToken.safeTransferFrom(buyer, treasury, fee);
        settlementToken.safeTransferFrom(buyer, s.provider, cost - fee);
        ICUToken(s.token).mint(buyer, qty);
        _sold[seriesId] = soldNow + qty;
        emit PrimaryBuy(seriesId, buyer, qty, s.primaryPrice, cost, fee);
    }
}
