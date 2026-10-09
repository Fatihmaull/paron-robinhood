import type { Hex } from "viem";

export type SeriesRow = {
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

export type BondRow = {
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

export type PrintRow = {
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

export type OrderRow = {
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

export type HoldingRow = {
  seriesId: bigint;
  account: Hex;
  balance: bigint;
  updatedAt: bigint;
};

export type RedemptionRow = {
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

export type DisputeRow = {
  reqId: bigint;
  arbitrator: Hex;
  disputeBond: bigint;
  rulingDeadline: bigint;
  ruling: string | null;
  signers: string[];
  openedAt: bigint;
  ruledAt: bigint | null;
};

export type ProviderRow = {
  address: Hex;
  entityId: Hex;
  status: string;
  deliveredCu: bigint;
  defaultedCu: bigint;
  voluntaryDefaultedCu: bigint;
  disputesLost: number;
  strikes: number;
  registeredAt: bigint;
  updatedAt: bigint;
};

export type ParticipantRow = {
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

export type IndexStateRow = {
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

export type IndexRoundRow = {
  gpuModel: Hex;
  roundId: bigint;
  answer: bigint | null;
  status: string;
  ts: bigint;
};

export type ReferenceRow = {
  gpuModel: Hex;
  roundId: bigint;
  value: bigint;
  observedAt: bigint;
  label: string;
  ts: bigint;
};

export type LedgerRow = {
  id: string;
  account: Hex;
  kind: string;
  seriesId: bigint | null;
  reqId: bigint | null;
  orderId: bigint | null;
  usdcDelta: bigint;
  cuDelta: bigint;
  counterparty: Hex;
  ts: bigint;
  txHash: Hex;
  logIndex: number;
};

export type DeliveryRow = {
  seriesId: bigint;
  month: string;
  gpu: string;
  deliveredCu: bigint;
  deliveredGpuHours: bigint;
  defaultedCu: bigint;
  defaultCount: number;
  finalizedCount: number;
};

export type GpuFactorRow = {
  gpuModel: Hex;
  name: string;
  factor: number;
  updatedAt: bigint;
};

export type ConfigRow = {
  id: string;
  contract: string;
  contractAddress: Hex;
  event: string;
  args: Record<string, unknown>;
  ts: bigint;
  txHash: Hex;
  txFrom: Hex;
  txTo: Hex | null;
  logIndex: number;
};

export type KybRow = {
  uid: Hex;
  applicant: Hex;
  valid: boolean;
  entityId: Hex;
  role: number;
  country: string;
  dataHash: Hex;
  submittedAt: bigint;
  txHash: Hex;
  withdrawn: boolean;
  approvalUid: Hex | null;
  approver: Hex | null;
  approvedAt: bigint | null;
  approvalExpiry: bigint | null;
  approvalRevoked: boolean;
};

export type EventRow = {
  id: string;
  contract: string;
  contractAddress: Hex;
  event: string;
  args: Record<string, unknown>;
  seriesId: bigint | null;
  reqId: bigint | null;
  blockNumber: bigint;
  ts: bigint;
  txHash: Hex;
  txFrom: Hex;
  logIndex: number;
};

export type TimelockRow = {
  id: string;
  timelockId: Hex;
  index: number;
  target: Hex;
  value: bigint;
  data: Hex;
  predecessor: Hex;
  salt: Hex | null;
  delayS: bigint;
  scheduledAt: bigint;
  readyAt: bigint;
  executedAt: bigint | null;
  cancelledAt: bigint | null;
  scheduledTx: Hex;
  executedTx: Hex | null;
  cancelledTx: Hex | null;
  proposer: Hex;
};

export type IndexParamsRow = {
  id: string;
  windowSecs: bigint;
  minVolume: bigint;
  minParticipants: number;
  maxCarryForwardSecs: bigint;
};

export type Snapshot = {
  chainId: number;
  chainKey: string;
  explorerBase: string;
  indexedBlock: bigint;
  indexedAt: bigint;
  headBlock: bigint | null;
  synced: boolean;
  series: SeriesRow[];
  bonds: BondRow[];
  prints: PrintRow[];
  orders: OrderRow[];
  holdings: HoldingRow[];
  redemptions: RedemptionRow[];
  disputes: DisputeRow[];
  providers: ProviderRow[];
  participants: ParticipantRow[];
  indexStates: IndexStateRow[];
  indexRounds: IndexRoundRow[];
  references: ReferenceRow[];
  ledger: LedgerRow[];
  deliveries: DeliveryRow[];
  gpuFactors: GpuFactorRow[];
  configChanges: ConfigRow[];
  kyb: KybRow[];
  events: EventRow[];
  timelocks: TimelockRow[];
  indexParams: IndexParamsRow | null;
  contractNames: Record<string, string>;
};

export const DEMO_INDEX_PARAMS: IndexParamsRow = {
  id: "current",
  windowSecs: 86400n,
  minVolume: 10n ** 18n,
  minParticipants: 2,
  maxCarryForwardSecs: 259200n,
};

/** Head is unknown when the RPC call fails. Indexed progress still counts as synced (local dev). */
// Robinhood Chain Testnet makes ~4 blocks per second, so a handful of blocks is not "behind".
// 240 blocks is about a minute. Override with SYNC_LAG_BLOCKS.
export const SYNC_LAG_BLOCKS = BigInt(process.env.SYNC_LAG_BLOCKS || 240);

export function syncOf(indexedBlock: bigint, headBlock: bigint | null): boolean {
  if (headBlock === null) return indexedBlock > 0n;
  const lag = headBlock > indexedBlock ? headBlock - indexedBlock : 0n;
  return lag <= SYNC_LAG_BLOCKS;
}
