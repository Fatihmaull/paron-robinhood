import { Hono } from "hono";
import { cors } from "hono/cors";
import { decodeFunctionData, type Hex } from "viem";
import { conversionTableAbi } from "../abi/temporary-event-abis.js";
import { toCsv } from "../domain/csv.js";
import { CursorError, decodeCursor, encodeCursor } from "../domain/cursor.js";
import {
  formatCu,
  formatFactor,
  formatRatioFloor,
  formatRatioHalfUp,
  formatUsdc,
  tsIso,
  tsMs,
} from "../domain/format.js";
import { GPU_SHORTS, GPU_TYPES, gpuModelHash, gpuTypeOf, isGpuShort, shortOfModel, type GpuShort } from "../domain/gpu.js";
import { roleName } from "../domain/roles.js";
import { isAddress } from "../domain/format.js";
import {
  DEMO_INDEX_PARAMS,
  type BondRow,
  type ConfigRow,
  type DeliveryRow,
  type EventRow,
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

const ZERO_BYTES32 = `0x${"0".repeat(64)}`;
const TERMINAL = new Set(["FINALIZED", "DEFAULTED", "REFUNDED"]);
const PRINT_COLUMNS = [
  "id",
  "kind",
  "gpu_type",
  "gpu",
  "price_per_gpu_hour",
  "cu_price",
  "factor",
  "qty_cu",
  "native_gpu_hours",
  "gpu_count",
  "region",
  "country",
  "ts_ms",
  "ts_iso",
  "series",
  "series_id",
  "delivery_window",
  "side",
  "notional_usd",
  "fee_usd",
  "maker",
  "taker",
  "eligible",
  "ineligible_reason",
  "index_status",
  "thin",
  "block_number",
  "tx_hash",
  "explorer_url",
];

type Vars = { snap: Snapshot };

export type CreateAppOptions = {
  load: () => Promise<Snapshot>;
  /** Override the clock. Default: wall clock, or the indexed timestamp when API_NOW_SOURCE=chain. */
  now?: (snap: Snapshot) => number;
};

export function resolveNow(indexedAtSec: bigint): number {
  if (process.env.API_NOW_SOURCE === "chain") return Number(indexedAtSec) * 1000;
  return Date.now();
}

/** Comma-separated `API_CORS_ORIGIN`. Unset, blank, or `*` allows every origin. */
export function corsOriginSetting(raw = process.env.API_CORS_ORIGIN): string | string[] {
  const value = raw?.trim() ?? "";
  if (value === "" || value === "*") return "*";
  const origins = value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (origins.length === 0 || origins.includes("*")) return "*";
  return origins;
}

export function createApp(options: CreateAppOptions) {
  const app = new Hono<{ Variables: Vars }>();
  app.use("*", cors({ origin: corsOriginSetting() }));
  app.use("*", async (c, next) => {
    await next();
    const allowed = corsOriginSetting();
    if (allowed === "*") return;
    const requestOrigin = c.req.header("origin");
    if (!requestOrigin || allowed.includes(requestOrigin)) return;
    // Ponder's server sets Access-Control-Allow-Origin: * before this app runs.
    // Omitting the header leaves that * in place, so a rejected origin overwrites it.
    c.header("Access-Control-Allow-Origin", "null");
  });

  app.use("*", async (c, next) => {
    const snap = await options.load();
    c.set("snap", snap);
    const path = c.req.path;
    const health = path === "/health" || path === "/v1/health";
    if (!health && path.startsWith("/v1/") && !snap.synced) {
      return c.json(errorBody("INDEXER_SYNCING", "indexer is still backfilling", {}), 503);
    }
    await next();
  });

  const health = (c: { get: (key: "snap") => Snapshot; json: (body: unknown) => Response }) => {
    const snap = c.get("snap");
    const lag =
      snap.headBlock === null ? null : Number(snap.headBlock > snap.indexedBlock ? snap.headBlock - snap.indexedBlock : 0n);
    return c.json(
      ok(snap, clock(options, snap), {
        chain_id: snap.chainId,
        chain: snap.chainKey,
        synced: snap.synced,
        indexed_block: num(snap.indexedBlock),
        head_block: snap.headBlock === null ? null : num(snap.headBlock),
        lag_blocks: lag,
        indexed_at_ms: tsMs(snap.indexedAt),
        api_version: "v1",
        index_update_failures: snap.configChanges.filter((row) => row.event === "IndexUpdateFailed").length,
      }),
    );
  };

  // Ponder reserves GET /health (and /ready, /status, /metrics, /client).
  app.get("/v1/health", health);

  app.get("/v1/prints", (c) => {
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const gpu = c.req.query("gpu");
    if (gpu !== undefined && !isGpuShort(gpu)) return badGpu(c);
    const kind = c.req.query("kind");
    if (kind !== undefined && kind !== "PRIMARY" && kind !== "TRADE") return bad(c, "kind", "kind must be PRIMARY or TRADE");
    const side = c.req.query("side");
    if (side !== undefined && side !== "BUY" && side !== "SELL") return bad(c, "side", "side must be BUY or SELL");
    const eligible = boolParam(c.req.query("eligible"));
    if (eligible === "bad") return bad(c, "eligible", "eligible must be true or false");
    const range = timeRange(c.req.query("from"), c.req.query("to"));
    if (range === "bad") return bad(c, "from", "from/to must be millisecond timestamps or ISO-8601");
    const seriesFilter = c.req.query("series");
    const account = c.req.query("account");
    if (account !== undefined && !isAddress(account)) return bad(c, "account", "account is not an address");
    const format = c.req.query("format") ?? "json";
    if (format !== "json" && format !== "csv") return bad(c, "format", "format must be json or csv");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");

    let rows = snap.prints.filter((row) => {
      if (gpu && row.gpu !== gpu) return false;
      if (kind && row.kind !== kind) return false;
      if (side && row.takerSide !== side) return false;
      if (eligible !== undefined && row.eligible !== eligible) return false;
      const region = c.req.query("region");
      if (region && row.continent !== region) return false;
      const country = c.req.query("country");
      if (country && row.country !== country) return false;
      const window = c.req.query("delivery_window");
      if (window && row.deliveryWindow !== window) return false;
      if (range && (row.ts < range.from || row.ts >= range.to)) return false;
      if (seriesFilter && !matchesSeries(snap, row.seriesId, seriesFilter)) return false;
      if (account && row.maker !== account.toLowerCase() && row.taker !== account.toLowerCase()) return false;
      return true;
    });
    rows.sort((a, b) => cmpDesc(a.ts, b.ts) || b.logIndex - a.logIndex);
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const logIndex = Number(page.cursor.l ?? 0);
      rows = rows.filter((row) => row.ts < ts || (row.ts === ts && row.logIndex < logIndex));
    }
    const slice = rows.slice(0, page.limit);
    const body = slice.map((row) => presentPrint(snap, row));
    const next = slice.length === page.limit ? encodeCursor({ ts: Number(slice[slice.length - 1]!.ts), l: slice[slice.length - 1]!.logIndex }) : null;
    if (format === "csv") return csv(c, body, PRINT_COLUMNS, next);
    return c.json(list(snap, clock(options, snap), body, next));
  });

  app.get("/v1/index/:gpu", (c) => {
    const gpu = c.req.param("gpu");
    if (!isGpuShort(gpu)) return notFound(c, `unknown gpu '${gpu}'`);
    const snap = c.get("snap");
    return c.json(ok(snap, clock(options, snap), presentIndex(snap, gpu, sec(clock(options, snap)))));
  });

  app.get("/v1/index/:gpu/history", (c) => {
    const gpu = c.req.param("gpu");
    if (!isGpuShort(gpu)) return notFound(c, `unknown gpu '${gpu}'`);
    const interval = c.req.query("interval") ?? "1h";
    const step = interval === "1m" ? 60n : interval === "1d" ? 86400n : interval === "1h" ? 3600n : null;
    if (step === null) return bad(c, "interval", "interval must be 1m, 1h, or 1d");
    const range = timeRange(c.req.query("from"), c.req.query("to"));
    if (range === "bad") return bad(c, "from", "from/to must be millisecond timestamps or ISO-8601");
    const format = c.req.query("format") ?? "json";
    if (format !== "json" && format !== "csv") return bad(c, "format", "format must be json or csv");
    const snap = c.get("snap");
    const model = gpuModelHash(gpu);
    const rounds = snap.indexRounds
      .filter((row) => row.gpuModel === model && (!range || (row.ts >= range.from && row.ts < range.to)))
      .sort((a, b) => cmpAsc(a.ts, b.ts));
    const buckets = new Map<string, (typeof rounds)[number]>();
    for (const row of rounds) {
      const bucket = (row.ts / step) * step;
      buckets.set(bucket.toString(), row);
    }
    const data = [...buckets.entries()].map(([bucket, row]) => ({
      ts_ms: tsMs(BigInt(bucket)),
      value: row.answer === null ? null : formatUsdc(row.answer),
      onchain_vwap: row.answer === null ? null : formatUsdc(row.answer),
      status: row.status,
      eligible_volume_cu: null,
    }));
    if (format === "csv") {
      return csv(c, data, ["ts_ms", "value", "onchain_vwap", "status", "eligible_volume_cu"], null);
    }
    return c.json(list(snap, clock(options, snap), data, null));
  });

  app.get("/v1/series", (c) => {
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const gpu = c.req.query("gpu");
    if (gpu !== undefined && !isGpuShort(gpu)) return badGpu(c);
    const status = c.req.query("status") ?? "active";
    if (!["active", "paused", "finalized", "all"].includes(status)) return bad(c, "status", "status must be active, paused, finalized, or all");
    const sale = boolParam(c.req.query("sale_open"));
    if (sale === "bad") return bad(c, "sale_open", "sale_open must be true or false");
    const expired = boolParam(c.req.query("expired"));
    if (expired === "bad") return bad(c, "expired", "expired must be true or false");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    let rows = snap.series.filter((row) => {
      if (gpu && row.gpu !== gpu) return false;
      const region = c.req.query("region");
      if (region && row.continent !== region) return false;
      const country = c.req.query("country");
      if (country && row.country !== country) return false;
      const window = c.req.query("delivery_window");
      if (window && row.deliveryWindow !== window) return false;
      const provider = c.req.query("provider");
      if (provider && row.provider !== provider.toLowerCase()) return false;
      if (status === "active" && row.finalized) return false;
      if (status === "paused" && !row.paused) return false;
      if (status === "finalized" && !row.finalized) return false;
      const open = saleOpen(row, nowSec);
      if (sale !== undefined && open !== sale) return false;
      const isExpired = nowSec >= row.windowEnd && !row.finalized;
      if (expired !== undefined && isExpired !== expired) return false;
      return true;
    });
    rows.sort((a, b) => a.deliveryWindow.localeCompare(b.deliveryWindow) || cmpAsc(a.seriesId, b.seriesId));
    if (page.cursor) {
      const window = String(page.cursor.w ?? "");
      const id = BigInt(page.cursor.id ?? 0);
      rows = rows.filter((row) => row.deliveryWindow > window || (row.deliveryWindow === window && row.seriesId > id));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentSeries(snap, row, nowSec));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ w: last.deliveryWindow, id: Number(last.seriesId) }) : null;
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/series/:id", (c) => {
    const snap = c.get("snap");
    const row = findSeries(snap, c.req.param("id"));
    if (!row) return notFound(c, "series not found");
    const nowMs = clock(options, snap);
    return c.json(ok(snap, nowMs, presentSeriesDetail(snap, row, sec(nowMs))));
  });

  app.get("/v1/series/:id/orderbook", (c) => {
    const snap = c.get("snap");
    const row = findSeries(snap, c.req.param("id"));
    if (!row) return notFound(c, "series not found");
    const depthRaw = c.req.query("depth") ?? "10";
    if (!/^\d+$/.test(depthRaw) || Number(depthRaw) < 1) return bad(c, "depth", "depth must be a positive integer");
    return c.json(ok(snap, clock(options, snap), presentBook(snap, row, Number(depthRaw))));
  });

  app.get("/v1/orders", (c) => {
    const snap = c.get("snap");
    const maker = c.req.query("maker");
    const series = c.req.query("series");
    if (!maker && !series) return bad(c, "maker", "maker or series is required");
    if (maker && !isAddress(maker)) return bad(c, "maker", "maker is not an address");
    const side = c.req.query("side");
    if (side !== undefined && side !== "BID" && side !== "ASK") return bad(c, "side", "side must be BID or ASK");
    const statusRaw = c.req.query("status") ?? "OPEN,PARTIAL";
    const statuses = new Set(statusRaw.split(",").filter(Boolean));
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    let rows = snap.orders.filter((row) => {
      if (maker && row.maker !== maker.toLowerCase()) return false;
      if (series && !matchesSeries(snap, row.seriesId, series)) return false;
      if (side && row.side !== side) return false;
      if (!statuses.has(row.status)) return false;
      return true;
    });
    rows.sort((a, b) => cmpDesc(a.updatedAt, b.updatedAt) || cmpDesc(a.orderId, b.orderId));
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const id = BigInt(page.cursor.id ?? 0);
      rows = rows.filter((row) => row.updatedAt < ts || (row.updatedAt === ts && row.orderId < id));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentOrder(snap, row));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ ts: Number(last.updatedAt), id: Number(last.orderId) }) : null;
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/accounts/:addr/holdings", (c) => {
    const addr = c.req.param("addr");
    if (!isAddress(addr)) return bad(c, "addr", "addr is not an address");
    const includeZero = boolParam(c.req.query("include_zero") ?? "false");
    if (includeZero === "bad") return bad(c, "include_zero", "include_zero must be true or false");
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const account = addr.toLowerCase() as Hex;
    const rows = snap.holdings
      .filter((row) => row.account === account && (includeZero || row.balance !== 0n))
      .sort((a, b) => cmpAsc(a.seriesId, b.seriesId));
    const data = rows.map((row) => {
      const series = seriesById(snap, row.seriesId);
      const open = snap.redemptions.filter((item) => item.seriesId === row.seriesId && item.holder === account && !TERMINAL.has(item.state));
      const locked = open.reduce((sum, item) => sum + item.amount, 0n);
      const price = series?.lastPrice ?? series?.primaryPrice ?? 0n;
      const brief = series ? presentSeries(snap, series, nowSec) : null;
      if (brief) delete (brief as { provider?: unknown }).provider;
      return {
        series: brief,
        balance_cu: formatCu(row.balance),
        redeemable_now: Boolean(
          series && nowSec >= series.windowStart && nowSec < series.windowEnd && row.balance >= series.minRedemption,
        ),
        open_requests: open.length,
        locked_cu: formatCu(locked),
        value_at_last_usd: formatUsdc((row.balance * price) / 10n ** 18n),
      };
    });
    return c.json(list(snap, clock(options, snap), data, null));
  });

  app.get("/v1/accounts/:addr/statement", (c) => {
    const addr = c.req.param("addr");
    if (!isAddress(addr)) return bad(c, "addr", "addr is not an address");
    const range = timeRange(c.req.query("from"), c.req.query("to"));
    if (range === "bad") return bad(c, "from", "from/to must be millisecond timestamps or ISO-8601");
    const format = c.req.query("format") ?? "json";
    if (format !== "json" && format !== "csv") return bad(c, "format", "format must be json or csv");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    const snap = c.get("snap");
    const account = addr.toLowerCase();
    const kinds = c.req.query("kind")?.split(",").filter(Boolean);
    const series = c.req.query("series");
    let rows = snap.ledger.filter((row) => {
      if (row.account !== account) return false;
      if (kinds && !kinds.includes(row.kind)) return false;
      if (series && row.seriesId !== null && !matchesSeries(snap, row.seriesId, series)) return false;
      if (range && (row.ts < range.from || row.ts >= range.to)) return false;
      return true;
    });
    rows.sort((a, b) => cmpAsc(a.ts, b.ts) || a.logIndex - b.logIndex || a.id.localeCompare(b.id));
    const summary = statementSummary(rows);
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const logIndex = Number(page.cursor.l ?? 0);
      const id = String(page.cursor.i ?? "");
      rows = rows.filter(
        (row) => row.ts > ts || (row.ts === ts && row.logIndex > logIndex) || (row.ts === ts && row.logIndex === logIndex && row.id > id),
      );
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentLedger(snap, row));
    const last = slice[slice.length - 1];
    const next =
      slice.length === page.limit && last ? encodeCursor({ ts: Number(last.ts), l: last.logIndex, i: last.id }) : null;
    if (format === "csv") {
      return csv(
        c,
        data,
        ["ts_ms", "ts_iso", "kind", "series_id", "symbol", "req_id", "order_id", "usdc_delta", "cu_delta", "counterparty", "tx_hash", "explorer_url"],
        next,
      );
    }
    return c.json({ ...list(snap, clock(options, snap), data, next), summary });
  });

  app.get("/v1/redemptions", (c) => {
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const holder = c.req.query("holder");
    const provider = c.req.query("provider");
    const series = c.req.query("series");
    const actionable = c.req.query("actionable");
    if (!holder && !provider && !series && !actionable) {
      return bad(c, "holder", "holder, provider, series, or actionable is required");
    }
    if (holder && !isAddress(holder)) return bad(c, "holder", "holder is not an address");
    if (provider && !isAddress(provider)) return bad(c, "provider", "provider is not an address");
    const states = c.req.query("state")?.split(",").filter(Boolean);
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    let rows = snap.redemptions.filter((row) => {
      if (holder && row.holder !== holder.toLowerCase()) return false;
      if (provider && row.provider !== provider.toLowerCase()) return false;
      if (series && !matchesSeries(snap, row.seriesId, series)) return false;
      const effective = effectiveState(row, nowSec);
      if (states && !states.includes(effective)) return false;
      if (actionable && !actionsOf(row, nowSec).includes(actionable)) return false;
      return true;
    });
    rows.sort((a, b) => cmpDesc(a.requestedAt, b.requestedAt) || cmpDesc(a.reqId, b.reqId));
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const id = BigInt(page.cursor.id ?? 0);
      rows = rows.filter((row) => row.requestedAt < ts || (row.requestedAt === ts && row.reqId < id));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentRedemption(snap, row, nowSec));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ ts: Number(last.requestedAt), id: Number(last.reqId) }) : null;
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/redemptions/:reqId", (c) => {
    const snap = c.get("snap");
    const id = c.req.param("reqId");
    if (!/^\d+$/.test(id)) return bad(c, "reqId", "reqId must be an integer");
    const row = snap.redemptions.find((item) => item.reqId === BigInt(id));
    if (!row) return notFound(c, "redemption not found");
    const nowSec = sec(clock(options, snap));
    const timeline = snap.events
      .filter((item) => item.reqId === row.reqId)
      .sort((a, b) => cmpAsc(a.ts, b.ts) || a.logIndex - b.logIndex)
      .map((item) => ({
        event: item.event,
        ts_ms: tsMs(item.ts),
        tx_hash: item.txHash,
        explorer_url: txUrl(snap, item.txHash),
        args: timelineArgs(item.args),
      }));
    return c.json(ok(snap, clock(options, snap), { ...presentRedemption(snap, row, nowSec), timeline }));
  });

  app.get("/v1/providers", (c) => {
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const status = c.req.query("status") ?? "all";
    if (!["ACTIVE", "SUSPENDED", "BANNED", "all"].includes(status)) return bad(c, "status", "status must be ACTIVE, SUSPENDED, BANNED, or all");
    const verified = boolParam(c.req.query("verified"));
    if (verified === "bad") return bad(c, "verified", "verified must be true or false");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    let rows = snap.providers.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (verified !== undefined && isVerified(snap, row.address, nowSec) !== verified) return false;
      return true;
    });
    rows.sort((a, b) => cmpAsc(a.registeredAt, b.registeredAt) || a.address.localeCompare(b.address));
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const address = String(page.cursor.a ?? "");
      rows = rows.filter((row) => row.registeredAt > ts || (row.registeredAt === ts && row.address > address));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentProviderList(snap, row, nowSec));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ ts: Number(last.registeredAt), a: last.address }) : null;
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/providers/:addr", (c) => {
    const addr = c.req.param("addr");
    if (!isAddress(addr)) return bad(c, "addr", "addr is not an address");
    const snap = c.get("snap");
    const row = snap.providers.find((item) => item.address === addr.toLowerCase());
    if (!row) return notFound(c, "provider not found");
    const nowSec = sec(clock(options, snap));
    return c.json(ok(snap, clock(options, snap), presentProvider(snap, row, nowSec)));
  });

  app.get("/v1/participants/:addr", (c) => {
    const addr = c.req.param("addr");
    if (!isAddress(addr)) return bad(c, "addr", "addr is not an address");
    const snap = c.get("snap");
    return c.json(ok(snap, clock(options, snap), presentParticipant(snap, addr.toLowerCase() as Hex, sec(clock(options, snap)))));
  });

  app.get("/v1/gpus", (c) => {
    const snap = c.get("snap");
    const data = [...snap.gpuFactors]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((row) => ({
        gpu: row.name,
        gpu_type: gpuTypeOf(row.name),
        factor: formatFactor(row.factor),
        updated_at_ms: tsMs(row.updatedAt),
      }));
    return c.json(list(snap, clock(options, snap), data, null));
  });

  app.get("/v1/reference/:gpu", (c) => {
    const gpu = c.req.param("gpu");
    if (!isGpuShort(gpu)) return notFound(c, `unknown gpu '${gpu}'`);
    const snap = c.get("snap");
    const ref = latestReference(snap, gpuModelHash(gpu));
    if (!ref) return notFound(c, "reference not found");
    return c.json(
      ok(snap, clock(options, snap), {
        gpu,
        value: formatUsdc(ref.value),
        unit: "USD per H100-equivalent GPU-hour",
        observed_at_ms: tsMs(ref.observedAt),
        round_id: ref.roundId.toString(),
        label: ref.label,
        synthetic: true,
      }),
    );
  });

  app.get("/v1/deliveries", (c) => {
    const snap = c.get("snap");
    const gpu = c.req.query("gpu");
    if (gpu !== undefined && !isGpuShort(gpu)) return badGpu(c);
    const format = c.req.query("format") ?? "json";
    if (format !== "json" && format !== "csv") return bad(c, "format", "format must be json or csv");
    const series = c.req.query("series");
    const provider = c.req.query("provider");
    const month = c.req.query("month");
    const rows = snap.deliveries.filter((row) => {
      if (gpu && row.gpu !== gpu) return false;
      if (month && row.month !== month) return false;
      if (series && !matchesSeries(snap, row.seriesId, series)) return false;
      if (provider) {
        const owner = seriesById(snap, row.seriesId);
        if (!owner || owner.provider !== provider.toLowerCase()) return false;
      }
      return true;
    });
    const data = rows.map((row) => presentDelivery(snap, row));
    const columns = ["series_id", "symbol", "gpu", "month", "delivered_cu", "delivered_gpu_hours", "defaulted_cu", "default_count", "finalized_count", "default_rate"];
    if (format === "csv") return csv(c, data, columns, null);
    return c.json(list(snap, clock(options, snap), data, null));
  });

  app.get("/v1/disputes", (c) => {
    const snap = c.get("snap");
    const status = c.req.query("status") ?? "all";
    if (!["open", "ruled", "all"].includes(status)) return bad(c, "status", "status must be open, ruled, or all");
    const arbitrator = c.req.query("arbitrator");
    const holder = c.req.query("holder");
    const provider = c.req.query("provider");
    const rows = snap.disputes.filter((row) => {
      if (arbitrator && row.arbitrator !== arbitrator.toLowerCase()) return false;
      const redemption = snap.redemptions.find((item) => item.reqId === row.reqId);
      if (holder && redemption?.holder !== holder.toLowerCase()) return false;
      if (provider && redemption?.provider !== provider.toLowerCase()) return false;
      const ruled = row.ruling !== null && row.ruling !== "NONE";
      if (status === "open" && ruled) return false;
      if (status === "ruled" && !ruled) return false;
      return true;
    });
    const data = rows.map((row) => {
      const redemption = snap.redemptions.find((item) => item.reqId === row.reqId);
      return {
        req_id: row.reqId.toString(),
        series_id: redemption?.seriesId.toString() ?? null,
        holder: redemption?.holder ?? null,
        provider: redemption?.provider ?? null,
        dispute_bond: formatUsdc(row.disputeBond),
        opened_at_ms: tsMs(row.openedAt),
        ruling_deadline_ms: tsMs(row.rulingDeadline),
        ruling: row.ruling,
        signers: row.signers,
        receipt_hash: redemption?.receiptHash ?? null,
        delivery_ref: redemption?.deliveryRef ?? null,
      };
    });
    return c.json(list(snap, clock(options, snap), data, null));
  });

  app.get("/v1/kyb/applications", (c) => {
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const status = c.req.query("status") ?? "PENDING";
    if (!["PENDING", "APPROVED", "EXPIRED", "REVOKED", "WITHDRAWN", "all"].includes(status)) {
      return bad(c, "status", "status must be PENDING, APPROVED, EXPIRED, REVOKED, WITHDRAWN, or all");
    }
    const includeInvalid = boolParam(c.req.query("include_invalid") ?? "false");
    if (includeInvalid === "bad") return bad(c, "include_invalid", "include_invalid must be true or false");
    const role = c.req.query("role");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    let rows = snap.kyb.filter((row) => {
      if (!includeInvalid && !row.valid) return false;
      if (status !== "all" && kybStatus(row, nowSec) !== status) return false;
      const applicant = c.req.query("applicant");
      if (applicant && row.applicant !== applicant.toLowerCase()) return false;
      if (role !== undefined && row.role !== Number(role)) return false;
      const country = c.req.query("country");
      if (country && row.country !== country) return false;
      return true;
    });
    rows.sort((a, b) => cmpAsc(a.submittedAt, b.submittedAt) || a.uid.localeCompare(b.uid));
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const uid = String(page.cursor.u ?? "");
      rows = rows.filter((row) => row.submittedAt > ts || (row.submittedAt === ts && row.uid > uid));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentKyb(snap, row, nowSec));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ ts: Number(last.submittedAt), u: last.uid }) : null;
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/kyb/applications/:uid", (c) => {
    const snap = c.get("snap");
    const uid = c.req.param("uid").toLowerCase();
    const row = snap.kyb.find((item) => item.uid === uid);
    if (!row) return notFound(c, "kyb application not found");
    const nowSec = sec(clock(options, snap));
    const history = snap.events
      .filter((item) => item.event === "Attested" || item.event === "Revoked")
      .filter((item) => {
        const args = item.args;
        return args.uid === row.uid || args.uid === row.approvalUid || args.refUID === row.uid;
      })
      .sort((a, b) => cmpAsc(a.ts, b.ts) || a.logIndex - b.logIndex)
      .map((item) => ({ event: item.event, ts_ms: tsMs(item.ts), tx_hash: item.txHash }));
    return c.json(
      ok(snap, clock(options, snap), {
        ...presentKyb(snap, row, nowSec),
        participant: presentParticipant(snap, row.applicant, nowSec),
        history,
      }),
    );
  });

  app.get("/v1/config-changes", (c) => {
    const snap = c.get("snap");
    const range = timeRange(c.req.query("from"), c.req.query("to"));
    if (range === "bad") return bad(c, "from", "from/to must be millisecond timestamps or ISO-8601");
    const format = c.req.query("format") ?? "json";
    if (format !== "json" && format !== "csv") return bad(c, "format", "format must be json or csv");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    const contract = c.req.query("contract");
    const event = c.req.query("event");
    let rows = snap.configChanges.filter((row) => {
      if (contract && row.contract !== contract) return false;
      if (event && row.event !== event) return false;
      if (range && (row.ts < range.from || row.ts >= range.to)) return false;
      return true;
    });
    rows.sort((a, b) => cmpDesc(a.ts, b.ts) || b.logIndex - a.logIndex);
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const logIndex = Number(page.cursor.l ?? 0);
      rows = rows.filter((row) => row.ts < ts || (row.ts === ts && row.logIndex < logIndex));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentConfig(snap, row));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ ts: Number(last.ts), l: last.logIndex }) : null;
    if (format === "csv") {
      return csv(c, data.map((row) => ({ ...row, args: JSON.stringify(row.args) })), ["id", "contract", "contract_address", "event", "args", "ts_ms", "ts_iso", "tx_hash", "tx_from", "tx_to", "explorer_url"], next);
    }
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/timelock/operations", (c) => {
    const snap = c.get("snap");
    const nowSec = sec(clock(options, snap));
    const status = c.req.query("status") ?? "all";
    if (!["PENDING", "READY", "DONE", "CANCELLED", "all"].includes(status)) {
      return bad(c, "status", "status must be PENDING, READY, DONE, CANCELLED, or all");
    }
    const target = c.req.query("target");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    let rows = snap.timelocks.filter((row) => {
      if (target && row.target !== target.toLowerCase()) return false;
      if (status !== "all" && timelockStatus(row, nowSec) !== status) return false;
      return true;
    });
    rows.sort((a, b) => cmpDesc(a.scheduledAt, b.scheduledAt) || a.index - b.index);
    if (page.cursor) {
      const ts = BigInt(page.cursor.ts ?? 0);
      const index = Number(page.cursor.i ?? 0);
      rows = rows.filter((row) => row.scheduledAt < ts || (row.scheduledAt === ts && row.index > index));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentTimelock(snap, row, nowSec));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ ts: Number(last.scheduledAt), i: last.index }) : null;
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.get("/v1/events", (c) => {
    const snap = c.get("snap");
    const range = timeRange(c.req.query("from"), c.req.query("to"));
    if (range === "bad") return bad(c, "from", "from/to must be millisecond timestamps or ISO-8601");
    const format = c.req.query("format") ?? "json";
    if (format !== "json" && format !== "csv") return bad(c, "format", "format must be json or csv");
    const page = pageOf(c.req.query("limit"), c.req.query("cursor"));
    if (page === "bad") return bad(c, "limit", "limit must be an integer from 1 to 1000");
    const contract = c.req.query("contract");
    const event = c.req.query("event");
    const series = c.req.query("series");
    const reqId = c.req.query("req_id");
    const tx = c.req.query("tx_hash");
    let rows = snap.events.filter((row) => {
      if (contract && row.contract !== contract) return false;
      if (event && row.event !== event) return false;
      if (series && row.seriesId !== null && !matchesSeries(snap, row.seriesId, series)) return false;
      if (reqId !== undefined && row.reqId !== BigInt(reqId)) return false;
      if (tx && row.txHash !== tx.toLowerCase()) return false;
      if (range && (row.ts < range.from || row.ts >= range.to)) return false;
      return true;
    });
    rows.sort((a, b) => cmpDesc(a.blockNumber, b.blockNumber) || b.logIndex - a.logIndex);
    if (page.cursor) {
      const block = BigInt(page.cursor.b ?? 0);
      const logIndex = Number(page.cursor.l ?? 0);
      rows = rows.filter((row) => row.blockNumber < block || (row.blockNumber === block && row.logIndex < logIndex));
    }
    const slice = rows.slice(0, page.limit);
    const data = slice.map((row) => presentEvent(snap, row));
    const last = slice[slice.length - 1];
    const next = slice.length === page.limit && last ? encodeCursor({ b: Number(last.blockNumber), l: last.logIndex }) : null;
    if (format === "csv") {
      return csv(c, data.map((row) => ({ ...row, args: JSON.stringify(row.args) })), ["id", "contract", "contract_address", "event", "args", "series_id", "req_id", "block_number", "ts_ms", "tx_hash", "tx_from", "explorer_url"], next);
    }
    return c.json(list(snap, clock(options, snap), data, next));
  });

  app.notFound((c) => c.json(errorBody("NOT_FOUND", "not found", {}), 404));
  return app;
}

