/**
 * TEMPORARY event ABIs.
 *
 * Derived from dev doc 01 (APPROVED) so this package typechecks before lane L1
 * publishes `shared/abi`. Replace this module with L1's export and delete the file.
 * Do not treat these strings as the contract source of truth.
 */
import { parseAbi } from "viem";

const access = [
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
] as const;

export const seriesFactoryAbi = parseAbi([
  ...access,
  "event SeriesCreated(uint256 indexed seriesId, address indexed provider, address indexed token, string symbol, bytes32 gpuModel, uint32 factor, uint64 gpuHours, uint256 maxSupply, uint256 primaryPrice, uint256 bondPerCU, uint64 windowStart, uint64 windowEnd, uint64 ackWindow, uint64 deliveryWindow, uint64 disputeWindow, uint256 minRedemption, address arbitrator, bytes32 specHash, bytes32 termsHash, bytes2 country, uint8 continent, bool institutional)",
  "event PrimaryPriceRaised(uint256 indexed seriesId, uint256 oldPrice, uint256 newPrice)",
  "event SeriesPaused(uint256 indexed seriesId)",
  "event SeriesUnpaused(uint256 indexed seriesId)",
  "event SeriesFinalized(uint256 indexed seriesId)",
  "event ArbitratorAllowlistUpdated(address indexed arbitrator, bool allowed)",
  "event GateUpdated(address indexed oldGate, address indexed newGate)",
]);

export const providerRegistryAbi = parseAbi([
  ...access,
  "event ProviderRegistered(address indexed provider, bytes32 entityId)",
  "event ProviderStatusChanged(address indexed provider, uint8 oldStatus, uint8 newStatus)",
  "event ReputationUpdated(address indexed provider, uint256 deliveredCU, uint256 defaultedCU, uint256 voluntaryDefaultedCU, uint32 disputesLost, uint32 strikes)",
]);

export const conversionTableAbi = parseAbi([
  ...access,
  "function setFactor(bytes32 gpuModel, uint32 factor)",
  "event FactorSet(bytes32 indexed gpuModel, uint32 oldFactor, uint32 newFactor)",
]);

export const bondVaultAbi = parseAbi([
  ...access,
  "event BondDeposited(uint256 indexed seriesId, address indexed provider, uint256 amount)",
  "event BondReleased(uint256 indexed seriesId, address indexed provider, uint256 amount, uint256 indexed reqId)",
  "event BondSlashed(uint256 indexed seriesId, address indexed recipient, uint256 amount, uint256 indexed reqId)",
  "event BondFinalized(uint256 indexed seriesId, uint256 balance)",
  "event BondWithdrawn(uint256 indexed seriesId, address indexed provider, uint256 amount)",
]);

export const primarySaleAbi = parseAbi([
  ...access,
  "event PrimaryBuy(uint256 indexed seriesId, address indexed buyer, uint256 qty, uint256 price, uint256 cost, uint256 fee)",
  "event TreasuryUpdated(address treasury)",
  "event PrimaryFeeUpdated(uint16 bps)",
  "event GateUpdated(address indexed oldGate, address indexed newGate)",
]);

export const orderBookAbi = parseAbi([
  ...access,
  "event OrderPlaced(uint256 indexed orderId, uint256 indexed seriesId, address indexed maker, uint8 side, uint256 price, uint256 qty)",
  "event OrderCancelled(uint256 indexed orderId)",
  "event Trade(uint256 indexed seriesId, uint256 indexed makerOrderId, address indexed taker, address maker, bytes32 makerEntity, bytes32 takerEntity, uint8 takerSide, uint256 cuPrice, uint256 qty, uint256 nativePrice, uint256 takerFee, bool eligible)",
  "event TakerFeeUpdated(uint16 bps)",
  "event GateUpdated(address indexed oldGate, address indexed newGate)",
  "event IndexUpdateFailed(bytes32 indexed gpuModel, uint256 indexed seriesId, uint256 refId)",
]);

