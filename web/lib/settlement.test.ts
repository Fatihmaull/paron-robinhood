import assert from "node:assert/strict";
import test from "node:test";
import { asBytes32, bidUsdcAllowance, factorBps, seriesBondRaw, splitSignature } from "./settlement.ts";

test("series bond scales with the conversion factor", () => {
  const bondPerCu = 4_500_000n;
  const hours = 500n;
  assert.equal(seriesBondRaw(bondPerCu, hours, factorBps("1.0000")), 2_250_000_000n);
  assert.equal(seriesBondRaw(bondPerCu, hours, factorBps("1.4000")), 3_150_000_000n);
  assert.equal(factorBps("0.4500"), 4_500n);
});

test("bid allowance covers the fill fee on top of escrow", () => {
  const qty = 10n ** 18n;
  const price = 3_200_000n;
  assert.equal(bidUsdcAllowance(qty, price, 15n), 3_204_800n);
  assert.equal(bidUsdcAllowance(qty, price, 0n), 3_200_000n);
});

test("permit signatures split into v, r, s", () => {
  const signature = `0x${"11".repeat(32)}${"22".repeat(32)}1b` as `0x${string}`;
  const parts = splitSignature(signature);
  assert.equal(parts.r, `0x${"11".repeat(32)}`);
  assert.equal(parts.s, `0x${"22".repeat(32)}`);
  assert.equal(parts.v, 27);
});

test("a short schema value does not get padded into a fake uid", () => {
  assert.equal(asBytes32("0x0000000000000000000000000000000000000000"), `0x${"0".repeat(64)}`);
  assert.equal(asBytes32(`0x${"ab".repeat(32)}`), `0x${"ab".repeat(32)}`);
});
