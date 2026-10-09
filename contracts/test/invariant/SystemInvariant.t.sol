// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ParonFixture} from "../fixtures/ParonFixture.sol";
import {MockUSDC} from "../../src/mocks/MockUSDC.sol";
import {CUToken} from "../../src/series/CUToken.sol";
import {BondVault} from "../../src/series/BondVault.sol";
import {SeriesFactory} from "../../src/series/SeriesFactory.sol";
import {PrimarySale} from "../../src/market/PrimarySale.sol";
import {OrderBook} from "../../src/market/OrderBook.sol";
import {RedemptionManager} from "../../src/redemption/RedemptionManager.sol";
import {PrintIndex} from "../../src/data/PrintIndex.sol";
import {ParonConstants} from "../../src/libraries/ParonConstants.sol";
import {RedemptionState, Series, Side} from "../../src/libraries/ParonTypes.sol";

contract Handler is ParonFixture {
    uint256 public seriesId;
    address public token;
    uint256 public anchorBond;
    uint256 public usdcSupply;
    bool public selfMatchFilled;
    bool public postWindowTransfer;
    bool public ineligibleMovedIndex;
    bool public badTransition;
    mapping(uint256 reqId => uint256 count) public payouts;
    mapping(uint256 reqId => uint256 amount) public payoutAmount;
    uint256[] public reqs;

    constructor(uint256 seriesId_, address token_, uint256 anchorBond_, uint256 usdcSupply_) {
        seriesId = seriesId_;
        token = token_;
        anchorBond = anchorBond_;
        usdcSupply = usdcSupply_;
    }

    function wire(
        address usdc_,
        address factory_,
        address sale_,
        address book_,
        address rm_,
        address vault_,
        address index_,
        address buyer_,
        address buyer2_,
        address trader_,
        address provider_
    ) external {
        usdc = MockUSDC(usdc_);
        factory = SeriesFactory(factory_);
        sale = PrimarySale(sale_);
        book = OrderBook(book_);
        rm = RedemptionManager(rm_);
        vault = BondVault(vault_);
        index = PrintIndex(index_);
        buyer = buyer_;
        buyer2 = buyer2_;
        trader = trader_;
        providerA = provider_;
    }

    function buy(uint256 whoSeed, uint256 lots) external {
        lots = bound(lots, 1, 4);
        address actor = whoSeed % 2 == 0 ? buyer : trader;
        vm.prank(actor);
        try sale.buy(seriesId, lots * CU, type(uint256).max) {} catch {}
    }

    function placeAndTake(uint256) external {
        vm.startPrank(trader);
        CUToken(token).approve(address(book), type(uint256).max);
        try book.placeOrder(seriesId, Side.Ask, 3_200_000, CU, false) {} catch {}
        vm.stopPrank();
        uint256 beforeRound = index.stateOf(ParonConstants.H100).roundId;
        int256 beforeAnswer = index.stateOf(ParonConstants.H100).answer;
        vm.startPrank(buyer);
        usdc.approve(address(book), type(uint256).max);
        try book.placeOrder(seriesId, Side.Bid, 3_200_000, CU, true) returns (uint256, uint256 filled) {
            if (filled > 0 && index.stateOf(ParonConstants.H100).roundId == beforeRound && beforeAnswer != 0) {
                if (index.stateOf(ParonConstants.H100).answer != beforeAnswer) ineligibleMovedIndex = true;
            }
        } catch {}
        vm.stopPrank();
    }

    function selfMatch(uint256) external {
        vm.startPrank(buyer);
        CUToken(token).approve(address(book), type(uint256).max);
        try book.placeOrder(seriesId, Side.Ask, 2_500_000, CU, false) returns (uint256 askId, uint256) {
            vm.stopPrank();
            if (askId == 0) return;
            vm.startPrank(buyer2);
            usdc.approve(address(book), type(uint256).max);
            try book.placeOrder(seriesId, Side.Bid, 2_500_000, CU, true) returns (uint256, uint256 filled) {
                if (filled > 0) selfMatchFilled = true;
            } catch {}
            vm.stopPrank();
        } catch {
            vm.stopPrank();
        }
    }

    function request(uint256) external {
        vm.prank(buyer);
        try rm.requestRedemption(seriesId, CU, bytes32("inv")) returns (uint256 reqId) {
            reqs.push(reqId);
        } catch {}
    }

    function acknowledge(uint256 salt) external {
        uint256 reqId = _req(salt);
        if (reqId == 0) return;
        RedemptionState before = rm.stateOf(reqId);
        vm.prank(providerA);
        try rm.acknowledge(reqId) {
            if (before != RedemptionState.Requested) badTransition = true;
        } catch {}
    }

    function deliver(uint256 salt) external {
        uint256 reqId = _req(salt);
        if (reqId == 0) return;
        vm.prank(providerA);
        try rm.markDelivered(reqId, keccak256("inv-receipt")) {} catch {}
    }

    function confirm(uint256 salt) external {
        uint256 reqId = _req(salt);
        if (reqId == 0) return;
        vm.prank(buyer);
        try rm.confirm(reqId) {} catch {}
    }

    function claimDefault(uint256 salt) external {
        uint256 reqId = _req(salt);
        if (reqId == 0) return;
        address holder = rm.getRequest(reqId).holder;
        uint256 before = usdc.balanceOf(holder);
        try rm.claimDefault(reqId) {
            payouts[reqId] += 1;
            payoutAmount[reqId] = usdc.balanceOf(holder) - before;
        } catch {}
    }

    function warp(uint256 dt) external {
        dt = bound(dt, 0, 12 hours);
        vm.warp(block.timestamp + dt);
    }

    function transferAfterWindow(uint256) external {
        if (block.timestamp < factory.getSeries(seriesId).windowEnd) return;
        vm.prank(buyer);
        try CUToken(token).transfer(trader, 1) returns (bool ok) {
            if (ok) postWindowTransfer = true;
        } catch {}
    }

    function reqCount() external view returns (uint256) {
        return reqs.length;
    }

    function reqAt(uint256 i) external view returns (uint256) {
        return reqs[i];
    }

    function _req(uint256 salt) private view returns (uint256) {
        if (reqs.length == 0) return 0;
        return reqs[salt % reqs.length];
    }
}

