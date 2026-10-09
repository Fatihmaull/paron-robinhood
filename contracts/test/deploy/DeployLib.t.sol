// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Test} from "forge-std/Test.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {DeployLib} from "../../script/DeployLib.sol";
import {EASGate} from "../../src/gate/EASGate.sol";
import {MockUSDC} from "../../src/mocks/MockUSDC.sol";
import {ConversionTable} from "../../src/registry/ConversionTable.sol";
import {SeriesFactory} from "../../src/series/SeriesFactory.sol";
import {IndexParams, WindowBounds} from "../../src/libraries/ParonTypes.sol";
import {ParonConstants} from "../../src/libraries/ParonConstants.sol";

interface IRoles {
    function hasRole(bytes32 role, address account) external view returns (bool);
}

contract DeployLibTest is Test {
    function test_coreMatchesPlanAndOpensTheExecutor() public {
        address registry = DeployLib.deploySchemaRegistry();
        address eas = DeployLib.deployEAS(registry);
        (bytes32 participant, bytes32 kyb) = DeployLib.registerSchemas(registry);
        assertEq(participant, DeployLib.schemaUid(DeployLib.SCHEMA_PARTICIPANT));
        assertEq(kyb, DeployLib.schemaUid(DeployLib.SCHEMA_KYB));
        assertEq(participant, hex"58aa312e14d11b14c0739620c263f5785c00d6a6bb4f5bcc7a1a76ab4a67eee9");

        address usdc = DeployLib.deployMockUSDC(address(this));
        address verifier = makeAddr("verifier");
        address treasury = makeAddr("treasury");

        DeployLib.CoreArgs memory args;
        args.deployer = address(this);
        args.usdc = usdc;
        args.treasury = treasury;
        args.verifier = verifier;
        args.eas = eas;
        args.schemaUid = participant;
        args.panel = new address[](2);
        args.panel[0] = makeAddr("arb1");
        args.panel[1] = makeAddr("arb2");
        args.panelThreshold = 2;
        args.primaryFeeBps = 100;
        args.takerFeeBps = 15;
        args.maxFillsPerTx = 10;
        args.rulingWindow = 120;
        args.leadTime = 0;
        args.allowOpenWindow = true;
        args.enforceCalendarMonth = true;
        args.bounds = WindowBounds({
            minAck: 60, maxAck: 259_200, minDelivery: 60, maxDelivery: 604_800, minDispute: 90, maxDispute: 604_800
        });
        args.index = IndexParams({
            windowLength: 86_400, minVolume: 1e18, minParticipants: 2, maxCarryForward: 259_200
        });

        DeployLib.Core memory core = DeployLib.deployCore(args);
        assertEq(SeriesFactory(core.factory).orderBook(), core.book);
        assertTrue(SeriesFactory(core.factory).arbitratorAllowed(core.panel));
        assertTrue(EASGate(core.gate).trustedAttester(verifier));
        assertEq(ConversionTable(core.table).factorOf(keccak256("GB200-NVL72")), 35_000);

        address[] memory proposers = new address[](2);
        proposers[0] = makeAddr("safe");
        proposers[1] = makeAddr("admin");
        address timelock = DeployLib.deployTimelock(300, proposers);
        assertTrue(TimelockController(payable(timelock)).hasRole(keccak256("EXECUTOR_ROLE"), address(0)));
        assertTrue(TimelockController(payable(timelock)).hasRole(keccak256("PROPOSER_ROLE"), proposers[0]));

        DeployLib.grantRoles(core, usdc, address(this), timelock, proposers[1], verifier, false);
        bytes32 adminRole = bytes32(0);
        assertTrue(IRoles(core.factory).hasRole(adminRole, timelock));
        assertFalse(IRoles(core.factory).hasRole(adminRole, address(this)));
        assertTrue(IRoles(core.factory).hasRole(ParonConstants.PAUSER_ROLE, proposers[1]));
        assertTrue(IRoles(usdc).hasRole(adminRole, timelock));
        assertTrue(MockUSDC(usdc).hasRole(ParonConstants.MINTER_ROLE, address(this)));
        assertFalse(IRoles(usdc).hasRole(adminRole, address(this)));
    }
}
