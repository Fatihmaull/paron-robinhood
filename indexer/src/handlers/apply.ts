import { decodeAbiParameters, type Hex } from "viem";
import {
  bytes2ToAscii,
  continentCode,
  deliveryWindowOf,
  formatFactor,
  lowerAddress,
  monthOf,
  mulDiv,
  nativeGpuHours,
  nativePrice,
  notionalUsdc,
} from "../domain/format.js";
import { shortOfModel } from "../domain/gpu.js";
import { accessRoleName } from "../domain/roles.js";
import { holdingKey, pairKey, type Store } from "../store/memory.js";

const ZERO = "0x0000000000000000000000000000000000000000" as const;
const ZERO_BYTES32 = `0x${"0".repeat(64)}` as Hex;

export type ApplyContext = {
  chainId: number;
  redemptionManager: Hex;
  orderBook: Hex;
  treasury: Hex;
  participantSchema: Hex | null;
  kybSchema: Hex | null;
};

export type IndexedLog = {
  address: Hex;
  eventName: string;
  contractName: string;
  args: Record<string, unknown>;
  blockNumber: bigint;
  blockTimestamp: bigint;
  txHash: Hex;
  txFrom: Hex;
  txTo: Hex | null;
  logIndex: number;
};

type SeriesRow = {
  seriesId: bigint;
  token: Hex;
  symbol: string;
  provider: Hex;
  gpuModel: Hex;
  gpu: string;
  factor: number;
  gpuHours: bigint;
  maxSupply: bigint;
  primaryPrice: bigint;
  bondPerCu: bigint;
  windowStart: bigint;
  windowEnd: bigint;
  deliveryWindow: string;
  ackWindow: bigint;
  deliveryWindowSecs: bigint;
  disputeWindow: bigint;
  minRedemption: bigint;
  arbitrator: Hex;
  specHash: Hex;
  termsHash: Hex;
  country: string;
  continent: string;
  institutional: boolean;
  paused: boolean;
  finalized: boolean;
  soldSupply: bigint;
  totalSupply: bigint;
  lockedSupply: bigint;
  lastPrice: bigint | null;
  createdAt: bigint;
  createdTx: Hex;
};

type BondRow = {
  seriesId: bigint;
  provider: Hex;
  deposited: bigint;
  balance: bigint;
  released: bigint;
  slashed: bigint;
  withdrawnAmount: bigint;
  finalized: boolean;
  withdrawn: boolean;
  updatedAt: bigint;
};

type PrintRow = {
  id: string;
  kind: string;
  seriesId: bigint;
  gpuModel: Hex;
  gpu: string;
  factor: number;
  cuPrice: bigint;
  nativePrice: bigint;
  qtyCu: bigint;
  nativeGpuHours: bigint;
  notional: bigint;
  fee: bigint;
  takerSide: string;
  maker: Hex;
  taker: Hex;
  makerEntity: Hex;
  takerEntity: Hex;
  eligible: boolean;
  ineligibleReason: string | null;
  indexStatus: string;
  thin: boolean;
  country: string;
  continent: string;
  deliveryWindow: string;
  blockNumber: bigint;
  ts: bigint;
  txHash: Hex;
  logIndex: number;
};

type OrderRow = {
  orderId: bigint;
  seriesId: bigint;
  maker: Hex;
  side: string;
  price: bigint;
  qtyInitial: bigint;
  qtyRemaining: bigint;
  status: string;
  createdAt: bigint;
  updatedAt: bigint;
  txHash: Hex;
};

type RedemptionRow = {
  reqId: bigint;
  seriesId: bigint;
  holder: Hex;
  provider: Hex;
  amount: bigint;
  claim: bigint;
  deliveryRef: Hex;
  receiptHash: Hex | null;
  state: string;
  requestedAt: bigint;
  ackDeadline: bigint;
  acknowledgedAt: bigint | null;
  deliveryDeadline: bigint | null;
  deliveredAt: bigint | null;
  disputeDeadline: bigint | null;
  disputedAt: bigint | null;
  rulingDeadline: bigint | null;
  resolvedAt: bigint | null;
  disputeBond: bigint | null;
  ruling: string | null;
  payout: bigint | null;
  bondReleased: bigint | null;
  voluntary: boolean | null;
  viaDispute: boolean | null;
  autoFinalized: boolean | null;
  defaultCaller: Hex | null;
  refundedAfterWindow: boolean | null;
  reopenedFromReqId: bigint | null;
  reopenedToReqId: bigint | null;
  updatedAt: bigint;
};

type ParticipantRow = {
  address: Hex;
  entityId: Hex;
  role: number;
  country: string;
  expiry: bigint;
  source: string;
  attestationUid: Hex | null;
  attester: Hex | null;
  txHash: Hex | null;
  revoked: boolean;
  updatedAt: bigint;
};

type IndexStateRow = {
  gpuModel: Hex;
  gpu: string;
  answer: bigint | null;
  roundId: bigint;
  status: string;
  lastOkAt: bigint | null;
  lastOkAnswer: bigint | null;
  deliveredCu: bigint;
  defaultedCu: bigint;
  updatedAt: bigint;
};

function addr(value: unknown): Hex {
  return lowerAddress(String(value));
}

function bi(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  return 0n;
}

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return Number(value);
}

function hex(value: unknown): Hex {
  return String(value).toLowerCase() as Hex;
}

function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) out[key] = jsonSafe(item);
    return out;
  }
  return value;
}

function providerStatus(value: number): string {
  return ["NONE", "ACTIVE", "SUSPENDED", "BANNED"][value] ?? "ACTIVE";
}

function indexStatus(value: number | string): string {
  if (typeof value === "string") return value;
  return ["OK", "THIN", "DISRUPTED"][value] ?? "THIN";
}

function takerSide(value: number): string {
  return value === 0 ? "BUY" : "SELL";
}

function orderSide(value: number): string {
  return value === 0 ? "BID" : "ASK";
}

function rulingName(value: number): string {
  return ["NONE", "DELIVERED", "NOT_DELIVERED"][value] ?? "NONE";
}

function emptyBond(seriesId: bigint, provider: Hex, ts: bigint): BondRow {
  return {
    seriesId,
    provider,
    deposited: 0n,
    balance: 0n,
    released: 0n,
    slashed: 0n,
    withdrawnAmount: 0n,
    finalized: false,
    withdrawn: false,
    updatedAt: ts,
  };
}

async function seriesOf(store: Store, seriesId: bigint): Promise<SeriesRow | undefined> {
  return store.get<SeriesRow>("series", seriesId.toString());
}

async function seriesByToken(store: Store, token: Hex): Promise<SeriesRow | undefined> {
  const rows = await store.list<SeriesRow>("series");
  return rows.find((row) => row.token === token);
}

