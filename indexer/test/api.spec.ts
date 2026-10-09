import { describe, expect, it } from "vitest";
import { createApp, resolveNow } from "../src/api/create-app.js";
import type { Snapshot } from "../src/api/snapshot.js";
import { MemoryStore } from "../src/store/memory.js";
import {
  APPROVAL_UID,
  APPLICANT,
  BUY,
  BUY2,
  CHAIN_ID,
  CONVERSION,
  DATA_HASH,
  DEMO_NOW,
  E_KYB,
  EXPLORER,
  INDEXED_AT,
  INDEXED_BLOCK,
  JUDGE,
  JKT,
  KYB_UID,
  OP_ID,
  TRADER,
  kybApproved,
  kybPending,
  replay,
  timelock,
} from "./demo-replay.js";

const TRADE = `0x${"c5".repeat(32)}`;
const PRIMARY10 = `0x${"c3".repeat(32)}`;
const PRIMARY20 = `0x${"c2".repeat(32)}`;
const CREATED = `0x${"c1".repeat(32)}`;

async function appAt(store: MemoryStore, nowSec = DEMO_NOW, indexedBlock = INDEXED_BLOCK, indexedAt = INDEXED_AT) {
  return createApp({
    load: async () => snapshot(store, indexedBlock, indexedAt),
    now: () => Number(nowSec) * 1000,
  });
}

function snapshot(store: MemoryStore, indexedBlock: bigint, indexedAt: bigint): Promise<Snapshot> {
  return build(store, indexedBlock, indexedAt, true);
}

async function build(store: MemoryStore, indexedBlock: bigint, indexedAt: bigint, synced: boolean): Promise<Snapshot> {
  const list = async <T>(table: string) => store.list<T>(table);
  const params = await list<{ id: string }>("index_params");
  return {
    chainId: CHAIN_ID,
    chainKey: "robinhoodTestnet",
    explorerBase: EXPLORER,
    indexedBlock,
    indexedAt,
    headBlock: indexedBlock,
    synced,
    series: await list("series"),
    bonds: await list("bond"),
    prints: await list("print"),
    orders: await list("order"),
    holdings: await list("holding"),
    redemptions: await list("redemption"),
    disputes: await list("dispute"),
    providers: await list("provider"),
    participants: await list("participant"),
    indexStates: await list("index_state"),
    indexRounds: await list("index_round"),
    references: await list("reference_price"),
    ledger: await list("ledger_entry"),
    deliveries: await list("delivery_record"),
    gpuFactors: await list("gpu_factor"),
    configChanges: await list("config_change"),
    kyb: await list("kyb_application"),
    events: await list("event_log"),
    timelocks: await list("timelock_operation"),
    indexParams: (params[0] as Snapshot["indexParams"]) ?? null,
    contractNames: { [CONVERSION]: "ConversionTable" },
  };
}

async function get(store: MemoryStore, path: string, nowSec = DEMO_NOW) {
  const app = await appAt(store, nowSec);
  const response = await app.request(path);
  const body = await response.json();
  return { status: response.status, body, response };
}

describe("API-01 health", () => {
  it("reports synced with the indexed head", async () => {
    const store = await replay("end");
    const { status, body } = await get(store, "/v1/health");
    expect(status).toBe(200);
    expect(body.data.synced).toBe(true);
    expect(body.data.chain).toBe("robinhoodTestnet");
    expect(body.data.indexed_block).toBeGreaterThanOrEqual(130100390);
    expect(body.data.api_version).toBe("v1");
    expect(body.meta.server_now_ms).toBe(Number(DEMO_NOW) * 1000);
  });

  it("answers /health the same way for the Railway healthcheck", async () => {
    const store = await replay("end");
    const app = await appAt(store);
    const response = await app.request("/health");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.synced).toBe(true);
  });

  it("serves 503 on data routes while unsynced and still serves health", async () => {
    const store = await replay("end");
    const app = createApp({
      load: () => build(store, 0n, 0n, false),
      now: () => Date.now(),
    });
    const health = await app.request("/v1/health");
    expect(health.status).toBe(200);
    const blocked = await app.request("/v1/prints");
    expect(blocked.status).toBe(503);
    const body = await blocked.json();
    expect(body.error.code).toBe("INDEXER_SYNCING");
    expect(body.meta).toBeUndefined();
  });
});

