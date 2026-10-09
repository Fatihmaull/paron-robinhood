import { ponder } from "ponder:registry";
import * as schema from "ponder:schema";
import type { Hex } from "viem";
import { easAbi } from "./abi/temporary-event-abis.js";
import { loadDeployment } from "./config/load.js";
import { applyLog, type ApplyContext, type IndexedLog } from "./handlers/apply.js";
import { PonderStore } from "./handlers/ponder-store.js";

const deployment = loadDeployment();

const applyContext = (): ApplyContext => ({
  chainId: deployment.chainId,
  redemptionManager: deployment.redemptionManager,
  orderBook: deployment.orderBook,
  treasury: deployment.treasury,
  participantSchema: deployment.participantSchema,
  kybSchema: deployment.kybSchema,
});

type IndexArgs = {
  event: {
    args: Record<string, unknown>;
    log: { address: Hex; logIndex: number };
    block: { number: bigint; timestamp: bigint };
    transaction: { hash: Hex; from: Hex; to: Hex | null };
  };
  context: {
    db: ConstructorParameters<typeof PonderStore>[0];
    client: {
      readContract: (args: {
        address: Hex;
        abi: typeof easAbi;
        functionName: "getAttestation";
        args: [Hex];
      }) => Promise<{ data: Hex; refUID: Hex }>;
    };
  };
};

/**
 * Ponder's `on` is generic over the config's event union. Registering the full
 * list through one helper keeps the reducer (`applyLog`) as the only handler.
 */
const on = ponder.on as unknown as (name: string, handler: (args: IndexArgs) => Promise<void>) => void;

const CONTRACTS: Record<string, readonly string[]> = {
  SeriesFactory: [
    "SeriesCreated",
    "PrimaryPriceRaised",
    "SeriesPaused",
    "SeriesUnpaused",
    "SeriesFinalized",
    "ArbitratorAllowlistUpdated",
    "GateUpdated",
    "RoleGranted",
    "RoleRevoked",
    "RoleAdminChanged",
  ],
  ProviderRegistry: ["ProviderRegistered", "ProviderStatusChanged", "ReputationUpdated", "RoleGranted", "RoleRevoked"],
  ConversionTable: ["FactorSet", "RoleGranted", "RoleRevoked"],
  BondVault: ["BondDeposited", "BondReleased", "BondSlashed", "BondFinalized", "BondWithdrawn", "RoleGranted", "RoleRevoked"],
  PrimarySale: ["PrimaryBuy", "TreasuryUpdated", "PrimaryFeeUpdated", "GateUpdated", "RoleGranted", "RoleRevoked"],
  OrderBook: ["OrderPlaced", "OrderCancelled", "Trade", "TakerFeeUpdated", "GateUpdated", "IndexUpdateFailed", "RoleGranted", "RoleRevoked"],
  RedemptionManager: [
    "RedemptionRequested",
    "Acknowledged",
    "Delivered",
    "Disputed",
    "RedemptionFinalized",
    "Defaulted",
    "Refunded",
    "Ruled",
    "RedemptionReopened",
    "IndexUpdateFailed",
    "RoleGranted",
    "RoleRevoked",
  ],
  PanelArbitrator: ["DisputeReceived", "RulingSubmitted", "PanelUpdated", "RoleGranted", "RoleRevoked"],
  PrintIndex: [
    "IndexUpdated",
    "IndexStatusChanged",
    "DeliveryRecorded",
    "DefaultRecorded",
    "IndexParamsUpdated",
    "PrintRecorded",
    "IndexUpdateFailed",
    "RoleGranted",
    "RoleRevoked",
  ],
  ReferenceFeed: ["ReferenceUpdated", "LabelUpdated", "RoleGranted", "RoleRevoked"],
  EASGate: ["AttestationLinked", "AttesterUpdated", "RoleGranted", "RoleRevoked"],
  RegistryGate: ["ParticipantSet", "ParticipantRevoked", "RoleGranted", "RoleRevoked"],
  EAS: ["Attested", "Revoked"],
  TimelockController: ["CallScheduled", "CallSalt", "CallExecuted", "Cancelled", "MinDelayChange", "RoleGranted", "RoleRevoked"],
  CUToken: ["Transfer"],
};

for (const [contractName, events] of Object.entries(CONTRACTS)) {
  for (const eventName of events) {
    on(`${contractName}:${eventName}`, async ({ event, context }) => {
      const args = { ...event.args };
      if ((eventName === "Attested" || eventName === "Revoked") && typeof args.data !== "string" && deployment.easAddress) {
        const attestation = await context.client.readContract({
          address: deployment.easAddress,
          abi: easAbi,
          functionName: "getAttestation",
          args: [String(args.uid) as Hex],
        });
        args.data = attestation.data;
        args.refUID = attestation.refUID;
      }
      const log: IndexedLog = {
        address: event.log.address.toLowerCase() as Hex,
        eventName,
        contractName,
        args,
        blockNumber: event.block.number,
        blockTimestamp: event.block.timestamp,
        txHash: event.transaction.hash.toLowerCase() as Hex,
        txFrom: event.transaction.from.toLowerCase() as Hex,
        txTo: event.transaction.to ? (event.transaction.to.toLowerCase() as Hex) : null,
        logIndex: event.log.logIndex,
      };
      await applyLog(new PonderStore(context.db, schema), applyContext(), log);
    });
  }
}
