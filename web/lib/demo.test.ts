import assert from "node:assert/strict";
import test from "node:test";
import { demoChecks } from "./demo.ts";

test("demo checklist names the live series and does not mark steps done", () => {
  const checks = demoChecks();
  const text = checks.map((item) => `${item.label} ${item.href}`).join("\n");
  assert.match(text, /CU-JKT-H100-2611/);
  assert.equal(text.includes("2610"), false);
  assert.equal(text.includes("Series 4"), false);
  assert.equal(checks.some((item) => "done" in item), false);
  assert.equal(checks[0]?.href, "/markets/1");
});
