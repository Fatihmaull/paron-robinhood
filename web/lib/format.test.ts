import assert from "node:assert/strict";
import test from "node:test";
import { disputeBond, formatUsd, isWholeCu, quotePrimary } from "./format.ts";

test("usd display keeps extra digits only when they are nonzero", () => {
  assert.equal(formatUsd("60.000000"), "$60.00");
  assert.equal(formatUsd("16.024000"), "$16.024");
  assert.equal(formatUsd("0.600000"), "$0.60");
  assert.equal(formatUsd("-0.900000"), "-$0.90");
});

test("primary quote uses integer USDC math", () => {
  const q = quotePrimary("20", "3.000000");
  assert.equal(q.cost, "60.000000");
  assert.equal(q.fee, "0.600000");
});

test("whole CU check", () => {
  assert.equal(isWholeCu("1"), true);
  assert.equal(isWholeCu("1.5"), false);
  assert.equal(isWholeCu("0"), false);
});

test("dispute bond floors at five dollars", () => {
  assert.equal(disputeBond("45.000000"), "5.000000");
  assert.equal(disputeBond("200.000000"), "10.000000");
});
