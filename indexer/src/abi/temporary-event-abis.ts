/**
 * Paron ABIs are the JSON in `shared/abi`, copied into `./shared` so this
 * package still builds when Railway's root directory is `indexer`.
 * Refresh the copy with `node script/sync-shared-abi.mjs` from `indexer/`.
 *
 * EAS and TimelockController are not Paron contracts, so they are not in
 * `shared/abi`. The fragments below match eas-contracts 1.9.0 and
 * OpenZeppelin TimelockController 5.6.1.
 */
import { parseAbi, type Abi } from "viem";
import bondVaultJson from "./shared/BondVault.json";
import conversionTableJson from "./shared/ConversionTable.json";
import cuTokenJson from "./shared/CUToken.json";
import easGateJson from "./shared/EASGate.json";
import orderBookJson from "./shared/OrderBook.json";
import panelArbitratorJson from "./shared/PanelArbitrator.json";
import primarySaleJson from "./shared/PrimarySale.json";
import printIndexJson from "./shared/PrintIndex.json";
import providerRegistryJson from "./shared/ProviderRegistry.json";
import redemptionManagerJson from "./shared/RedemptionManager.json";
import referenceFeedJson from "./shared/ReferenceFeed.json";
import registryGateJson from "./shared/RegistryGate.json";
import seriesFactoryJson from "./shared/SeriesFactory.json";

export const seriesFactoryAbi = seriesFactoryJson as Abi;
export const providerRegistryAbi = providerRegistryJson as Abi;
export const conversionTableAbi = conversionTableJson as Abi;
export const bondVaultAbi = bondVaultJson as Abi;
export const primarySaleAbi = primarySaleJson as Abi;
export const orderBookAbi = orderBookJson as Abi;
export const redemptionManagerAbi = redemptionManagerJson as Abi;
export const panelArbitratorAbi = panelArbitratorJson as Abi;
export const printIndexAbi = printIndexJson as Abi;
export const referenceFeedAbi = referenceFeedJson as Abi;
export const easGateAbi = easGateJson as Abi;
export const registryGateAbi = registryGateJson as Abi;
export const cuTokenAbi = cuTokenJson as Abi;

const access = [
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
] as const;

export const easAbi = parseAbi([
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
  "event Revoked(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
  "function getAttestation(bytes32 uid) view returns ((bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))",
]);

export const timelockAbi = parseAbi([
  ...access,
  "event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)",
  "event CallSalt(bytes32 indexed id, bytes32 salt)",
  "event CallExecuted(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data)",
  "event Cancelled(bytes32 indexed id)",
  "event MinDelayChange(uint256 oldDuration, uint256 newDuration)",
]);
