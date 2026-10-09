// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IParticipantGate} from "../interfaces/IParticipantGate.sol";
import {ICUToken} from "../interfaces/IWiring.sol";

contract CUToken is ERC20Upgradeable, ICUToken {
    uint256 public seriesId;
    address public factory;
    address public primarySale;
    address public redemptionManager;
    address public orderBook;
    IParticipantGate public gate;
    uint64 public windowEnd;
    bool public institutional;

    error OnlyFactory();
    error OnlyPrimarySale();
    error OnlyRedemptionManager();
    error TransfersClosed(uint64 windowEnd);
    error RecipientNotVerified(address account);

    constructor() {
        _disableInitializers();
    }

    function initialize(
        uint256 seriesId_,
        string memory name_,
        string memory symbol_,
        address factory_,
        address primarySale_,
        address redemptionManager_,
        address orderBook_,
        address gate_,
        uint64 windowEnd_,
        bool institutional_
    ) external initializer {
        if (msg.sender != factory_) revert OnlyFactory();
        __ERC20_init(name_, symbol_);
        seriesId = seriesId_;
        factory = factory_;
        primarySale = primarySale_;
        redemptionManager = redemptionManager_;
        orderBook = orderBook_;
        gate = IParticipantGate(gate_);
        windowEnd = windowEnd_;
        institutional = institutional_;
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != primarySale) revert OnlyPrimarySale();
        _mint(to, amount);
    }

    function lockFrom(address holder, uint256 amount) external {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        _transfer(holder, redemptionManager, amount);
    }

    function burn(uint256 amount) external {
        if (msg.sender != redemptionManager) revert OnlyRedemptionManager();
        _burn(redemptionManager, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (block.timestamp >= windowEnd) {
            bool outOfSystem = from == redemptionManager || from == orderBook;
            bool burnByRm = from == redemptionManager && to == address(0);
            if (!outOfSystem && !burnByRm) revert TransfersClosed(windowEnd);
            // A mint (from == 0) is not a system outflow.
            if (from == address(0)) revert TransfersClosed(windowEnd);
        }

        if (
            institutional && to != address(0) && to != redemptionManager && to != orderBook
                && from != redemptionManager && from != orderBook
        ) {
            if (!gate.isVerified(to)) revert RecipientNotVerified(to);
        }

        super._update(from, to, value);
    }
}
