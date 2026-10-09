export const INDEXER_LAG_BLOCKS = 20;

export type HealthSnapshot = {
  synced?: boolean;
  indexed_block?: number | null;
  head_block?: number | null;
  lag_blocks?: number | null;
};

const COPY =
  "Indexer catching up (block {indexed} of {head}). Onchain actions still work; lists may lag a few seconds.";

/** Banner only when /v1/health says unsynced, or the indexer is more than 20 blocks behind. */
export function catchupBanner(health: HealthSnapshot | null): string | null {
  if (!health) return null;
  const indexed = typeof health.indexed_block === "number" ? health.indexed_block : null;
  const head = typeof health.head_block === "number" ? health.head_block : null;
  let lag: number | null = typeof health.lag_blocks === "number" ? health.lag_blocks : null;
  if (lag == null && indexed != null && head != null) lag = Math.max(0, head - indexed);
  const behind = health.synced === false || (lag != null && lag > INDEXER_LAG_BLOCKS);
  if (!behind) return null;
  return COPY.replace("{indexed}", indexed == null ? "—" : String(indexed)).replace(
    "{head}",
    head == null ? "—" : String(head),
  );
}
