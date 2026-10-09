import { db, publicClients } from "ponder:api";
import * as schema from "ponder:schema";
import { loadDeployment } from "../config/load.js";
import {
  syncOf,
  type BondRow,
  type ConfigRow,
  type DeliveryRow,
  type DisputeRow,
  type EventRow,
  type GpuFactorRow,
  type HoldingRow,
  type IndexParamsRow,
  type IndexRoundRow,
  type IndexStateRow,
  type KybRow,
  type LedgerRow,
  type OrderRow,
  type ParticipantRow,
  type PrintRow,
  type ProviderRow,
  type RedemptionRow,
  type ReferenceRow,
  type SeriesRow,
  type Snapshot,
  type TimelockRow,
} from "./snapshot.js";

async function rows<T>(table: unknown): Promise<T[]> {
  return (await db.select().from(table as never)) as T[];
}

/** Read the indexed tables into the snapshot the Hono routes query. */
export async function loadSnapshot(): Promise<Snapshot> {
  const deployment = loadDeployment();
  const [series, bonds, prints, orders, holdings, redemptions, disputes, providers, participants, indexStates, indexRounds, references, ledger, deliveries, gpuFactors, configChanges, kyb, events, timelocks, params] =
    await Promise.all([
      rows<SeriesRow>(schema.series),
      rows<BondRow>(schema.bond),
      rows<PrintRow>(schema.print),
      rows<OrderRow>(schema.order),
      rows<HoldingRow>(schema.holding),
      rows<RedemptionRow>(schema.redemption),
      rows<DisputeRow>(schema.dispute),
      rows<ProviderRow>(schema.provider),
      rows<ParticipantRow>(schema.participant),
      rows<IndexStateRow>(schema.indexState),
      rows<IndexRoundRow>(schema.indexRound),
      rows<ReferenceRow>(schema.referencePrice),
      rows<LedgerRow>(schema.ledgerEntry),
      rows<DeliveryRow>(schema.deliveryRecord),
      rows<GpuFactorRow>(schema.gpuFactor),
      rows<ConfigRow>(schema.configChange),
      rows<KybRow>(schema.kybApplication),
      rows<EventRow>(schema.eventLog),
      rows<TimelockRow>(schema.timelockOperation),
      rows<IndexParamsRow>(schema.indexParams),
    ]);

  let indexedBlock = 0n;
  let indexedAt = 0n;
  for (const event of events) {
    if (event.blockNumber > indexedBlock) indexedBlock = event.blockNumber;
    if (event.ts > indexedAt) indexedAt = event.ts;
  }

  // Ponder's own progress (GET /status). Events only exist where the contracts emitted, so on an
  // idle testnet the newest event block trails head forever and the API would stay "syncing".
  try {
    const res = await fetch(`http://127.0.0.1:${process.env.PORT || 42069}/status`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const status = (await res.json()) as Record<string, { block?: { number?: number; timestamp?: number } }>;
      const block = status[deployment.chainKey]?.block;
      if (block?.number && BigInt(block.number) > indexedBlock) indexedBlock = BigInt(block.number);
      if (block?.timestamp && BigInt(block.timestamp) > indexedAt) indexedAt = BigInt(block.timestamp);
    }
  } catch {
    // fall back to the newest event block
  }

  let headBlock: bigint | null = null;
  try {
    const clients = publicClients as unknown as Record<string, { getBlockNumber: () => Promise<bigint> }>;
    const client = clients[deployment.chainKey];
    if (client) headBlock = await client.getBlockNumber();
  } catch {
    headBlock = null;
  }

  const contractNames: Record<string, string> = {};
  for (const [name, ref] of Object.entries(deployment.contracts)) {
    contractNames[ref.address] = name;
  }

  return {
    chainId: deployment.chainId,
    chainKey: deployment.chainKey,
    explorerBase: deployment.explorerUrl,
    indexedBlock,
    indexedAt,
    headBlock,
    synced: syncOf(indexedBlock, headBlock),
    series,
    bonds,
    prints,
    orders,
    holdings,
    redemptions,
    disputes,
    providers,
    participants,
    indexStates,
    indexRounds,
    references,
    ledger,
    deliveries,
    gpuFactors,
    configChanges,
    kyb,
    events,
    timelocks,
    indexParams: params.find((row) => row.id === "current") ?? params[0] ?? null,
    contractNames,
  };
}
