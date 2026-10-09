import assert from "node:assert/strict";
import test from "node:test";
import { missingSeedKeys, normalizePrivateKey, readDeployerKey, redact } from "../src/key.mjs";

const HEX = "11".repeat(32);

test("accepts 64 hex characters with or without 0x", () => {
  assert.equal(normalizePrivateKey(HEX), `0x${HEX}`);
  assert.equal(normalizePrivateKey(`0x${HEX}`), `0x${HEX}`);
  assert.equal(normalizePrivateKey(`0X${HEX.toUpperCase()}`), `0x${HEX}`);
});

test("rejects a bad key without echoing it", () => {
  const secret = "abcd";
  assert.throws(() => normalizePrivateKey(secret), (err) => {
    assert.equal(err.message.includes(secret), false);
    assert.match(err.message, /64 hex/);
    return true;
  });
  assert.throws(() => readDeployerKey({}), /PARON_DEPLOYER_PK/);
});

test("seed signer W-DEP reads PARON_DEPLOYER_PK", () => {
  const missing = missingSeedKeys(["W-DEP", "W-VERIFIER"], {});
  assert.deepEqual(missing, ["PARON_DEPLOYER_PK", "KEY_W_VERIFIER"]);
  assert.deepEqual(missingSeedKeys(["W-DEP"], { PARON_DEPLOYER_PK: HEX }), []);
});

test("redact removes the secret", () => {
  assert.equal(redact(`failed ${HEX}`, [`0x${HEX}`]).includes(HEX), false);
});
