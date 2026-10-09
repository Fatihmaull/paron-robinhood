import assert from "node:assert/strict";
import { test } from "node:test";
import { SYNCING_COPY, marketsNotice, showSeriesCount } from "./markets-state.ts";

class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

test("503 INDEXER_SYNCING is neutral syncing copy and hides the count", () => {
  const n = marketsNotice(new CodedError("INDEXER_SYNCING", "indexer is still backfilling"));
  assert.deepEqual(n, { kind: "syncing", text: "Indexer is syncing. Series will appear shortly." });
  assert.equal(n?.text, SYNCING_COPY);
  assert.equal(showSeriesCount(n), false);
});

test("other errors are red errors and keep the count", () => {
  const n = marketsNotice(new CodedError("INTERNAL", "boom"));
  assert.deepEqual(n, { kind: "error", text: "boom" });
  assert.equal(showSeriesCount(n), true);
});

test("no error means synced: count shown", () => {
  assert.equal(marketsNotice(null), null);
  assert.equal(showSeriesCount(null), true);
});
