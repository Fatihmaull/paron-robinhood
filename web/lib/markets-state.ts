export const SYNCING_COPY = "Indexer is syncing. Series will appear shortly.";

export type MarketsNotice =
  | { kind: "syncing"; text: string }
  | { kind: "error"; text: string }
  | null;

const FALLBACK = "Couldn't load markets. Check your connection and retry.";

// D-66: 503 INDEXER_SYNCING is neutral (never red); other errors are red.
export function marketsNotice(error: unknown): MarketsNotice {
  if (!error) return null;
  const code = (error as { code?: string }).code;
  if (code === "INDEXER_SYNCING") return { kind: "syncing", text: SYNCING_COPY };
  return { kind: "error", text: error instanceof Error ? error.message : FALLBACK };
}

// "N series." is shown only when the indexer is synced (no syncing notice).
export function showSeriesCount(notice: MarketsNotice): boolean {
  return notice?.kind !== "syncing";
}