function clock(options: CreateAppOptions, snap: Snapshot): number {
  return options.now ? options.now(snap) : resolveNow(snap.indexedAt);
}

function sec(ms: number): bigint {
  return BigInt(Math.floor(ms / 1000));
}

function num(value: bigint): number {
  return Number(value);
}

function ok(snap: Snapshot, nowMs: number, data: unknown) {
  return { data, meta: meta(snap, nowMs) };
}

function list(snap: Snapshot, nowMs: number, data: unknown[], next: string | null) {
  return { data, next_cursor: next, meta: meta(snap, nowMs) };
}

function meta(snap: Snapshot, nowMs: number) {
  return {
    chain_id: snap.chainId,
    indexed_block: num(snap.indexedBlock),
    indexed_at_ms: tsMs(snap.indexedAt),
    server_now_ms: nowMs,
  };
}

function errorBody(code: string, message: string, details: Record<string, unknown>) {
  return { error: { code, message, details } };
}

function bad(c: { json: (body: unknown, status: 400) => Response }, param: string, message: string) {
  return c.json(errorBody("INVALID_PARAM", message, { param }), 400);
}

function badGpu(c: { json: (body: unknown, status: 400) => Response }) {
  return c.json(
    errorBody("INVALID_PARAM", "unknown gpu", { param: "gpu", allowed: [...GPU_SHORTS] }),
    400,
  );
}

