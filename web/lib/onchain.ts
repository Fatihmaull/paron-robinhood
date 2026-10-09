import {
  hexToString,
  type Address,
  type PublicClient,
} from "viem";
import {
  bondVaultAbi,
  orderBookAbi,
  printIndexAbi,
  redemptionManagerAbi,
  referenceFeedAbi,
  seriesFactoryAbi,
} from "./abi";
import { contractAddress, contractsConfigured } from "./config";
import { canonicalAddress, formatRaw6 } from "./format";
import { gpuModelId } from "./gpu-model";
import type { IndexStrip, OrderBook, Redemption, SeriesDetail, SeriesRow } from "./types";

export class OnchainUnavailable extends Error {
  constructor(message = "Couldn't load markets. Check your connection and retry.") {
    super(message);
    this.name = "OnchainUnavailable";
  }
}

const STATES = [
  "NONE",
  "REQUESTED",
  "ACKNOWLEDGED",
  "DELIVERED",
  "DEFAULTABLE",
  "DISPUTED",
  "DEFAULTED",
  "FINALIZED",
  "REFUNDED",
] as const;

const INDEX_STATUS = ["OK", "THIN", "DISRUPTED"] as const;

function requireAddr(key: Parameters<typeof contractAddress>[0]): Address {
  const addr = contractAddress(key);
  if (!contractsConfigured() || addr === "0x0000000000000000000000000000000000000000") {
    throw new OnchainUnavailable();
  }
  return addr;
}

function cuString(raw: bigint): string {
  const scale = 10n ** 18n;
  const whole = raw / scale;
  const frac = raw % scale;
  if (frac === 0n) return whole.toString();
  const digits = frac.toString().padStart(18, "0").replace(/0+$/, "");
  return `${whole.toString()}.${digits}`;
}

function factorString(raw: number | bigint): string {
  const n = BigInt(raw);
  const whole = n / 10_000n;
  const frac = (n % 10_000n).toString().padStart(4, "0");
  return `${whole.toString()}.${frac}`;
}

const GPU_KEYS = ["H100-SXM-80GB", "H200-SXM-141GB", "B200-SXM-180GB", "GB200-NVL72", "A100-SXM-80GB"];
const GPU_BY_HASH = new Map<string, string>(GPU_KEYS.map((key) => [gpuModelId(key).toLowerCase(), key]));

/** Seeded series store keccak256(gpuKey), not the string. Resolve known keys, else keep the old decode. */
function gpuKeyOf(model: `0x${string}`): string {
  return GPU_BY_HASH.get(model.toLowerCase()) ?? hexToString(model, { size: 32 }).replace(/\0+$/g, "");
}

function gpuLabel(model: `0x${string}`): string {
  const text = gpuKeyOf(model);
  if (!/^[\x20-\x7e]*$/.test(text)) return "GPU";
  if (text.startsWith("H100")) return "H100";
  if (text.startsWith("H200")) return "H200";
  if (text.startsWith("B200")) return "B200";
  if (text.startsWith("GB200")) return "GB200";
  if (text.startsWith("A100")) return "A100";
  return text || "GPU";
}

type Stored = {
  provider: Address;
  token: Address;
  gpuModel: `0x${string}`;
  factor: number;
  gpuHours: bigint;
  maxSupply: bigint;
  primaryPrice: bigint;
  bondPerCU: bigint;
  windowStart: bigint;
  windowEnd: bigint;
  ackWindow: bigint;
  deliveryWindow: bigint;
  disputeWindow: bigint;
  minRedemption: bigint;
  arbitrator: Address;
  specHash: `0x${string}`;
  termsHash: `0x${string}`;
  country: `0x${string}`;
  continent: number;
  institutional: boolean;
  symbol: string;
  paused: boolean;
  finalized: boolean;
  soldSupply: bigint;
};

function countryCode(raw: `0x${string}`): string {
  const text = hexToString(raw, { size: 2 }).replace(/\0/g, "");
  return text || "—";
}

export async function readSeriesList(client: PublicClient): Promise<SeriesRow[]> {
  const factory = requireAddr("seriesFactory");
  const count = await client.readContract({
    address: factory,
    abi: seriesFactoryAbi,
    functionName: "seriesCount",
  });
  const rows: SeriesRow[] = [];
  const total = Number(count);
  for (let id = 1; id <= total; id++) {
    const detail = await readSeries(client, String(id));
    if (detail) rows.push(detail);
  }
  return rows;
}

