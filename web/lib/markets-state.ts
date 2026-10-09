export const SYNCING_COPY = "Indexer is syncing. Series will appear shortly.";

const RPC_ERROR_NAMES = new Set(["HttpRequestError", "TimeoutError", "RpcRequestError", "OnchainUnavailable"]);

/** Public chain RPC / transport failures. Indexer API errors stay out of this set. */
export function isPublicRpcFailure(error: unknown): boolean {
  if (!error) return false;
  const name = typeof error === "object" && "name" in error ? String((error as { name?: string }).name) : "";
  if (RPC_ERROR_NAMES.has(name)) return true;
  const text = error instanceof Error ? error.message : String(error);
  return /ERR_SSL|UNRECOGNIZED_NAME_ALERT|HTTP request failed/i.test(text);
}

/** Red for ordinary load errors. Muted status for a public RPC miss. */
export function readFailureTone(error: unknown): "bad" | "muted" {
  return isPublicRpcFailure(error) ? "muted" : "bad";
}

export type MarketsNotice =
  | { kind: "syncing"; text: string }
  | { kind: "degraded"; text: string }
  | { kind: "error"; text: string }
  | null;

const FALLBACK = "Couldn't load markets. Check your connection and retry.";

// D-66: 503 INDEXER_SYNCING is neutral (never red); other API errors are red.
// A public RPC miss is degraded: same sentence, not the red error style.
export function marketsNotice(error: unknown): MarketsNotice {
  if (!error) return null;
  const code = (error as { code?: string }).code;
  if (code === "INDEXER_SYNCING") return { kind: "syncing", text: SYNCING_COPY };
  const text = error instanceof Error ? error.message : FALLBACK;
  if (isPublicRpcFailure(error)) return { kind: "degraded", text };
  return { kind: "error", text };
}

// "N series." is hidden while loading or syncing. It shows once the indexer is synced, including a real zero.
export function showSeriesCount(notice: MarketsNotice, loading = false): boolean {
  if (loading) return false;
  return notice?.kind !== "syncing";
}
