import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { failureReason } from "./errors.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the landing keeps a single hero heading", () => {
  const landing = read("../components/landing.tsx");
  const screens = read("../components/landing/tour-screens.tsx");
  assert.equal((landing.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.equal(screens.includes("<h1"), false);
  assert.match(screens, /className="screen-title"/);
  assert.match(screens, /className="h1row"/);
});

test("reduced motion stops the tour beam after it is defined", () => {
  const css = read("../app/landing.css");
  const beam = css.lastIndexOf("@keyframes landing-tour-beam");
  assert.ok(beam > 0);
  const after = css.slice(beam);
  assert.match(after, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*tour-frame::before[\s\S]*animation:\s*none/);
});

test("request redemption is a 44px hit target", () => {
  const series = read("../components/series-view.tsx");
  const css = read("../app/globals.css");
  assert.match(series, /className="touch-link"[^>]*>Request redemption/);
  assert.match(css, /a\.touch-link[\s\S]*min-height:\s*44px/);
});

test("a failed step names a known reason once", () => {
  assert.equal(failureReason(new Error("user rejected the request")), "Transaction rejected.");
  assert.equal(failureReason(new Error("SlippageExceeded(60000000, 50000000)")), "max cost too low");
  assert.equal(failureReason(new Error("MaxCostRequired()")), "max cost too low");
  const cool = failureReason(new Error("FaucetCooldown(1700000000)"));
  assert.match(cool, /^Faucet cooling down\. Try again at /);
  assert.equal(cool.includes("Transaction failed"), false);
  const waiting = failureReason(new Error("FaucetCooldown(2000000000)"));
  assert.match(waiting, /left\)/);
  assert.match(failureReason(new Error("SaleClosed()")), /primary sale is closed/);
  assert.equal(failureReason(new Error("execution reverted")), "Transaction failed.");
  const ops = read("../components/ops.tsx");
  const faucet = ops.slice(ops.indexOf("function FaucetPage"), ops.indexOf("function KybPage"));
  assert.match(faucet, /<TxStatus record=\{record\} \/>/);
  assert.equal(faucet.includes("FaucetCooldown"), false);
  assert.equal(faucet.includes('className="bad"'), false);
  assert.equal(faucet.includes("Transaction failed"), false);
  const css = read("../app/globals.css");
  assert.match(css, /\.tx-status \{[^}]*font-size:\s*14px/);
});

test("step 4 hides the buy form and inactive screens", () => {
  const css = read("../app/landing.css");
  const runner = read("../components/landing/tour-runner.ts");
  assert.match(css, /\.screen \{[^}]*visibility:\s*hidden/);
  assert.match(css, /\.screen\.on \{[^}]*visibility:\s*visible/);
  assert.match(css, /\.screen\.tx-focus > \.two \{ visibility: hidden/);
  assert.match(runner, /tx-focus/);
  assert.match(css, /\.screen\.tx-focus \.tray\.on \{[^}]*left: 440px/);
  assert.match(runner, /tx-pending[\s\S]*setCam\(frame\.tx, frame\.ty, frame\.z, 0\)/);
  const ops = read("../components/ops.tsx");
  const verifier = ops.slice(ops.indexOf("function VerifierPage"), ops.indexOf("function AdminPage"));
  assert.match(verifier, /Issued attestations/);
  assert.match(verifier, /Use for revoke/);
  assert.match(ops, /lastFaucetAt/);
  assert.match(ops, /data-testid="faucet-cooldown"/);
  const disclaimer = read("../app/legal/disclaimer/page.tsx");
  assert.match(disclaimer, /<h1>Disclaimer<\/h1>/);
  assert.match(disclaimer, /no monetary value/);
  assert.equal(disclaimer.toLowerCase().includes("affili"), false);
});
