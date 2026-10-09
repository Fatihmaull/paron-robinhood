import { fallback, http, type Transport } from "viem";

/** Attempts after the first call. viem waits retryDelay * 2^(n-1) between them. */
export const RPC_RETRY_COUNT = 3;
export const RPC_RETRY_BASE_MS = 400;
const RPC_TIMEOUT_MS = 8_000;
const RPC_BACKOFF_CAP_MS = 8_000;

/** Delay before retry number `attempt` (1 = first retry). 400ms, 800ms, 1600ms, then the cap. */
export function rpcBackoffMs(attempt: number, baseMs = RPC_RETRY_BASE_MS, capMs = RPC_BACKOFF_CAP_MS): number {
  const n = Math.max(1, Math.floor(attempt));
  return Math.min(capMs, baseMs * 2 ** (n - 1));
}

/**
 * Primary URL, plus a backup only when that value is non-empty.
 * A missing INDEXER_RPC_URL_BACKUP must not change the endpoint list.
 */
export function rpcEndpoints(primary: string, backup?: string | null): string[] {
  const urls = [primary.trim()];
  const extra = backup?.trim();
  if (extra) urls.push(extra);
  return urls.filter((url) => url.length > 0);
}

export function rpcHttpOptions(retryCount = RPC_RETRY_COUNT) {
  return { retryCount, retryDelay: RPC_RETRY_BASE_MS, timeout: RPC_TIMEOUT_MS };
}

export function indexerRpcTransport(primary: string, backup?: string | null, retryCount = RPC_RETRY_COUNT): Transport {
  const urls = rpcEndpoints(primary, backup);
  if (urls.length === 0) throw new Error("RPC URL is empty");
  const transports = urls.map((url) => http(url, rpcHttpOptions(retryCount)));
  return transports.length === 1 ? transports[0] : fallback(transports);
}

/** Run an RPC call again after rpcBackoffMs when it throws. */
export async function withRpcRetry<T>(
  run: () => Promise<T>,
  opts?: { retries?: number; sleep?: (ms: number) => Promise<void> },
): Promise<T> {
  const retries = opts?.retries ?? RPC_RETRY_COUNT;
  const sleep = opts?.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  let last: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await run();
    } catch (error) {
      last = error;
      if (attempt === retries) break;
      await sleep(rpcBackoffMs(attempt));
    }
  }
  throw last;
}
