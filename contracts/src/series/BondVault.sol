// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IBondVault} from "../interfaces/IWiring.sol";
import {SeriesBond} from "../libraries/ParonTypes.sol";

contract BondVault is IBondVault, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable settlementToken;
    address public immutable factory;
    address public immutable redemptionManager;

    mapping(uint256 seriesId => SeriesBond) private _bonds;

    error ZeroAddress();
    error OnlyFactory();
    error OnlyRedemptionManager();
    error AlreadyDeposited();
    error UnknownSeries(uint256 seriesId);
    error InsufficientBond(uint256 have, uint256 need);
    error AlreadyFinalized();
    error NotFinalized();
    error NotSeriesProvider();
    error AlreadyWithdrawn();
    error ZeroAmount();

    event BondDeposited(uint256 indexed seriesId, address indexed provider, uint256 amount);
    event BondReleased(uint256 indexed seriesId, address indexed provider, uint256 amount, uint256 indexed reqId);
    event BondSlashed(uint256 indexed seriesId, address indexed recipient, uint256 amount, uint256 indexed reqId);
    event BondFinalized(uint256 indexed seriesId, uint256 balance);
    event BondWithdrawn(uint256 indexed seriesId, address indexed provider, uint256 amount);

    constructor(address settlementToken_, address factory_, address redemptionManager_) {
        if (settlementToken_ == address(0) || factory_ == address(0) || redemptionManager_ == address(0)) {
            revert ZeroAddress();
        }
        settlementToken = IERC20(settlementToken_);
        factory = factory_;
        redemptionManager = redemptionManager_;
    }

    function deposit(uint256 seriesId, address provider, uint256 amount) external nonReentrant {
        if (msg.sender != factory) revert OnlyFactory();
        if (provider == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (_bonds[seriesId].provider != address(0)) revert AlreadyDeposited();
        _bonds[seriesId] = SeriesBond({
            provider: provider,
            deposited: amount,
            balance: amount,
            released: 0,
            slashed: 0,
            finalized: false,
            withdrawn: false
        });
        settlementToken.safeTransferFrom(provider, address(this), amount);
        emit BondDeposited(seriesId, provider, amount);
    }

    function release(uint256 seriesId, uint256 amount, uint256 reqId) external nonReentrant {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        SeriesBond storage b = _live(seriesId);
        _debit(b, amount);
        b.released += amount;
        settlementToken.safeTransfer(b.provider, amount);
        emit BondReleased(seriesId, b.provider, amount, reqId);
    }

    function slash(uint256 seriesId, address recipient, uint256 amount, uint256 reqId) external nonReentrant {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        if (recipient == address(0)) revert ZeroAddress();
        SeriesBond storage b = _live(seriesId);
        _debit(b, amount);
        b.slashed += amount;
        settlementToken.safeTransfer(recipient, amount);
        emit BondSlashed(seriesId, recipient, amount, reqId);
    }

    function withdrawRemaining(uint256 seriesId) external nonReentrant {
        SeriesBond storage b = _bonds[seriesId];
        if (b.provider == address(0)) revert UnknownSeries(seriesId);
        if (msg.sender != b.provider) revert NotSeriesProvider();
        if (!b.finalized) revert NotFinalized();
        if (b.withdrawn) revert AlreadyWithdrawn();
        uint256 amount = b.balance;
        b.balance = 0;
        b.withdrawn = true;
        if (amount > 0) settlementToken.safeTransfer(b.provider, amount);
        emit BondWithdrawn(seriesId, b.provider, amount);
    }

    function markFinalized(uint256 seriesId) external {
        if (msg.sender != factory) revert OnlyFactory();
        SeriesBond storage b = _bonds[seriesId];
        if (b.provider == address(0)) revert UnknownSeries(seriesId);
        b.finalized = true;
        emit BondFinalized(seriesId, b.balance);
    }

    function bondOf(uint256 seriesId) external view returns (SeriesBond memory) {
        return _bonds[seriesId];
    }

    function _live(uint256 seriesId) private view returns (SeriesBond storage b) {
        b = _bonds[seriesId];
        if (b.provider == address(0)) revert UnknownSeries(seriesId);
        if (b.finalized) revert AlreadyFinalized();
    }

    function _debit(SeriesBond storage b, uint256 amount) private {
        if (b.balance < amount) revert InsufficientBond(b.balance, amount);
        b.balance -= amount;
    }
}