function notFound(c: { json: (body: unknown, status: 404) => Response }, message: string) {
  return c.json(errorBody("NOT_FOUND", message, {}), 404);
}

function csv(
  c: { header: (name: string, value: string) => void; body: (text: string) => Response },
  rows: Record<string, unknown>[],
  columns: string[],
  next: string | null,
) {
  c.header("Content-Type", "text/csv; charset=utf-8");
  if (next) c.header("X-Next-Cursor", next);
  return c.body(toCsv(rows, columns));
}

function pageOf(limitRaw: string | undefined, cursorRaw: string | undefined): { limit: number; cursor: Record<string, string | number> | null } | "bad" {
  const limit = limitRaw === undefined ? 100 : /^\d+$/.test(limitRaw) ? Number(limitRaw) : -1;
  if (limit < 1 || limit > 1000) return "bad";
  if (!cursorRaw) return { limit, cursor: null };
  try {
    return { limit, cursor: decodeCursor(cursorRaw) };
  } catch (error) {
    if (error instanceof CursorError) return "bad";
    throw error;
  }
}

function boolParam(raw: string | undefined): boolean | undefined | "bad" {
  if (raw === undefined) return undefined;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return "bad";
}

function timeRange(fromRaw: string | undefined, toRaw: string | undefined): { from: bigint; to: bigint } | null | "bad" {
  if (fromRaw === undefined && toRaw === undefined) return null;
  const from = fromRaw === undefined ? 0n : parseTime(fromRaw);
  const to = toRaw === undefined ? 2n ** 62n : parseTime(toRaw);
  if (from === null || to === null) return "bad";
  return { from, to };
}

