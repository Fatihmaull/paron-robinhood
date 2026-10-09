import type {
  Envelope,
  GpuRow,
  Holding,
  IndexStrip,
  OrderBook,
  Participant,
  PrintRow,
  ProviderAccount,
  Redemption,
  SeriesDetail,
  SeriesRow,
  Snap,
  StatementRow,
  TimelockOp,
} from "./types";

import gpusJson from "../fixtures/v1/gpus.json";
import healthJson from "../fixtures/v1/health.json";
import holdingsT0 from "../fixtures/v1/holdings.buyer.t0.json";
import holdingsT2 from "../fixtures/v1/holdings.buyer.t2.json";
import holdingsT3 from "../fixtures/v1/holdings.buyer.t3.json";
import indexOk from "../fixtures/v1/index.H100.ok.json";
import indexThin from "../fixtures/v1/index.H100.thin.json";
import kybPending from "../fixtures/v1/kyb.applications.pending.json";
import bookT0 from "../fixtures/v1/orderbook.4.t0.json";
import bookT1 from "../fixtures/v1/orderbook.4.t1.json";
import ordersTrader from "../fixtures/v1/orders.trader.json";
import participantBuyer from "../fixtures/v1/participant.buyer.json";
import participantJkt from "../fixtures/v1/participant.jkt.json";
import participantUnknown from "../fixtures/v1/participant.unknown.json";
import printsEmpty from "../fixtures/v1/prints.empty.json";
import printsH100 from "../fixtures/v1/prints.H100.limit3.json";
import providerT2 from "../fixtures/v1/provider.jkt.t2.json";
import providerT3 from "../fixtures/v1/provider.jkt.json";
import redemption1 from "../fixtures/v1/redemption.1.json";
import redemption2t2 from "../fixtures/v1/redemption.2.t2.json";
import redemption2t3 from "../fixtures/v1/redemption.2.t3.json";
import redemptionsBuyerT2 from "../fixtures/v1/redemptions.buyer.t2.json";
import redemptionsBuyerT3 from "../fixtures/v1/redemptions.buyer.t3.json";
import redemptionsProviderT1 from "../fixtures/v1/redemptions.provider.t1.json";
import referenceH100 from "../fixtures/v1/reference.H100.json";
import series4t0 from "../fixtures/v1/series.4.t0.json";
import series4t1 from "../fixtures/v1/series.4.t1.json";
import series4t2 from "../fixtures/v1/series.4.t2.json";
import series4t3 from "../fixtures/v1/series.4.json";
import seriesListT0 from "../fixtures/v1/series.list.t0.json";
import seriesListT1 from "../fixtures/v1/series.list.t1.json";
import seriesListT2 from "../fixtures/v1/series.list.t2.json";
import seriesListT3 from "../fixtures/v1/series.list.json";
import statementBuyer from "../fixtures/v1/statement.buyer.json";
import timelockOps from "../fixtures/v1/timelock.operations.json";

function asEnv<T>(value: unknown): Envelope<T> {
  return value as Envelope<T>;
}

const lists: Record<Snap, Envelope<SeriesRow[]>> = {
  t0: asEnv(seriesListT0),
  t1: asEnv(seriesListT1),
  t2: asEnv(seriesListT2),
  t3: asEnv(seriesListT3),
};

const details: Record<Snap, Envelope<SeriesDetail>> = {
  t0: asEnv(series4t0),
  t1: asEnv(series4t1),
  t2: asEnv(series4t2),
  t3: asEnv(series4t3),
};

const books: Record<Snap, Envelope<OrderBook>> = {
  t0: asEnv(bookT0),
  t1: asEnv(bookT1),
  t2: asEnv(bookT1),
  t3: asEnv(bookT1),
};

const holdings: Record<Snap, Envelope<Holding[]>> = {
  t0: asEnv(holdingsT0),
  t1: asEnv(holdingsT0),
  t2: asEnv(holdingsT2),
  t3: asEnv(holdingsT3),
};

const GPU_HOURS: Record<string, string> = {
  "1": "720",
  "2": "1000",
  "3": "744",
  "4": "500",
};

export function seriesList(snap: Snap): Envelope<SeriesRow[]> {
  return lists[snap];
}

export function seriesDetail(snap: Snap, seriesId: string): Envelope<SeriesDetail> | null {
  const row = lists[snap].data.find((item) => item.series_id === seriesId);
  if (!row) return null;
  if (seriesId === "4") return details[snap];
  return {
    data: {
      ...row,
      gpu_hours: GPU_HOURS[seriesId] ?? row.max_supply,
      terms: null,
      bond: null,
      redemption_stats: null,
      index: null,
      created_at_ms: null,
      created_tx: null,
      explorer_url: null,
    },
    meta: lists[snap].meta,
  };
}

