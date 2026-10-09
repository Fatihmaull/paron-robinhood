// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ParonConstants} from "../libraries/ParonConstants.sol";

contract MockUSDC is ERC20, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = ParonConstants.MINTER_ROLE;

    uint256 public constant faucetAmount = 5_000 * 1e6;
    uint256 public constant faucetCooldown = 1 hours;

    mapping(address account => uint64 nextAt) public lastFaucetAt;

    error FaucetCooldown(uint64 nextAt);

    event FaucetDrip(address indexed account, uint256 amount);

    constructor(address admin, address minter) ERC20("Mock USDC", "mUSDC") ERC20Permit("Mock USDC") {
        if (admin == address(0) || minter == address(0)) revert();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function faucet() external {
        uint64 nextAt = lastFaucetAt[msg.sender];
        if (nextAt != 0 && block.timestamp < nextAt) revert FaucetCooldown(nextAt);
        lastFaucetAt[msg.sender] = uint64(block.timestamp + faucetCooldown);
        _mint(msg.sender, faucetAmount);
        emit FaucetDrip(msg.sender, faucetAmount);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
