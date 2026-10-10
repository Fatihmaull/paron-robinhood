import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { catchupBanner, catchupText, nextCatchupState, QUIET_CATCHUP, type HealthSnapshot } from "./indexer-banner.ts";

const COPY = "Indexer is catching up to the latest blocks; data may lag briefly.";
const behind: HealthSnapshot = { synced: true, indexed_block: 100, head_block: 160, lag_blocks: 60 };
const quiet: HealthSnapshot = { synced: true, indexed_block: 100, head_block: 120, lag_blocks: 20 };

test("unsynced health is a behind sample", () => {
  const text = catchupBanner({ synced: false, indexed_block: 10, head_block: 12, lag_blocks: 2 });
  assert.equal(text, COPY);
});

test("lag of 50 blocks stays quiet and 51 blocks is behind", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 150, lag_blocks: 50 }), null);
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 151, lag_blocks: 51 }), COPY);
});

test("a healthy indexer with no lag hides the banner", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 100, lag_blocks: 0 }), null);
  assert.equal(catchupBanner(null), null);
  assert.equal(catchupBanner({}), null);
});

test("lag is derived from head and indexed when lag_blocks is absent", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 130 }), null);
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 180 }), COPY);
});

test("the banner waits for consecutive behind polls and ignores a failed poll", () => {
  const once = nextCatchupState(QUIET_CATCHUP, behind);
  assert.equal(catchupText(once), null);
  const twice = nextCatchupState(once, behind);
  assert.equal(catchupText(twice), COPY);
  const held = nextCatchupState(twice, null);
  assert.equal(catchupText(held), COPY);
  const dip = nextCatchupState(held, quiet);
  assert.equal(catchupText(dip), COPY);
  const clear = nextCatchupState(dip, quiet);
  assert.equal(catchupText(clear), null);
  const shell = readFileSync(new URL("../components/shell.tsx", import.meta.url), "utf8");
  assert.match(shell, /nextCatchupState/);
  assert.match(shell, /catchupText/);
  assert.equal(shell.includes("catchupBanner(health)"), false);
});