describe("API-02 prints", () => {
  it("returns the three newest H100 prints", async () => {
    const store = await replay("end");
    const { body } = await get(store, "/v1/prints?gpu=H100&limit=3");
    expect(body.data).toHaveLength(3);
    expect(body.data[0]).toMatchObject({
      id: `46630-${TRADE}-4`,
      kind: "TRADE",
      gpu_type: "H100-SXM-80GB",
      gpu: "H100",
      cu_price: "3.200000",
      qty_cu: "5",
      fee_usd: "0.024000",
      eligible: true,
      index_status: "OK",
      thin: false,
      gpu_count: null,
      maker: TRADER,
      taker: BUY2,
      series: "CU-JKT-H100-2610",
      series_id: "4",
    });
    expect(body.data[1]).toMatchObject({
      id: `46630-${PRIMARY10}-2`,
      kind: "PRIMARY",
      qty_cu: "10",
      cu_price: "3.000000",
      eligible: false,
      ineligible_reason: "PRIMARY",
      index_status: "THIN",
    });
    expect(body.data[2]).toMatchObject({
      id: `46630-${PRIMARY20}-2`,
      kind: "PRIMARY",
      qty_cu: "20",
      cu_price: "3.000000",
      fee_usd: "0.600000",
      eligible: false,
      ineligible_reason: "PRIMARY",
      taker: BUY,
    });
    expect(body.next_cursor).toBe("eyJ0cyI6MTc5MTYwMTI0MCwibCI6Mn0");
    expect(body.meta.chain_id).toBe(46630);
    expect(body.meta.server_now_ms).toBeTypeOf("number");
  });
});

describe("API-03 csv", () => {
  it("matches the JSON field order and row count", async () => {
    const store = await replay("end");
    const app = await appAt(store);
    const json = await (await app.request("/v1/prints?gpu=H100&limit=3")).json();
    const csv = await app.request("/v1/prints?gpu=H100&limit=3&format=csv");
    expect(csv.headers.get("content-type")).toContain("text/csv");
    const text = await csv.text();
    const [header, ...lines] = text.trim().split("\n");
    expect(header?.split(",")).toEqual(Object.keys(json.data[0]));
    expect(lines).toHaveLength(json.data.length);
    expect(lines[0]).toContain(TRADE);
    expect(csv.headers.get("x-next-cursor")).toBe(json.next_cursor);
  });
});

describe("API-04 index", () => {
  it("is OK at 3.20 after the trade and THIN before it", async () => {
    const after = await replay("end");
    const ok = await get(after, "/v1/index/H100");
    expect(ok.body.data).toMatchObject({
      status: "OK",
      value: "3.200000",
      onchain_vwap: "3.200000",
      participants: 2,
      eligible_volume_cu: "5",
      window_secs: 86400,
    });
    expect(ok.body.data.method).toEqual({ type: "winsorized_vwap", alpha: null, methodology: "METHODOLOGY.md" });
    expect(ok.body.data.reference.label).toBe("synthetic demo data");

    const before = await replay("beforeTrade");
    const thin = await get(before, "/v1/index/H100", 1791601260n);
    expect(thin.body.data.status).toBe("THIN");
    expect(thin.body.data.value).toBeNull();
  });
});

describe("API-05 series", () => {
  it("reports bond health, coverage, and supplies for series 4", async () => {
    const store = await replay("end");
    const { body } = await get(store, "/v1/series/4");
    expect(body.data.symbol).toBe("CU-JKT-H100-2610");
    expect(body.data.sold_supply).toBe("30");
    expect(body.data.total_supply).toBe("12");
    expect(body.data.coverage).toBe("1.50");
    expect(body.data.gpu_hours).toBe("500");
    expect(body.data.bond).toEqual({
      deposited: "2250.000000",
      balance: "2169.000000",
      released: "36.000000",
      slashed: "45.000000",
      health: "0.964",
      finalized: false,
      withdrawn: false,
    });
    expect(body.data.redemption_stats).toMatchObject({
      delivered_cu: "8",
      defaulted_cu: "10",
      open_requests: 0,
    });
    expect(body.data.created_tx).toBe(CREATED);
    const series2 = await get(store, "/v1/series/2");
    expect(series2.body.data.coverage).toBe("2.03");
    expect(series2.body.data.native_primary_price).toBe("5.684000");
  });
});

