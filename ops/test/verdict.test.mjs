import assert from "node:assert/strict";
import test from "node:test";
import { assessChain, selectActiveKey } from "../src/verdict.mjs";

const healthy = {
  key: "robinhoodTestnet",
  rpcReachable: true,
  chainIdOk: true,
  tipAgeSeconds: 0,
  gasPriceWei: "10000000",
  productionWatch: { advanced: true },
};

test("healthy public reads are a go", () => {
  assert.equal(assessChain(healthy).verdict, "go");
});

test("wrong chain id is a no-go and selects the fallback", () => {
  const bad = { ...healthy, key: "robinhoodTestnet", chainIdOk: false };
  const fallback = { ...healthy, key: "arbitrumSepolia" };
  const decision = selectActiveKey(bad, fallback);
  assert.equal(decision.verdict, "no-go");
  assert.equal(decision.switched, true);
  assert.equal(decision.active, "arbitrumSepolia");
  assert.deepEqual(decision.blockers, ["chain-id-mismatch"]);
});

test("a quiet tip older than 120s with no new block is a no-go", () => {
  const stale = { ...healthy, tipAgeSeconds: 600, productionWatch: { advanced: false } };
  assert.equal(assessChain(stale).verdict, "no-go");
});

test("a fresh tip counts even if the watch window saw no new block", () => {
  const fresh = { ...healthy, productionWatch: { advanced: false }, tipAgeSeconds: 3 };
  assert.equal(assessChain(fresh).verdict, "go");
});