function parseTime(raw: string): bigint | null {
  if (/^\d+$/.test(raw)) return BigInt(raw) / 1000n;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return null;
  return BigInt(Math.floor(ms / 1000));
}

function cmpDesc(a: bigint, b: bigint): number {
  return a === b ? 0 : a > b ? -1 : 1;
}

function cmpAsc(a: bigint, b: bigint): number {
  return a === b ? 0 : a < b ? -1 : 1;
}

function txUrl(snap: Snapshot, hash: string): string {
  return `${snap.explorerBase}/tx/${hash}`;
}

function seriesById(snap: Snapshot, id: bigint): SeriesRow | undefined {
  return snap.series.find((row) => row.seriesId === id);
}

function findSeries(snap: Snapshot, idOrSymbol: string): SeriesRow | undefined {
  if (/^\d+$/.test(idOrSymbol)) return seriesById(snap, BigInt(idOrSymbol));
  return snap.series.find((row) => row.symbol === idOrSymbol);
}

function matchesSeries(snap: Snapshot, seriesId: bigint, filter: string): boolean {
  const parts = filter.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.some((part) => {
    const row = findSeries(snap, part);
    return row?.seriesId === seriesId;
  });
}

function bondOf(snap: Snapshot, seriesId: bigint): BondRow | undefined {
  return snap.bonds.find((row) => row.seriesId === seriesId);
}