export function orderBook(snap: Snap, seriesId: string): Envelope<OrderBook> {
  if (seriesId !== "4") {
    return {
      data: {
        series_id: seriesId,
        symbol: "",
        tick: "0.010000",
        bids: [],
        asks: [],
        best_bid: null,
        best_ask: null,
        spread: null,
      },
      meta: lists[snap].meta,
    };
  }
  return books[snap];
}

export function redemption(snap: Snap, reqId: string): Envelope<Redemption> | null {
  if (reqId === "1" && (snap === "t2" || snap === "t3")) return asEnv(redemption1);
  if (reqId === "2" && snap === "t2") return asEnv(redemption2t2);
  if (reqId === "2" && snap === "t3") return asEnv(redemption2t3);
  return null;
}

export function holderRedemptions(snap: Snap): Envelope<Redemption[]> {
  if (snap === "t2") return asEnv(redemptionsBuyerT2);
  if (snap === "t3") return asEnv(redemptionsBuyerT3);
  return { data: [], next_cursor: null, meta: lists[snap].meta };
}

/**
 * t1 overlays redemptions.provider.t1 (server 03:01:30Z) onto the post-trade
 * market snapshot (03:01:05Z) so Ack and Decline & pay are reachable.
 * The card clock is anchored in the provider console, not the market strip.
 */
export function providerRedemptions(snap: Snap): Envelope<Redemption[]> {
  if (snap === "t1") return asEnv(redemptionsProviderT1);
  if (snap === "t2") {
    const open = asEnv<Redemption>(redemption2t2);
    const done = asEnv<Redemption>(redemption1);
    return { data: [open.data, done.data], meta: lists.t2.meta };
  }
  if (snap === "t3") {
    const done2 = asEnv<Redemption>(redemption2t3);
    const done1 = asEnv<Redemption>(redemption1);
    return { data: [done2.data, done1.data], meta: lists.t3.meta };
  }
  return { data: [], next_cursor: null, meta: lists[snap].meta };
}

export const PROVIDER_T1_SERVER_MS = 1_791_601_290_000;

export function providerAccount(snap: Snap): Envelope<ProviderAccount> {
  if (snap === "t2") return asEnv(providerT2);
  if (snap === "t3") return asEnv(providerT3);
  const base = asEnv<ProviderAccount>(providerT2);
  return {
    data: {
      ...base.data,
      reputation: {
        delivered_cu: "0",
        defaulted_cu: "0",
        voluntary_defaulted_cu: "0",
        disputes_lost: 0,
        strikes: 0,
      },
      bond: {
        deposited: "5490.000000",
        balance: "5490.000000",
        released: "0.000000",
        slashed: "0.000000",
      },
      proceeds: { gross: "90.000000", fees: "0.900000", net: "89.100000" },
      open_requests: snap === "t1" ? 1 : 0,
    },
    meta: lists[snap].meta,
  };
}

export function holdingsOf(snap: Snap): Envelope<Holding[]> {
  return holdings[snap];
}

export function indexStrip(snap: Snap): Envelope<IndexStrip> {
  if (snap === "t0") return asEnv(indexThin);
  return asEnv(indexOk);
}

export function printsOf(snap: Snap): Envelope<PrintRow[]> {
  if (snap === "t0") return asEnv(printsEmpty);
  return asEnv(printsH100);
}

export function statementOf(): Envelope<StatementRow[]> {
  return asEnv(statementBuyer);
}

export function gpus(): Envelope<GpuRow[]> {
  return asEnv(gpusJson);
}

export function timelock(): Envelope<TimelockOp[]> {
  return asEnv(timelockOps);
}

export function participantFor(address: string): Envelope<Participant> {
  const lower = address.toLowerCase();
  if (lower.startsWith("0x1111")) return asEnv(participantJkt);
  if (lower.startsWith("0x2222")) return asEnv(participantBuyer);
  return asEnv(participantUnknown);
}

export function kybPendingApps() {
  return kybPending;
}

export function healthFixture() {
  return healthJson;
}

export function referenceFixture() {
  return referenceH100;
}

export function traderOrders() {
  return ordersTrader;
}

export function snapServerNow(snap: Snap): number {
  return lists[snap].meta.server_now_ms;
}
