import { ponder } from "ponder:registry";
import { CONTRACT_EVENTS } from "./config/events.js";
import * as schema from "ponder:schema";
import { createPublicClient, type Hex } from "viem";
import { easAbi } from "./abi/temporary-event-abis.js";
import { loadDeployment } from "./config/load.js";
import { applyLog, type ApplyContext, type IndexedLog } from "./handlers/apply.js";
import { PonderStore } from "./handlers/ponder-store.js";
import { indexerRpcTransport, withRpcRetry } from "./rpc/retry.js";

const deployment = loadDeployment();

// EAS attestations are read at "latest" through our own client. Public RPC nodes prune
// historical state, so a pinned eth_call at the event block throws and crashes the indexer.
// An attestation's data and refUID never change after creation, so latest is safe.
// Transport retries are off here; withRpcRetry owns the backoff so a flaky public RPC
// does not stack two retry loops. Backup URL is optional and may be unset.
const latestClient = createPublicClient({
  transport: indexerRpcTransport(deployment.rpcUrl, process.env.INDEXER_RPC_URL_BACKUP, 0),
});

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
 * Call it with `ponder` as `this`: the virtual registry pushes onto `this.fns`.
 */
const on = (ponder.on as unknown as (name: string, handler: (args: IndexArgs) => Promise<void>) => void).bind(
  ponder,
);


for (const [contractName, events] of Object.entries(CONTRACT_EVENTS)) {
  for (const eventName of events) {
    on(`${contractName}:${eventName}`, async ({ event, context }) => {
      const args = { ...event.args };
      const easAddress = deployment.easAddress;
      if ((eventName === "Attested" || eventName === "Revoked") && typeof args.data !== "string" && easAddress) {
        const attestation = await withRpcRetry(() =>
          latestClient.readContract({
            address: easAddress,
            abi: easAbi,
            functionName: "getAttestation",
            args: [String(args.uid) as Hex],
          }),
        );
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