function providerOf(snap: Snapshot, address: string): ProviderRow | undefined {
  return snap.providers.find((row) => row.address === address);
}

function isVerified(snap: Snapshot, address: string, nowSec: bigint): boolean {
  const row = snap.participants.find((item) => item.address === address);
  if (!row || row.revoked) return false;
  return row.expiry === 0n || row.expiry > nowSec;
}

function saleOpen(row: SeriesRow, nowSec: bigint): boolean {
  return !row.paused && nowSec < row.windowEnd && row.soldSupply < row.maxSupply;
}

function latestReference(snap: Snapshot, gpuModel: Hex): ReferenceRow | undefined {
  return snap.references
    .filter((row) => row.gpuModel === gpuModel)
    .sort((a, b) => cmpDesc(a.roundId, b.roundId))[0];
}

function coverageOf(snap: Snapshot, row: SeriesRow): string | null {
  const own = latestReference(snap, row.gpuModel);
  const h100 = latestReference(snap, gpuModelHash("H100"));
  const ref = own ?? h100;
  if (!ref) return null;
  return formatRatioFloor(row.bondPerCu, ref.value, 2);
}

function paramsOf(snap: Snapshot) {
  return snap.indexParams ?? DEMO_INDEX_PARAMS;
}

function indexState(snap: Snapshot, gpu: GpuShort): IndexStateRow | undefined {
  return snap.indexStates.find((row) => row.gpuModel === gpuModelHash(gpu));
}

function presentIndex(snap: Snapshot, gpu: GpuShort, nowSec: bigint) {
  const state = indexState(snap, gpu);
  const params = paramsOf(snap);
  const model = gpuModelHash(gpu);
  const windowStart = nowSec - params.windowSecs;
  const prints = snap.prints.filter((row) => row.gpuModel === model && row.eligible && row.ts >= windowStart && row.ts <= nowSec);
  let notional = 0n;
  let qty = 0n;
  const entities = new Set<string>();
  for (const row of prints) {
    notional += row.notional;
    qty += row.qtyCu;
    if (row.makerEntity !== ZERO_BYTES32) entities.add(row.makerEntity);
    if (row.takerEntity !== ZERO_BYTES32) entities.add(row.takerEntity);
  }
  const vwap = qty === 0n ? null : (notional * 10n ** 18n) / qty;
  const status = state?.status ?? "THIN";
  const carry = state?.lastOkAnswer ?? null;
  const value = status === "OK" ? (vwap ?? carry) : carry;
  const ref = latestReference(snap, model);
  return {
    gpu,
    gpu_type: GPU_TYPES[gpu],
    unit: "USD per CU (H100-equivalent GPU-hour)",
    status,
    value: value === null ? null : formatUsdc(value),
    onchain_vwap: state?.answer == null ? null : formatUsdc(state.answer),
    round_id: (state?.roundId ?? 0n).toString(),
    updated_at_ms: state ? tsMs(state.updatedAt) : null,
    last_ok_at_ms: state?.lastOkAt == null ? null : tsMs(state.lastOkAt),
    window_secs: Number(params.windowSecs),
    eligible_volume_cu: formatCu(qty),
    participants: entities.size,
    thresholds: {
      min_volume_cu: formatCu(params.minVolume),
      min_participants: params.minParticipants,
      max_carry_forward_secs: Number(params.maxCarryForwardSecs),
    },
    method: { type: "winsorized_vwap", alpha: null, methodology: "METHODOLOGY.md" },
    reference: ref
      ? { value: formatUsdc(ref.value), label: ref.label, observed_at_ms: tsMs(ref.observedAt) }
      : null,
  };
}

