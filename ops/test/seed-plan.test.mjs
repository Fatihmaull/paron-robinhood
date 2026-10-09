import assert from "node:assert/strict";
import test from "node:test";
import { CU, bondDeposit, buildSeedPlan, maxSupply, SERIES } from "../src/seed-plan.mjs";

test("forward series supplies and bonds match the demo script", () => {
  const [jkt, btm, sgp] = SERIES;
  assert.equal(maxSupply(jkt), 720n * CU);
  assert.equal(bondDeposit(jkt), 3_240_000_000n);
  assert.equal(maxSupply(btm), 1400n * CU);
  assert.equal(bondDeposit(btm), 8_526_000_000n);
  assert.equal(maxSupply(sgp), 1860n * CU);
  assert.equal(bondDeposit(sgp), 8_370_000_000n);
});

test("stage seed stops after phase 2 and uses W-VERIFIER", () => {
  const plan = buildSeedPlan({ mode: "stage", label: "stage-1" });
  assert.ok(plan.steps.every((step) => step.phase <= 2));
  const attest = plan.steps.find((step) => step.action === "multiAttest");
  assert.equal(attest.signer, "W-VERIFIER");
  assert.equal(attest.recipients.length, 6);
  assert.equal(attest.recipients[3].entity, attest.recipients[4].entity);
});

test("rehearsal is refused on a stage label", () => {
  assert.throws(() => buildSeedPlan({ mode: "rehearsal", label: "stage-1" }), /refused/);
});

test("callout ask is present unless turned off", () => {
  const on = buildSeedPlan({ callout: true });
  const off = buildSeedPlan({ callout: false });
  assert.equal(on.steps.filter((step) => step.step === "F-4").length, 3);
  assert.equal(off.steps.some((step) => step.step === "F-4"), false);
});
