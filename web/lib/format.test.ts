import assert from "node:assert/strict";
import test from "node:test";
import { addressParts, disputeBond, formatMaxCost, formatUsd, isWholeCu, quotePrimary, shortAddress, shortId } from "./format.ts";

test("usd display is grouped and always two decimals", () => {
  assert.equal(formatUsd("60.000000"), "$60.00");
  assert.equal(formatUsd("16.024000"), "$16.02");
  assert.equal(formatUsd("0.600000"), "$0.60");
  assert.equal(formatUsd("-0.900000"), "-$0.90");
  assert.equal(formatUsd("3240.000000"), "$3,240.00");
  assert.equal(formatUsd("2250.500000"), "$2,250.50");
  assert.equal(formatUsd("-3240.000000"), "-$3,240.00");
});

test("max cost is two decimal places and covers the quote", () => {
  assert.equal(formatMaxCost("60.000000"), "60.00");
  assert.equal(formatMaxCost("16.024000"), "16.03");
  assert.equal(formatMaxCost("3240.000000"), "3240.00");
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

test("address casing matches between API lowercase and onchain checksum", () => {
  const lower = "0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed";
  const checksum = "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed";
  assert.equal(shortId(lower), shortId(checksum));
  assert.equal(shortId(lower), checksum);
  const hidden = "0xda147f898cf5f1a0c891cf40d8b9e7f772491d0f";
  assert.equal(shortId(hidden), "0xda147F898Cf5F1A0c891cf40D8B9e7f772491d0f");
  const hash = `0x${"ab".repeat(32)}`;
  assert.equal(shortId(hash), "0xabab…abab");
  const parts = addressParts(hidden);
  assert.equal(parts?.full, "0xda147F898Cf5F1A0c891cf40D8B9e7f772491d0f");
  assert.equal(`${parts?.head}${parts?.tail}`, parts?.full);
  assert.equal(parts?.tail, "1d0f");
  assert.equal(addressParts(hash), null);
});

test("shortAddress keeps a checksum head and tail and never the full 42 characters", () => {
  const sample = "0x3F8fBCD4b4196Ea3c1c020F09Fc9a590bB246ae9";
  assert.equal(shortAddress(sample), "0x3F8f…6ae9");
  assert.equal(shortAddress(sample.toLowerCase()), "0x3F8f…6ae9");
  assert.equal(shortAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed"), "0x5aAe…eAed");
  assert.equal(shortAddress(null), "—");
  assert.ok(shortAddress(sample).length < 42);
});

test("dispute bond floors at five dollars", () => {
  assert.equal(disputeBond("45.000000"), "5.000000");
  assert.equal(disputeBond("200.000000"), "10.000000");
});