describe("API-06 orderbook", () => {
  it("is empty on series 4 and still has the series 3 ask", async () => {
    const store = await replay("end");
    const book4 = await get(store, "/v1/series/4/orderbook");
    expect(book4.body.data.bids).toEqual([]);
    expect(book4.body.data.asks).toEqual([]);
    expect(book4.body.data.best_ask).toBeNull();
    const book3 = await get(store, "/v1/series/3/orderbook");
    expect(book3.body.data.asks.length).toBeGreaterThan(0);
  });
});

describe("API-07 redemptions", () => {
  it("returns finalized and defaulted requests and an ordered timeline", async () => {
    const store = await replay("end");
    const list = await get(store, `/v1/redemptions?holder=${BUY}`);
    const byId = Object.fromEntries(list.body.data.map((row: { req_id: string }) => [row.req_id, row]));
    expect(byId["1"]).toMatchObject({ state: "FINALIZED", bond_released: "36.000000" });
    expect(byId["2"]).toMatchObject({
      state: "DEFAULTED",
      payout: "45.000000",
      voluntary: false,
      default_caller: JUDGE,
      holder: BUY,
    });
    const detail = await get(store, "/v1/redemptions/1");
    expect(detail.body.data.timeline.map((item: { event: string }) => item.event)).toEqual([
      "RedemptionRequested",
      "Acknowledged",
      "Delivered",
      "RedemptionFinalized",
      "BondReleased",
    ]);
  });
});

describe("API-08 defaultable", () => {
  it("derives DEFAULTABLE once now is past the ack deadline", async () => {
    const store = await replay("beforeDefault");
    const { body } = await get(store, `/v1/redemptions?holder=${BUY}&state=DEFAULTABLE`, 1791601441n);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).toMatchObject({
      req_id: "2",
      state: "DEFAULTABLE",
      stored_state: "REQUESTED",
      actions: ["CLAIM_DEFAULT"],
    });
  });
});

describe("API-09 provider", () => {
  it("sums bonds across the Jakarta series", async () => {
    const store = await replay("end");
    const { body } = await get(store, `/v1/providers/${JKT}`);
    expect(body.data.reputation).toMatchObject({
      delivered_cu: "8",
      defaulted_cu: "10",
      voluntary_defaulted_cu: "0",
      strikes: 1,
    });
    expect(body.data.bond).toEqual({
      deposited: "5490.000000",
      balance: "5409.000000",
      released: "36.000000",
      slashed: "45.000000",
    });
    expect(body.data.proceeds).toEqual({ gross: "90.000000", fees: "0.900000", net: "89.100000" });
    expect(body.data.open_requests).toBe(0);
    const detail = Object.fromEntries(body.data.series.map((row: { series_id: string }) => [row.series_id, row]));
    expect(detail["1"].symbol).toBe("CU-JKT-H100-2611");
    expect(detail["4"].symbol).toBe("CU-JKT-H100-2610");
  });
});

describe("API-10 statement", () => {
  it("summarises the buyer and the signed USDC sums", async () => {
    const store = await replay("end");
    const buyer = await get(store, `/v1/accounts/${BUY}/statement`);
    expect(buyer.body.summary).toMatchObject({
      usdc_out: "60.000000",
      usdc_in: "45.000000",
      default_payouts: "45.000000",
      cu_bought: "20",
      cu_redeemed: "18",
      fees_paid: "0.000000",
    });
    const sum = async (address: string) => {
      const { body } = await get(store, `/v1/accounts/${address}/statement`);
      return body.data.reduce((total: number, row: { usdc_delta: string }) => total + Number(row.usdc_delta), 0);
    };
    expect(await sum(BUY)).toBeCloseTo(-15, 5);
    expect(await sum(TRADER)).toBeCloseTo(-14, 5);
    expect(await sum(BUY2)).toBeCloseTo(-16.024, 5);
  });
});

describe("API-11 winsorized", () => {
  it("equals the VWAP when there is one eligible print", async () => {
    const store = await replay("end");
    const { body } = await get(store, "/v1/index/H100");
    expect(body.data.value).toBe("3.200000");
    expect(body.data.onchain_vwap).toBe("3.200000");
    expect(body.data.method.alpha).toBeNull();
  });
});