async function currentIndexStatus(store: Store, gpuModel: Hex): Promise<string> {
  const row = await store.get<IndexStateRow>("index_state", gpuModel);
  return row?.status ?? "THIN";
}

async function participantEntity(store: Store, account: Hex): Promise<Hex> {
  const row = await store.get<ParticipantRow>("participant", account);
  if (!row || row.revoked) return ZERO_BYTES32;
  return row.entityId;
}

async function addHolding(store: Store, seriesId: bigint, account: Hex, delta: bigint, ts: bigint): Promise<void> {
  if (account === ZERO) return;
  const key = holdingKey(seriesId, account);
  const prev = await store.get<{ seriesId: bigint; account: Hex; balance: bigint; updatedAt: bigint }>("holding", key);
  await store.put("holding", key, {
    seriesId,
    account,
    balance: (prev?.balance ?? 0n) + delta,
    updatedAt: ts,
  });
}

async function putLedger(
  store: Store,
  log: IndexedLog,
  entry: {
    account: Hex;
    kind: string;
    seriesId: bigint | null;
    reqId: bigint | null;
    orderId: bigint | null;
    usdcDelta: bigint;
    cuDelta: bigint;
    counterparty: Hex;
  },
): Promise<void> {
  const id = `${log.txHash}-${log.logIndex}-${entry.account}-${entry.kind}`;
  await store.put("ledger_entry", id, {
    id,
    ...entry,
    ts: log.blockTimestamp,
    txHash: log.txHash,
    logIndex: log.logIndex,
  });
}

async function putConfig(
  store: Store,
  log: IndexedLog,
  args: Record<string, unknown>,
): Promise<void> {
  const id = `${log.txHash}-${log.logIndex}`;
  await store.put("config_change", id, {
    id,
    contract: log.contractName,
    contractAddress: log.address,
    event: log.eventName,
    args,
    ts: log.blockTimestamp,
    txHash: log.txHash,
    txFrom: log.txFrom,
    txTo: log.txTo,
    logIndex: log.logIndex,
  });
}

async function putEvent(store: Store, log: IndexedLog, seriesId: bigint | null, reqId: bigint | null): Promise<void> {
  const id = `${log.txHash}-${log.logIndex}`;
  await store.put("event_log", id, {
    id,
    contract: log.contractName,
    contractAddress: log.address,
    event: log.eventName,
    args: jsonSafe(log.args),
    seriesId,
    reqId,
    blockNumber: log.blockNumber,
    ts: log.blockTimestamp,
    txHash: log.txHash,
    txFrom: log.txFrom,
    logIndex: log.logIndex,
  });
}

function idsOf(args: Record<string, unknown>): { seriesId: bigint | null; reqId: bigint | null } {
  const seriesId = args.seriesId === undefined ? null : bi(args.seriesId);
  const reqId = args.reqId === undefined ? (args.oldReqId === undefined ? null : bi(args.oldReqId)) : bi(args.reqId);
  return { seriesId, reqId };
}

async function bumpDelivery(
  store: Store,
  series: SeriesRow,
  ts: bigint,
  delivered: bigint,
  defaulted: bigint,
  finalized: boolean,
): Promise<void> {
  const month = monthOf(ts);
  const key = pairKey(series.seriesId.toString(), month);
  const prev = await store.get<{
    seriesId: bigint;
    month: string;
    gpu: string;
    deliveredCu: bigint;
    deliveredGpuHours: bigint;
    defaultedCu: bigint;
    defaultCount: number;
    finalizedCount: number;
  }>("delivery_record", key);
  const deliveredCu = (prev?.deliveredCu ?? 0n) + delivered;
  const defaultedCu = (prev?.defaultedCu ?? 0n) + defaulted;
  await store.put("delivery_record", key, {
    seriesId: series.seriesId,
    month,
    gpu: series.gpu,
    deliveredCu,
    deliveredGpuHours: nativeGpuHours(deliveredCu, series.factor),
    defaultedCu,
    defaultCount: (prev?.defaultCount ?? 0) + (defaulted > 0n ? 1 : 0),
    finalizedCount: (prev?.finalizedCount ?? 0) + (finalized ? 1 : 0),
  });
}

