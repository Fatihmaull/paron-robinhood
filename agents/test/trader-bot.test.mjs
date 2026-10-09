import assert from "node:assert/strict";
import test from "node:test";
import { evaluateTrigger, nextStep } from "../src/trader-bot/decide.mjs";

const base = {
  seriesId: 4n,
  buyer: "0x2222222222222222222222222222222222222222",
  trader: "0x3333333333333333333333333333333333333333",
  armed: true,
  holdingCu: 0n,
  openAsk: false,
};

test("fires once on the buyer primary purchase of series 4", () => {
  const decision = evaluateTrigger({
    ...base,
    event: { name: "PrimaryBuy", seriesId: 4n, buyer: base.buyer },
  });
  assert.equal(decision.fire, true);
  assert.deepEqual(decision.steps.map((step) => step.id), ["S-03", "S-04", "S-05"]);
  assert.equal(decision.steps[2].price, 3_200_000n);
  assert.equal(decision.steps[2].qty, 5n * 10n ** 18n);
  assert.equal(decision.steps[2].sideIndex, 1);
});

test("ignores other series, other buyers, and the trader's own buy", () => {
  assert.equal(evaluateTrigger({ ...base, event: { name: "PrimaryBuy", seriesId: 1n, buyer: base.buyer } }).reason, "other-series");
  assert.equal(evaluateTrigger({ ...base, event: { name: "PrimaryBuy", seriesId: 4n, buyer: "0x9999999999999999999999999999999999999999" } }).reason, "other-buyer");
  assert.equal(evaluateTrigger({ ...base, event: { name: "PrimaryBuy", seriesId: 4n, buyer: base.trader } }).reason, "self-buy");
});

test("one-shot and revert stop", () => {
  const event = { name: "PrimaryBuy", seriesId: 4n, buyer: base.buyer };
  assert.equal(evaluateTrigger({ ...base, event, holdingCu: 1n }).reason, "one-shot");
  assert.equal(evaluateTrigger({ ...base, event, openAsk: true }).reason, "one-shot");
  const steps = evaluateTrigger({ ...base, event }).steps;
  assert.equal(nextStep(steps, 1, { reverted: true }).reason, "revert");
  assert.equal(nextStep(steps, 3).reason, "done");
});