function volume24h(snap: Snapshot, seriesId: bigint, nowSec: bigint): { cu: bigint; usd: bigint } {
  const from = nowSec - 86400n;
  let cu = 0n;
  let usd = 0n;
  for (const row of snap.prints) {
    if (row.seriesId === seriesId && row.kind === "TRADE" && row.ts >= from && row.ts <= nowSec) {
      cu += row.qtyCu;
      usd += row.notional;
    }
  }
  return { cu, usd };
}

function presentSeries(snap: Snapshot, row: SeriesRow, nowSec: bigint, withProvider = true) {
  const vol = volume24h(snap, row.seriesId, nowSec);
  const provider = providerOf(snap, row.provider);
  const body: Record<string, unknown> = {
    series_id: row.seriesId.toString(),
    symbol: row.symbol,
    token: row.token,
    gpu: row.gpu,
    gpu_type: gpuTypeOf(row.gpu) ?? row.gpu,
    factor: formatFactor(row.factor),
    region: row.continent,
    country: row.country,
    delivery_window: row.deliveryWindow,
    window_start_ms: tsMs(row.windowStart),
    window_end_ms: tsMs(row.windowEnd),
    primary_price: formatUsdc(row.primaryPrice),
    native_primary_price: formatUsdc((row.primaryPrice * BigInt(row.factor)) / 10_000n),
    last_price: row.lastPrice === null ? null : formatUsdc(row.lastPrice),
    volume_24h_cu: formatCu(vol.cu),
    volume_24h_usd: formatUsdc(vol.usd),
    bond_per_cu: formatUsdc(row.bondPerCu),
    coverage: coverageOf(snap, row),
    max_supply: formatCu(row.maxSupply),
    sold_supply: formatCu(row.soldSupply),
    total_supply: formatCu(row.totalSupply),
    paused: row.paused,
    finalized: row.finalized,
    sale_open: saleOpen(row, nowSec),
    institutional: row.institutional,
  };
  if (withProvider) {
    body.provider = {
      address: row.provider,
      verified: isVerified(snap, row.provider, nowSec),
      status: provider?.status ?? "NONE",
      delivered_cu: formatCu(provider?.deliveredCu ?? 0n),
      defaulted_cu: formatCu(provider?.defaultedCu ?? 0n),
      voluntary_defaulted_cu: formatCu(provider?.voluntaryDefaultedCu ?? 0n),
    };
  }
  return body;
}

function presentSeriesDetail(snap: Snapshot, row: SeriesRow, nowSec: bigint) {
  const bond = bondOf(snap, row.seriesId);
  const redemptions = snap.redemptions.filter((item) => item.seriesId === row.seriesId);
  const sum = (pred: (item: RedemptionRow) => boolean) =>
    redemptions.filter(pred).reduce((total, item) => total + item.amount, 0n);
  const index = presentIndex(snap, (isGpuShort(row.gpu) ? row.gpu : "H100") as GpuShort, nowSec);
  return {
    ...presentSeries(snap, row, nowSec),
    gpu_hours: formatCu(row.gpuHours * 10n ** 18n),
    terms: {
      ack_window_secs: Number(row.ackWindow),
      delivery_window_secs: Number(row.deliveryWindowSecs),
      dispute_window_secs: Number(row.disputeWindow),
      min_redemption_cu: formatCu(row.minRedemption),
      arbitrator: row.arbitrator,
      spec_hash: row.specHash,
      terms_hash: row.termsHash,
    },
    bond: {
      deposited: formatUsdc(bond?.deposited ?? 0n),
      balance: formatUsdc(bond?.balance ?? 0n),
      released: formatUsdc(bond?.released ?? 0n),
      slashed: formatUsdc(bond?.slashed ?? 0n),
      health: bond && bond.deposited > 0n ? formatRatioFloor(bond.balance, bond.deposited, 3) : null,
      finalized: bond?.finalized ?? false,
      withdrawn: bond?.withdrawn ?? false,
    },
    redemption_stats: {
      requested_cu: formatCu(redemptions.reduce((total, item) => total + item.amount, 0n)),
      delivered_cu: formatCu(sum((item) => item.state === "FINALIZED")),
      defaulted_cu: formatCu(sum((item) => item.state === "DEFAULTED")),
      open_requests: redemptions.filter((item) => !TERMINAL.has(item.state)).length,
      locked_cu: formatCu(row.lockedSupply),
    },
    index: { status: index.status, value: index.value },
    created_at_ms: tsMs(row.createdAt),
    created_tx: row.createdTx,
    explorer_url: txUrl(snap, row.createdTx),
  };
}

function presentBook(snap: Snapshot, row: SeriesRow, depth: number) {
  const open = snap.orders.filter(
    (order) => order.seriesId === row.seriesId && (order.status === "OPEN" || order.status === "PARTIAL") && order.qtyRemaining > 0n,
  );
  const levels = (side: string, desc: boolean) => {
    const grouped = new Map<string, { price: bigint; qty: bigint; orders: number }>();
    for (const order of open.filter((item) => item.side === side)) {
      const key = order.price.toString();
      const prev = grouped.get(key) ?? { price: order.price, qty: 0n, orders: 0 };
      prev.qty += order.qtyRemaining;
      prev.orders += 1;
      grouped.set(key, prev);
    }
    return [...grouped.values()]
      .sort((a, b) => (desc ? cmpDesc(a.price, b.price) : cmpAsc(a.price, b.price)))
      .slice(0, depth)
      .map((level) => ({ price: formatUsdc(level.price), qty_cu: formatCu(level.qty), orders: level.orders }));
  };
  const bids = levels("BID", true);
  const asks = levels("ASK", false);
  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  let spread: string | null = null;
  if (bestBid && bestAsk) {
    const bid = open.filter((order) => order.side === "BID").sort((a, b) => cmpDesc(a.price, b.price))[0];
    const ask = open.filter((order) => order.side === "ASK").sort((a, b) => cmpAsc(a.price, b.price))[0];
    if (bid && ask) spread = formatUsdc(ask.price - bid.price);
  }
  return {
    series_id: row.seriesId.toString(),
    symbol: row.symbol,
    tick: "0.010000",
    bids,
    asks,
    best_bid: bestBid,
    best_ask: bestAsk,
    spread,
  };
}

function presentOrder(snap: Snapshot, row: OrderRow) {
  const series = seriesById(snap, row.seriesId);
  return {
    order_id: row.orderId.toString(),
    series_id: row.seriesId.toString(),
    symbol: series?.symbol ?? null,
    maker: row.maker,
    side: row.side,
    price: formatUsdc(row.price),
    qty_initial: formatCu(row.qtyInitial),
    qty_remaining: formatCu(row.qtyRemaining),
    status: row.status,
    created_at_ms: tsMs(row.createdAt),
    updated_at_ms: tsMs(row.updatedAt),
    tx_hash: row.txHash,
  };
}