export async function applyLog(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const args = log.args;
  const ts = log.blockTimestamp;
  switch (log.eventName) {
    case "SeriesCreated":
      await onSeriesCreated(store, log);
      break;
    case "PrimaryPriceRaised": {
      const series = await seriesOf(store, bi(args.seriesId));
      if (series) await store.put("series", series.seriesId.toString(), { ...series, primaryPrice: bi(args.newPrice) });
      break;
    }
    case "SeriesPaused":
    case "SeriesUnpaused": {
      const series = await seriesOf(store, bi(args.seriesId));
      if (series) {
        await store.put("series", series.seriesId.toString(), { ...series, paused: log.eventName === "SeriesPaused" });
      }
      await putConfig(store, log, { series_id: bi(args.seriesId).toString(), paused: log.eventName === "SeriesPaused" });
      break;
    }
    case "SeriesFinalized": {
      const series = await seriesOf(store, bi(args.seriesId));
      if (series) await store.put("series", series.seriesId.toString(), { ...series, finalized: true });
      break;
    }
    case "ArbitratorAllowlistUpdated":
      await putConfig(store, log, { arbitrator: addr(args.arbitrator), allowed: Boolean(args.allowed) });
      break;
    case "ProviderRegistered":
      await store.put("provider", addr(args.provider), {
        address: addr(args.provider),
        entityId: hex(args.entityId),
        status: "ACTIVE",
        deliveredCu: 0n,
        defaultedCu: 0n,
        voluntaryDefaultedCu: 0n,
        disputesLost: 0,
        strikes: 0,
        registeredAt: ts,
        updatedAt: ts,
      });
      break;
    case "ProviderStatusChanged": {
      const address = addr(args.provider);
      const row = await store.get<Record<string, unknown>>("provider", address);
      const status = providerStatus(num(args.newStatus));
      if (row) await store.put("provider", address, { ...row, status, updatedAt: ts });
      await putConfig(store, log, {
        provider: address,
        old_status: providerStatus(num(args.oldStatus)),
        new_status: status,
      });
      break;
    }
    case "ReputationUpdated": {
      const address = addr(args.provider);
      const row = await store.get<Record<string, unknown>>("provider", address);
      if (row) {
        await store.put("provider", address, {
          ...row,
          deliveredCu: bi(args.deliveredCU),
          defaultedCu: bi(args.defaultedCU),
          voluntaryDefaultedCu: bi(args.voluntaryDefaultedCU),
          disputesLost: num(args.disputesLost),
          strikes: num(args.strikes),
          updatedAt: ts,
        });
      }
      break;
    }
    case "FactorSet": {
      const gpuModel = hex(args.gpuModel);
      const name = shortOfModel(gpuModel) ?? "UNKNOWN";
      await store.put("gpu_factor", gpuModel, {
        gpuModel,
        name,
        factor: num(args.newFactor),
        updatedAt: ts,
      });
      await putConfig(store, log, {
        gpu: name,
        old_factor: formatFactor(num(args.oldFactor)),
        new_factor: formatFactor(num(args.newFactor)),
      });
      break;
    }
    case "BondDeposited":
      await onBondDeposited(store, log);
      break;
    case "BondReleased":
      await onBondReleased(store, ctx, log);
      break;
    case "BondSlashed":
      await onBondSlashed(store, log);
      break;
    case "BondFinalized": {
      const bond = await store.get<BondRow>("bond", bi(args.seriesId).toString());
      if (bond) await store.put("bond", bond.seriesId.toString(), { ...bond, finalized: true, updatedAt: ts });
      break;
    }
    case "BondWithdrawn": {
      const seriesId = bi(args.seriesId);
      const bond = await store.get<BondRow>("bond", seriesId.toString());
      const amount = bi(args.amount);
      if (bond) {
        await store.put("bond", seriesId.toString(), {
          ...bond,
          withdrawn: true,
          withdrawnAmount: amount,
          balance: 0n,
          updatedAt: ts,
        });
      }
      await putLedger(store, log, {
        account: addr(args.provider),
        kind: "BOND_WITHDRAW",
        seriesId,
        reqId: null,
        orderId: null,
        usdcDelta: amount,
        cuDelta: 0n,
        counterparty: ctx.treasury,
      });
      break;
    }
    case "PrimaryBuy":
      await onPrimaryBuy(store, ctx, log);
      break;
    case "OrderPlaced":
      await onOrderPlaced(store, log);
      break;
    case "OrderCancelled": {
      const order = await store.get<OrderRow>("order", bi(args.orderId).toString());
      if (order) {
        await store.put("order", order.orderId.toString(), {
          ...order,
          qtyRemaining: 0n,
          status: "CANCELLED",
          updatedAt: ts,
          txHash: log.txHash,
        });
      }
      break;
    }
    case "Trade":
      await onTrade(store, ctx, log);
      break;
    case "RedemptionRequested":
      await onRedemptionRequested(store, ctx, log);
      break;
    case "Acknowledged":
      await patchRedemption(store, bi(args.reqId), {
        state: "ACKNOWLEDGED",
        acknowledgedAt: ts,
        deliveryDeadline: bi(args.deliveryDeadline),
        updatedAt: ts,
      });
      break;
    case "Delivered":
      await patchRedemption(store, bi(args.reqId), {
        state: "DELIVERED",
        receiptHash: hex(args.receiptHash),
        deliveredAt: ts,
        disputeDeadline: bi(args.disputeDeadline),
        updatedAt: ts,
      });
      break;
    case "Disputed":
      await onDisputed(store, ctx, log);
      break;
    case "RedemptionFinalized":
      await onFinalized(store, log);
      break;
    case "Defaulted":
      await onDefaulted(store, log);
      break;
    case "Refunded":
      await onRefunded(store, ctx, log);
      break;
    case "Ruled":
      await onRuled(store, log);
      break;
    case "RedemptionReopened":
      await onReopened(store, log);
      break;
    case "DisputeReceived": {
      const reqId = bi(args.reqId);
      const row = await store.get<Record<string, unknown>>("dispute", reqId.toString());
      if (row) await store.put("dispute", reqId.toString(), { ...row, rulingDeadline: bi(args.rulingDeadline) });
      break;
    }
    case "RulingSubmitted": {
      const reqId = bi(args.reqId);
      const row = await store.get<Record<string, unknown>>("dispute", reqId.toString());
      const signers = Array.isArray(args.signers) ? (args.signers as unknown[]).map((item) => addr(item)) : [];
      if (row) {
        await store.put("dispute", reqId.toString(), {
          ...row,
          ruling: rulingName(num(args.ruling)),
          signers,
          ruledAt: ts,
        });
      }
      break;
    }
    case "PanelUpdated":
      await putConfig(store, log, {
        members: Array.isArray(args.members) ? (args.members as unknown[]).map((item) => addr(item)) : [],
        threshold: num(args.threshold),
      });
      break;
    case "IndexUpdated":
      await onIndexUpdated(store, log);
      break;
    case "IndexStatusChanged":
      await onIndexStatus(store, log);
      break;
    case "DeliveryRecorded":
    case "DefaultRecorded":
      await onIndexCounter(store, log);
      break;
    case "IndexParamsUpdated":
      await onIndexParams(store, log);
      break;
    case "ReferenceUpdated":
      await onReference(store, log);
      break;
    case "LabelUpdated":
      await putConfig(store, log, { label: String(args.label ?? args[0] ?? "") });
      break;
    case "AttestationLinked":
      await onAttestationLinked(store, log);
      break;
    case "AttesterUpdated":
      await putConfig(store, log, { attester: addr(args.attester), trusted: Boolean(args.trusted) });
      break;
    case "ParticipantSet":
      await onParticipantSet(store, log);
      break;
    case "ParticipantRevoked": {
      const account = addr(args.account);
      const row = await store.get<ParticipantRow>("participant", account);
      if (row) await store.put("participant", account, { ...row, revoked: true, updatedAt: ts });
      break;
    }
    case "Attested":
      await onAttested(store, ctx, log);
      break;
    case "Revoked":
      await onRevoked(store, ctx, log);
      break;
    case "Transfer":
      await onTransfer(store, ctx, log);
      break;
    case "TakerFeeUpdated":
    case "PrimaryFeeUpdated":
      await putConfig(store, log, { bps: num(args.bps ?? args[0]) });
      break;
    case "TreasuryUpdated":
      await putConfig(store, log, { treasury: addr(args.treasury ?? args[0]) });
      break;
    case "GateUpdated":
      await putConfig(store, log, { old_gate: addr(args.oldGate), new_gate: addr(args.newGate) });
      break;
    case "CallScheduled":
      await onCallScheduled(store, log);
      break;
    case "CallSalt":
      await onCallSalt(store, log);
      break;
    case "CallExecuted":
      await onCallExecuted(store, log);
      break;
    case "Cancelled":
      await onCancelled(store, log);
      break;
    case "MinDelayChange":
      await putConfig(store, log, {
        old_delay_s: bi(args.oldDuration).toString(),
        new_delay_s: bi(args.newDuration).toString(),
      });
      break;
    case "RoleGranted":
    case "RoleRevoked":
      await onRole(store, log);
      break;
    case "RoleAdminChanged":
      await putConfig(store, log, {
        role: hex(args.role),
        previous_admin: hex(args.previousAdminRole),
        new_admin: hex(args.newAdminRole),
      });
      break;
    case "IndexUpdateFailed":
      await putConfig(store, log, {
        gpu_model: hex(args.gpuModel),
        series_id: bi(args.seriesId).toString(),
        ref_id: bi(args.refId).toString(),
      });
      break;
    case "PrintRecorded":
    case "FaucetDrip":
      break;
    default:
      break;
  }

  if (log.eventName !== "FaucetDrip" && log.eventName !== "PrintRecorded") {
    const ids = idsOf(args);
    await putEvent(store, log, ids.seriesId, ids.reqId);
  }
}

