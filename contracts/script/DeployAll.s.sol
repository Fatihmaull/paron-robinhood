// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script, console2} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {DeployLib} from "./DeployLib.sol";
import {EASGate} from "../src/gate/EASGate.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {ProviderRegistry} from "../src/registry/ProviderRegistry.sol";
import {SeriesFactory} from "../src/series/SeriesFactory.sol";
import {PrimarySale} from "../src/market/PrimarySale.sol";
import {OrderBook} from "../src/market/OrderBook.sol";
import {ReferenceFeed} from "../src/data/ReferenceFeed.sol";
import {IndexParams, SeriesParams, Side, WindowBounds} from "../src/libraries/ParonTypes.sol";

interface IERC20Approve {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IEASMulti {
    struct AttestationRequestData {
        address recipient;
        uint64 expirationTime;
        bool revocable;
        bytes32 refUID;
        bytes data;
        uint256 value;
    }

    struct MultiAttestationRequest {
        bytes32 schema;
        AttestationRequestData[] data;
    }

    function multiAttest(MultiAttestationRequest[] calldata multiRequests) external payable returns (bytes32[] memory);
}

/// @notice Same five steps as `ops/scripts/deploy.mjs`: mock-usdc, eas-schema, core, roles, seed.
/// @dev The integrator command is `PARON_BROADCAST=1 node ops/scripts/deploy.mjs <step>`.
/// This script reads the same config and the same `PARON_DEPLOYER_PK`. It never logs the key.
/// `PARON_STEP` is mock-usdc, eas-schema, core, roles, seed, smoke (first two), or all.
contract DeployAll is Script {
    using stdJson for string;

    error BadKey();
    error WrongChain(uint256 expected, uint256 actual);
    error UnknownStep(string step);

    uint256 internal constant KYB_EXPIRY = 1_822_953_600;
    uint8 internal constant CONTINENT_AS = 2;
    uint256 internal constant USDC = 1_000_000;
    uint256 internal constant CU = 1e18;

    function run() external {
        string memory step = vm.envOr("PARON_STEP", string("all"));
        if (!_known(step)) revert UnknownStep(step);

        string memory chains = vm.readFile("../config/chains.json");
        string memory active = chains.readString(".active");
        string memory chainKey = vm.envOr("CHAIN", active);
        uint256 expectedId = chains.readUint(string.concat(".chains.", chainKey, ".chainId"));
        string memory easMode = chains.readString(string.concat(".chains.", chainKey, ".eas.mode"));
        string memory paramSet = vm.envOr("PARAM_SET", string("demo"));
        string memory params = vm.readFile(string.concat("../config/params/", paramSet, ".json"));
        bool allowOpen = params.readBool(".allowOpenWindow");
        if (_eq(paramSet, "prod") && allowOpen) revert("PARAM_SET=prod cannot set allowOpenWindow");

        bool broadcast = vm.envOr("PARON_BROADCAST", uint256(0)) == 1;
        if (!broadcast) {
            console2.log("Dry run. No key was read. No transaction was signed.");
            console2.log("step", step);
            console2.log("chain", chainKey);
            console2.log("paramSet", paramSet);
            return;
        }
        if (block.chainid != expectedId) revert WrongChain(expectedId, block.chainid);

        uint256 pk = _key("PARON_DEPLOYER_PK");
        address deployer = vm.addr(pk);
        string memory label = vm.envOr("DEPLOY_LABEL", string("stage-1"));
        console2.log("deployer", deployer);
        console2.log("step", step);

        vm.startBroadcast(pk);
        if (_wants(step, "mock-usdc")) _mockUsdc(expectedId, deployer);
        if (_wants(step, "eas-schema")) _eas(expectedId, easMode, chains, chainKey);
        if (_wants(step, "core")) _core(expectedId, deployer, params, paramSet, label, chainKey);
        if (_wants(step, "roles")) _roles(expectedId, deployer, params, label);
        if (_wants(step, "seed")) _seed(expectedId, pk, label);
        vm.stopBroadcast();
    }

    function _mockUsdc(uint256 chainId, address deployer) internal {
        address usdc = address(new MockUSDC(deployer, deployer));
        console2.log("MockUSDC", usdc);
        _writeAddress(_infra(chainId), ".mockUsdc.address", usdc);
        _writeAddress(_infra(chainId), ".mockUsdc.minter", deployer);
    }

    function _eas(uint256 chainId, string memory easMode, string memory chains, string memory chainKey) internal {
        address registry;
        address eas;
        if (_eq(easMode, "self-deploy")) {
            registry = DeployLib.deploySchemaRegistry();
            eas = DeployLib.deployEAS(registry);
            console2.log("SchemaRegistry", registry);
            console2.log("EAS", eas);
        } else {
            registry = chains.readAddress(string.concat(".chains.", chainKey, ".eas.schemaRegistry"));
            eas = chains.readAddress(string.concat(".chains.", chainKey, ".eas.address"));
            console2.log("SchemaRegistry", registry);
            console2.log("EAS", eas);
        }
        (bytes32 participant, bytes32 kyb) = DeployLib.registerSchemas(registry);
        console2.log("ParticipantVerified");
        console2.logBytes32(participant);
        console2.log("KybApplication");
        console2.logBytes32(kyb);
        string memory path = _infra(chainId);
        _writeAddress(path, ".eas.address", eas);
        _writeAddress(path, ".eas.schemaRegistry", registry);
        _writeString(path, ".eas.mode", easMode);
        _writeBytes32(path, ".schemas.ParticipantVerified.uid", participant);
        _writeString(path, ".schemas.ParticipantVerified.schema", DeployLib.SCHEMA_PARTICIPANT);
        _writeBytes32(path, ".schemas.KybApplication.uid", kyb);
        _writeString(path, ".schemas.KybApplication.schema", DeployLib.SCHEMA_KYB);
    }

    function _core(
        uint256 chainId,
        address deployer,
        string memory params,
        string memory paramSet,
        string memory label,
        string memory chainKey
    ) internal {
        address usdc = _readInfraAddress(chainId, ".mockUsdc.address");
        address eas = _readInfraAddress(chainId, ".eas.address");
        bytes32 schemaUid = _readInfraBytes32(chainId, ".schemas.ParticipantVerified.uid");
        if (usdc == address(0) || eas == address(0) || schemaUid == bytes32(0)) revert("infra");
        if (_labelHas(chainId, label, ".contracts.SeriesFactory.address")) revert("label exists");

        DeployLib.CoreArgs memory args;
        args.deployer = deployer;
        args.usdc = usdc;
        args.treasury = _treasury();
        args.verifier = vm.envAddress("W_VERIFIER");
        args.eas = eas;
        args.schemaUid = schemaUid;
        args.useRegistryGate = _eq(vm.envOr("GATE_KIND", string("")), "registry");
        args.panel = _panel();
        args.panelThreshold = params.keyExists(".panelThreshold") ? uint8(params.readUint(".panelThreshold")) : 2;
        args.primaryFeeBps = uint16(params.readUint(".primaryFeeBps"));
        args.takerFeeBps = uint16(params.readUint(".takerFeeBps"));
        args.maxFillsPerTx = uint16(_maxFills(params));
        args.rulingWindow = uint64(params.readUint(".rulingWindow"));
        args.leadTime = uint64(params.readUint(".leadTime"));
        args.allowOpenWindow = params.readBool(".allowOpenWindow");
        args.enforceCalendarMonth = params.readBool(".enforceCalendarMonth");
        args.referenceFeed = _eq(vm.envOr("REFERENCE_FEED", string("")), "1");
        args.feedSigner = args.referenceFeed ? vm.envAddress("W_FEED") : address(0);
        args.bounds = _bounds(params);
        args.index = _index(params);
        if (args.panel.length < 2) revert("panel");
        if (!args.useRegistryGate && args.verifier == address(0)) revert("verifier");

        DeployLib.Core memory core = DeployLib.deployCore(args);
        console2.log("gate", core.gate);
        console2.log("SeriesFactory", core.factory);
        console2.log("OrderBook", core.book);
        console2.log("RedemptionManager", core.redemption);
        console2.log("PanelArbitrator", core.panel);

        string memory path = _label(chainId, label, chainKey, paramSet);
        _writeAddress(path, ".contracts.ConversionTable.address", core.table);
        _writeAddress(path, ".contracts.ProviderRegistry.address", core.registry);
        _writeAddress(path, ".contracts.BondVault.address", core.vault);
        _writeAddress(path, ".contracts.CUToken.address", core.tokenImpl);
        _writeAddress(path, ".contracts.PrintIndex.address", core.index);
        _writeAddress(path, ".contracts.SeriesFactory.address", core.factory);
        _writeAddress(path, ".contracts.PrimarySale.address", core.sale);
        _writeAddress(path, ".contracts.OrderBook.address", core.book);
        _writeAddress(path, ".contracts.RedemptionManager.address", core.redemption);
        _writeAddress(path, ".contracts.PanelArbitrator.address", core.panel);
        if (args.useRegistryGate) _writeAddress(path, ".contracts.RegistryGate.address", core.gate);
        else _writeAddress(path, ".contracts.EASGate.address", core.gate);
        if (core.feed != address(0)) _writeAddress(path, ".contracts.ReferenceFeed.address", core.feed);
        _writeAddress(path, ".deployer", deployer);
        _writeString(path, ".paramSet", paramSet);
    }

    function _roles(uint256 chainId, address deployer, string memory params, string memory label) internal {
        DeployLib.Core memory core = _loadCore(chainId, label);
        if (core.factory == address(0)) revert("core");
        bool allowlist = _eq(vm.envOr("PARON_SAFE_MODE", string("")), "allowlist");
        address admin = allowlist ? vm.envAddress("W_ADMIN") : vm.envAddress("SAFE_ADDRESS");
        if (!allowlist && vm.envAddress("W_ADMIN") == address(0)) revert("W_ADMIN");
        address[] memory proposers;
        if (allowlist) {
            proposers = new address[](3);
            proposers[0] = vm.envAddress("W_ADMIN");
            proposers[1] = vm.envAddress("TEAM_EOA_1");
            proposers[2] = vm.envAddress("TEAM_EOA_2");
        } else {
            proposers = new address[](2);
            proposers[0] = vm.envAddress("SAFE_ADDRESS");
            proposers[1] = vm.envAddress("W_ADMIN");
        }
        address timelock = DeployLib.deployTimelock(params.readUint(".timelockDelay"), proposers);
        console2.log("TimelockController", timelock);
        if (!TimelockController(payable(timelock)).hasRole(keccak256("EXECUTOR_ROLE"), address(0))) {
            revert DeployLib.DeployFailed("executor");
        }

        address usdc = _readInfraAddress(chainId, ".mockUsdc.address");
        bool registryGate = core.gate != address(0) && !_labelHas(chainId, label, ".contracts.EASGate.address");
        DeployLib.grantRoles(core, usdc, deployer, timelock, admin, vm.envOr("W_VERIFIER", address(0)), registryGate);

        string memory path = _labelPath(chainId, label);
        _writeAddress(path, ".contracts.TimelockController.address", timelock);
        _writeAddress(path, ".roles.timelock", timelock);
        _writeAddress(path, ".roles.timelockExecutor", address(0));
        _writeAddress(path, ".roles.treasury", _treasury());
        _writeAddress(path, ".roles.verifier", vm.envOr("W_VERIFIER", address(0)));
        _writeAddress(path, ".roles.adminEoa", vm.envOr("W_ADMIN", address(0)));
        if (!allowlist) _writeAddress(path, ".roles.safe", vm.envAddress("SAFE_ADDRESS"));
    }

    function _seed(uint256 chainId, uint256 depPk, string memory label) internal {
        address usdc = _readInfraAddress(chainId, ".mockUsdc.address");
        address eas = _readInfraAddress(chainId, ".eas.address");
        bytes32 schemaUid = _readInfraBytes32(chainId, ".schemas.ParticipantVerified.uid");
        DeployLib.Core memory core = _loadCore(chainId, label);
        if (usdc == address(0) || eas == address(0) || core.factory == address(0) || core.gate == address(0)) {
            revert("seed-prereq");
        }

        _topUp(vm.envAddress("W_VERIFIER"));
        _topUp(vm.envAddress("W_P_JKT"));
        _topUp(vm.envAddress("W_P_BTM"));
        _topUp(vm.envAddress("W_P_SGP"));
        _topUp(vm.envAddress("W_BUY"));
        _topUp(vm.envAddress("W_BUY2"));
        _topUp(vm.envAddress("W_TRD"));

        _mintTo(usdc, vm.envAddress("W_P_JKT"), 10_000 * USDC);
        _mintTo(usdc, vm.envAddress("W_P_BTM"), 10_000 * USDC);
        _mintTo(usdc, vm.envAddress("W_P_SGP"), 10_000 * USDC);
        _mintTo(usdc, vm.envAddress("W_BUY"), 1_000 * USDC);
        _mintTo(usdc, vm.envAddress("W_BUY2"), 1_000 * USDC);
        _mintTo(usdc, vm.envAddress("W_TRD"), 1_000 * USDC);

        // EAS uids include the block timestamp, so a uid returned by the simulation
        // does not match the mined attestation. Read the mined logs, or attest and stop.
        bytes32[] memory uids = _attestationUids(eas, schemaUid);
        if (!_uidsReady(uids)) {
            vm.stopBroadcast();
            uint256 verifierPk = _key("KEY_W_VERIFIER");
            vm.startBroadcast(verifierPk);
            _attest(eas, schemaUid);
            vm.stopBroadcast();
            vm.startBroadcast(depPk);
            console2.log("Attestations submitted. Re-run PARON_STEP=seed to link them and create series.");
            return;
        }

        for (uint256 i; i < uids.length; ++i) {
            EASGate(core.gate).linkAttestation(uids[i]);
        }

        _as(vm.envAddress("W_P_JKT"), "KEY_W_P_JKT", depPk);
        ProviderRegistry(core.registry).registerProvider();
        _as(vm.envAddress("W_P_BTM"), "KEY_W_P_BTM", depPk);
        ProviderRegistry(core.registry).registerProvider();
        _as(vm.envAddress("W_P_SGP"), "KEY_W_P_SGP", depPk);
        ProviderRegistry(core.registry).registerProvider();
        vm.stopBroadcast();
        vm.startBroadcast(depPk);

        _approveUsdc("W_P_JKT", "KEY_W_P_JKT", usdc, core.vault, 3_240_000_000, depPk);
        _approveUsdc("W_P_BTM", "KEY_W_P_BTM", usdc, core.vault, 8_526_000_000, depPk);
        _approveUsdc("W_P_SGP", "KEY_W_P_SGP", usdc, core.vault, 8_370_000_000, depPk);
        _approveUsdc("W_BUY", "KEY_W_BUY", usdc, core.sale, 60_000_000, depPk);
        _approveUsdc("W_BUY", "KEY_W_BUY", usdc, core.book, 3_104_650, depPk);
        _approveUsdc("W_BUY2", "KEY_W_BUY2", usdc, core.book, 16_024_000, depPk);
        _approveUsdc("W_BUY2", "KEY_W_BUY2", usdc, core.sale, 3_000_000, depPk);
        _approveUsdc("W_TRD", "KEY_W_TRD", usdc, core.sale, 30_000_000, depPk);

        _as(vm.envAddress("W_P_JKT"), "KEY_W_P_JKT", depPk);
        SeriesFactory(core.factory).createSeries(_series(
            "H100-SXM-80GB", 720, 3_000_000, 4_500_000, 1_793_491_200, 1_796_083_200, "ID", "CU-JKT-H100-2611", core.panel
        ));
        _as(vm.envAddress("W_P_BTM"), "KEY_W_P_BTM", depPk);
        SeriesFactory(core.factory).createSeries(_series(
            "H200-SXM-141GB", 1000, 4_060_000, 6_090_000, 1_793_491_200, 1_796_083_200, "ID", "CU-BTM-H200-2611", core.panel
        ));
        _as(vm.envAddress("W_P_SGP"), "KEY_W_P_SGP", depPk);
        (uint256 seriesId, address token) = SeriesFactory(core.factory).createSeries(_series(
            "B200-SXM-180GB", 744, 3_000_000, 4_500_000, 1_796_083_200, 1_798_761_600, "SG", "CU-SGP-B200-2612", core.panel
        ));

        if (!_eq(vm.envOr("SEED_CALLOUT", string("true")), "false")) {
            _as(vm.envAddress("W_BUY2"), "KEY_W_BUY2", depPk);
            PrimarySale(core.sale).buy(seriesId, CU, 3_000_000);
            IERC20Approve(token).approve(core.book, CU);
            OrderBook(core.book).placeOrder(seriesId, Side.Ask, 3_100_000, CU, false);
        }

        if (core.feed != address(0) && _eq(vm.envOr("REFERENCE_FEED", string("")), "1")) {
            _as(vm.envAddress("W_FEED"), "KEY_W_FEED", depPk);
            uint64 observed = uint64(block.timestamp);
            ReferenceFeed(core.feed).push(keccak256("H100-SXM-80GB"), 3_000_000, observed);
            ReferenceFeed(core.feed).push(keccak256("H200-SXM-141GB"), 3_000_000, observed);
            ReferenceFeed(core.feed).push(keccak256("B200-SXM-180GB"), 3_000_000, observed);
        }

        vm.stopBroadcast();
        vm.startBroadcast(depPk);
        _writeString(_labelPath(chainId, label), ".seed.mode", vm.envOr("SEED_MODE", string("stage")));
        console2.log("seed", "phases 1-2");
    }

    /// @dev Latest ParticipantVerified uid per actor, from mined Attested logs. Order is the seed actor list.
    function _attestationUids(address eas, bytes32 schemaUid) internal view returns (bytes32[] memory uids) {
        uids = new bytes32[](6);
        address[] memory who = _seedActors();
        bytes32[] memory topics = new bytes32[](1);
        topics[0] = keccak256("Attested(address,address,bytes32,bytes32)");
        VmSafe.EthGetLogs[] memory logs = vm.eth_getLogs(0, block.number, eas, topics);
        bytes32 attester = bytes32(uint256(uint160(vm.envAddress("W_VERIFIER"))));
        uint256 n = logs.length;
        for (uint256 i; i < n; ++i) {
            if (!_matchesAttestation(logs[i], attester, schemaUid)) continue;
            address recipient = address(uint160(uint256(logs[i].topics[1])));
            bytes32 uid = abi.decode(logs[i].data, (bytes32));
            for (uint256 j; j < who.length; ++j) {
                if (recipient == who[j]) uids[j] = uid;
            }
        }
    }

    function _seedActors() internal view returns (address[] memory who) {
        who = new address[](6);
        who[0] = vm.envAddress("W_P_JKT");
        who[1] = vm.envAddress("W_P_BTM");
        who[2] = vm.envAddress("W_P_SGP");
        who[3] = vm.envAddress("W_BUY");
        who[4] = vm.envAddress("W_BUY2");
        who[5] = vm.envAddress("W_TRD");
    }

    function _matchesAttestation(VmSafe.EthGetLogs memory log, bytes32 attester, bytes32 schemaUid)
        internal
        pure
        returns (bool)
    {
        return log.topics.length >= 4 && log.topics[2] == attester && log.topics[3] == schemaUid;
    }

    function _uidsReady(bytes32[] memory uids) internal pure returns (bool) {
        for (uint256 i; i < uids.length; ++i) {
            if (uids[i] == bytes32(0)) return false;
        }
        return true;
    }

    function _attest(address eas, bytes32 schemaUid) internal returns (bytes32[] memory) {
        IEASMulti.AttestationRequestData[] memory rows = new IEASMulti.AttestationRequestData[](6);
        rows[0] = _row("W_P_JKT", 1, "ID", _repeat(0xe1));
        rows[1] = _row("W_P_BTM", 1, "ID", _repeat(0xe4));
        rows[2] = _row("W_P_SGP", 1, "SG", _repeat(0xe5));
        rows[3] = _row("W_BUY", 2, "ID", _repeat(0xe2));
        rows[4] = _row("W_BUY2", 2, "ID", _repeat(0xe2));
        rows[5] = _row("W_TRD", 3, "SG", _repeat(0xe3));
        IEASMulti.MultiAttestationRequest[] memory batch = new IEASMulti.MultiAttestationRequest[](1);
        batch[0].schema = schemaUid;
        batch[0].data = rows;
        return IEASMulti(eas).multiAttest(batch);
    }

    function _row(string memory envName, uint8 role, bytes2 country, bytes32 entity)
        internal
        view
        returns (IEASMulti.AttestationRequestData memory row)
    {
        row.recipient = vm.envAddress(envName);
        row.revocable = true;
        row.data = abi.encode(entity, role, country, uint64(KYB_EXPIRY));
    }

    function _series(
        string memory gpu,
        uint64 hours_,
        uint256 price,
        uint256 bond,
        uint64 start_,
        uint64 end_,
        bytes2 country,
        string memory symbol,
        address panel
    ) internal pure returns (SeriesParams memory p) {
        p.gpuModel = keccak256(bytes(gpu));
        p.gpuHours = hours_;
        p.primaryPrice = price;
        p.bondPerCU = bond;
        p.windowStart = start_;
        p.windowEnd = end_;
        p.ackWindow = 60;
        p.deliveryWindow = 60;
        p.disputeWindow = 90;
        p.minRedemption = CU;
        p.arbitrator = panel;
        p.country = country;
        p.continent = CONTINENT_AS;
        p.symbol = symbol;
    }

    function _approveUsdc(string memory who, string memory keyName, address usdc, address spender, uint256 amount, uint256 depPk)
        internal
    {
        _as(vm.envAddress(who), keyName, depPk);
        IERC20Approve(usdc).approve(spender, amount);
        vm.stopBroadcast();
        vm.startBroadcast(depPk);
    }

    function _as(address who, string memory keyName, uint256 depPk) internal {
        depPk;
        vm.stopBroadcast();
        uint256 pk = _key(keyName);
        if (vm.addr(pk) != who) revert DeployLib.DeployFailed("signer");
        vm.startBroadcast(pk);
    }

    function _mintTo(address usdc, address to, uint256 target) internal {
        uint256 bal = MockUSDC(usdc).balanceOf(to);
        if (bal >= target) return;
        MockUSDC(usdc).mint(to, target - bal);
    }

    function _topUp(address to) internal {
        uint256 target = vm.envOr("ETH_TARGET_WEI", uint256(20_000_000_000_000_000));
        if (to.balance >= target) return;
        (bool ok,) = to.call{value: target - to.balance}("");
        if (!ok) revert DeployLib.DeployFailed("topUp");
    }

    function _panel() internal view returns (address[] memory panel) {
        address a1 = vm.envAddress("W_ARB_1");
        address a2 = vm.envAddress("W_ARB_2");
        address a3 = vm.envOr("W_ARB_3", address(0));
        uint256 n = a3 == address(0) ? 2 : 3;
        panel = new address[](n);
        panel[0] = a1;
        panel[1] = a2;
        if (n == 3) panel[2] = a3;
    }

    function _treasury() internal view returns (address) {
        address treasury = vm.envOr("TREASURY_ADDRESS", address(0));
        if (treasury == address(0)) treasury = vm.envOr("SAFE_ADDRESS", address(0));
        if (treasury == address(0)) revert("treasury");
        return treasury;
    }

    function _bounds(string memory params) internal pure returns (WindowBounds memory bounds) {
        bounds.minAck = uint64(params.readUint(".bounds.minAck"));
        bounds.maxAck = uint64(params.readUint(".bounds.maxAck"));
        bounds.minDelivery = uint64(params.readUint(".bounds.minDelivery"));
        bounds.maxDelivery = uint64(params.readUint(".bounds.maxDelivery"));
        bounds.minDispute = uint64(params.readUint(".bounds.minDispute"));
        bounds.maxDispute = uint64(params.readUint(".bounds.maxDispute"));
    }

    function _index(string memory params) internal pure returns (IndexParams memory index) {
        index.windowLength = uint64(params.readUint(".index.windowLength"));
        index.minVolume = vm.parseUint(params.readString(".index.minVolume"));
        index.minParticipants = uint32(params.readUint(".index.minParticipants"));
        index.maxCarryForward = uint64(params.readUint(".index.maxCarryForward"));
    }

    function _maxFills(string memory params) internal view returns (uint256) {
        string memory override_ = vm.envOr("MAX_FILLS_PER_TX", string(""));
        if (bytes(override_).length != 0) return vm.parseUint(override_);
        return params.readUint(".maxFillsPerTx");
    }

    function _loadCore(uint256 chainId, string memory label) internal view returns (DeployLib.Core memory core) {
        string memory path = _labelPath(chainId, label);
        if (!vm.exists(path)) return core;
        string memory json = vm.readFile(path);
        core.gate = _optional(json, ".contracts.EASGate.address");
        if (core.gate == address(0)) core.gate = _optional(json, ".contracts.RegistryGate.address");
        core.table = _optional(json, ".contracts.ConversionTable.address");
        core.registry = _optional(json, ".contracts.ProviderRegistry.address");
        core.vault = _optional(json, ".contracts.BondVault.address");
        core.tokenImpl = _optional(json, ".contracts.CUToken.address");
        core.index = _optional(json, ".contracts.PrintIndex.address");
        core.factory = _optional(json, ".contracts.SeriesFactory.address");
        core.sale = _optional(json, ".contracts.PrimarySale.address");
        core.book = _optional(json, ".contracts.OrderBook.address");
        core.redemption = _optional(json, ".contracts.RedemptionManager.address");
        core.panel = _optional(json, ".contracts.PanelArbitrator.address");
        core.feed = _optional(json, ".contracts.ReferenceFeed.address");
    }

    function _optional(string memory json, string memory key) internal view returns (address) {
        if (!json.keyExists(key)) return address(0);
        return json.readAddress(key);
    }

    function _infra(uint256 chainId) internal returns (string memory path) {
        path = string.concat("../deployments/", vm.toString(chainId), "/infra.json");
        if (!vm.exists(path)) {
            vm.createDir(string.concat("../deployments/", vm.toString(chainId)), true);
            vm.writeFile(
                path,
                string.concat(
                    '{"schemaVersion":"paron-deployments/v1","chainId":',
                    vm.toString(chainId),
                    ',"mockUsdc":{},"eas":{},"schemas":{"ParticipantVerified":{},"KybApplication":{}}}'
                )
            );
        }
    }

    function _label(uint256 chainId, string memory label, string memory chainKey, string memory paramSet)
        internal
        returns (string memory path)
    {
        path = _labelPath(chainId, label);
        if (!vm.exists(path)) {
            vm.createDir(string.concat("../deployments/", vm.toString(chainId)), true);
            vm.writeFile(
                path,
                string.concat(
                    '{"schemaVersion":"paron-deployments/v1","label":"',
                    label,
                    '","chainId":',
                    vm.toString(chainId),
                    ',"chainKey":"',
                    chainKey,
                    '","paramSet":"',
                    paramSet,
                    '","contracts":{},"roles":{"timelockExecutor":"0x0000000000000000000000000000000000000000"},"seed":{"phasesCompleted":[1,2]}}'
                )
            );
        }
    }

    function _labelPath(uint256 chainId, string memory label) internal pure returns (string memory) {
        return string.concat("../deployments/", vm.toString(chainId), "/", label, ".json");
    }

    function _readInfraAddress(uint256 chainId, string memory key) internal view returns (address) {
        string memory path = string.concat("../deployments/", vm.toString(chainId), "/infra.json");
        if (!vm.exists(path)) return address(0);
        string memory json = vm.readFile(path);
        if (!json.keyExists(key)) return address(0);
        return json.readAddress(key);
    }

    function _readInfraBytes32(uint256 chainId, string memory key) internal view returns (bytes32) {
        string memory path = string.concat("../deployments/", vm.toString(chainId), "/infra.json");
        if (!vm.exists(path)) return bytes32(0);
        string memory json = vm.readFile(path);
        if (!json.keyExists(key)) return bytes32(0);
        return json.readBytes32(key);
    }

    function _labelHas(uint256 chainId, string memory label, string memory key) internal view returns (bool) {
        string memory path = _labelPath(chainId, label);
        if (!vm.exists(path)) return false;
        return vm.readFile(path).keyExists(key);
    }

    function _writeAddress(string memory path, string memory key, address value) internal {
        vm.writeJson(string.concat('"', vm.toString(value), '"'), path, key);
    }

    function _writeString(string memory path, string memory key, string memory value) internal {
        vm.writeJson(string.concat('"', value, '"'), path, key);
    }

    function _writeBytes32(string memory path, string memory key, bytes32 value) internal {
        vm.writeJson(string.concat('"', vm.toString(value), '"'), path, key);
    }

    function _repeat(bytes1 b) internal pure returns (bytes32 out) {
        for (uint256 i; i < 32; ++i) {
            out |= bytes32(b) >> (i * 8);
        }
    }

    function _key(string memory name) internal view returns (uint256 pk) {
        string memory raw = vm.envString(name);
        bytes memory data = bytes(raw);
        uint256 start;
        if (data.length >= 2 && data[0] == "0" && (data[1] == "x" || data[1] == "X")) start = 2;
        if (data.length - start != 64) revert BadKey();
        for (uint256 i = start; i < data.length; ++i) {
            uint256 c = uint256(uint8(data[i]));
            uint256 nibble;
            if (c >= 48 && c <= 57) nibble = c - 48;
            else if (c >= 97 && c <= 102) nibble = c - 87;
            else if (c >= 65 && c <= 70) nibble = c - 55;
            else revert BadKey();
            pk = (pk << 4) | nibble;
        }
        if (pk == 0) revert BadKey();
    }

    function _wants(string memory step, string memory name) internal pure returns (bool) {
        if (_eq(step, "all")) return true;
        if (_eq(step, "smoke")) return _eq(name, "mock-usdc") || _eq(name, "eas-schema");
        return _eq(step, name);
    }

    function _known(string memory step) internal pure returns (bool) {
        return _eq(step, "mock-usdc") || _eq(step, "eas-schema") || _eq(step, "core") || _eq(step, "roles")
            || _eq(step, "seed") || _eq(step, "smoke") || _eq(step, "all");
    }

    function _eq(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}
