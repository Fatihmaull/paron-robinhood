import assert from "node:assert/strict";
import test from "node:test";
import { catchupBanner } from "./indexer-banner.ts";

test("unsynced health shows the catching-up banner", () => {
  const text = catchupBanner({ synced: false, indexed_block: 10, head_block: 12, lag_blocks: 2 });
  assert.equal(
    text,
    "Indexer catching up (block 10 of 12). Onchain actions still work; lists may lag a few seconds.",
  );
});

test("lag of 20 blocks stays quiet and 21 blocks shows the banner", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 120, lag_blocks: 20 }), null);
  assert.match(catchupBanner({ synced: true, indexed_block: 100, head_block: 121, lag_blocks: 21 }) ?? "", /block 100 of 121/);
});

test("a healthy indexer with no lag hides the banner", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 100, lag_blocks: 0 }), null);
  assert.equal(catchupBanner(null), null);
  assert.equal(catchupBanner({}), null);
});

test("lag is derived from head and indexed when lag_blocks is absent", () => {
  assert.equal(catchupBanner({ synced: true, indexed_block: 100, head_block: 110 }), null);
  assert.match(catchupBanner({ synced: true, indexed_block: 100, head_block: 130 }) ?? "", /block 100 of 130/);
});
