import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function assignments(path) {
  const out = new Map();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    out.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  return out;
}

const retired = [
  "W_PROVIDER_JKT",
  "W_PROVIDER_BTM",
  "W_PROVIDER_SGP",
  "W_TRADER",
  "W_ARBITER1",
  "W_ARBITER2",
  "W_ARBITER3",
  "PANEL_MEMBER_1",
  "PANEL_MEMBER_2",
  "PANEL_MEMBER_3",
  "KYB_ATTESTER_ADDRESS",
  "REFERENCE_SIGNER_ADDRESS",
  "EAS_SCHEMA_UID",
  "TIMELOCK_ADDRESS",
];

test("root and ops env examples do not use retired names", () => {
  const root = assignments(resolve(repo, ".env.example"));
  const ops = assignments(resolve(repo, "ops/.env.example"));
  for (const name of retired) {
    assert.equal(root.has(name), false, name);
    assert.equal(ops.has(name), false, name);
  }
  assert.equal(root.get("PARON_DEPLOYER_PK"), "");
  assert.equal(ops.get("PARON_DEPLOYER_PK"), "");
  assert.equal(root.has("DEPLOYER_PRIVATE_KEY"), false);
  for (const name of ["CHAIN", "PARAM_SET", "DEPLOY_LABEL", "GATE_KIND"]) {
    assert.equal(root.get(name), ops.get(name), name);
  }
  for (const name of root.keys()) {
    if (!ops.has(name)) continue;
    const left = root.get(name);
    const right = ops.get(name);
    if (left === "" || right === "") continue;
    assert.equal(left, right, name);
  }
});