describe("API-12 errors", () => {
  it("returns 404 and 400 without a meta envelope", async () => {
    const store = await replay("end");
    const missing = await get(store, "/v1/series/999");
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
    expect(missing.body.meta).toBeUndefined();
    const bad = await get(store, "/v1/prints?limit=1001");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("INVALID_PARAM");
    const gpu = await get(store, "/v1/prints?gpu=H900");
    expect(gpu.status).toBe(400);
    expect(gpu.body.error.details.allowed).toContain("H100");
  });
});

describe("API-13 nulls", () => {
  it("leaves gpu_count null", async () => {
    const store = await replay("end");
    const { body } = await get(store, "/v1/prints?limit=1");
    expect(body.data[0].gpu_count).toBeNull();
  });
});

describe("API-14 reference", () => {
  it("labels the synthetic H100 reference", async () => {
    const store = await replay("end");
    const { body } = await get(store, "/v1/reference/H100");
    expect(body.data.value).toBe("3.000000");
    expect(body.data.label).toBe("synthetic demo data");
    expect(body.data.synthetic).toBe(true);
    const index = await get(store, "/v1/index/H100");
    expect(index.body.data.reference.label).toBe("synthetic demo data");
  });
});

describe("API-15 timelock", () => {
  it("moves setFactor from PENDING to READY to DONE", async () => {
    const pendingStore = await timelock(false);
    const pending = await get(pendingStore, "/v1/timelock/operations", 1791601501n);
    expect(pending.body.data[0]).toMatchObject({
      operation_id: OP_ID,
      status: "PENDING",
      target: CONVERSION,
      target_name: "ConversionTable",
    });
    expect(pending.body.data[0].decoded).toMatchObject({ function: "setFactor", args: { gpu: "A100", factor: "0.4500" } });

    const ready = await get(pendingStore, "/v1/timelock/operations?status=READY", 1791601800n);
    expect(ready.body.data[0].status).toBe("READY");
    expect(ready.body.data[0].operation_id).toBe(OP_ID);

    const doneStore = await timelock(true);
    const done = await get(doneStore, "/v1/timelock/operations", 1791601800n);
    expect(done.body.data[0].status).toBe("DONE");
    expect(done.body.data[0].operation_id).toBe(OP_ID);
  });
});

describe("API-16 kyb", () => {
  it("shows PENDING then APPROVED", async () => {
    const pendingStore = await kybPending();
    const pending = await get(pendingStore, "/v1/kyb/applications?status=PENDING");
    expect(pending.body.data[0]).toMatchObject({
      uid: KYB_UID,
      applicant: APPLICANT,
      status: "PENDING",
      approval: null,
      entity_id: E_KYB,
      data_hash: DATA_HASH,
    });
    const approvedStore = await kybApproved();
    const approved = await get(approvedStore, "/v1/kyb/applications?status=APPROVED");
    expect(approved.body.data[0]).toMatchObject({ uid: KYB_UID, status: "APPROVED" });
    expect(approved.body.data[0].approval.attestation_uid).toBe(APPROVAL_UID);
    const queue = await get(approvedStore, "/v1/kyb/applications?status=PENDING");
    expect(queue.body.data).toEqual([]);
  });
});

describe("API-17 server clock", () => {
  it("stamps server_now_ms from the wall clock and from the chain clock", async () => {
    const store = await replay("end");
    const live = createApp({ load: async () => snapshot(store, INDEXED_BLOCK, INDEXED_AT) });
    const before = Date.now();
    const response = await live.request("/v1/series/4");
    const after = Date.now();
    const body = await response.json();
    expect(body.meta.server_now_ms).toBeGreaterThanOrEqual(before);
    expect(body.meta.server_now_ms).toBeLessThanOrEqual(after + 2000);
    expect(Math.abs(body.meta.server_now_ms - Date.now())).toBeLessThanOrEqual(2000);

    const previous = process.env.API_NOW_SOURCE;
    process.env.API_NOW_SOURCE = "chain";
    try {
      expect(resolveNow(INDEXED_AT)).toBe(Number(INDEXED_AT) * 1000);
      const chainApp = createApp({ load: async () => snapshot(store, INDEXED_BLOCK, INDEXED_AT) });
      const chainBody = await (await chainApp.request("/v1/health")).json();
      expect(chainBody.meta.server_now_ms).toBe(Number(INDEXED_AT) * 1000);
    } finally {
      if (previous === undefined) delete process.env.API_NOW_SOURCE;
      else process.env.API_NOW_SOURCE = previous;
    }
  });
});
