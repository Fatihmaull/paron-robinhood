import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { claimCountdown, formatCountdown } from "./format.ts";
import { isDoneOp, isReadyOp, opStatusKey, scheduledFactor } from "./timelock-ops.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

function slice(source: string, start: string, end: string) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `${start} … ${end}`);
  return source.slice(from, to);
}

test("a scheduled factor accepts new_factor or factor and refuses a missing value", () => {
  assert.equal(scheduledFactor({ new_factor: "0.4500" }), "0.4500");
  assert.equal(scheduledFactor({ factor: "0.3200" }), "0.3200");
  assert.equal(scheduledFactor({ new_factor: "0.5000", factor: "0.3200" }), "0.5000");
  assert.equal(scheduledFactor({ new_factor: "  ", factor: "0.3100" }), "0.3100");
  assert.equal(scheduledFactor({}), null);
  assert.equal(scheduledFactor({ factor: "" }), null);
  assert.equal(scheduledFactor(undefined), null);
  const ops = read("../components/ops.tsx");
  assert.equal(ops.includes('?? "0.4500"'), false);
  assert.equal(ops.includes("?? '0.4500'"), false);
  assert.match(ops, /className="muted">Not set</);
  assert.match(ops, /Factor is not set\./);
  assert.match(ops, /if \(!next\)/);
});

test("done operations use a green Done badge and do not render Execute", () => {
  assert.equal(isDoneOp("DONE"), true);
  assert.equal(isDoneOp("Done"), true);
  assert.equal(isDoneOp("EXECUTED"), true);
  assert.equal(isDoneOp("executed"), true);
  assert.equal(isDoneOp("READY"), false);
  assert.equal(isReadyOp("Ready"), true);
  assert.equal(isReadyOp("DONE"), false);
  assert.equal(opStatusKey(" Done "), "DONE");
  const ops = read("../components/ops.tsx");
  assert.match(ops, /DONE: \{ label: "Done", tone: "ok" \}/);
  assert.match(ops, /EXECUTED: \{ label: "Done", tone: "ok" \}/);
  const admin = slice(ops, "function AdminPage", "const KYB_PILLS");
  assert.match(admin, /isReadyOp\(op\.status\) \|\| isDoneOp\(op\.status\)/);
  assert.match(admin, /\{done \? null : \([\s\S]*Execute[\s\S]*?<\/TxButton>/);
  assert.match(admin, /<span>Ready at<\/span><span>\{formatWib\(op\.ready_at_ms\)\}<\/span>/);
  assert.equal(admin.includes('done ? "Executed"'), false);
});

test("verifier, admin, keepers, and KYB render the shared tx status", () => {
  const ops = read("../components/ops.tsx");
  const kyb = slice(ops, "function KybPage", "function KeepersPage");
  const keepers = slice(ops, "function KeepersPage", "function Queue");
  const verifier = slice(ops, "function VerifierPage", "function AdminPage");
  const admin = slice(ops, "function AdminPage", "const KYB_PILLS");
  for (const part of [kyb, keepers, verifier, admin]) {
    assert.match(part, /<TxStatus record=\{record\} \/>/);
  }
  assert.match(verifier, /record\?\.step === "attest" && record\.phase === "success"/);
  assert.match(verifier, /Attestation issued\./);
  const css = read("../app/globals.css");
  assert.match(css, /\.tx-status \{[^}]*font-size:\s*14px/);
  assert.match(css, /\.tx-status\.success \{[^}]*--color-ok/);
  assert.match(css, /\.tx-status\.pending \{[^}]*--color-warn/);
  assert.match(css, /\.tx-status\.failed \{[^}]*--color-danger/);
});

test("a live claim says Claimable now and the clock does not go negative", () => {
  assert.equal(formatCountdown(124_000, 0), "-2:04");
  assert.equal(claimCountdown(124_000, 0), "0:00");
  assert.equal(claimCountdown(0, 124_000), "2:04");
  assert.equal(claimCountdown(0, 0), "0:00");
  const view = read("../components/redemption-view.tsx");
  assert.match(view, /data-testid="countdown">\{claimCountdown\(nowMs, deadline\)\}/);
  assert.match(view, /\{open\s*\?\s*"Claimable now"/);
  const status = slice(view, 'data-testid="claim-status"', "</p>");
  const liveBranch = status.split("?")[1]?.split(":")[0] ?? "";
  assert.match(liveBranch, /Claimable now/);
  assert.equal(liveBranch.includes("NotDefaultable"), false);
  assert.match(status, /NotDefaultable/);
});