async function onSeriesCreated(store: Store, log: IndexedLog): Promise<void> {
  const args = log.args;
  const seriesId = bi(args.seriesId);
  const gpuModel = hex(args.gpuModel);
  const gpu = shortOfModel(gpuModel) ?? "UNKNOWN";
  const windowStart = bi(args.windowStart);
  const row: SeriesRow = {
    seriesId,
    token: addr(args.token),
    symbol: String(args.symbol),
    provider: addr(args.provider),
    gpuModel,
    gpu,
    factor: num(args.factor),
    gpuHours: bi(args.gpuHours),
    maxSupply: bi(args.maxSupply),
    primaryPrice: bi(args.primaryPrice),
    bondPerCu: bi(args.bondPerCU),
    windowStart,
    windowEnd: bi(args.windowEnd),
    deliveryWindow: deliveryWindowOf(windowStart),
    ackWindow: bi(args.ackWindow),
    deliveryWindowSecs: bi(args.deliveryWindow),
    disputeWindow: bi(args.disputeWindow),
    minRedemption: bi(args.minRedemption),
    arbitrator: addr(args.arbitrator),
    specHash: hex(args.specHash),
    termsHash: hex(args.termsHash),
    country: bytes2ToAscii(hex(args.country)),
    continent: continentCode(num(args.continent)),
    institutional: Boolean(args.institutional),
    paused: false,
    finalized: false,
    soldSupply: 0n,
    totalSupply: 0n,
    lockedSupply: 0n,
    lastPrice: null,
    createdAt: log.blockTimestamp,
    createdTx: log.txHash,
  };
  await store.put("series", seriesId.toString(), row);
  const existing = await store.get<BondRow>("bond", seriesId.toString());
  if (!existing) await store.put("bond", seriesId.toString(), emptyBond(seriesId, row.provider, log.blockTimestamp));
}

async function onBondDeposited(store: Store, log: IndexedLog): Promise<void> {
  const seriesId = bi(log.args.seriesId);
  const provider = addr(log.args.provider);
  const amount = bi(log.args.amount);
  const prev = (await store.get<BondRow>("bond", seriesId.toString())) ?? emptyBond(seriesId, provider, log.blockTimestamp);
  await store.put("bond", seriesId.toString(), {
    ...prev,
    provider,
    deposited: prev.deposited + amount,
    balance: prev.balance + amount,
    updatedAt: log.blockTimestamp,
  });
  await putLedger(store, log, {
    account: provider,
    kind: "BOND_DEPOSIT",
    seriesId,
    reqId: null,
    orderId: null,
    usdcDelta: -amount,
    cuDelta: 0n,
    counterparty: log.address,
  });
}

async function onBondReleased(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const seriesId = bi(log.args.seriesId);
  const amount = bi(log.args.amount);
  const reqId = bi(log.args.reqId);
  const bond = await store.get<BondRow>("bond", seriesId.toString());
  if (bond) {
    await store.put("bond", seriesId.toString(), {
      ...bond,
      balance: bond.balance - amount,
      released: bond.released + amount,
      updatedAt: log.blockTimestamp,
    });
  }
  const provider = bond?.provider ?? addr(log.args.provider);
  await putLedger(store, log, {
    account: provider,
    kind: "BOND_RELEASE",
    seriesId,
    reqId,
    orderId: null,
    usdcDelta: amount,
    cuDelta: 0n,
    counterparty: ctx.redemptionManager === ZERO ? log.address : log.address,
  });
}

async function onBondSlashed(store: Store, log: IndexedLog): Promise<void> {
  const seriesId = bi(log.args.seriesId);
  const amount = bi(log.args.amount);
  const reqId = bi(log.args.reqId);
  const bond = await store.get<BondRow>("bond", seriesId.toString());
  if (bond) {
    await store.put("bond", seriesId.toString(), {
      ...bond,
      balance: bond.balance - amount,
      slashed: bond.slashed + amount,
      updatedAt: log.blockTimestamp,
    });
  }
  if (bond) {
    await putLedger(store, log, {
      account: bond.provider,
      kind: "BOND_SLASHED",
      seriesId,
      reqId,
      orderId: null,
      usdcDelta: 0n,
      cuDelta: 0n,
      counterparty: addr(log.args.recipient),
    });
  }
}

async function onPrimaryBuy(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const seriesId = bi(log.args.seriesId);
  const series = await seriesOf(store, seriesId);
  if (!series) return;
  const qty = bi(log.args.qty);
  const price = bi(log.args.price);
  const fee = bi(log.args.fee);
  const cost = bi(log.args.cost);
  const buyer = addr(log.args.buyer);
  const status = await currentIndexStatus(store, series.gpuModel);
  const native = nativePrice(price, series.factor);
  const id = `${ctx.chainId}-${log.txHash}-${log.logIndex}`;
  const print: PrintRow = {
    id,
    kind: "PRIMARY",
    seriesId,
    gpuModel: series.gpuModel,
    gpu: series.gpu,
    factor: series.factor,
    cuPrice: price,
    nativePrice: native,
    qtyCu: qty,
    nativeGpuHours: nativeGpuHours(qty, series.factor),
    notional: cost,
    fee,
    takerSide: "BUY",
    maker: series.provider,
    taker: buyer,
    makerEntity: await participantEntity(store, series.provider),
    takerEntity: await participantEntity(store, buyer),
    eligible: false,
    ineligibleReason: "PRIMARY",
    indexStatus: status,
    thin: status !== "OK",
    country: series.country,
    continent: series.continent,
    deliveryWindow: series.deliveryWindow,
    blockNumber: log.blockNumber,
    ts: log.blockTimestamp,
    txHash: log.txHash,
    logIndex: log.logIndex,
  };
  await store.put("print", id, print);
  await store.put("series", seriesId.toString(), { ...series, soldSupply: series.soldSupply + qty });
  await putLedger(store, log, {
    account: buyer,
    kind: "PRIMARY_BUY",
    seriesId,
    reqId: null,
    orderId: null,
    usdcDelta: -cost,
    cuDelta: qty,
    counterparty: series.provider,
  });
  await putLedger(store, log, {
    account: series.provider,
    kind: "PRIMARY_PROCEEDS",
    seriesId,
    reqId: null,
    orderId: null,
    usdcDelta: cost,
    cuDelta: 0n,
    counterparty: buyer,
  });
  await putLedger(store, log, {
    account: series.provider,
    kind: "FEE_PAID",
    seriesId,
    reqId: null,
    orderId: null,
    usdcDelta: -fee,
    cuDelta: 0n,
    counterparty: ctx.treasury,
  });
  await putLedger(store, log, {
    account: ctx.treasury,
    kind: "FEE_RECEIVED",
    seriesId,
    reqId: null,
    orderId: null,
    usdcDelta: fee,
    cuDelta: 0n,
    counterparty: series.provider,
  });
}