function presentPrint(snap: Snapshot, row: PrintRow) {
  const series = seriesById(snap, row.seriesId);
  return {
    id: row.id,
    kind: row.kind,
    gpu_type: gpuTypeOf(row.gpu) ?? row.gpu,
    gpu: row.gpu,
    price_per_gpu_hour: formatUsdc(row.nativePrice),
    cu_price: formatUsdc(row.cuPrice),
    factor: formatFactor(row.factor),
    qty_cu: formatCu(row.qtyCu),
    native_gpu_hours: formatCu(row.nativeGpuHours),
    gpu_count: null,
    region: row.continent,
    country: row.country,
    ts_ms: tsMs(row.ts),
    ts_iso: tsIso(row.ts),
    series: series?.symbol ?? null,
    series_id: row.seriesId.toString(),
    delivery_window: row.deliveryWindow,
    side: row.takerSide,
    notional_usd: formatUsdc(row.notional),
    fee_usd: formatUsdc(row.fee),
    maker: row.maker,
    taker: row.taker,
    eligible: row.eligible,
    ineligible_reason: row.ineligibleReason,
    index_status: row.indexStatus,
    thin: row.thin,
    block_number: num(row.blockNumber),
    tx_hash: row.txHash,
    explorer_url: txUrl(snap, row.txHash),
  };
}

function presentLedger(snap: Snapshot, row: LedgerRow) {
  const series = row.seriesId === null ? undefined : seriesById(snap, row.seriesId);
  return {
    ts_ms: tsMs(row.ts),
    ts_iso: tsIso(row.ts),
    kind: row.kind,
    series_id: row.seriesId?.toString() ?? null,
    symbol: series?.symbol ?? null,
    req_id: row.reqId?.toString() ?? null,
    order_id: row.orderId?.toString() ?? null,
    usdc_delta: formatUsdc(row.usdcDelta),
    cu_delta: formatCu(row.cuDelta),
    counterparty: row.counterparty,
    tx_hash: row.txHash,
    explorer_url: txUrl(snap, row.txHash),
  };
}

function statementSummary(rows: LedgerRow[]) {
  let usdcIn = 0n;
  let usdcOut = 0n;
  let fees = 0n;
  let bought = 0n;
  let sold = 0n;
  let redeemed = 0n;
  let payouts = 0n;
  for (const row of rows) {
    if (row.usdcDelta > 0n) usdcIn += row.usdcDelta;
    if (row.usdcDelta < 0n) usdcOut += -row.usdcDelta;
    if (row.kind === "FEE_PAID" && row.usdcDelta < 0n) fees += -row.usdcDelta;
    if ((row.kind === "PRIMARY_BUY" || row.kind === "TRADE_BUY") && row.cuDelta > 0n) bought += row.cuDelta;
    if (row.kind === "TRADE_SELL" && row.cuDelta < 0n) sold += -row.cuDelta;
    if (row.kind === "REDEMPTION_LOCK" && row.cuDelta < 0n) redeemed += -row.cuDelta;
    if (row.kind === "DEFAULT_PAYOUT" && row.usdcDelta > 0n) payouts += row.usdcDelta;
  }
  return {
    usdc_in: formatUsdc(usdcIn),
    usdc_out: formatUsdc(usdcOut),
    fees_paid: formatUsdc(fees),
    cu_bought: formatCu(bought),
    cu_sold: formatCu(sold),
    cu_redeemed: formatCu(redeemed),
    default_payouts: formatUsdc(payouts),
  };
}

function effectiveState(row: RedemptionRow, nowSec: bigint): string {
  if (row.state === "REQUESTED" && nowSec > row.ackDeadline) return "DEFAULTABLE";
  if (row.state === "ACKNOWLEDGED" && row.deliveryDeadline !== null && nowSec > row.deliveryDeadline) return "DEFAULTABLE";
  return row.state;
}

function actionsOf(row: RedemptionRow, nowSec: bigint): string[] {
  if (effectiveState(row, nowSec) === "DEFAULTABLE") return ["CLAIM_DEFAULT"];
  if (row.state === "REQUESTED" && nowSec <= row.ackDeadline) return ["ACK", "DECLINE_AND_PAY"];
  if (row.state === "ACKNOWLEDGED" && row.deliveryDeadline !== null && nowSec <= row.deliveryDeadline) {
    return ["MARK_DELIVERED", "DECLINE_AND_PAY"];
  }
  if (row.state === "DELIVERED" && row.disputeDeadline !== null && nowSec <= row.disputeDeadline) return ["CONFIRM", "DISPUTE"];
  if (row.state === "DELIVERED" && row.disputeDeadline !== null && nowSec > row.disputeDeadline) return ["FINALIZE"];
  if (row.state === "DISPUTED" && row.rulingDeadline !== null && nowSec > row.rulingDeadline) return ["RESOLVE_NO_RULING"];
  return [];
}

function nextDeadline(row: RedemptionRow, nowSec: bigint): bigint | null {
  if (effectiveState(row, nowSec) === "DEFAULTABLE") return null;
  if (row.state === "REQUESTED") return row.ackDeadline;
  if (row.state === "ACKNOWLEDGED") return row.deliveryDeadline;
  if (row.state === "DELIVERED") return row.disputeDeadline;
  if (row.state === "DISPUTED") return row.rulingDeadline;
  return null;
}

function msOrNull(value: bigint | null): number | null {
  return value === null ? null : tsMs(value);
}

function presentRedemption(snap: Snapshot, row: RedemptionRow, nowSec: bigint) {
  const series = seriesById(snap, row.seriesId);
  const deadline = nextDeadline(row, nowSec);
  return {
    req_id: row.reqId.toString(),
    series_id: row.seriesId.toString(),
    symbol: series?.symbol ?? null,
    holder: row.holder,
    provider: row.provider,
    amount_cu: formatCu(row.amount),
    claim_usd: formatUsdc(row.claim),
    state: effectiveState(row, nowSec),
    stored_state: row.state,
    requested_at_ms: tsMs(row.requestedAt),
    ack_deadline_ms: tsMs(row.ackDeadline),
    acknowledged_at_ms: msOrNull(row.acknowledgedAt),
    delivery_deadline_ms: msOrNull(row.deliveryDeadline),
    delivered_at_ms: msOrNull(row.deliveredAt),
    dispute_deadline_ms: msOrNull(row.disputeDeadline),
    disputed_at_ms: msOrNull(row.disputedAt),
    ruling_deadline_ms: msOrNull(row.rulingDeadline),
    resolved_at_ms: msOrNull(row.resolvedAt),
    next_deadline_ms: msOrNull(deadline),
    delivery_ref: row.deliveryRef,
    receipt_hash: row.receiptHash,
    dispute_bond: row.disputeBond === null ? null : formatUsdc(row.disputeBond),
    ruling: row.ruling,
    payout: row.payout === null ? null : formatUsdc(row.payout),
    bond_released: row.bondReleased === null ? null : formatUsdc(row.bondReleased),
    voluntary: row.voluntary,
    via_dispute: row.viaDispute,
    auto_finalized: row.autoFinalized,
    default_caller: row.defaultCaller,
    refunded_after_window: row.refundedAfterWindow,
    reopened_from_req_id: row.reopenedFromReqId?.toString() ?? null,
    reopened_to_req_id: row.reopenedToReqId?.toString() ?? null,
    actions: actionsOf(row, nowSec),
  };
}

