// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {ParonFixture} from "../fixtures/ParonFixture.sol";
import {CUToken} from "../../src/series/CUToken.sol";
import {OrderBook} from "../../src/market/OrderBook.sol";
import {RedemptionManager} from "../../src/redemption/RedemptionManager.sol";
import {ParonConstants} from "../../src/libraries/ParonConstants.sol";
import {IndexStatus, RedemptionState, SeriesParams, Side} from "../../src/libraries/ParonTypes.sol";

contract StageScriptTest is ParonFixture {
    uint256 internal s1;
    uint256 internal s2;
    uint256 internal s3;
    uint256 internal s4;
    address internal t4;

    function setUp() public {
        _deployDemo(10);
        _seedIdentities();

        (s1,) = _create(
            providerA,
            _series(ParonConstants.H100, 720, 3_000_000, 4_500_000, uint64(NOV1), uint64(DEC1), "ID", "CU-JKT-H100-2611")
        );
        (s2,) = _create(
            providerB,
            _series(ParonConstants.H200, 1000, 4_060_000, 6_090_000, uint64(NOV1), uint64(DEC1), "ID", "CU-BTM-H200-2611")
        );
        (s3,) = _create(
            providerC,
            _series(ParonConstants.B200, 744, 3_000_000, 4_500_000, uint64(DEC1), uint64(JAN1), "SG", "CU-SGP-B200-2612")
        );

        _buy(buyer2, s3, CU);
        vm.startPrank(buyer2);
        CUToken(factory.getSeries(s3).token).approve(address(book), type(uint256).max);
        (uint256 orderId, uint256 filled) = book.placeOrder(s3, Side.Ask, 3_100_000, CU, false);
        vm.stopPrank();
        assertEq(orderId, 1);
        assertEq(filled, 0);
        assertEq(vault.bondOf(s1).deposited, 3_240_000_000);
        assertEq(vault.bondOf(s2).deposited, 8_526_000_000);
        assertEq(vault.bondOf(s3).deposited, 8_370_000_000);
    }

    function test_E2E_StageScript() public {
        (s4, t4) = _create(
            providerA,
            _series(ParonConstants.H100, 500, 3_000_000, 4_500_000, uint64(OCT1), uint64(NOV1), "ID", "CU-JKT-H100-2610")
        );
        assertEq(vault.bondOf(s4).deposited, 2_250_000_000);
        assertTrue(factory.isRedeemWindowOpen(s4));

        assertEq(_buy(buyer, s4, 20 * CU), 60_000_000);
        assertEq(_buy(trader, s4, 10 * CU), 30_000_000);

        vm.startPrank(trader);
        CUToken(t4).approve(address(book), type(uint256).max);
        (uint256 askId, uint256 askFilled) = book.placeOrder(s4, Side.Ask, 3_200_000, 5 * CU, false);
        vm.stopPrank();
        assertEq(askId, 2);
        assertEq(askFilled, 0);

        vm.startPrank(buyer2);
        usdc.approve(address(book), type(uint256).max);
        (uint256 iocId, uint256 filled) = book.placeOrder(s4, Side.Bid, 3_200_000, 5 * CU, true);
        vm.stopPrank();
        assertEq(iocId, 0);
        assertEq(filled, 5 * CU);
        assertEq(book.getOrder(2).qtyRemaining, 0);

        vm.prank(buyer);
        uint256 req1 = rm.requestRedemption(s4, 8 * CU, bytes32("stage-8"));
        vm.warp(block.timestamp + 3);
        vm.prank(providerA);
        rm.acknowledge(req1);
        vm.prank(providerA);
        rm.markDelivered(req1, keccak256("receipt-8"));

        vm.prank(buyer);
        uint256 req2 = rm.requestRedemption(s4, 10 * CU, bytes32("stage-10"));

        vm.prank(buyer);
        rm.confirm(req1);
        assertEq(uint256(rm.stateOf(req1)), uint256(RedemptionState.Finalized));

        vm.startPrank(buyer);
        usdc.approve(address(book), type(uint256).max);
        vm.expectRevert(OrderBook.SelfMatch.selector);
        book.placeOrder(s3, Side.Bid, 3_100_000, CU, true);
        vm.stopPrank();

        uint64 deadline = rm.getRequest(req2).ackDeadline;
        vm.warp(deadline);
        vm.expectRevert(RedemptionManager.NotDefaultable.selector);
        rm.claimDefault(req2);
        vm.warp(deadline + 1);
        rm.claimDefault(req2);

        assertEq(uint256(rm.stateOf(req2)), uint256(RedemptionState.Defaulted));
        assertEq(CUToken(t4).balanceOf(buyer), 2 * CU);
        assertEq(CUToken(t4).balanceOf(trader), 5 * CU);
        assertEq(CUToken(t4).balanceOf(buyer2), 5 * CU);
        assertEq(usdc.balanceOf(buyer), 985_000_000);
        assertEq(usdc.balanceOf(providerA), 4_635_100_000);
        assertEq(usdc.balanceOf(treasury), 954_000);
        assertEq(usdc.balanceOf(buyer2), 980_976_000);
        assertEq(usdc.balanceOf(trader), 986_000_000);
        assertEq(vault.bondOf(s1).balance, 3_240_000_000);
        assertEq(vault.bondOf(s2).balance, 8_526_000_000);
        assertEq(vault.bondOf(s3).balance, 8_370_000_000);
        assertEq(vault.bondOf(s4).released, 36_000_000);
        assertEq(vault.bondOf(s4).slashed, 45_000_000);
        assertEq(registry.getProvider(providerA).deliveredCU, 8 * CU);
        assertEq(registry.getProvider(providerA).defaultedCU, 10 * CU);
        assertEq(registry.getProvider(providerA).strikes, 1);
        (IndexStatus status,) = index.statusOf(ParonConstants.H100);
        assertEq(uint256(status), uint256(IndexStatus.OK));
        (, int256 answer,,,) = index.latestRoundData(ParonConstants.H100);
        assertEq(answer, 3_200_000);
        assertEq(index.stateOf(ParonConstants.H100).roundId, 1);
    }

    function _series(
        bytes32 gpu,
        uint64 hours_,
        uint256 price,
        uint256 bond,
        uint64 start,
        uint64 end,
        bytes32 countryName,
        string memory symbol
    ) private view returns (SeriesParams memory) {
        return _params(gpu, hours_, price, bond, start, end, bytes2(countryName), address(panel), symbol);
    }
}
