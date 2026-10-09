import assert from "node:assert/strict";
import { test } from "node:test";
import { SYNCING_COPY, isPublicRpcFailure, marketsNotice, readFailureTone, showSeriesCount } from "./markets-state.ts";

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

test("a public RPC failure is quiet and keeps the count", () => {
  const ssl = new Error("net::ERR_SSL_UNRECOGNIZED_NAME_ALERT");
  const http = new Error("HTTP request failed.");
  http.name = "HttpRequestError";
  const unavailable = new Error("Couldn't load markets. Check your connection and retry.");
  unavailable.name = "OnchainUnavailable";
  const api = new CodedError("INTERNAL", "boom");
  const n = marketsNotice(ssl);
  assert.equal(n?.kind, "degraded");
  assert.equal(n?.text, ssl.message);
  assert.equal(showSeriesCount(n), true);
  assert.equal(isPublicRpcFailure(http), true);
  assert.equal(isPublicRpcFailure(unavailable), true);
  assert.equal(isPublicRpcFailure(api), false);
  assert.equal(readFailureTone(ssl), "muted");
  assert.equal(readFailureTone(api), "bad");
});

test("no error means synced: count shown", () => {
  assert.equal(marketsNotice(null), null);
  assert.equal(showSeriesCount(null), true);
});

test("loading hides the series count, including a zero", () => {
  assert.equal(showSeriesCount(null, true), false);
  assert.equal(showSeriesCount({ kind: "error", text: "boom" }, true), false);
});
