import type { PublicClient } from "viem";
import { apiBase, chainId, dataSource } from "./config";
import {
  gpus,
  holdingsOf,
  indexStrip,
  kybPendingApps,
  orderBook,
  participantFor,
  printsOf,
  providerAccount,
  providerRedemptions,
  redemption,
  referenceFixture,
  seriesDetail,
  seriesList,
  statementOf,
  timelock,
  traderOrders,
} from "./fixtures";
import {
  OnchainUnavailable,
  readIndex,
  readOrderBook,
  readRedemption,
  readSeries,
  readSeriesList,
  STATEMENT_UNAVAILABLE,
  TAPE_UNAVAILABLE,
} from "./onchain";
import type { GpuRow, Holding, LoadResult, Meta, Participant, Redemption, Snap, StatementRow, TimelockOp } from "./types";

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function localMeta(): Meta {
  const now = Date.now();
  return { chain_id: chainId(), indexed_block: 0, indexed_at_ms: now, server_now_ms: now };
}

async function liveGet<T>(path: string): Promise<{ data: T; next_cursor?: string | null; meta: Meta }> {
  const base = apiBase();
  if (!base) throw new ApiError("INTERNAL", "API base URL is not set.");
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    try {
      const res = await fetch(`${base}${path}`, { signal: ctrl.signal });
      const body = (await res.json()) as {
        data?: T;
        meta?: Meta;
        next_cursor?: string | null;
        error?: { code?: string; message?: string };
      };
      if (!res.ok || body.error) {
        throw new ApiError(body.error?.code ?? "INTERNAL", body.error?.message ?? `HTTP ${res.status}`);
      }
      if (!body.meta) throw new ApiError("INTERNAL", "Response is missing meta.");
      return { data: body.data as T, meta: body.meta, next_cursor: body.next_cursor ?? null };
    } catch (error) {
      last = error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw last instanceof Error ? last : new ApiError("INTERNAL", "API request failed.");
}

async function withFallback<T>(
  snap: Snap,
  source: "mock" | "live",
  mock: () => { data: T; meta: Meta; next_cursor?: string | null } | null,
  path: string,
  onchain: (client: PublicClient) => Promise<T>,
  client?: PublicClient,
): Promise<LoadResult<T>> {
  if (source === "mock") {
    const env = mock();
    if (!env) throw new ApiError("NOT_FOUND", "Not in this fixture snapshot.");
    return { ...env, origin: "mock" };
  }
  try {
    const env = await liveGet<T>(path);
    return { ...env, origin: "live" };
  } catch (error) {
    if (!client) throw error;
    try {
      const data = await onchain(client);
      return { data, meta: localMeta(), origin: "onchain" };
    } catch (fallback) {
      if (fallback instanceof OnchainUnavailable) throw fallback;
      throw error;
    }
  }
}

export function currentSource(): "mock" | "live" {
  return dataSource();
}

export function loadSeriesList(snap: Snap, source: "mock" | "live", client?: PublicClient) {
  return withFallback(snap, source, () => seriesList(snap), "/series?sort=delivery_window", readSeriesList, client);
}

export function loadSeries(snap: Snap, source: "mock" | "live", seriesId: string, client?: PublicClient) {
  return withFallback(
    snap,
    source,
    () => seriesDetail(snap, seriesId),
    `/series/${seriesId}`,
    async (c) => {
      const row = await readSeries(c, seriesId);
      if (!row) throw new ApiError("NOT_FOUND", "series not found");
      return row;
    },
    client,
  );
}

export function loadBook(snap: Snap, source: "mock" | "live", seriesId: string, client?: PublicClient) {
  return withFallback(
    snap,
    source,
    () => orderBook(snap, seriesId),
    `/series/${seriesId}/orderbook`,
    (c) => readOrderBook(c, seriesId),
    client,
  );
}

export function loadRedemption(snap: Snap, source: "mock" | "live", reqId: string, client?: PublicClient) {
  return withFallback(
    snap,
    source,
    () => redemption(snap, reqId),
    `/redemptions/${reqId}`,
    async (c) => {
      const row = await readRedemption(c, reqId);
      if (!row) throw new ApiError("NOT_FOUND", "redemption not found");
      return row;
    },
    client,
  );
}

export function loadHoldings(snap: Snap, source: "mock" | "live", client?: PublicClient, address?: string) {
  if (source === "live" && !address) {
    // No wallet connected: nothing to query (the API is per account), so no request is made.
    return Promise.resolve<LoadResult<Holding[]>>({ data: [], meta: localMeta(), origin: "live" });
  }
  return withFallback(snap, source, () => holdingsOf(snap), `/accounts/${address}/holdings`, async () => {
    throw new OnchainUnavailable("Holdings need the Paron API, or a connected wallet balance read.");
  }, client);
}

export const DEMO_PROVIDER = "0x1111111111111111111111111111111111111111";

/** Which redemptions to list: one provider's queue, one holder's, or every open default/final/ruling (keepers). */
export type QueueScope = { provider: string } | { holder: string } | "keepers";

export function queuePath(scope: QueueScope): string {
  if (scope === "keepers") return "/redemptions?state=DEFAULTABLE,DELIVERED,DISPUTED&limit=100";
  if ("provider" in scope) return `/redemptions?provider=${scope.provider}&limit=100`;
  return `/redemptions?holder=${scope.holder}&limit=100`;
}

export function loadProviderRedemptions(snap: Snap, source: "mock" | "live", client?: PublicClient, scope: QueueScope = "keepers") {
  if (source === "live" && typeof scope === "object" && !("provider" in scope ? scope.provider : scope.holder)) {
    return Promise.resolve<LoadResult<Redemption[]>>({ data: [], meta: localMeta(), origin: "live" });
  }
  return withFallback(
    snap,
    source,
    () => providerRedemptions(snap),
    queuePath(scope),
    async () => {
      throw new OnchainUnavailable("The provider queue needs the Paron API. Open a request by id to read it on-chain.");
    },
    client,
  );
}

export function loadProvider(snap: Snap, source: "mock" | "live", client?: PublicClient, address: string = DEMO_PROVIDER) {
  return withFallback(snap, source, () => providerAccount(snap), `/providers/${address}`, async () => {
    throw new OnchainUnavailable("Provider totals need the Paron API.");
  }, client);
}

export function loadIndex(snap: Snap, source: "mock" | "live", client?: PublicClient) {
  return withFallback(snap, source, () => indexStrip(snap), "/index/H100", (c) => readIndex(c), client);
}

export function loadPrints(snap: Snap, source: "mock" | "live", client?: PublicClient) {
  return withFallback(snap, source, () => printsOf(snap), "/prints?gpu=H100&limit=3", async () => {
    throw new OnchainUnavailable(TAPE_UNAVAILABLE);
  }, client);
}

export function loadStatement(snap: Snap, source: "mock" | "live", address?: string): Promise<LoadResult<StatementRow[]>> {
  if (source === "mock") return Promise.resolve({ ...statementOf(), origin: "mock" });
  // No wallet connected: the statement is per account, so no request is made.
  if (!address) return Promise.resolve({ data: [], meta: localMeta(), origin: "live" as const });
  return liveGet<StatementRow[]>(`/accounts/${address}/statement`)
    .then((env) => ({ ...env, origin: "live" as const }))
    .catch(() => {
      throw new OnchainUnavailable(STATEMENT_UNAVAILABLE);
    });
}

export function loadGpus(snap: Snap, source: "mock" | "live"): Promise<LoadResult<GpuRow[]>> {
  if (source === "mock") return Promise.resolve({ ...gpus(), origin: "mock" });
  return liveGet<GpuRow[]>("/gpus").then((env) => ({ ...env, origin: "live" as const }));
}

export function loadTimelock(source: "mock" | "live"): Promise<LoadResult<TimelockOp[]>> {
  if (source === "mock") return Promise.resolve({ ...timelock(), origin: "mock" });
  return liveGet<TimelockOp[]>("/timelock/operations").then((env) => ({ ...env, origin: "live" as const }));
}

export function loadParticipant(address: string, source: "mock" | "live"): Promise<LoadResult<Participant>> {
  if (source === "mock") return Promise.resolve({ ...participantFor(address), origin: "mock" });
  return liveGet<Participant>(`/participants/${address}`).then((env) => ({ ...env, origin: "live" as const }));
}

export function loadKyb(source: "mock" | "live"): Promise<LoadResult<unknown[]>> {
  if (source === "mock") {
    const env = kybPendingApps() as { data: unknown[]; meta: Meta; next_cursor?: string | null };
    return Promise.resolve({ ...env, origin: "mock" });
  }
  return liveGet<unknown[]>("/kyb/applications?status=PENDING").then((env) => ({ ...env, origin: "live" as const }));
}

export function loadReference() {
  return referenceFixture();
}

export function loadOrders() {
  return traderOrders();
}

export { TAPE_UNAVAILABLE, STATEMENT_UNAVAILABLE };
