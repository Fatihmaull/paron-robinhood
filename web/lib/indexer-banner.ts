export const INDEXER_LAG_BLOCKS = 50;

/** A single lagging poll is not enough. The banner waits for this many in a row. */
export const CATCHUP_POLLS = 2;

export type HealthSnapshot = {
  synced?: boolean;
  indexed_block?: number | null;
  head_block?: number | null;
  lag_blocks?: number | null;
};

export type CatchupMemory = { behind: number; clear: number; show: boolean };

export const QUIET_CATCHUP: CatchupMemory = { behind: 0, clear: 0, show: false };

const COPY = "Indexer is catching up to the latest blocks; data may lag briefly.";

/** One sample is behind when /v1/health says unsynced, or lag is more than 50 blocks. */
export function catchupBanner(health: HealthSnapshot | null): string | null {
  if (!health) return null;
  const indexed = typeof health.indexed_block === "number" ? health.indexed_block : null;
  const head = typeof health.head_block === "number" ? health.head_block : null;
  let lag: number | null = typeof health.lag_blocks === "number" ? health.lag_blocks : null;
  if (lag == null && indexed != null && head != null) lag = Math.max(0, head - indexed);
  const behind = health.synced === false || (lag != null && lag > INDEXER_LAG_BLOCKS);
  if (!behind) return null;
  return COPY;
}

/**
 * Show only after consecutive behind samples, and hide only after the same
 * number of consecutive healthy samples. A missing sample (failed poll) holds
 * the previous streak so the banner does not blink off.
 */
export function nextCatchupState(prev: CatchupMemory, health: HealthSnapshot | null): CatchupMemory {
  if (!health) return prev;
  if (catchupBanner(health)) {
    const behind = prev.behind + 1;
    return { behind, clear: 0, show: prev.show || behind >= CATCHUP_POLLS };
  }
  const clear = prev.clear + 1;
  return { behind: 0, clear, show: prev.show && clear < CATCHUP_POLLS };
}

export function catchupText(memory: CatchupMemory): string | null {
  return memory.show ? COPY : null;
}