contract SystemInvariantTest is ParonFixture {
    Handler internal handler;
    uint256 internal seriesId;
    uint256 internal otherId;
    address internal token;

    function setUp() public {
        _deployDemo(10);
        _seedIdentities();
        vm.prank(buyer);
        usdc.approve(address(sale), type(uint256).max);
        vm.prank(buyer2);
        usdc.approve(address(sale), type(uint256).max);
        vm.prank(trader);
        usdc.approve(address(sale), type(uint256).max);
        (seriesId, token) = _create(
            providerA,
            _params(
                ParonConstants.H100, 80, 3_000_000, 4_500_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "INV"
            )
        );
        (otherId,) = _create(
            providerB,
            _params(
                ParonConstants.H100, 10, 3_000_000, 4_500_000, uint64(NOV1), uint64(DEC1), bytes2("ID"), address(mockArb), "ANCHOR"
            )
        );
        vm.warp(NOV1 + 1);
        handler = new Handler(seriesId, token, vault.bondOf(otherId).balance, usdc.totalSupply());
        handler.wire(
            address(usdc),
            address(factory),
            address(sale),
            address(book),
            address(rm),
            address(vault),
            address(index),
            buyer,
            buyer2,
            trader,
            providerA
        );
        targetContract(address(handler));
        bytes4[] memory sels = new bytes4[](10);
        sels[0] = Handler.buy.selector;
        sels[1] = Handler.placeAndTake.selector;
        sels[2] = Handler.selfMatch.selector;
        sels[3] = Handler.request.selector;
        sels[4] = Handler.acknowledge.selector;
        sels[5] = Handler.deliver.selector;
        sels[6] = Handler.confirm.selector;
        sels[7] = Handler.claimDefault.selector;
        sels[8] = Handler.warp.selector;
        sels[9] = Handler.transferAfterWindow.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: sels}));
    }

    function invariant_BondCoversSupply() public view {
        uint256 n = factory.seriesCount();
        for (uint256 i = 1; i <= n; ++i) {
            Series memory s = factory.getSeries(i);
            if (s.finalized) continue;
            uint256 supply = IERC20(s.token).totalSupply();
            uint256 need = (s.bondPerCU * supply) / 1e18;
            assertGe(vault.bondOf(i).balance, need, "bond covers supply");
        }
    }

    function invariant_NoUnbackedCU() public view {
        uint256 n = factory.seriesCount();
        for (uint256 i = 1; i <= n; ++i) {
            Series memory s = factory.getSeries(i);
            assertLe(IERC20(s.token).totalSupply(), sale.sold(i), "unbacked");
            assertLe(sale.sold(i), s.maxSupply, "oversold");
        }
    }

    function invariant_USDCConservation() public view {
        uint256 sum = usdc.balanceOf(providerA) + usdc.balanceOf(providerB) + usdc.balanceOf(providerC)
            + usdc.balanceOf(buyer) + usdc.balanceOf(buyer2) + usdc.balanceOf(trader) + usdc.balanceOf(outsider)
            + usdc.balanceOf(treasury) + usdc.balanceOf(address(vault)) + usdc.balanceOf(address(book))
            + usdc.balanceOf(address(rm)) + usdc.balanceOf(address(sale)) + usdc.balanceOf(address(this))
            + usdc.balanceOf(address(handler));
        assertEq(sum, usdc.totalSupply(), "usdc");
    }

    function invariant_BondIsolation() public view {
        assertEq(vault.bondOf(otherId).slashed, 0, "anchor slashed");
        assertEq(vault.bondOf(otherId).released, 0, "anchor released");
        assertEq(vault.bondOf(otherId).balance, handler.anchorBond(), "anchor balance");
    }

    function invariant_NoSelfMatchPrints() public view {
        assertFalse(handler.selfMatchFilled(), "self match");
    }

    function invariant_IndexIgnoresIneligible() public view {
        assertFalse(handler.ineligibleMovedIndex(), "ineligible index");
    }

    function invariant_NoTransferAfterWindowEnd() public view {
        assertFalse(handler.postWindowTransfer(), "post window");
    }

    function invariant_DefaultPaysExactlyOnce() public view {
        uint256 n = handler.reqCount();
        for (uint256 i; i < n; ++i) {
            uint256 reqId = handler.reqAt(i);
            assertLe(handler.payouts(reqId), 1, "double pay");
            if (handler.payouts(reqId) == 1) {
                uint256 amount = rm.getRequest(reqId).amount;
                uint256 expected = (factory.getSeries(seriesId).bondPerCU * amount) / 1e18;
                assertEq(handler.payoutAmount(reqId), expected, "payout");
            }
        }
    }

    function invariant_ValidTransitionsOnly() public view {
        assertFalse(handler.badTransition(), "transition");
        uint256 n = handler.reqCount();
        for (uint256 i; i < n; ++i) {
            RedemptionState st = rm.stateOf(handler.reqAt(i));
            assertTrue(uint256(st) <= uint256(RedemptionState.Refunded), "state");
        }
    }
}
