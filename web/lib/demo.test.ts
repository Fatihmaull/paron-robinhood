import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { demoChecks } from "./demo.ts";

test("demo checklist names the stage series and does not mark steps done", () => {
  const checks = demoChecks();
  const text = checks.map((item) => `${item.label} ${item.href}`).join("\n");
  assert.match(text, /CU-JKT-H100-2610/);
  assert.equal(text.includes("2611"), false);
  assert.equal(checks.some((item) => "done" in item), false);
  assert.equal(checks.find((item) => item.id === "series")?.href, "/markets/4");
  assert.equal(checks.find((item) => item.id === "primary")?.href, "/markets/4");
  assert.equal(checks.find((item) => item.id === "trade")?.href, "/trade/4");
  assert.equal(checks.find((item) => item.id === "finalized")?.href, "/redemptions/1");
  assert.equal(checks.find((item) => item.id === "defaulted")?.href, "/redemptions/2");
});

test("redemption 1 and 2 are the stage series, not a seed series", () => {
  for (const file of ["redemption.1.json", "redemption.2.t2.json", "redemption.2.t3.json"]) {
    const body = JSON.parse(readFileSync(new URL(`../fixtures/v1/${file}`, import.meta.url), "utf8")) as {
      data: { series_id: string; symbol: string; req_id: string };
    };
    assert.equal(body.data.series_id, "4");
    assert.equal(body.data.symbol, "CU-JKT-H100-2610");
    assert.equal(body.data.req_id === "1" || body.data.req_id === "2", true);
  }
});