export async function readSeries(client: PublicClient, seriesId: string): Promise<SeriesDetail | null> {
  const factory = requireAddr("seriesFactory");
  const stored = (await client.readContract({
    address: factory,
    abi: seriesFactoryAbi,
    functionName: "getSeries",
    args: [BigInt(seriesId)],
  })) as Stored;
  if (stored.provider === "0x0000000000000000000000000000000000000000") return null;
  let saleOpen = false;
  try {
    saleOpen = (await client.readContract({
      address: factory,
      abi: seriesFactoryAbi,
      functionName: "isSaleOpen",
      args: [BigInt(seriesId)],
    })) as boolean;
  } catch {
    saleOpen = false;
  }
  const price = formatRaw6(stored.primaryPrice);
  const bondPer = formatRaw6(stored.bondPerCU);
  const gpu = gpuLabel(stored.gpuModel);
  const row: SeriesDetail = {
    series_id: seriesId,
    symbol: stored.symbol,
    token: canonicalAddress(stored.token),
    gpu,
    gpu_type: gpuKeyOf(stored.gpuModel),
    factor: factorString(stored.factor),
    region: "—",
    country: countryCode(stored.country),
    delivery_window: "",
    window_start_ms: Number(stored.windowStart) * 1000,
    window_end_ms: Number(stored.windowEnd) * 1000,
    primary_price: price,
    native_primary_price: price,
    max_supply: cuString(stored.maxSupply),
    paused: stored.paused,
    finalized: stored.finalized,
    institutional: stored.institutional,
    sale_open: saleOpen,
    last_price: null,
    volume_24h_cu: "0",
    volume_24h_usd: "0.000000",
    bond_per_cu: bondPer,
    coverage: "—",
    sold_supply: cuString(stored.soldSupply),
    total_supply: "0",
    provider: {
      address: canonicalAddress(stored.provider),
      verified: false,
      status: "ACTIVE",
      delivered_cu: "0",
      defaulted_cu: "0",
      voluntary_defaulted_cu: "0",
    },
    gpu_hours: stored.gpuHours.toString(),
    terms: {
      ack_window_secs: Number(stored.ackWindow),
      delivery_window_secs: Number(stored.deliveryWindow),
      dispute_window_secs: Number(stored.disputeWindow),
      min_redemption_cu: cuString(stored.minRedemption),
      arbitrator: canonicalAddress(stored.arbitrator),
      spec_hash: stored.specHash,
      terms_hash: stored.termsHash,
    },
    bond: null,
    redemption_stats: null,
    index: null,
    created_at_ms: null,
    created_tx: null,
    explorer_url: null,
  };
  try {
    const vault = contractAddress("bondVault");
    if (vault !== "0x0000000000000000000000000000000000000000") {
      const bond = (await client.readContract({
        address: vault,
        abi: bondVaultAbi,
        functionName: "bondOf",
        args: [BigInt(seriesId)],
      })) as {
        deposited: bigint;
        balance: bigint;
        released: bigint;
        slashed: bigint;
        finalized: boolean;
        withdrawn: boolean;
      };
      row.bond = {
        deposited: formatRaw6(bond.deposited),
        balance: formatRaw6(bond.balance),
        released: formatRaw6(bond.released),
        slashed: formatRaw6(bond.slashed),
        health: "—",
        finalized: bond.finalized,
        withdrawn: bond.withdrawn,
      };
    }
  } catch {
    row.bond = null;
  }
  return row;
}

export async function readOrderBook(client: PublicClient, seriesId: string): Promise<OrderBook> {
  const book = requireAddr("orderBook");
  const depth = 10n;
  const [bidPrices, bidQtys] = (await client.readContract({
    address: book,
    abi: orderBookAbi,
    functionName: "getLevels",
    args: [BigInt(seriesId), 0, depth],
  })) as readonly [readonly bigint[], readonly bigint[]];
  const [askPrices, askQtys] = (await client.readContract({
    address: book,
    abi: orderBookAbi,
    functionName: "getLevels",
    args: [BigInt(seriesId), 1, depth],
  })) as readonly [readonly bigint[], readonly bigint[]];
  const map = (prices: readonly bigint[], qtys: readonly bigint[]) =>
    prices.map((price, i) => ({
      price: formatRaw6(price),
      qty_cu: cuString(qtys[i] ?? 0n),
      orders: 1,
    }));
  const bids = map(bidPrices, bidQtys);
  const asks = map(askPrices, askQtys);
  return {
    series_id: seriesId,
    symbol: "",
    tick: "0.010000",
    bids,
    asks,
    best_bid: bids[0]?.price ?? null,
    best_ask: asks[0]?.price ?? null,
    spread: null,
  };
}