async function onOrderPlaced(store: Store, log: IndexedLog): Promise<void> {
  const orderId = bi(log.args.orderId);
  const qty = bi(log.args.qty);
  await store.put("order", orderId.toString(), {
    orderId,
    seriesId: bi(log.args.seriesId),
    maker: addr(log.args.maker),
    side: orderSide(num(log.args.side)),
    price: bi(log.args.price),
    qtyInitial: qty,
    qtyRemaining: qty,
    status: "OPEN",
    createdAt: log.blockTimestamp,
    updatedAt: log.blockTimestamp,
    txHash: log.txHash,
  } satisfies OrderRow);
}

async function onTrade(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const seriesId = bi(log.args.seriesId);
  const series = await seriesOf(store, seriesId);
  if (!series) return;
  const qty = bi(log.args.qty);
  const cuPrice = bi(log.args.cuPrice);
  const fee = bi(log.args.takerFee);
  const maker = addr(log.args.maker);
  const taker = addr(log.args.taker);
  const side = takerSide(num(log.args.takerSide));
  const eligible = Boolean(log.args.eligible);
  const makerEntity = hex(log.args.makerEntity);
  const takerEntity = hex(log.args.takerEntity);
  const status = await currentIndexStatus(store, series.gpuModel);
  const notional = notionalUsdc(qty, cuPrice);
  let reason: string | null = null;
  if (!eligible) {
    reason = makerEntity === ZERO_BYTES32 || takerEntity === ZERO_BYTES32 ? "UNVERIFIED" : "SAME_ENTITY";
  }
  const id = `${ctx.chainId}-${log.txHash}-${log.logIndex}`;
  const row: PrintRow = {
    id,
    kind: "TRADE",
    seriesId,
    gpuModel: series.gpuModel,
    gpu: series.gpu,
    factor: series.factor,
    cuPrice,
    nativePrice: log.args.nativePrice === undefined ? nativePrice(cuPrice, series.factor) : bi(log.args.nativePrice),
    qtyCu: qty,
    nativeGpuHours: nativeGpuHours(qty, series.factor),
    notional,
    fee,
    takerSide: side,
    maker,
    taker,
    makerEntity,
    takerEntity,
    eligible,
    ineligibleReason: reason,
    indexStatus: status,
    thin: status !== "OK",
    country: series.country,
    continent: series.continent,
    deliveryWindow: series.deliveryWindow,
    blockNumber: log.blockNumber,
    ts: log.blockTimestamp,
    txHash: log.txHash,
    logIndex: log.logIndex,
  };
  await store.put("print", id, row);
  await store.put("series", seriesId.toString(), { ...series, lastPrice: cuPrice });
  const makerOrderId = bi(log.args.makerOrderId);
  const order = await store.get<OrderRow>("order", makerOrderId.toString());
  if (order) {
    const qtyRemaining = order.qtyRemaining > qty ? order.qtyRemaining - qty : 0n;
    await store.put("order", order.orderId.toString(), {
      ...order,
      qtyRemaining,
      status: qtyRemaining === 0n ? "FILLED" : "PARTIAL",
      updatedAt: log.blockTimestamp,
      txHash: log.txHash,
    });
  }
  const takerIsBuy = side === "BUY";
  const buyer = takerIsBuy ? taker : maker;
  const seller = takerIsBuy ? maker : taker;
  await putLedger(store, log, {
    account: buyer,
    kind: "TRADE_BUY",
    seriesId,
    reqId: null,
    orderId: makerOrderId,
    usdcDelta: -notional,
    cuDelta: qty,
    counterparty: seller,
  });
  await putLedger(store, log, {
    account: seller,
    kind: "TRADE_SELL",
    seriesId,
    reqId: null,
    orderId: makerOrderId,
    usdcDelta: notional,
    cuDelta: -qty,
    counterparty: buyer,
  });
  await putLedger(store, log, {
    account: taker,
    kind: "FEE_PAID",
    seriesId,
    reqId: null,
    orderId: makerOrderId,
    usdcDelta: -fee,
    cuDelta: 0n,
    counterparty: ctx.treasury,
  });
  await putLedger(store, log, {
    account: ctx.treasury,
    kind: "FEE_RECEIVED",
    seriesId,
    reqId: null,
    orderId: makerOrderId,
    usdcDelta: fee,
    cuDelta: 0n,
    counterparty: taker,
  });
}

async function onRedemptionRequested(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const series = await seriesOf(store, bi(log.args.seriesId));
  if (!series) return;
  const amount = bi(log.args.amount);
  const reqId = bi(log.args.reqId);
  const holder = addr(log.args.holder);
  const row: RedemptionRow = {
    reqId,
    seriesId: series.seriesId,
    holder,
    provider: series.provider,
    amount,
    claim: mulDiv(series.bondPerCu, amount, 10n ** 18n),
    deliveryRef: hex(log.args.deliveryRef),
    receiptHash: null,
    state: "REQUESTED",
    requestedAt: log.blockTimestamp,
    ackDeadline: bi(log.args.ackDeadline),
    acknowledgedAt: null,
    deliveryDeadline: null,
    deliveredAt: null,
    disputeDeadline: null,
    disputedAt: null,
    rulingDeadline: null,
    resolvedAt: null,
    disputeBond: null,
    ruling: null,
    payout: null,
    bondReleased: null,
    voluntary: null,
    viaDispute: null,
    autoFinalized: null,
    defaultCaller: null,
    refundedAfterWindow: null,
    reopenedFromReqId: null,
    reopenedToReqId: null,
    updatedAt: log.blockTimestamp,
  };
  await store.put("redemption", reqId.toString(), row);
  await putLedger(store, log, {
    account: holder,
    kind: "REDEMPTION_LOCK",
    seriesId: series.seriesId,
    reqId,
    orderId: null,
    usdcDelta: 0n,
    cuDelta: -amount,
    counterparty: ctx.redemptionManager,
  });
}

async function patchRedemption(store: Store, reqId: bigint, patch: Partial<RedemptionRow>): Promise<void> {
  const row = await store.get<RedemptionRow>("redemption", reqId.toString());
  if (!row) return;
  await store.put("redemption", reqId.toString(), { ...row, ...patch });
}

