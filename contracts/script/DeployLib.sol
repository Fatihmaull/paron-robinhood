// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {Vm} from "forge-std/Vm.sol";
import {EASGate} from "../src/gate/EASGate.sol";
import {RegistryGate} from "../src/gate/RegistryGate.sol";
import {ConversionTable} from "../src/registry/ConversionTable.sol";
import {ProviderRegistry} from "../src/registry/ProviderRegistry.sol";
import {CUToken} from "../src/series/CUToken.sol";
import {BondVault} from "../src/series/BondVault.sol";
import {SeriesFactory} from "../src/series/SeriesFactory.sol";
import {PrimarySale} from "../src/market/PrimarySale.sol";
import {OrderBook} from "../src/market/OrderBook.sol";
import {RedemptionManager} from "../src/redemption/RedemptionManager.sol";
import {PanelArbitrator} from "../src/redemption/PanelArbitrator.sol";
import {PrintIndex} from "../src/data/PrintIndex.sol";
import {ReferenceFeed} from "../src/data/ReferenceFeed.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {IndexParams, WindowBounds} from "../src/libraries/ParonTypes.sol";

interface ISchemaRegister {
    function register(string calldata schema, address resolver, bool revocable) external returns (bytes32);
}

/// @notice CREATE sequence shared by DeployAll and the deploy test.
/// @dev Order matches `coreActions` in `ops/src/deploy-plan.mjs`. Addresses are
/// predicted from `args.deployer`, which is the account that broadcasts.
library DeployLib {
    Vm private constant VM = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address internal constant OPEN_ROLE = address(0);

    string internal constant SCHEMA_PARTICIPANT =
        "ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)";
    string internal constant SCHEMA_KYB = "KybApplication(bytes32 entityId,uint8 role,bytes2 country,bytes32 dataHash)";

    struct CoreArgs {
        address deployer;
        address usdc;
        address treasury;
        address verifier;
        address eas;
        bytes32 schemaUid;
        bool useRegistryGate;
        address[] panel;
        uint8 panelThreshold;
        uint16 primaryFeeBps;
        uint16 takerFeeBps;
        uint16 maxFillsPerTx;
        uint64 rulingWindow;
        uint64 leadTime;
        bool allowOpenWindow;
        bool enforceCalendarMonth;
        bool referenceFeed;
        address feedSigner;
        WindowBounds bounds;
        IndexParams index;
    }

    struct Core {
        address gate;
        address table;
        address registry;
        address vault;
        address tokenImpl;
        address index;
        address factory;
        address sale;
        address book;
        address redemption;
        address panel;
        address feed;
    }

    error DeployFailed(string what);
    error ZeroAddress();

    function deployCode(string memory what, bytes memory args) internal returns (address addr) {
        bytes memory init = abi.encodePacked(VM.getCode(what), args);
        assembly {
            addr := create(0, add(init, 0x20), mload(init))
        }
        if (addr == address(0)) revert DeployFailed(what);
    }

    function deploySchemaRegistry() internal returns (address) {
        return deployCode("SchemaRegistry.sol:SchemaRegistry", "");
    }

    function deployEAS(address registry) internal returns (address) {
        return deployCode("EAS.sol:EAS", abi.encode(registry));
    }

    function registerSchemas(address registry) internal returns (bytes32 participant, bytes32 kyb) {
        participant = ISchemaRegister(registry).register(SCHEMA_PARTICIPANT, OPEN_ROLE, true);
        kyb = ISchemaRegister(registry).register(SCHEMA_KYB, OPEN_ROLE, true);
    }

    function schemaUid(string memory schema) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(schema, OPEN_ROLE, true));
    }

    function deployMockUSDC(address deployer) internal returns (address) {
        return address(new MockUSDC(deployer, deployer));
    }

    function deployCore(CoreArgs memory a) internal returns (Core memory c) {
        if (a.deployer == address(0) || a.treasury == address(0) || a.usdc == address(0)) revert ZeroAddress();
        if (!a.useRegistryGate && (a.eas == address(0) || a.verifier == address(0))) revert ZeroAddress();

        uint256 n = VM.getNonce(a.deployer);
        address gateA = VM.computeCreateAddress(a.deployer, n);
        address tableA = VM.computeCreateAddress(a.deployer, n + 1);
        address registryA = VM.computeCreateAddress(a.deployer, n + 2);
        address vaultA = VM.computeCreateAddress(a.deployer, n + 3);
        address implA = VM.computeCreateAddress(a.deployer, n + 4);
        address indexA = VM.computeCreateAddress(a.deployer, n + 5);
        address factoryA = VM.computeCreateAddress(a.deployer, n + 6);
        address saleA = VM.computeCreateAddress(a.deployer, n + 7);
        address bookA = VM.computeCreateAddress(a.deployer, n + 8);
        address rmA = VM.computeCreateAddress(a.deployer, n + 9);
        address panelA = VM.computeCreateAddress(a.deployer, n + 10);

        if (a.useRegistryGate) c.gate = address(new RegistryGate(a.deployer));
        else {
            address[] memory attesters = new address[](1);
            attesters[0] = a.verifier;
            c.gate = address(new EASGate(a.eas, a.schemaUid, attesters, a.deployer));
        }
        c.table = address(new ConversionTable(a.deployer));
        c.registry = address(new ProviderRegistry(gateA, rmA, a.deployer));
        c.vault = address(new BondVault(a.usdc, factoryA, rmA));
        c.tokenImpl = address(new CUToken());
        c.index = address(new PrintIndex(bookA, rmA, factoryA, a.deployer, a.index));
        c.factory = address(
            new SeriesFactory(
                registryA,
                tableA,
                vaultA,
                implA,
                saleA,
                rmA,
                gateA,
                a.usdc,
                a.deployer,
                a.bounds,
                a.allowOpenWindow,
                a.enforceCalendarMonth,
                a.leadTime
            )
        );
        c.sale = address(new PrimarySale(factoryA, a.usdc, gateA, a.treasury, a.primaryFeeBps, a.deployer));
        c.book = address(
            new OrderBook(factoryA, a.usdc, gateA, indexA, a.treasury, a.takerFeeBps, a.maxFillsPerTx, a.deployer)
        );
        c.redemption = address(new RedemptionManager(factoryA, vaultA, registryA, indexA, a.usdc, a.rulingWindow));
        c.panel = address(new PanelArbitrator(a.panel, a.panelThreshold, rmA, a.deployer));
        if (a.referenceFeed) c.feed = address(new ReferenceFeed(a.deployer, a.feedSigner, "synthetic demo data"));

        if (c.gate != gateA || c.factory != factoryA || c.book != bookA || c.redemption != rmA || c.panel != panelA) {
            revert DeployFailed("nonce");
        }

        SeriesFactory(c.factory).setOrderBook(c.book);
        SeriesFactory(c.factory).setArbitratorAllowed(c.panel, true);
    }

    /// @dev D-54: proposers are the Safe and W-ADMIN (or the admin EOA in allowlist mode). Executor is address(0).
    function deployTimelock(uint256 delay, address[] memory proposers) internal returns (address) {
        address[] memory executors = new address[](1);
        executors[0] = OPEN_ROLE;
        return address(new TimelockController(delay, proposers, executors, OPEN_ROLE));
    }

    function grantRoles(
        Core memory c,
        address usdc,
        address deployer,
        address timelock,
        address admin,
        address verifier,
        bool registryGate
    ) internal {
        address[] memory controlled = new address[](8);
        controlled[0] = c.gate;
        controlled[1] = c.table;
        controlled[2] = c.registry;
        controlled[3] = c.index;
        controlled[4] = c.factory;
        controlled[5] = c.sale;
        controlled[6] = c.book;
        controlled[7] = c.panel;
        for (uint256 i; i < controlled.length; ++i) {
            _grant(controlled[i], bytes32(0), timelock);
        }
        _grant(c.registry, keccak256("ADMIN_ROLE"), admin);
        _grant(c.index, keccak256("ADMIN_ROLE"), admin);
        _grant(c.factory, keccak256("PAUSER_ROLE"), admin);
        if (registryGate && verifier != address(0)) _grant(c.gate, keccak256("VERIFIER_ROLE"), verifier);
        if (c.feed != address(0)) _grant(c.feed, bytes32(0), timelock);
        for (uint256 i; i < controlled.length; ++i) {
            _renounce(controlled[i], deployer);
        }
        if (c.feed != address(0)) _renounce(c.feed, deployer);
        _grant(usdc, bytes32(0), timelock);
        _renounce(usdc, deployer);
    }

    function _grant(address target, bytes32 role, address account) private {
        (bool ok,) = target.call(abi.encodeWithSignature("grantRole(bytes32,address)", role, account));
        if (!ok) revert DeployFailed("grantRole");
    }

    function _renounce(address target, address deployer) private {
        (bool ok,) = target.call(abi.encodeWithSignature("renounceRole(bytes32,address)", bytes32(0), deployer));
        if (!ok) revert DeployFailed("renounceRole");
    }
}