export async function readRedemption(client: PublicClient, reqId: string): Promise<Redemption | null> {
  const rm = requireAddr("redemptionManager");
  const request = (await client.readContract({
    address: rm,
    abi: redemptionManagerAbi,
    functionName: "getRequest",
    args: [BigInt(reqId)],
  })) as {
    seriesId: bigint;
    holder: Address;
    amount: bigint;
    deliveryRef: `0x${string}`;
    receiptHash: `0x${string}`;
    state: number;
    requestedAt: bigint;
    ackDeadline: bigint;
    deliveryDeadline: bigint;
    disputeDeadline: bigint;
    rulingDeadline: bigint;
    disputeBond: bigint;
  };
  if (request.holder === "0x0000000000000000000000000000000000000000") return null;
  const state = await client.readContract({
    address: rm,
    abi: redemptionManagerAbi,
    functionName: "stateOf",
    args: [BigInt(reqId)],
  });
  let reopened = 0n;
  try {
    reopened = (await client.readContract({
      address: rm,
      abi: redemptionManagerAbi,
      functionName: "reopenedFrom",
      args: [BigInt(reqId)],
    })) as bigint;
  } catch {
    reopened = 0n;
  }
  const name = STATES[Number(state)] ?? "NONE";
  return {
    req_id: reqId,
    series_id: request.seriesId.toString(),
    symbol: "",
    holder: canonicalAddress(request.holder),
    provider: "0x0000000000000000000000000000000000000000",
    amount_cu: cuString(request.amount),
    claim_usd: "0.000000",
    state: name,
    stored_state: STATES[request.state] ?? "NONE",
    requested_at_ms: Number(request.requestedAt) * 1000,
    ack_deadline_ms: Number(request.ackDeadline) * 1000,
    acknowledged_at_ms: null,
    delivery_deadline_ms: Number(request.deliveryDeadline) * 1000 || null,
    delivered_at_ms: null,
    dispute_deadline_ms: Number(request.disputeDeadline) * 1000 || null,
    disputed_at_ms: null,
    ruling_deadline_ms: Number(request.rulingDeadline) * 1000 || null,
    resolved_at_ms: null,
    next_deadline_ms: null,
    delivery_ref: request.deliveryRef,
    receipt_hash: request.receiptHash,
    dispute_bond: formatRaw6(request.disputeBond),
    ruling: null,
    payout: null,
    bond_released: null,
    voluntary: null,
    via_dispute: null,
    auto_finalized: null,
    default_caller: null,
    refunded_after_window: null,
    reopened_from_req_id: reopened === 0n ? null : reopened.toString(),
    reopened_to_req_id: null,
    actions: name === "DEFAULTABLE" ? ["CLAIM_DEFAULT"] : [],
  };
}

export async function readIndex(client: PublicClient, gpu = "H100-SXM-80GB"): Promise<IndexStrip> {
  const index = requireAddr("printIndex");
  const key = gpuModelId(gpu);
  const statusRound = (await client.readContract({
    address: index,
    abi: printIndexAbi,
    functionName: "statusOf",
    args: [key],
  })) as readonly [number, bigint];
  const status = statusRound[0];
  const round = (await client.readContract({
    address: index,
    abi: printIndexAbi,
    functionName: "latestRoundData",
    args: [key],
  })) as readonly [bigint, bigint, bigint, bigint, bigint];
  let reference: IndexStrip["reference"] = { value: null, label: "synthetic demo data" };
  const feed = contractAddress("referenceFeed");
  if (feed !== "0x0000000000000000000000000000000000000000") {
    try {
      const ref = (await client.readContract({
        address: feed,
        abi: referenceFeedAbi,
        functionName: "latestRoundData",
        args: [key],
      })) as readonly [bigint, bigint, bigint, bigint, bigint];
      const label = (await client.readContract({
        address: feed,
        abi: referenceFeedAbi,
        functionName: "label",
      })) as string;
      reference = { value: formatRaw6(BigInt(ref[1])), label: label || "synthetic demo data" };
    } catch {
      reference = { value: null, label: "synthetic demo data" };
    }
  }
  const answer = BigInt(round[1]);
  return {
    gpu: "H100",
    status: INDEX_STATUS[Number(status)] ?? "THIN",
    value: answer > 0n ? formatRaw6(answer) : null,
    participants: 0,
    eligible_volume_cu: "0",
    reference,
  };
}

export const TAPE_UNAVAILABLE =
  "Trade history needs the Paron API. Order book and bond are read on-chain.";

export const STATEMENT_UNAVAILABLE = "Statements need the Paron API. Try again shortly.";
