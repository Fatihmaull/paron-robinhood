import assert from "node:assert/strict";
import test from "node:test";
import indexOk from "../fixtures/v1/index.H100.ok.json" with { type: "json" };
import indexThin from "../fixtures/v1/index.H100.thin.json" with { type: "json" };
import { indexQuote } from "./index-quote.ts";

test("an OK index with an empty reference shows the index value", () => {
  assert.equal(indexOk.data.status, "OK");
  assert.equal(indexOk.data.value, "3.200000");
  assert.equal(indexOk.data.reference, null);
  assert.deepEqual(indexQuote(indexOk.data), { label: "Index", amount: "3.200000" });
});

test("a present reference stays labeled Reference", () => {
  assert.equal(indexThin.data.reference.value, "3.000000");
  assert.deepEqual(indexQuote(indexThin.data), { label: "Reference", amount: "3.000000" });
  assert.deepEqual(
    indexQuote({ status: "OK", value: "3.200000", reference: { value: "3.000000" } }),
    { label: "Reference", amount: "3.000000" },
  );
});

test("a non-OK index without a reference has no number", () => {
  assert.deepEqual(indexQuote({ status: "THIN", value: null, reference: null }), { label: "Index", amount: null });
  assert.deepEqual(indexQuote({ status: "DISRUPTED", value: "3.200000", reference: null }), { label: "Index", amount: null });
});
