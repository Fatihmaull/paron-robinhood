// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "../../src/mocks/MockUSDC.sol";
import {RegistryGate} from "../../src/gate/RegistryGate.sol";
import {ConversionTable} from "../../src/registry/ConversionTable.sol";
import {ProviderRegistry} from "../../src/registry/ProviderRegistry.sol";
import {BondVault} from "../../src/series/BondVault.sol";
import {CUToken} from "../../src/series/CUToken.sol";
import {SeriesFactory} from "../../src/series/SeriesFactory.sol";
import {PrimarySale} from "../../src/market/PrimarySale.sol";
import {OrderBook} from "../../src/market/OrderBook.sol";
import {RedemptionManager} from "../../src/redemption/RedemptionManager.sol";
import {PanelArbitrator} from "../../src/redemption/PanelArbitrator.sol";
import {PrintIndex} from "../../src/data/PrintIndex.sol";
import {ReferenceFeed} from "../../src/data/ReferenceFeed.sol";
import {MockArbitrator} from "../mocks/MockArbitrator.sol";
import {ParonConstants} from "../../src/libraries/ParonConstants.sol";
import {IndexParams, SeriesParams, WindowBounds} from "../../src/libraries/ParonTypes.sol";

abstract contract ParonFixture is Test {
    uint256 internal constant OCT1 = 1_790_812_800;
    uint256 internal constant NOV1 = 1_793_491_200;
    uint256 internal constant DEC1 = 1_796_083_200;
    uint256 internal constant JAN1 = 1_798_761_600;
    uint256 internal constant OCT9 = 1_791_504_000;
    uint256 internal constant CU = 1e18;

    MockUSDC internal usdc;
    RegistryGate internal gate;
    ConversionTable internal table;
    ProviderRegistry internal registry;
    BondVault internal vault;
    CUToken internal impl;
    PrintIndex internal index;
    SeriesFactory internal factory;
    PrimarySale internal sale;
    OrderBook internal book;
    RedemptionManager internal rm;
    PanelArbitrator internal panel;
    ReferenceFeed internal feed;
    MockArbitrator internal mockArb;

    address internal treasury;
    address internal providerA;
    address internal providerB;
    address internal providerC;
    address internal buyer;
    address internal buyer2;
    address internal trader;
    address internal outsider;
    uint256 internal arb1Pk;
    uint256 internal arb2Pk;
    uint256 internal arb3Pk;
    address internal arb1;
    address internal arb2;
    address internal arb3;

    bytes32 internal entityBuyer;
    bytes32 internal entityTrader;

    function _deployDemo(uint16 maxFills) internal {
        treasury = makeAddr("treasury");
        providerA = makeAddr("providerA");
        providerB = makeAddr("providerB");
        providerC = makeAddr("providerC");
        buyer = makeAddr("buyer");
        buyer2 = makeAddr("buyer2");
        trader = makeAddr("trader");
        outsider = makeAddr("outsider");
        arb1Pk = 0xA11CE;
        arb2Pk = 0xB0B;
        arb3Pk = 0xC0C;
        arb1 = vm.addr(arb1Pk);
        arb2 = vm.addr(arb2Pk);
        arb3 = vm.addr(arb3Pk);
        entityBuyer = keccak256("BUY-ENTITY");
        entityTrader = keccak256("TRADER-ENTITY");

        vm.warp(OCT9);
        uint256 n = vm.getNonce(address(this));
        address usdcA = vm.computeCreateAddress(address(this), n);
        address gateA = vm.computeCreateAddress(address(this), n + 1);
        address tableA = vm.computeCreateAddress(address(this), n + 2);
        address registryA = vm.computeCreateAddress(address(this), n + 3);
        address vaultA = vm.computeCreateAddress(address(this), n + 4);
        address implA = vm.computeCreateAddress(address(this), n + 5);
        address indexA = vm.computeCreateAddress(address(this), n + 6);
        address factoryA = vm.computeCreateAddress(address(this), n + 7);
        address saleA = vm.computeCreateAddress(address(this), n + 8);
        address bookA = vm.computeCreateAddress(address(this), n + 9);
        address rmA = vm.computeCreateAddress(address(this), n + 10);
        address panelA = vm.computeCreateAddress(address(this), n + 11);
        address feedA = vm.computeCreateAddress(address(this), n + 12);
        address mockA = vm.computeCreateAddress(address(this), n + 13);

        usdc = new MockUSDC(address(this), address(this));
        gate = new RegistryGate(address(this));
        table = new ConversionTable(address(this));
        registry = new ProviderRegistry(gateA, rmA, address(this));
        vault = new BondVault(usdcA, factoryA, rmA);
        impl = new CUToken();
        index = new PrintIndex(
            bookA,
            rmA,
            factoryA,
            address(this),
            IndexParams({windowLength: 1 days, minVolume: CU, minParticipants: 2, maxCarryForward: 3 days})
        );
        factory = new SeriesFactory(
            registryA,
            tableA,
            vaultA,
            implA,
            saleA,
            rmA,
            gateA,
            usdcA,
            address(this),
            _demoBounds(),
            true,
            true,
            0
        );
        sale = new PrimarySale(factoryA, usdcA, gateA, treasury, 100, address(this));
        book = new OrderBook(factoryA, usdcA, gateA, indexA, treasury, 15, maxFills, address(this));
        rm = new RedemptionManager(factoryA, vaultA, registryA, indexA, usdcA, 120);
        address[] memory members = new address[](3);
        members[0] = arb1;
        members[1] = arb2;
        members[2] = arb3;
        panel = new PanelArbitrator(members, 2, rmA, address(this));
        feed = new ReferenceFeed(address(this), address(this), "synthetic demo data");
        mockArb = new MockArbitrator(rmA);

        assertEq(address(usdc), usdcA, "usdc");
        assertEq(address(gate), gateA, "gate");
        assertEq(address(table), tableA, "table");
        assertEq(address(registry), registryA, "registry");
        assertEq(address(vault), vaultA, "vault");
        assertEq(address(impl), implA, "impl");
        assertEq(address(index), indexA, "index");
        assertEq(address(factory), factoryA, "factory");
        assertEq(address(sale), saleA, "sale");
        assertEq(address(book), bookA, "book");
        assertEq(address(rm), rmA, "rm");
        assertEq(address(panel), panelA, "panel");
        assertEq(address(feed), feedA, "feed");
        assertEq(address(mockArb), mockA, "mock");

        factory.setOrderBook(address(book));
        factory.setArbitratorAllowed(address(panel), true);
        factory.setArbitratorAllowed(address(mockArb), true);
    }

    function _demoBounds() internal pure returns (WindowBounds memory) {
        return WindowBounds({
            minAck: 60,
            maxAck: uint64(72 hours),
            minDelivery: 60,
            maxDelivery: uint64(7 days),
            minDispute: 90,
            maxDispute: uint64(7 days)
        });
    }

    function _kyb(address account, bytes32 entity, uint8 role) internal {
        gate.setParticipant(account, entity, role, bytes2("ID"), uint64(2_200_000_000));
    }

    function _seedIdentities() internal {
        _kyb(providerA, keccak256("JKT"), ParonConstants.ROLE_PROVIDER);
        _kyb(providerB, keccak256("BTM"), ParonConstants.ROLE_PROVIDER);
        _kyb(providerC, keccak256("SGP"), ParonConstants.ROLE_PROVIDER);
        _kyb(buyer, entityBuyer, ParonConstants.ROLE_BUYER);
        _kyb(buyer2, entityBuyer, ParonConstants.ROLE_BUYER);
        _kyb(trader, entityTrader, ParonConstants.ROLE_TRADER);
        vm.prank(providerA);
        registry.registerProvider();
        vm.prank(providerB);
        registry.registerProvider();
        vm.prank(providerC);
        registry.registerProvider();
        usdc.mint(providerA, 10_000 * 1e6);
        usdc.mint(providerB, 10_000 * 1e6);
        usdc.mint(providerC, 10_000 * 1e6);
        usdc.mint(buyer, 1_000 * 1e6);
        usdc.mint(buyer2, 1_000 * 1e6);
        usdc.mint(trader, 1_000 * 1e6);
        vm.prank(providerA);
        usdc.approve(address(vault), type(uint256).max);
        vm.prank(providerB);
        usdc.approve(address(vault), type(uint256).max);
        vm.prank(providerC);
        usdc.approve(address(vault), type(uint256).max);
    }

    function _params(
        bytes32 gpu,
        uint64 gpuHours,
        uint256 price,
        uint256 bond,
        uint64 start,
        uint64 end,
        bytes2 country,
        address arbitrator,
        string memory symbol
    ) internal pure returns (SeriesParams memory p) {
        p.gpuModel = gpu;
        p.gpuHours = gpuHours;
        p.primaryPrice = price;
        p.bondPerCU = bond;
        p.windowStart = start;
        p.windowEnd = end;
        p.ackWindow = 60;
        p.deliveryWindow = 60;
        p.disputeWindow = 90;
        p.minRedemption = CU;
        p.arbitrator = arbitrator;
        p.specHash = keccak256("spec");
        p.termsHash = keccak256("terms");
        p.country = country;
        p.continent = ParonConstants.CONTINENT_AS;
        p.institutional = false;
        p.symbol = symbol;
    }

    function _create(address provider, SeriesParams memory p) internal returns (uint256 id, address token) {
        vm.prank(provider);
        (id, token) = factory.createSeries(p);
    }

    function _buy(address who, uint256 id, uint256 qty) internal returns (uint256 cost) {
        (uint256 quoted,) = sale.quote(id, qty);
        vm.startPrank(who);
        usdc.approve(address(sale), type(uint256).max);
        cost = sale.buy(id, qty, quoted);
        vm.stopPrank();
    }
}
