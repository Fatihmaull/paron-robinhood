// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ISeriesFactoryView, IPrimarySaleView, IBondVault, IConversionTableView, IProviderRegistryView} from
    "../interfaces/IWiring.sol";
import {IRedemptionCallbacks} from "../interfaces/IArbitrator.sol";
import {CUToken} from "./CUToken.sol";
import {DateTimeLib} from "../libraries/DateTimeLib.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";
import {Series, SeriesParams, WindowBounds} from "../libraries/ParonTypes.sol";

contract SeriesFactory is ISeriesFactoryView, AccessControl, ReentrancyGuard {
    bytes32 public constant PAUSER_ROLE = ParonConstants.PAUSER_ROLE;

    IProviderRegistryView public immutable registry;
    IConversionTableView public immutable conversionTable;
    IBondVault public immutable bondVault;
    address public immutable cuTokenImpl;
    address public immutable primarySale;
    address public immutable redemptionManager;
    address public gate;
    address public orderBook;
    address public immutable settlementToken;

    WindowBounds private _bounds;
    bool public immutable allowOpenWindow;
    bool public immutable enforceCalendarMonth;
    uint64 public immutable leadTime;

    uint256 public nextSeriesId = 1;
    mapping(uint256 seriesId => Series) private _series;
    mapping(address token => uint256 seriesId) public seriesIdOf;
    mapping(address arbitrator => bool) public arbitratorAllowed;

    error ZeroAddress();
    error NotListable(address provider);
    error UnknownGpuModel(bytes32 gpuModel);
    error ZeroSupply();
    error ZeroPrice();
    error InvalidWindow();
    error BondBelowFloor(uint256 bondPerCU, uint256 minRequired);
    error ArbitratorNotAllowed(address arbitrator);
    error AckWindowOutOfBounds();
    error DeliveryWindowOutOfBounds();
    error DisputeWindowOutOfBounds();
    error MinRedemptionTooSmall();
    error MinRedemptionAboveSupply();
    error UnknownSeries(uint256 seriesId);
    error NotSeriesProvider();
    error PriceCanOnlyIncrease();
    error SaleClosed();
    error AlreadyFinalized();
    error SeriesNotExpired();
    error OpenRequestsRemaining(uint256 count);
    error CloneMismatch(address predicted, address actual);
    error OrderBookAlreadySet();

    event SeriesCreated(
        uint256 indexed seriesId,
        address indexed provider,
        address indexed token,
        string symbol,
        bytes32 gpuModel,
        uint32 factor,
        uint64 gpuHours,
        uint256 maxSupply,
        uint256 primaryPrice,
        uint256 bondPerCU,
        uint64 windowStart,
        uint64 windowEnd,
        uint64 ackWindow,
        uint64 deliveryWindow,
        uint64 disputeWindow,
        uint256 minRedemption,
        address arbitrator,
        bytes32 specHash,
        bytes32 termsHash,
        bytes2 country,
        uint8 continent,
        bool institutional
    );
    event PrimaryPriceRaised(uint256 indexed seriesId, uint256 oldPrice, uint256 newPrice);
    event SeriesPaused(uint256 indexed seriesId, address by);
    event SeriesUnpaused(uint256 indexed seriesId, address by);
    event SeriesFinalized(uint256 indexed seriesId, uint256 voidedSupply, uint256 bondRemaining);
    event ArbitratorAllowlistUpdated(address indexed arbitrator, bool allowed);
    event GateUpdated(address indexed oldGate, address indexed newGate);

    constructor(
        address registry_,
        address conversionTable_,
        address bondVault_,
        address cuTokenImpl_,
        address primarySale_,
        address redemptionManager_,
        address gate_,
        address settlementToken_,
        address admin,
        WindowBounds memory bounds_,
        bool allowOpenWindow_,
        bool enforceCalendarMonth_,
        uint64 leadTime_
    ) {
        if (
            registry_ == address(0) || conversionTable_ == address(0) || bondVault_ == address(0)
                || cuTokenImpl_ == address(0) || primarySale_ == address(0) || redemptionManager_ == address(0)
                || gate_ == address(0) || settlementToken_ == address(0) || admin == address(0)
        ) revert ZeroAddress();
        registry = IProviderRegistryView(registry_);
        conversionTable = IConversionTableView(conversionTable_);
        bondVault = IBondVault(bondVault_);
        cuTokenImpl = cuTokenImpl_;
        primarySale = primarySale_;
        redemptionManager = redemptionManager_;
        gate = gate_;
        settlementToken = settlementToken_;
        _bounds = bounds_;
        allowOpenWindow = allowOpenWindow_;
        enforceCalendarMonth = enforceCalendarMonth_;
        leadTime = leadTime_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function createSeries(SeriesParams calldata p) external nonReentrant returns (uint256 seriesId, address token) {
        return _createSeries(msg.sender, p);
    }

    function createSeriesWithPermit(
        SeriesParams calldata p,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256 seriesId, address token) {
        uint256 bondAmount = _bondAmount(p);
        try IERC20Permit(settlementToken).permit(msg.sender, address(bondVault), bondAmount, deadline, v, r, s) {}
            catch {}
        return _createSeries(msg.sender, p);
    }

    function raisePrimaryPrice(uint256 seriesId, uint256 newPrice) external {
        Series storage s = _series[seriesId];
        if (s.provider == address(0)) revert UnknownSeries(seriesId);
        if (msg.sender != s.provider) revert NotSeriesProvider();
        if (newPrice <= s.primaryPrice) revert PriceCanOnlyIncrease();
        if (!isSaleOpen(seriesId)) revert SaleClosed();
        uint256 minBond = (newPrice * ParonConstants.BOND_FLOOR_BPS) / ParonConstants.BPS;
        if (s.bondPerCU < minBond) revert BondBelowFloor(s.bondPerCU, minBond);
        uint256 old = s.primaryPrice;
        s.primaryPrice = newPrice;
        emit PrimaryPriceRaised(seriesId, old, newPrice);
    }

    function pause(uint256 seriesId, bool paused_) external onlyRole(PAUSER_ROLE) {
        Series storage s = _series[seriesId];
        if (s.provider == address(0)) revert UnknownSeries(seriesId);
        s.paused = paused_;
        if (paused_) emit SeriesPaused(seriesId, msg.sender);
        else emit SeriesUnpaused(seriesId, msg.sender);
    }

    function finalizeSeries(uint256 seriesId) external nonReentrant {
        Series storage s = _series[seriesId];
        if (s.provider == address(0)) revert UnknownSeries(seriesId);
        if (s.finalized) revert AlreadyFinalized();
        uint256 grace = uint256(s.ackWindow) + s.deliveryWindow + s.disputeWindow
            + IRedemptionCallbacks(redemptionManager).rulingWindow();
        if (block.timestamp < uint256(s.windowEnd) + grace) revert SeriesNotExpired();
        uint256 open = IRedemptionCallbacks(redemptionManager).openRequestCount(seriesId);
        if (open != 0) revert OpenRequestsRemaining(open);
        s.finalized = true;
        bondVault.markFinalized(seriesId);
        uint256 voided = IERC20(s.token).totalSupply();
        uint256 bondRemaining = bondVault.bondOf(seriesId).balance;
        emit SeriesFinalized(seriesId, voided, bondRemaining);
    }

    address[] private _arbitratorList;
    mapping(address arbitrator => uint256 indexPlusOne) private _arbitratorIndex;

    function setArbitratorAllowed(address arbitrator, bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (arbitrator == address(0)) revert ZeroAddress();
        if (allowed && _arbitratorIndex[arbitrator] == 0) {
            _arbitratorList.push(arbitrator);
            _arbitratorIndex[arbitrator] = _arbitratorList.length;
        } else if (!allowed && _arbitratorIndex[arbitrator] != 0) {
            uint256 idx = _arbitratorIndex[arbitrator] - 1;
            uint256 last = _arbitratorList.length - 1;
            if (idx != last) {
                address moved = _arbitratorList[last];
                _arbitratorList[idx] = moved;
                _arbitratorIndex[moved] = idx + 1;
            }
            _arbitratorList.pop();
            _arbitratorIndex[arbitrator] = 0;
        }
        arbitratorAllowed[arbitrator] = allowed;
        emit ArbitratorAllowlistUpdated(arbitrator, allowed);
    }

    function setOrderBook(address orderBook_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (orderBook_ == address(0)) revert ZeroAddress();
        if (orderBook != address(0)) revert OrderBookAlreadySet();
        orderBook = orderBook_;
    }

    function setGate(address gate_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (gate_ == address(0)) revert ZeroAddress();
        address old = gate;
        gate = gate_;
        emit GateUpdated(old, gate_);
    }

    function getSeries(uint256 seriesId) public view returns (Series memory s) {
        s = _series[seriesId];
        if (s.provider == address(0)) revert UnknownSeries(seriesId);
        s.soldSupply = IPrimarySaleView(primarySale).sold(seriesId);
    }

    function isSaleOpen(uint256 seriesId) public view returns (bool) {
        Series storage s = _series[seriesId];
        if (s.provider == address(0) || s.paused || s.finalized) return false;
        if (block.timestamp >= uint256(s.windowEnd) - leadTime) return false;
        return IPrimarySaleView(primarySale).sold(seriesId) < s.maxSupply;
    }

    function isRedeemWindowOpen(uint256 seriesId) public view returns (bool) {
        Series storage s = _series[seriesId];
        if (s.provider == address(0) || s.finalized) return false;
        return block.timestamp >= s.windowStart && block.timestamp < s.windowEnd;
    }

    function predictTokenAddress(uint256 seriesId) public view returns (address) {
        return Clones.predictDeterministicAddress(cuTokenImpl, keccak256(abi.encode(seriesId)), address(this));
    }

    function bounds() external view returns (WindowBounds memory) {
        return _bounds;
    }

    function seriesCount() external view returns (uint256) {
        return nextSeriesId - 1;
    }

    function allowedArbitrators() external view returns (address[] memory) {
        return _arbitratorList;
    }

    function _createSeries(address provider, SeriesParams calldata p)
        private
        returns (uint256 seriesId, address token)
    {
        if (!registry.isListable(provider)) revert NotListable(provider);
        uint32 factor = conversionTable.factorOf(p.gpuModel);
        if (factor == 0) revert UnknownGpuModel(p.gpuModel);
        uint256 maxSupply = (uint256(p.gpuHours) * uint256(factor) * ParonConstants.CU_LOT) / ParonConstants.BPS;
        if (maxSupply == 0) revert ZeroSupply();
        if (p.primaryPrice == 0) revert ZeroPrice();
        _checkWindow(p.windowStart, p.windowEnd);
        uint256 minBond = (p.primaryPrice * ParonConstants.BOND_FLOOR_BPS) / ParonConstants.BPS;
        if (p.bondPerCU < minBond) revert BondBelowFloor(p.bondPerCU, minBond);
        if (!arbitratorAllowed[p.arbitrator]) revert ArbitratorNotAllowed(p.arbitrator);
        _checkDurations(p.ackWindow, p.deliveryWindow, p.disputeWindow);
        if (p.minRedemption < ParonConstants.CU_LOT) revert MinRedemptionTooSmall();
        if (p.minRedemption > maxSupply) revert MinRedemptionAboveSupply();

        if (orderBook == address(0)) revert ZeroAddress();
        seriesId = nextSeriesId++;
        token = predictTokenAddress(seriesId);
        uint256 bondAmount = (p.bondPerCU * maxSupply) / ParonConstants.CU_LOT;

        Series storage s = _series[seriesId];
        s.provider = provider;
        s.token = token;
        s.gpuModel = p.gpuModel;
        s.factor = factor;
        s.gpuHours = p.gpuHours;
        s.maxSupply = maxSupply;
        s.primaryPrice = p.primaryPrice;
        s.bondPerCU = p.bondPerCU;
        s.windowStart = p.windowStart;
        s.windowEnd = p.windowEnd;
        s.ackWindow = p.ackWindow;
        s.deliveryWindow = p.deliveryWindow;
        s.disputeWindow = p.disputeWindow;
        s.minRedemption = p.minRedemption;
        s.arbitrator = p.arbitrator;
        s.specHash = p.specHash;
        s.termsHash = p.termsHash;
        s.country = p.country;
        s.continent = p.continent;
        s.institutional = p.institutional;
        s.symbol = p.symbol;

        seriesIdOf[token] = seriesId;
        bondVault.deposit(seriesId, provider, bondAmount);

        address clone = Clones.cloneDeterministic(cuTokenImpl, keccak256(abi.encode(seriesId)));
        if (clone != token) revert CloneMismatch(token, clone);
        CUToken(token).initialize(
            seriesId,
            string.concat("Paron CU ", p.symbol),
            p.symbol,
            address(this),
            primarySale,
            redemptionManager,
            orderBook,
            gate,
            p.windowEnd,
            p.institutional
        );

        emit SeriesCreated(
            seriesId,
            provider,
            token,
            p.symbol,
            p.gpuModel,
            factor,
            p.gpuHours,
            maxSupply,
            p.primaryPrice,
            p.bondPerCU,
            p.windowStart,
            p.windowEnd,
            p.ackWindow,
            p.deliveryWindow,
            p.disputeWindow,
            p.minRedemption,
            p.arbitrator,
            p.specHash,
            p.termsHash,
            p.country,
            p.continent,
            p.institutional
        );
    }

    function _bondAmount(SeriesParams calldata p) private view returns (uint256) {
        uint32 factor = conversionTable.factorOf(p.gpuModel);
        uint256 maxSupply = (uint256(p.gpuHours) * uint256(factor) * ParonConstants.CU_LOT) / ParonConstants.BPS;
        return (p.bondPerCU * maxSupply) / ParonConstants.CU_LOT;
    }

    function _checkWindow(uint64 start, uint64 end) private view {
        if (start >= end) revert InvalidWindow();
        if (!allowOpenWindow && start <= block.timestamp) revert InvalidWindow();
        if (allowOpenWindow && end <= block.timestamp + leadTime) revert InvalidWindow();
        if (enforceCalendarMonth && !DateTimeLib.isUtcMonthWindow(start, end)) revert InvalidWindow();
    }

    function _checkDurations(uint64 ack, uint64 delivery, uint64 dispute) private view {
        if (ack < _bounds.minAck || ack > _bounds.maxAck) revert AckWindowOutOfBounds();
        if (delivery < _bounds.minDelivery || delivery > _bounds.maxDelivery) revert DeliveryWindowOutOfBounds();
        if (dispute < _bounds.minDispute || dispute > _bounds.maxDispute) revert DisputeWindowOutOfBounds();
    }

}
