export const RPC_RETRY_COUNT = 3;
export const RPC_RETRY_BASE_MS = 400;
const RPC_TIMEOUT_MS = 8_000;
const RPC_BACKOFF_CAP_MS = 8_000;

/** Delay before retry number `attempt` (1 = first retry). */
export function rpcBackoffMs(attempt: number, baseMs = RPC_RETRY_BASE_MS, capMs = RPC_BACKOFF_CAP_MS): number {
  const n = Math.max(1, Math.floor(attempt));
  return Math.min(capMs, baseMs * 2 ** (n - 1));
}

/** Primary URL, plus a backup only when that value is non-empty. */
export function rpcUrls(primary: string, backup?: string | null): string[] {
  const urls = [primary.trim()];
  const extra = backup?.trim();
  if (extra) urls.push(extra);
  return urls.filter((url) => url.length > 0);
}

export function rpcTransportOptions(retryCount = RPC_RETRY_COUNT) {
  return { retryCount, retryDelay: RPC_RETRY_BASE_MS, timeout: RPC_TIMEOUT_MS };
}
