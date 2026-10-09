import assert from "node:assert/strict";
import test from "node:test";
import list from "../fixtures/v1/series.list.json" with { type: "json" };
import redemption2 from "../fixtures/v1/redemption.2.t2.json" with { type: "json" };
import providerQueue from "../fixtures/v1/redemptions.provider.t1.json" with { type: "json" };

test("canonical series list matches the four-series fixture", () => {
  assert.equal(list.data.length, 4);
  assert.equal(list.data[0].series_id, "4");
  assert.equal(typeof list.meta.server_now_ms, "number");
  assert.equal(list.data[0].provider.delivered_cu, "8");
  assert.equal(list.data[0].provider.defaulted_cu, "10");
  for (const row of list.data) {
    assert.equal(typeof row.primary_price, "string");
    assert.equal(typeof row.bond_per_cu, "string");
  }
});

test("request 2 is defaultable one second after the ack deadline", () => {
  assert.equal(redemption2.data.state, "DEFAULTABLE");
  assert.equal(redemption2.data.actions.includes("CLAIM_DEFAULT"), true);
  assert.equal(redemption2.meta.server_now_ms, redemption2.data.ack_deadline_ms + 1000);
  assert.equal("reopened_from_req_id" in redemption2.data, true);
  assert.equal("reopened_to_req_id" in redemption2.data, true);
});

test("pre-deadline provider queue still offers decline and pay", () => {
  const row = providerQueue.data[0];
  assert.ok(row.actions.includes("ACK"));
  assert.ok(row.actions.includes("DECLINE_AND_PAY"));
  assert.ok(providerQueue.meta.server_now_ms <= row.ack_deadline_ms);
});
