import assert from "node:assert/strict";
import test from "node:test";
import { planKeeper, RedemptionState } from "../src/keeper/decide.mjs";

test("claimDefault arms two seconds after the deadline, not on the older block clock", () => {
  const request = { reqId: 2, state: RedemptionState.Requested, ackDeadline: 100, deliveryDeadline: 200, disputeDeadline: 0, rulingDeadline: 0 };
  assert.equal(planKeeper([request], 102, { dryRun: true })[0].action, "wait");
  const due = planKeeper([request], 103, { dryRun: true })[0];
  assert.equal(due.action, "claimDefault");
  assert.equal(due.send, false);
  assert.match(due.log, /would claimDefault/);
});

test("delivered requests are finalized, disputed requests call resolveNoRuling", () => {
  const delivered = { reqId: 1, state: RedemptionState.Delivered, ackDeadline: 0, deliveryDeadline: 0, disputeDeadline: 50, rulingDeadline: 0 };
  const disputed = { reqId: 3, state: RedemptionState.Disputed, ackDeadline: 0, deliveryDeadline: 0, disputeDeadline: 0, rulingDeadline: 80 };
  assert.equal(planKeeper([delivered], 53)[0].action, "finalizeRedemption");
  assert.equal(planKeeper([disputed], 83)[0].action, "resolveNoRuling");
  assert.equal(planKeeper([delivered], 52)[0].action, "wait");
});

test("the keeper never chooses declineAndPay", () => {
  const early = { reqId: 1, state: RedemptionState.Requested, ackDeadline: 500, deliveryDeadline: 0, disputeDeadline: 0, rulingDeadline: 0 };
  const planned = planKeeper([early, { ...early, state: RedemptionState.Acknowledged, deliveryDeadline: 500 }], 10);
  assert.ok(planned.every((row) => row.action !== "declineAndPay"));
});

test("dry-run off marks a send without changing the action", () => {
  const request = { reqId: 9, state: RedemptionState.Defaultable, ackDeadline: 0, deliveryDeadline: 0, disputeDeadline: 0, rulingDeadline: 0 };
  const row = planKeeper([request], 1, { dryRun: false })[0];
  assert.equal(row.action, "claimDefault");
  assert.equal(row.send, true);
});