export const redemptionManagerAbi = parseAbi([
  ...access,
  "event RedemptionRequested(uint256 indexed reqId, uint256 indexed seriesId, address indexed holder, uint256 amount, bytes32 deliveryRef, uint64 ackDeadline)",
  "event Acknowledged(uint256 indexed reqId, uint64 deliveryDeadline)",
  "event Delivered(uint256 indexed reqId, uint256 indexed seriesId, bytes32 receiptHash, uint64 disputeDeadline)",
  "event Disputed(uint256 indexed reqId, uint256 indexed seriesId, uint256 disputeBond, uint64 rulingDeadline)",
  "event RedemptionFinalized(uint256 indexed reqId, uint256 indexed seriesId, uint256 amount, uint256 bondReleased, bool auto_)",
  "event Defaulted(uint256 indexed reqId, uint256 indexed seriesId, address indexed holder, uint256 amount, uint256 payout, bool voluntary, bool viaDispute, address caller)",
  "event Refunded(uint256 indexed reqId, uint256 indexed seriesId, uint256 disputeBondReturned)",
  "event Ruled(uint256 indexed reqId, uint8 ruling)",
  "event RedemptionReopened(uint256 indexed oldReqId, uint256 indexed newReqId, uint256 indexed seriesId, uint64 ackDeadline)",
  "event IndexUpdateFailed(bytes32 indexed gpuModel, uint256 indexed seriesId, uint256 refId)",
]);

export const panelArbitratorAbi = parseAbi([
  ...access,
  "event DisputeReceived(uint256 indexed reqId, uint64 rulingDeadline)",
  "event RulingSubmitted(uint256 indexed reqId, uint8 outcome, address[] signers)",
  "event PanelUpdated(address[] members, uint8 threshold)",
]);

export const printIndexAbi = parseAbi([
  ...access,
  "event IndexUpdated(bytes32 indexed gpuModel, uint80 roundId, int256 answer, uint8 status)",
  "event IndexStatusChanged(bytes32 indexed gpuModel, uint8 oldStatus, uint8 newStatus)",
  "event DeliveryRecorded(bytes32 indexed gpuModel, uint256 cu)",
  "event DefaultRecorded(bytes32 indexed gpuModel, uint256 cu)",
  "event IndexParamsUpdated(uint64 windowLength, uint256 minVolume, uint32 minParticipants, uint64 maxCarryForward)",
  "event PrintRecorded(uint256 indexed seriesId, bytes32 indexed gpuModel, uint256 cuPrice, uint256 qty, bool eligible)",
  "event IndexUpdateFailed(bytes32 indexed gpuModel, uint256 indexed seriesId, uint256 refId)",
]);

export const referenceFeedAbi = parseAbi([
  ...access,
  "event ReferenceUpdated(bytes32 indexed gpuModel, int256 value, uint64 observedAt, uint80 roundId)",
  "event LabelUpdated(string label)",
]);

export const easGateAbi = parseAbi([
  ...access,
  "event AttestationLinked(address indexed account, bytes32 entityId, bytes32 uid)",
  "event AttesterUpdated(address indexed attester, bool trusted)",
]);

export const registryGateAbi = parseAbi([
  ...access,
  "event ParticipantSet(address indexed account, bytes32 entityId, uint8 role, bytes2 country, uint64 expiry)",
  "event ParticipantRevoked(address indexed account)",
]);

export const easAbi = parseAbi([
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
  "event Revoked(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
  "function getAttestation(bytes32 uid) view returns ((bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))",
]);

export const cuTokenAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

export const timelockAbi = parseAbi([
  ...access,
  "event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)",
  "event CallSalt(bytes32 indexed id, bytes32 salt)",
  "event CallExecuted(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data)",
  "event Cancelled(bytes32 indexed id)",
  "event MinDelayChange(uint256 oldDuration, uint256 newDuration)",
]);