function presentProvider(snap: Snapshot, row: ProviderRow, nowSec: bigint) {
  const series = snap.series.filter((item) => item.provider === row.address);
  const bonds = series.map((item) => bondOf(snap, item.seriesId)).filter((item): item is BondRow => Boolean(item));
  const sum = (pick: (bond: BondRow) => bigint) => bonds.reduce((total, bond) => total + pick(bond), 0n);
  const ledger = snap.ledger.filter((item) => item.account === row.address);
  const gross = ledger.filter((item) => item.kind === "PRIMARY_PROCEEDS").reduce((total, item) => total + item.usdcDelta, 0n);
  const fees = ledger.filter((item) => item.kind === "FEE_PAID" && item.usdcDelta < 0n).reduce((total, item) => total - item.usdcDelta, 0n);
  return {
    address: row.address,
    entity_id: row.entityId,
    status: row.status,
    verified: isVerified(snap, row.address, nowSec),
    reputation: {
      delivered_cu: formatCu(row.deliveredCu),
      defaulted_cu: formatCu(row.defaultedCu),
      voluntary_defaulted_cu: formatCu(row.voluntaryDefaultedCu),
      disputes_lost: row.disputesLost,
      strikes: row.strikes,
    },
    series: series
      .sort((a, b) => cmpAsc(a.seriesId, b.seriesId))
      .map((item) => presentSeries(snap, item, nowSec, false)),
    bond: {
      deposited: formatUsdc(sum((bond) => bond.deposited)),
      balance: formatUsdc(sum((bond) => bond.balance)),
      released: formatUsdc(sum((bond) => bond.released)),
      slashed: formatUsdc(sum((bond) => bond.slashed)),
    },
    proceeds: { gross: formatUsdc(gross), fees: formatUsdc(fees), net: formatUsdc(gross - fees) },
    open_requests: snap.redemptions.filter((item) => item.provider === row.address && !TERMINAL.has(item.state)).length,
  };
}

function presentProviderList(snap: Snapshot, row: ProviderRow, nowSec: bigint) {
  const series = snap.series.filter((item) => item.provider === row.address);
  return {
    address: row.address,
    entity_id: row.entityId,
    status: row.status,
    verified: isVerified(snap, row.address, nowSec),
    reputation: {
      delivered_cu: formatCu(row.deliveredCu),
      defaulted_cu: formatCu(row.defaultedCu),
      voluntary_defaulted_cu: formatCu(row.voluntaryDefaultedCu),
      disputes_lost: row.disputesLost,
      strikes: row.strikes,
    },
    series_count: series.length,
    active_series_count: series.filter((item) => !item.finalized).length,
    registered_at_ms: tsMs(row.registeredAt),
    updated_at_ms: tsMs(row.updatedAt),
  };
}

function presentParticipant(snap: Snapshot, address: Hex, nowSec: bigint) {
  const row = snap.participants.find((item) => item.address === address);
  if (!row) {
    return {
      address,
      verified: false,
      entity_id: null,
      role: null,
      country: null,
      expiry_ms: null,
      source: null,
      attestation_uid: null,
      attester: null,
      revoked: false,
      explorer_url: null,
    };
  }
  return {
    address: row.address,
    verified: isVerified(snap, row.address, nowSec),
    entity_id: row.entityId,
    role: { code: row.role, name: roleName(row.role) },
    country: row.country,
    expiry_ms: tsMs(row.expiry),
    source: row.source,
    attestation_uid: row.attestationUid,
    attester: row.attester,
    revoked: row.revoked,
    explorer_url: row.txHash ? txUrl(snap, row.txHash) : null,
  };
}

function presentDelivery(snap: Snapshot, row: DeliveryRow) {
  const series = seriesById(snap, row.seriesId);
  const denom = row.deliveredCu + row.defaultedCu;
  return {
    series_id: row.seriesId.toString(),
    symbol: series?.symbol ?? null,
    gpu: row.gpu,
    month: row.month,
    delivered_cu: formatCu(row.deliveredCu),
    delivered_gpu_hours: formatCu(row.deliveredGpuHours),
    defaulted_cu: formatCu(row.defaultedCu),
    default_count: row.defaultCount,
    finalized_count: row.finalizedCount,
    default_rate: denom === 0n ? null : formatRatioHalfUp(row.defaultedCu, denom, 3),
  };
}

function kybStatus(row: KybRow, nowSec: bigint): string {
  if (row.withdrawn) return "WITHDRAWN";
  if (row.approvalRevoked) return "REVOKED";
  if (row.approvalUid && row.approvalExpiry !== null && row.approvalExpiry <= nowSec) return "EXPIRED";
  if (row.approvalUid) return "APPROVED";
  return "PENDING";
}

function presentKyb(snap: Snapshot, row: KybRow, nowSec: bigint) {
  return {
    uid: row.uid,
    applicant: row.applicant,
    entity_id: row.entityId,
    role: { code: row.role, name: roleName(row.role) },
    country: row.country,
    data_hash: row.dataHash,
    submitted_at_ms: tsMs(row.submittedAt),
    status: kybStatus(row, nowSec),
    approval: row.approvalUid
      ? {
          attestation_uid: row.approvalUid,
          attester: row.approver,
          approved_at_ms: row.approvedAt === null ? null : tsMs(row.approvedAt),
          expiry_ms: row.approvalExpiry === null ? null : tsMs(row.approvalExpiry),
        }
      : null,
    tx_hash: row.txHash,
    explorer_url: txUrl(snap, row.txHash),
  };
}

function presentConfig(snap: Snapshot, row: ConfigRow) {
  return {
    id: row.id,
    contract: row.contract,
    contract_address: row.contractAddress,
    event: row.event,
    args: row.args,
    ts_ms: tsMs(row.ts),
    ts_iso: tsIso(row.ts),
    tx_hash: row.txHash,
    tx_from: row.txFrom,
    tx_to: row.txTo,
    explorer_url: txUrl(snap, row.txHash),
  };
}

function presentEvent(snap: Snapshot, row: EventRow) {
  return {
    id: row.id,
    contract: row.contract,
    contract_address: row.contractAddress,
    event: row.event,
    args: row.args,
    series_id: row.seriesId?.toString() ?? null,
    req_id: row.reqId?.toString() ?? null,
    block_number: num(row.blockNumber),
    ts_ms: tsMs(row.ts),
    tx_hash: row.txHash,
    tx_from: row.txFrom,
    explorer_url: txUrl(snap, row.txHash),
  };
}

function timelockStatus(row: TimelockRow, nowSec: bigint): string {
  if (row.cancelledAt !== null) return "CANCELLED";
  if (row.executedAt !== null) return "DONE";
  if (nowSec >= row.readyAt) return "READY";
  return "PENDING";
}

function presentTimelock(snap: Snapshot, row: TimelockRow, nowSec: bigint) {
  return {
    operation_id: row.timelockId,
    target: row.target,
    target_name: snap.contractNames[row.target] ?? null,
    value: row.value.toString(),
    data: row.data,
    decoded: decodeCall(row.data),
    predecessor: row.predecessor,
    salt: row.salt,
    delay_s: Number(row.delayS),
    scheduled_at_ms: tsMs(row.scheduledAt),
    ready_at_ms: tsMs(row.readyAt),
    status: timelockStatus(row, nowSec),
    scheduled_tx: row.scheduledTx,
    executed_tx: row.executedTx,
    cancelled_tx: row.cancelledTx,
  };
}

function decodeCall(data: Hex): { function: string; args: Record<string, unknown> } | null {
  try {
    const decoded = decodeFunctionData({ abi: conversionTableAbi, data });
    if (decoded.functionName === "setFactor") {
      const [gpuModel, factor] = decoded.args;
      const gpu = shortOfModel(gpuModel);
      return { function: "setFactor", args: { gpu: gpu ?? gpuModel, factor: formatFactor(factor) } };
    }
    return { function: decoded.functionName, args: {} };
  } catch {
    return null;
  }
}

const USDC_ARG = new Set(["bondReleased", "payout", "disputeBond", "disputeBondReturned", "cost", "fee", "price", "amountUsd"]);
const CU_ARG = new Set(["amount", "qty"]);

function timelineArgs(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    const name = key === "auto_" ? "auto" : key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
    if (typeof value === "string" && /^-?\d+$/.test(value) && USDC_ARG.has(key)) out[name] = formatUsdc(BigInt(value));
    else if (typeof value === "string" && /^-?\d+$/.test(value) && CU_ARG.has(key)) out[name] = formatCu(BigInt(value));
    else out[name] = value;
  }
  return out;
}