async function onDisputed(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const reqId = bi(log.args.reqId);
  const bond = bi(log.args.disputeBond);
  const row = await store.get<RedemptionRow>("redemption", reqId.toString());
  if (!row) return;
  await store.put("redemption", reqId.toString(), {
    ...row,
    state: "DISPUTED",
    disputeBond: bond,
    disputedAt: log.blockTimestamp,
    rulingDeadline: bi(log.args.rulingDeadline),
    updatedAt: log.blockTimestamp,
  });
  const series = await seriesOf(store, row.seriesId);
  await store.put("dispute", reqId.toString(), {
    reqId,
    arbitrator: series?.arbitrator ?? ZERO,
    disputeBond: bond,
    rulingDeadline: bi(log.args.rulingDeadline),
    ruling: null,
    signers: [],
    openedAt: log.blockTimestamp,
    ruledAt: null,
  });
  await putLedger(store, log, {
    account: row.holder,
    kind: "DISPUTE_BOND_PAID",
    seriesId: row.seriesId,
    reqId,
    orderId: null,
    usdcDelta: -bond,
    cuDelta: 0n,
    counterparty: ctx.redemptionManager,
  });
}

async function onFinalized(store: Store, log: IndexedLog): Promise<void> {
  const reqId = bi(log.args.reqId);
  const row = await store.get<RedemptionRow>("redemption", reqId.toString());
  if (!row) return;
  const released = bi(log.args.bondReleased);
  await store.put("redemption", reqId.toString(), {
    ...row,
    state: "FINALIZED",
    bondReleased: released,
    autoFinalized: Boolean(log.args.auto_),
    resolvedAt: log.blockTimestamp,
    updatedAt: log.blockTimestamp,
  });
  const series = await seriesOf(store, row.seriesId);
  if (series) await bumpDelivery(store, series, log.blockTimestamp, row.amount, 0n, true);
  await putLedger(store, log, {
    account: row.holder,
    kind: "REDEMPTION_BURN",
    seriesId: row.seriesId,
    reqId,
    orderId: null,
    usdcDelta: 0n,
    cuDelta: 0n,
    counterparty: row.provider,
  });
}

async function onDefaulted(store: Store, log: IndexedLog): Promise<void> {
  const reqId = bi(log.args.reqId);
  const row = await store.get<RedemptionRow>("redemption", reqId.toString());
  if (!row) return;
  const payout = bi(log.args.payout);
  await store.put("redemption", reqId.toString(), {
    ...row,
    state: "DEFAULTED",
    payout,
    voluntary: Boolean(log.args.voluntary),
    viaDispute: Boolean(log.args.viaDispute),
    defaultCaller: addr(log.args.caller),
    resolvedAt: log.blockTimestamp,
    updatedAt: log.blockTimestamp,
  });
  const series = await seriesOf(store, row.seriesId);
  if (series) await bumpDelivery(store, series, log.blockTimestamp, 0n, row.amount, false);
  await putLedger(store, log, {
    account: row.holder,
    kind: "DEFAULT_PAYOUT",
    seriesId: row.seriesId,
    reqId,
    orderId: null,
    usdcDelta: payout,
    cuDelta: 0n,
    counterparty: row.provider,
  });
  await putLedger(store, log, {
    account: row.holder,
    kind: "REDEMPTION_BURN",
    seriesId: row.seriesId,
    reqId,
    orderId: null,
    usdcDelta: 0n,
    cuDelta: 0n,
    counterparty: row.provider,
  });
}

async function onRefunded(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const reqId = bi(log.args.reqId);
  const row = await store.get<RedemptionRow>("redemption", reqId.toString());
  if (!row) return;
  const series = await seriesOf(store, row.seriesId);
  const afterWindow = series ? log.blockTimestamp >= series.windowEnd : false;
  const returned = bi(log.args.disputeBondReturned);
  await store.put("redemption", reqId.toString(), {
    ...row,
    state: "REFUNDED",
    refundedAfterWindow: afterWindow,
    resolvedAt: log.blockTimestamp,
    updatedAt: log.blockTimestamp,
  });
  const dispute = await store.get<Record<string, unknown>>("dispute", reqId.toString());
  if (dispute) await store.put("dispute", reqId.toString(), { ...dispute, ruling: dispute.ruling ?? null });
  await putLedger(store, log, {
    account: row.holder,
    kind: "REDEMPTION_UNLOCK",
    seriesId: row.seriesId,
    reqId,
    orderId: null,
    usdcDelta: 0n,
    cuDelta: row.amount,
    counterparty: ctx.redemptionManager,
  });
  if (returned > 0n) {
    await putLedger(store, log, {
      account: row.holder,
      kind: "DISPUTE_BOND_RETURNED",
      seriesId: row.seriesId,
      reqId,
      orderId: null,
      usdcDelta: returned,
      cuDelta: 0n,
      counterparty: ctx.redemptionManager,
    });
  }
}

async function onRuled(store: Store, log: IndexedLog): Promise<void> {
  const reqId = bi(log.args.reqId);
  const ruling = rulingName(num(log.args.ruling));
  const row = await store.get<RedemptionRow>("redemption", reqId.toString());
  if (row) {
    await store.put("redemption", reqId.toString(), { ...row, ruling, updatedAt: log.blockTimestamp });
    const bond = row.disputeBond ?? 0n;
    if (ruling === "DELIVERED" && bond > 0n) {
      await putLedger(store, log, {
        account: row.holder,
        kind: "DISPUTE_BOND_FORFEITED",
        seriesId: row.seriesId,
        reqId,
        orderId: null,
        usdcDelta: -bond,
        cuDelta: 0n,
        counterparty: row.provider,
      });
      await putLedger(store, log, {
        account: row.provider,
        kind: "DISPUTE_BOND_AWARDED",
        seriesId: row.seriesId,
        reqId,
        orderId: null,
        usdcDelta: bond,
        cuDelta: 0n,
        counterparty: row.holder,
      });
    }
    if (ruling === "NOT_DELIVERED" && bond > 0n) {
      await putLedger(store, log, {
        account: row.holder,
        kind: "DISPUTE_BOND_RETURNED",
        seriesId: row.seriesId,
        reqId,
        orderId: null,
        usdcDelta: bond,
        cuDelta: 0n,
        counterparty: addr(log.args.arbitrator),
      });
    }
  }
  const dispute = await store.get<Record<string, unknown>>("dispute", reqId.toString());
  if (dispute) await store.put("dispute", reqId.toString(), { ...dispute, ruling, ruledAt: log.blockTimestamp });
}

