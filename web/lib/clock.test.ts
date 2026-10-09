import assert from "node:assert/strict";
import test from "node:test";
import {
  afterDeadlineOpen,
  beforeDeadlineOpen,
  inUnlockGap,
  median,
  syncOffset,
} from "./clock.ts";

test("offset is server minus client", () => {
  assert.equal(syncOffset(1_000_000, 900_000), 100_000);
});

test("median of recent offsets", () => {
  assert.equal(median([10, 30, 20]), 20);
  assert.equal(median([10, 40]), 25);
  assert.equal(median([]), 0);
});

test("t2 claim stays shut on the fixture second and opens two seconds later", () => {
  const deadline = 1_791_601_440_000;
  const server = 1_791_601_441_000;
  assert.equal(afterDeadlineOpen(server, deadline), false);
  assert.equal(inUnlockGap(server, deadline), true);
  assert.equal(afterDeadlineOpen(server + 2_000, deadline), true);
  assert.equal(afterDeadlineOpen(deadline + 2_000, deadline), false);
  assert.equal(afterDeadlineOpen(deadline + 3_000, deadline), true);
});

test("declineAndPay is inclusive of the deadline second", () => {
  const deadline = 1_791_601_350_000;
  assert.equal(beforeDeadlineOpen(1_791_601_290_000, deadline), true);
  assert.equal(beforeDeadlineOpen(deadline, deadline), true);
  assert.equal(beforeDeadlineOpen(deadline + 1_000, deadline), false);
});
