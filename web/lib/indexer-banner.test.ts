import assert from "node:assert/strict";
import test from "node:test";
import { catchupBanner } from "./indexer-banner.ts";

test("unsynced health shows the catching-up banner", () => {
  const text = catchupBanner({ synced: false, indexed_block: 10, head_block: 12, lag_blocks: 2 });
  assert.equal(text, "Indexer is catching up to the latest blocks; data may lag briefly.");
});

test("lag of 20 blocks stays quiet and 21 blocks shows the banner", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 120, lag_blocks: 20 }), null);
  assert.equal(
    catchupBanner({ synced: true, indexed_block: 100, head_block: 121, lag_blocks: 21 }),
    "Indexer is catching up to the latest blocks; data may lag briefly.",
  );
});

test("a healthy indexer with no lag hides the banner", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 100, lag_blocks: 0 }), null);
  assert.equal(catchupBanner(null), null);
  assert.equal(catchupBanner({}), null);
});

test("lag is derived from head and indexed when lag_blocks is absent", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 110 }), null);
  assert.equal(
    catchupBanner({ synced: true, indexed_block: 100, head_block: 130 }),
    "Indexer is catching up to the latest blocks; data may lag briefly.",
  );
});