async function onReopened(store: Store, log: IndexedLog): Promise<void> {
  const oldReqId = bi(log.args.oldReqId);
  const newReqId = bi(log.args.newReqId);
  const oldRow = await store.get<RedemptionRow>("redemption", oldReqId.toString());
  const newRow = await store.get<RedemptionRow>("redemption", newReqId.toString());
  if (oldRow) {
    await store.put("redemption", oldReqId.toString(), { ...oldRow, reopenedToReqId: newReqId, updatedAt: log.blockTimestamp });
  }
  if (newRow) {
    await store.put("redemption", newReqId.toString(), { ...newRow, reopenedFromReqId: oldReqId, updatedAt: log.blockTimestamp });
  }
  const ledgers = await store.list<{ id: string; txHash: Hex; reqId: bigint | null; kind: string }>("ledger_entry");
  for (const entry of ledgers) {
    if (entry.txHash === log.txHash && entry.reqId === oldReqId && entry.kind === "REDEMPTION_UNLOCK") {
      await store.delete("ledger_entry", entry.id);
    }
  }
}

async function onIndexUpdated(store: Store, log: IndexedLog): Promise<void> {
  const gpuModel = hex(log.args.gpuModel);
  const status = indexStatus(num(log.args.status));
  const answer = bi(log.args.answer);
  const prev = await store.get<IndexStateRow>("index_state", gpuModel);
  const ok = status === "OK";
  const row: IndexStateRow = {
    gpuModel,
    gpu: shortOfModel(gpuModel) ?? prev?.gpu ?? "UNKNOWN",
    answer,
    roundId: bi(log.args.roundId),
    status,
    lastOkAt: ok ? log.blockTimestamp : (prev?.lastOkAt ?? null),
    lastOkAnswer: ok ? answer : (prev?.lastOkAnswer ?? null),
    deliveredCu: prev?.deliveredCu ?? 0n,
    defaultedCu: prev?.defaultedCu ?? 0n,
    updatedAt: log.blockTimestamp,
  };
  await store.put("index_state", gpuModel, row);
  await store.put("index_round", pairKey(gpuModel, row.roundId.toString()), {
    gpuModel,
    roundId: row.roundId,
    answer,
    status,
    ts: log.blockTimestamp,
  });
  const prints = await store.list<PrintRow>("print");
  for (const item of prints) {
    if (item.txHash === log.txHash && item.gpuModel === gpuModel) {
      await store.put("print", item.id, { ...item, indexStatus: status, thin: status !== "OK" });
    }
  }
}

async function onIndexStatus(store: Store, log: IndexedLog): Promise<void> {
  const gpuModel = hex(log.args.gpuModel);
  const status = indexStatus(num(log.args.newStatus));
  const prev = await store.get<IndexStateRow>("index_state", gpuModel);
  const base: IndexStateRow = prev ?? {
    gpuModel,
    gpu: shortOfModel(gpuModel) ?? "UNKNOWN",
    answer: null,
    roundId: 0n,
    status,
    lastOkAt: null,
    lastOkAnswer: null,
    deliveredCu: 0n,
    defaultedCu: 0n,
    updatedAt: log.blockTimestamp,
  };
  await store.put("index_state", gpuModel, {
    ...base,
    status,
    lastOkAt: status === "OK" ? log.blockTimestamp : base.lastOkAt,
    updatedAt: log.blockTimestamp,
  });
}

async function onIndexCounter(store: Store, log: IndexedLog): Promise<void> {
  const gpuModel = hex(log.args.gpuModel);
  const prev = await store.get<IndexStateRow>("index_state", gpuModel);
  const base: IndexStateRow = prev ?? {
    gpuModel,
    gpu: shortOfModel(gpuModel) ?? "UNKNOWN",
    answer: null,
    roundId: 0n,
    status: "THIN",
    lastOkAt: null,
    lastOkAnswer: null,
    deliveredCu: 0n,
    defaultedCu: 0n,
    updatedAt: log.blockTimestamp,
  };
  const cu = bi(log.args.cu);
  await store.put("index_state", gpuModel, {
    ...base,
    deliveredCu: base.deliveredCu + (log.eventName === "DeliveryRecorded" ? cu : 0n),
    defaultedCu: base.defaultedCu + (log.eventName === "DefaultRecorded" ? cu : 0n),
    updatedAt: log.blockTimestamp,
  });
}

async function onIndexParams(store: Store, log: IndexedLog): Promise<void> {
  const params = (log.args.params ?? log.args.p ?? log.args) as Record<string, unknown>;
  const windowSecs = bi(params.windowLength);
  const minVolume = bi(params.minVolume);
  const minParticipants = num(params.minParticipants);
  const maxCarryForwardSecs = bi(params.maxCarryForward);
  await store.put("index_params", "current", {
    id: "current",
    windowSecs,
    minVolume,
    minParticipants,
    maxCarryForwardSecs,
  });
  await putConfig(store, log, {
    window_secs: windowSecs.toString(),
    min_volume: minVolume.toString(),
    min_participants: minParticipants,
    max_carry_forward_secs: maxCarryForwardSecs.toString(),
  });
}

async function onReference(store: Store, log: IndexedLog): Promise<void> {
  const gpuModel = hex(log.args.gpuModel);
  const roundId = bi(log.args.roundId);
  await store.put("reference_price", pairKey(gpuModel, roundId.toString()), {
    gpuModel,
    roundId,
    value: bi(log.args.value),
    observedAt: bi(log.args.observedAt),
    label: "synthetic demo data",
    ts: log.blockTimestamp,
  });
}

async function onAttestationLinked(store: Store, log: IndexedLog): Promise<void> {
  const account = addr(log.args.account);
  const prev = await store.get<ParticipantRow>("participant", account);
  await store.put("participant", account, {
    address: account,
    entityId: hex(log.args.entityId ?? prev?.entityId ?? ZERO_BYTES32),
    role: prev?.role ?? 0,
    country: prev?.country ?? "",
    expiry: prev?.expiry ?? 0n,
    source: "EAS",
    attestationUid: hex(log.args.uid),
    attester: prev?.attester ?? null,
    txHash: log.txHash,
    revoked: false,
    updatedAt: log.blockTimestamp,
  });
}

async function onParticipantSet(store: Store, log: IndexedLog): Promise<void> {
  const account = addr(log.args.account);
  await store.put("participant", account, {
    address: account,
    entityId: hex(log.args.entityId),
    role: num(log.args.role),
    country: bytes2ToAscii(hex(log.args.country)),
    expiry: bi(log.args.expiry),
    source: "REGISTRY",
    attestationUid: null,
    attester: null,
    txHash: log.txHash,
    revoked: false,
    updatedAt: log.blockTimestamp,
  });
}

