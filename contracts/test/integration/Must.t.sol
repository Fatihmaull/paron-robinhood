// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {ParonFixture} from "../fixtures/ParonFixture.sol";
import {DateTimeLib} from "../../src/libraries/DateTimeLib.sol";
import {ParonConstants} from "../../src/libraries/ParonConstants.sol";
import {BondVault} from "../../src/series/BondVault.sol";
import {ConversionTable} from "../../src/registry/ConversionTable.sol";
import {CUToken} from "../../src/series/CUToken.sol";
import {SeriesFactory} from "../../src/series/SeriesFactory.sol";
import {PrimarySale} from "../../src/market/PrimarySale.sol";
import {OrderBook} from "../../src/market/OrderBook.sol";
import {RedemptionManager} from "../../src/redemption/RedemptionManager.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {Attestation} from "@ethereum-attestation-service/eas-contracts/IEAS.sol";
import {EASGate} from "../../src/gate/EASGate.sol";
import {IndexStatus, RedemptionState, Ruling, SeriesParams, Side} from "../../src/libraries/ParonTypes.sol";

contract MustTest is ParonFixture {
    uint256 internal id;
    address internal token;

    function setUp() public {
        _deployDemo(10);
        _seedIdentities();
        (id, token) = _create(
            providerA,
            _params(
                ParonConstants.H100, 500, 3_000_000, 4_500_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "CU-JKT-H100-2611"
            )
        );
    }

    function test_CalendarMonths() public pure {
        assertTrue(DateTimeLib.isUtcMonthWindow(uint64(OCT1), uint64(NOV1)));
        assertTrue(DateTimeLib.isUtcMonthWindow(uint64(NOV1), uint64(DEC1)));
        assertTrue(DateTimeLib.isUtcMonthWindow(uint64(DEC1), uint64(JAN1)));
        assertFalse(DateTimeLib.isUtcMonthWindow(uint64(OCT9), uint64(NOV1)));
    }

    function test_CreateSeries_LocksFullBond() public view {
        assertEq(vault.bondOf(id).deposited, 2_250_000_000);
        assertEq(vault.bondOf(id).balance, 2_250_000_000);
        assertEq(factory.getSeries(id).maxSupply, 500 * CU);
        assertEq(factory.predictTokenAddress(id), token);
    }

    function test_RevertWhen_BondBelowFloor() public {
        SeriesParams memory p = _params(
            ParonConstants.H100, 10, 3_000_000, 4_000_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "LOW"
        );
        vm.prank(providerA);
        vm.expectRevert(abi.encodeWithSelector(SeriesFactory.BondBelowFloor.selector, 4_000_000, 4_500_000));
        factory.createSeries(p);
    }

    function testFuzz_CreateSeries_Bounds(uint64 gpuHours, uint256 price, uint64 ack, uint64 delivery, uint64 dispute)
        public
    {
        gpuHours = uint64(bound(gpuHours, 1, 200));
        price = bound(price, 1, 20_000_000);
        gpuHours = uint64(bound(gpuHours, 1, 80));
        uint256 bond = (price * 15_000) / 10_000;
        ack = uint64(bound(ack, 60, 72 hours));
        delivery = uint64(bound(delivery, 60, 7 days));
        dispute = uint64(bound(dispute, 90, 7 days));
        SeriesParams memory p = _params(
            ParonConstants.H100, gpuHours, price, bond, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "FUZZ"
        );
        p.ackWindow = ack;
        p.deliveryWindow = delivery;
        p.disputeWindow = dispute;
        vm.prank(providerB);
        (uint256 sid,) = factory.createSeries(p);
        uint256 maxSupply = (uint256(gpuHours) * 10_000 * CU) / 10_000;
        assertEq(vault.bondOf(sid).deposited, (bond * maxSupply) / CU);
    }

    function test_DemoDeployment_AllowsOpenWindow() public {
        (uint256 sid,) = _create(
            providerA,
            _params(
                ParonConstants.H100, 10, 3_000_000, 4_500_000, uint64(OCT1), uint64(NOV1), bytes2("ID"), address(mockArb), "OPEN"
            )
        );
        assertGt(sid, 0);
        assertTrue(factory.isSaleOpen(sid));
    }

    function test_RevertWhen_ProdDeploymentOpenWindow() public {
        uint256 n = vm.getNonce(address(this));
        address vaultA = vm.computeCreateAddress(address(this), n);
        address factoryA = vm.computeCreateAddress(address(this), n + 1);
        BondVault vault2 = new BondVault(address(usdc), factoryA, address(rm));
        SeriesFactory prod = new SeriesFactory(
            address(registry),
            address(table),
            vaultA,
            address(impl),
            address(sale),
            address(rm),
            address(gate),
            address(usdc),
            address(this),
            _demoBounds(),
            false,
            true,
            0
        );
        assertEq(address(vault2), vaultA);
        assertEq(address(prod), factoryA);
        prod.setOrderBook(address(book));
        prod.setArbitratorAllowed(address(mockArb), true);
        vm.prank(providerA);
        usdc.approve(address(vault2), type(uint256).max);
        SeriesParams memory p = _params(
            ParonConstants.H100, 10, 3_000_000, 4_500_000, uint64(OCT1), uint64(NOV1), bytes2("ID"), address(mockArb), "PROD"
        );
        vm.prank(providerA);
        vm.expectRevert(SeriesFactory.InvalidWindow.selector);
        prod.createSeries(p);
    }

    function test_RevertWhen_UnknownGpu_RTX4090() public {
        SeriesParams memory p = _params(
            keccak256("RTX-4090"), 10, 3_000_000, 4_500_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "RTX"
        );
        vm.prank(providerA);
        vm.expectRevert(abi.encodeWithSelector(ConversionTable.UnknownGpuModel.selector, keccak256("RTX-4090")));
        factory.createSeries(p);
    }

    function test_A100Factor() public view {
        assertEq(table.factorOf(ParonConstants.A100), 4_500);
        assertEq(table.factorOf(ParonConstants.GB200), 35_000);
    }

    function test_RevertWhen_TransferAfterWindowEnd() public {
        _buy(buyer, id, 2 * CU);
        vm.warp(DEC1);
        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSelector(CUToken.TransfersClosed.selector, uint64(DEC1)));
        CUToken(token).transfer(trader, CU);
    }

    function test_RevertWhen_MintByNonPrimarySale() public {
        vm.prank(outsider);
        vm.expectRevert(CUToken.OnlyPrimarySale.selector);
        CUToken(token).mint(outsider, CU);
    }

    function test_BondIsolation_DefaultTouchesOnlyOwnSeries() public {
        (uint256 other,) = _create(
            providerB,
            _params(
                ParonConstants.H200, 10, 4_000_000, 6_090_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "OTHER"
            )
        );
        uint256 otherBefore = vault.bondOf(other).balance;
        _buy(buyer, id, 2 * CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        vm.warp(block.timestamp + 61);
        rm.claimDefault(req);
        assertEq(vault.bondOf(other).balance, otherBefore);
        assertEq(vault.bondOf(id).slashed, 4_500_000);
        assertEq(vault.bondOf(other).slashed, 0);
    }

    function test_RevertWhen_ReleaseOrSlashByNonRM() public {
        vm.prank(outsider);
        vm.expectRevert(BondVault.OnlyRedemptionManager.selector);
        vault.release(id, 1, 1);
        vm.prank(outsider);
        vm.expectRevert(BondVault.OnlyRedemptionManager.selector);
        vault.slash(id, outsider, 1, 1);
    }

    function test_RevertWhen_BuyWithZeroMaxCost() public {
        vm.prank(buyer);
        vm.expectRevert(PrimarySale.MaxCostRequired.selector);
        sale.buy(id, CU, 0);
    }

    function test_Buy_SplitsFeeAndMints() public {
        uint256 providerBefore = usdc.balanceOf(providerA);
        uint256 cost = _buy(buyer, id, 20 * CU);
        assertEq(cost, 60_000_000);
        assertEq(usdc.balanceOf(treasury), 600_000);
        assertEq(usdc.balanceOf(providerA), providerBefore + 59_400_000);
        assertEq(CUToken(token).balanceOf(buyer), 20 * CU);
        assertEq(sale.sold(id), 20 * CU);
    }

    function testFuzz_Buy_Slippage(uint256 lots, uint256 maxCost) public {
        lots = bound(lots, 1, 50);
        uint256 qty = lots * CU;
        (uint256 cost,) = sale.quote(id, qty);
        maxCost = bound(maxCost, 0, cost * 2);
        if (maxCost == 0) {
            vm.prank(buyer);
            vm.expectRevert(PrimarySale.MaxCostRequired.selector);
            sale.buy(id, qty, 0);
        } else if (maxCost < cost) {
            vm.startPrank(buyer);
            usdc.approve(address(sale), type(uint256).max);
            vm.expectRevert(abi.encodeWithSelector(PrimarySale.SlippageExceeded.selector, cost, maxCost));
            sale.buy(id, qty, maxCost);
            vm.stopPrank();
        } else {
            uint256 paid = _buy(buyer, id, qty);
            assertEq(paid, cost);
        }
    }

    function test_Fill_TransfersAndTakerFee() public {
        _buy(trader, id, 5 * CU);
        vm.warp(NOV1 + 1);
        vm.startPrank(trader);
        CUToken(token).approve(address(book), type(uint256).max);
        (uint256 askId, uint256 askFilled) = book.placeOrder(id, Side.Ask, 3_200_000, 5 * CU, false);
        vm.stopPrank();
        assertEq(askFilled, 0);
        assertGt(askId, 0);

        uint256 traderBefore = usdc.balanceOf(trader);
        uint256 treasuryBefore = usdc.balanceOf(treasury);
        vm.startPrank(buyer);
        usdc.approve(address(book), type(uint256).max);
        (uint256 bidId, uint256 filled) = book.placeOrder(id, Side.Bid, 3_200_000, 5 * CU, true);
        vm.stopPrank();
        assertEq(bidId, 0);
        assertEq(filled, 5 * CU);
        assertEq(usdc.balanceOf(trader), traderBefore + 16_000_000);
        assertEq(usdc.balanceOf(treasury), treasuryBefore + 24_000);
        assertEq(CUToken(token).balanceOf(buyer), 5 * CU);
        (IndexStatus status,) = index.statusOf(ParonConstants.H100);
        assertEq(uint256(status), uint256(IndexStatus.OK));
        (, int256 answer,,,) = index.latestRoundData(ParonConstants.H100);
        assertEq(answer, 3_200_000);
    }

    function test_RevertWhen_SelfMatchSameEntity() public {
        _buy(buyer, id, 2 * CU);
        vm.warp(NOV1 + 1);
        vm.startPrank(buyer);
        CUToken(token).approve(address(book), type(uint256).max);
        book.placeOrder(id, Side.Ask, 3_200_000, CU, false);
        vm.stopPrank();
        vm.startPrank(buyer2);
        usdc.approve(address(book), type(uint256).max);
        vm.expectRevert(OrderBook.SelfMatch.selector);
        book.placeOrder(id, Side.Bid, 3_200_000, CU, true);
        vm.stopPrank();
    }

    function test_HappyPath_ConfirmReleasesBondAndBurns() public {
        _buy(buyer, id, 8 * CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, 8 * CU, bytes32("ref"));
        vm.warp(block.timestamp + 3);
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.prank(providerA);
        rm.markDelivered(req, keccak256("receipt"));
        uint256 providerBefore = usdc.balanceOf(providerA);
        vm.prank(buyer);
        rm.confirm(req);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Finalized));
        assertEq(CUToken(token).balanceOf(address(rm)), 0);
        assertEq(usdc.balanceOf(providerA), providerBefore + 36_000_000);
        assertEq(registry.getProvider(providerA).deliveredCU, 8 * CU);
        assertEq(rm.openRequestCount(id), 0);
    }

    function test_AutoFinalize_AfterDisputeWindow() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.prank(providerA);
        rm.markDelivered(req, keccak256("receipt"));
        uint64 deadline = rm.getRequest(req).disputeDeadline;
        vm.warp(deadline);
        vm.expectRevert(RedemptionManager.DisputeWindowOpen.selector);
        rm.finalizeRedemption(req);
        vm.warp(deadline + 1);
        rm.finalizeRedemption(req);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Finalized));
    }

    function test_ClaimDefault_AfterMissedAck() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        uint64 deadline = rm.getRequest(req).ackDeadline;
        vm.warp(deadline + 1);
        uint256 before = usdc.balanceOf(buyer);
        rm.claimDefault(req);
        assertEq(usdc.balanceOf(buyer), before + 4_500_000);
        assertEq(registry.getProvider(providerA).strikes, 1);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Defaulted));
    }

    function test_ClaimDefault_AfterMissedDelivery() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.warp(rm.getRequest(req).deliveryDeadline + 1);
        rm.claimDefault(req);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Defaulted));
    }

    function test_RevertWhen_ClaimDefaultTwice() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        vm.warp(rm.getRequest(req).ackDeadline + 1);
        rm.claimDefault(req);
        vm.expectRevert(RedemptionManager.NotDefaultable.selector);
        rm.claimDefault(req);
    }

    function test_RevertWhen_ClaimDefaultAtDeadline() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        vm.warp(rm.getRequest(req).ackDeadline);
        vm.expectRevert(RedemptionManager.NotDefaultable.selector);
        rm.claimDefault(req);
        vm.warp(block.timestamp + 1);
        rm.claimDefault(req);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Defaulted));
    }

    function test_RevertWhen_DeclineAndPayAfterDeadline() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        vm.warp(rm.getRequest(req).ackDeadline + 1);
        vm.prank(providerA);
        vm.expectRevert(abi.encodeWithSelector(RedemptionManager.InvalidState.selector, RedemptionState.Defaultable));
        rm.declineAndPay(req);
    }

    function test_Dispute_RulingDelivered_FinalizesAndPaysDisputeBond() public {
        _buy(buyer, id, 8 * CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, 8 * CU, bytes32("ref"));
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.prank(providerA);
        rm.markDelivered(req, keccak256("receipt"));
        usdc.mint(buyer, 5_000_000);
        vm.startPrank(buyer);
        usdc.approve(address(rm), type(uint256).max);
        rm.dispute(req);
        vm.stopPrank();
        uint256 providerBefore = usdc.balanceOf(providerA);
        mockArb.rule(req, Ruling.Delivered);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Finalized));
        assertEq(usdc.balanceOf(providerA), providerBefore + 36_000_000 + 5_000_000);
        assertEq(registry.getProvider(providerA).deliveredCU, 8 * CU);
    }

    function test_Dispute_RulingNotDelivered_DefaultsAndRefundsDisputeBond() public {
        _buy(buyer, id, 8 * CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, 8 * CU, bytes32("ref"));
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.prank(providerA);
        rm.markDelivered(req, keccak256("receipt"));
        usdc.mint(buyer, 5_000_000);
        vm.startPrank(buyer);
        usdc.approve(address(rm), type(uint256).max);
        rm.dispute(req);
        vm.stopPrank();
        uint256 buyerBefore = usdc.balanceOf(buyer);
        mockArb.rule(req, Ruling.NotDelivered);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Defaulted));
        assertEq(usdc.balanceOf(buyer), buyerBefore + 5_000_000 + 36_000_000);
        assertEq(registry.getProvider(providerA).disputesLost, 1);
        assertEq(registry.getProvider(providerA).strikes, 1);
    }

    function test_ResolveNoRuling_RefundsWithoutSlash() public {
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        uint256 req = _toDispute(CU);
        uint256 slashedBefore = vault.bondOf(id).slashed;
        uint256 buyerCu = CUToken(token).balanceOf(buyer);
        vm.warp(rm.getRequest(req).rulingDeadline + 1);
        rm.resolveNoRuling(req);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Refunded));
        assertEq(vault.bondOf(id).slashed, slashedBefore);
        assertEq(CUToken(token).balanceOf(buyer), buyerCu + CU);
        assertEq(rm.openRequestCount(id), 0);
    }

    function test_ResolveNoRuling_ReopensOnceInsideGrace() public {
        _buy(buyer, id, CU);
        vm.warp(DEC1 - 10);
        uint256 req = _toDispute(CU);
        uint256 reopenAt = uint256(rm.getRequest(req).rulingDeadline) + 1;
        if (reopenAt < DEC1) reopenAt = DEC1;
        vm.warp(reopenAt);
        rm.resolveNoRuling(req);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Refunded));
        uint256 newId = req + 1;
        assertEq(rm.reopenedFrom(newId), req);
        assertEq(uint256(rm.stateOf(newId)), uint256(RedemptionState.Requested));
        assertEq(rm.openRequestCount(id), 1);
        assertEq(CUToken(token).balanceOf(address(rm)), CU);
        assertEq(vault.bondOf(id).slashed, 0);

        vm.prank(providerA);
        rm.acknowledge(newId);
        vm.prank(providerA);
        rm.markDelivered(newId, keccak256("receipt-2"));
        usdc.mint(buyer, 5_000_000);
        vm.startPrank(buyer);
        usdc.approve(address(rm), type(uint256).max);
        rm.dispute(newId);
        vm.stopPrank();
        vm.warp(rm.getRequest(newId).rulingDeadline + 1);
        rm.resolveNoRuling(newId);
        assertEq(rm.reopenedFrom(newId + 1), 0);
        assertEq(CUToken(token).balanceOf(buyer), CU);
        assertEq(rm.openRequestCount(id), 0);
    }

    function testFuzz_StateMachine_RandomActionsAndTimes(uint256 seed) public {
        _buy(buyer, id, 4 * CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(id, CU, bytes32("ref"));
        uint8 phase = 1;
        for (uint256 i; i < 5; ++i) {
            uint256 action = uint256(keccak256(abi.encode(seed, i))) % 5;
            uint256 dt = uint256(keccak256(abi.encode(seed, i, uint256(1)))) % 90;
            vm.warp(block.timestamp + dt);
            if (phase == 4) break;
            if (action == 0 && phase == 1) {
                bool late = block.timestamp > rm.getRequest(req).ackDeadline;
                if (late) vm.expectRevert();
                vm.prank(providerA);
                rm.acknowledge(req);
                if (!late) phase = 2;
            } else if (action == 1 && phase == 2) {
                vm.prank(providerA);
                rm.markDelivered(req, keccak256("r"));
                phase = 3;
            } else if (action == 2 && phase == 3) {
                vm.prank(buyer);
                rm.confirm(req);
                phase = 4;
            } else if (action == 3 && (phase == 1 || phase == 2)) {
                if (rm.stateOf(req) == RedemptionState.Defaultable) {
                    rm.claimDefault(req);
                    phase = 4;
                }
            } else if (action == 4 && (phase == 1 || phase == 2)) {
                RedemptionState st = rm.stateOf(req);
                if (st == RedemptionState.Requested || st == RedemptionState.Acknowledged) {
                    vm.prank(providerA);
                    rm.declineAndPay(req);
                    phase = 4;
                }
            }
        }
        if (phase == 4) {
            vm.expectRevert();
            rm.claimDefault(req);
        }
    }

    function test_IneligiblePrintIgnored() public {
        _buy(trader, id, CU);
        _buy(buyer, id, CU);
        vm.warp(NOV1 + 1);
        vm.prank(trader);
        CUToken(token).approve(address(book), type(uint256).max);
        vm.prank(trader);
        book.placeOrder(id, Side.Ask, 3_000_000, CU, false);
        vm.prank(buyer);
        usdc.approve(address(book), type(uint256).max);
        vm.prank(buyer);
        book.placeOrder(id, Side.Bid, 3_000_000, CU, true);
        (, int256 answer,,,) = index.latestRoundData(ParonConstants.H100);
        uint256 roundBefore = index.stateOf(ParonConstants.H100).roundId;

        EntityZeroGate zero = new EntityZeroGate();
        _kyb(outsider, keccak256("OUT"), ParonConstants.ROLE_BUYER);
        usdc.mint(outsider, 100 * 1e6);
        _buy(outsider, id, CU);
        book.setGate(address(zero));
        vm.prank(outsider);
        CUToken(token).approve(address(book), type(uint256).max);
        vm.prank(outsider);
        book.placeOrder(id, Side.Ask, 9_000_000, CU, false);
        vm.prank(buyer);
        book.placeOrder(id, Side.Bid, 9_000_000, CU, true);
        (, int256 afterAnswer,,,) = index.latestRoundData(ParonConstants.H100);
        assertEq(afterAnswer, answer);
        assertEq(index.stateOf(ParonConstants.H100).roundId, roundBefore);
    }

    function test_FirstEligibleFill_ThinToOk() public {
        (IndexStatus before,) = index.statusOf(ParonConstants.H100);
        assertEq(uint256(before), uint256(IndexStatus.THIN));
        test_Fill_TransfersAndTakerFee();
        assertEq(index.stateOf(ParonConstants.H100).roundId, 1);
    }

    function test_LinkAttestation_Verifies() public {
        MockEAS eas = new MockEAS();
        bytes32 schema = keccak256("ParticipantVerified");
        address attester = makeAddr("attester");
        address[] memory trusted = new address[](1);
        trusted[0] = attester;
        EASGate easGate = new EASGate(address(eas), schema, trusted, address(this));
        bytes32 uid = keccak256("uid-1");
        eas.set(
            Attestation({
                uid: uid,
                schema: schema,
                time: uint64(block.timestamp),
                expirationTime: 0,
                revocationTime: 0,
                refUID: bytes32(0),
                recipient: buyer,
                attester: attester,
                revocable: true,
                data: abi.encode(keccak256("ENT"), uint8(1), bytes2("ID"), uint64(block.timestamp + 30 days))
            })
        );
        easGate.linkAttestation(uid);
        assertTrue(easGate.isVerified(buyer));
        assertEq(easGate.entityId(buyer), keccak256("ENT"));

        eas.set(
            Attestation({
                uid: keccak256("uid-old"),
                schema: schema,
                time: uint64(block.timestamp - 10),
                expirationTime: 0,
                revocationTime: 0,
                refUID: bytes32(0),
                recipient: buyer,
                attester: attester,
                revocable: true,
                data: abi.encode(keccak256("ENT"), uint8(1), bytes2("ID"), uint64(block.timestamp + 30 days))
            })
        );
        vm.expectRevert(EASGate.StaleAttestation.selector);
        easGate.linkAttestation(keccak256("uid-old"));
    }

    function test_RevertWhen_SetFactorNotTimelock() public {
        address[] memory proposers = new address[](1);
        proposers[0] = address(this);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        TimelockController tl = new TimelockController(60, proposers, executors, address(0));
        ConversionTable locked = new ConversionTable(address(tl));
        vm.prank(outsider);
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, outsider, bytes32(0))
        );
        locked.setFactor(ParonConstants.H100, 9999);
    }

    function test_SetFactor_ViaTimelockAfterDelay() public {
        address[] memory proposers = new address[](1);
        proposers[0] = address(this);
        address[] memory executors = new address[](1);
        executors[0] = address(0);
        TimelockController tl = new TimelockController(60, proposers, executors, address(0));
        ConversionTable locked = new ConversionTable(address(tl));
        bytes memory data = abi.encodeCall(ConversionTable.setFactor, (ParonConstants.H100, 9999));
        tl.schedule(address(locked), 0, data, bytes32(0), bytes32(0), 60);
        vm.warp(block.timestamp + 60);
        tl.execute(address(locked), 0, data, bytes32(0), bytes32(0));
        assertEq(locked.factorOf(ParonConstants.H100), 9999);
    }

    function test_RuleWithTwoOfThreeSignatures() public {
        (uint256 sid, address cu) = _create(
            providerA,
            _params(
                ParonConstants.H100, 20, 3_000_000, 4_500_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(panel), "PANEL"
            )
        );
        _buy(buyer, sid, CU);
        vm.warp(NOV1 + 1);
        vm.prank(buyer);
        uint256 req = rm.requestRedemption(sid, CU, bytes32("ref"));
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.prank(providerA);
        rm.markDelivered(req, keccak256("receipt"));
        usdc.mint(buyer, 5_000_000);
        vm.startPrank(buyer);
        usdc.approve(address(rm), type(uint256).max);
        rm.dispute(req);
        vm.stopPrank();
        uint64 deadline = rm.getRequest(req).rulingDeadline;
        bytes32 digest = panel.hashRuling(req, Ruling.Delivered, deadline);
        bytes[] memory sigs = new bytes[](2);
        sigs[0] = _sign(arb1Pk, digest);
        sigs[1] = _sign(arb2Pk, digest);
        panel.ruleWithSignatures(req, Ruling.Delivered, sigs);
        assertEq(uint256(rm.stateOf(req)), uint256(RedemptionState.Finalized));
        assertEq(CUToken(cu).totalSupply(), 0);
    }

    function _toDispute(uint256 amount) private returns (uint256 req) {
        vm.prank(buyer);
        req = rm.requestRedemption(id, amount, bytes32("ref"));
        vm.prank(providerA);
        rm.acknowledge(req);
        vm.prank(providerA);
        rm.markDelivered(req, keccak256("receipt"));
        usdc.mint(buyer, 5_000_000);
        vm.startPrank(buyer);
        usdc.approve(address(rm), type(uint256).max);
        rm.dispute(req);
        vm.stopPrank();
    }

    function _sign(uint256 pk, bytes32 digest) private returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        return abi.encodePacked(r, s, v);
    }
}

contract MockEAS {
    mapping(bytes32 => Attestation) private _atts;

    function set(Attestation memory a) external {
        _atts[a.uid] = a;
    }

    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        return _atts[uid];
    }
}

contract EntityZeroGate {
    function isVerified(address) external pure returns (bool) {
        return true;
    }

    function entityId(address) external pure returns (bytes32) {
        return bytes32(0);
    }

    function participantOf(address) external pure returns (bytes32, uint8, bytes2, uint64) {
        return (bytes32(0), 2, bytes2("ID"), type(uint64).max);
    }
}