async function onAttested(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const schemaUID = hex(log.args.schemaUID);
  const data = log.args.data;
  if (typeof data !== "string") return;
  const uid = hex(log.args.uid);
  const recipient = addr(log.args.recipient);
  const attester = addr(log.args.attester);
  const refUID = log.args.refUID ? hex(log.args.refUID) : ZERO_BYTES32;
  if (ctx.kybSchema && schemaUID === ctx.kybSchema.toLowerCase()) {
    const [entityId, role, country, dataHash] = decodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "uint8" },
        { type: "bytes2" },
        { type: "bytes32" },
      ],
      data as Hex,
    );
    await store.put("kyb_application", uid, {
      uid,
      applicant: recipient,
      valid: recipient === attester,
      entityId: hex(entityId),
      role: Number(role),
      country: bytes2ToAscii(country),
      dataHash: hex(dataHash),
      submittedAt: log.blockTimestamp,
      txHash: log.txHash,
      withdrawn: false,
      approvalUid: null,
      approver: null,
      approvedAt: null,
      approvalExpiry: null,
      approvalRevoked: false,
    });
    return;
  }
  if (ctx.participantSchema && schemaUID === ctx.participantSchema.toLowerCase()) {
    const [entityId, role, country, expiry] = decodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "uint8" },
        { type: "bytes2" },
        { type: "uint64" },
      ],
      data as Hex,
    );
    const prev = await store.get<ParticipantRow>("participant", recipient);
    await store.put("participant", recipient, {
      address: recipient,
      entityId: hex(entityId),
      role: Number(role),
      country: bytes2ToAscii(country),
      expiry: bi(expiry),
      source: "EAS",
      attestationUid: uid,
      attester,
      txHash: log.txHash,
      revoked: false,
      updatedAt: log.blockTimestamp,
    });
    if (refUID !== ZERO_BYTES32) {
      const app = await store.get<Record<string, unknown>>("kyb_application", refUID);
      if (app) {
        await store.put("kyb_application", refUID, {
          ...app,
          approvalUid: uid,
          approver: attester,
          approvedAt: log.blockTimestamp,
          approvalExpiry: bi(expiry),
          approvalRevoked: false,
        });
      }
    }
    void prev;
  }
}

async function onRevoked(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const schemaUID = hex(log.args.schemaUID);
  const uid = hex(log.args.uid);
  if (ctx.kybSchema && schemaUID === ctx.kybSchema.toLowerCase()) {
    const app = await store.get<Record<string, unknown>>("kyb_application", uid);
    if (app) await store.put("kyb_application", uid, { ...app, withdrawn: true });
    return;
  }
  if (ctx.participantSchema && schemaUID === ctx.participantSchema.toLowerCase()) {
    const people = await store.list<ParticipantRow>("participant");
    for (const person of people) {
      if (person.attestationUid === uid) {
        await store.put("participant", person.address, { ...person, revoked: true, updatedAt: log.blockTimestamp });
      }
    }
    const apps = await store.list<{ uid: Hex; approvalUid: Hex | null } & Record<string, unknown>>("kyb_application");
    for (const app of apps) {
      if (app.approvalUid === uid) await store.put("kyb_application", app.uid, { ...app, approvalRevoked: true });
    }
  }
}

async function onTransfer(store: Store, ctx: ApplyContext, log: IndexedLog): Promise<void> {
  const token = log.address;
  const series = await seriesByToken(store, token);
  if (!series) return;
  const from = addr(log.args.from);
  const to = addr(log.args.to);
  const amount = bi(log.args.value ?? log.args.amount);
  let { totalSupply, lockedSupply } = series;
  if (from === ZERO) totalSupply += amount;
  if (to === ZERO) totalSupply -= amount;
  if (to === ctx.redemptionManager) lockedSupply += amount;
  if (from === ctx.redemptionManager) lockedSupply -= amount;
  await store.put("series", series.seriesId.toString(), { ...series, totalSupply, lockedSupply });
  await addHolding(store, series.seriesId, from, -amount, log.blockTimestamp);
  await addHolding(store, series.seriesId, to, amount, log.blockTimestamp);
}

async function onCallScheduled(store: Store, log: IndexedLog): Promise<void> {
  const operationId = hex(log.args.id);
  const index = num(log.args.index);
  const delay = bi(log.args.delay);
  const id = `${operationId}-${index}`;
  await store.put("timelock_operation", id, {
    id,
    timelockId: operationId,
    index,
    target: addr(log.args.target),
    value: bi(log.args.value),
    data: hex(log.args.data),
    predecessor: hex(log.args.predecessor),
    salt: null,
    delayS: delay,
    scheduledAt: log.blockTimestamp,
    readyAt: log.blockTimestamp + delay,
    executedAt: null,
    cancelledAt: null,
    scheduledTx: log.txHash,
    executedTx: null,
    cancelledTx: null,
    proposer: log.txFrom,
  });
}

async function onCallSalt(store: Store, log: IndexedLog): Promise<void> {
  const operationId = hex(log.args.id);
  const rows = await store.list<{ id: string; timelockId: Hex }>("timelock_operation");
  for (const row of rows) {
    if (row.timelockId === operationId) {
      await store.put("timelock_operation", row.id, { ...row, salt: hex(log.args.salt) });
    }
  }
}

async function onCallExecuted(store: Store, log: IndexedLog): Promise<void> {
  const operationId = hex(log.args.id);
  const index = num(log.args.index);
  const id = `${operationId}-${index}`;
  const row = await store.get<Record<string, unknown>>("timelock_operation", id);
  if (row) await store.put("timelock_operation", id, { ...row, executedAt: log.blockTimestamp, executedTx: log.txHash });
}

async function onCancelled(store: Store, log: IndexedLog): Promise<void> {
  const operationId = hex(log.args.id);
  const rows = await store.list<{ id: string; timelockId: Hex }>("timelock_operation");
  for (const row of rows) {
    if (row.timelockId === operationId) {
      await store.put("timelock_operation", row.id, { ...row, cancelledAt: log.blockTimestamp, cancelledTx: log.txHash });
    }
  }
}

async function onRole(store: Store, log: IndexedLog): Promise<void> {
  const role = hex(log.args.role);
  const account = addr(log.args.account);
  const id = `${log.address}-${role}-${account}`;
  const granted = log.eventName === "RoleGranted";
  const prev = await store.get<Record<string, unknown>>("role_member", id);
  await store.put("role_member", id, {
    id,
    contract: log.contractName,
    contractAddress: log.address,
    role,
    roleName: accessRoleName(role),
    account,
    active: granted,
    grantedAt: granted ? log.blockTimestamp : (prev?.grantedAt ?? null),
    revokedAt: granted ? null : log.blockTimestamp,
    txHash: log.txHash,
  });
  await putConfig(store, log, {
    role: accessRoleName(role),
    account,
    sender: addr(log.args.sender),
    active: granted,
  });
}
