import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { claimCountdown, formatCountdown, shortAddress } from "./format.ts";
import { isDoneOp, isReadyOp, opStatusKey, scheduledFactor } from "./timelock-ops.ts";
import { attestationRole, canRegisterAsProvider } from "./verification.ts";

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

test("verification register stays closed until the linked attestation is role 1", () => {
  assert.equal(canRegisterAsProvider(attestationRole(1)), true);
  assert.equal(canRegisterAsProvider(attestationRole(1n)), true);
  assert.equal(canRegisterAsProvider(attestationRole(2)), false);
  assert.equal(canRegisterAsProvider(attestationRole(0)), false);
  assert.equal(canRegisterAsProvider(attestationRole(null)), false);
  assert.equal(attestationRole(undefined), null);
  const wallet = "0x3F8fBCD4b4196Ea3c1c020F09Fc9a590bB246ae9";
  assert.equal(shortAddress(wallet), "0x3F8f…6ae9");
  const ops = read("../components/ops.tsx");
  const kyb = slice(ops, "function KybPage", "function KeepersPage");
  assert.match(kyb, /Paron verifier \(team-operated, testnet\)/);
  assert.equal(kyb.includes("Paron demo verifier (team-operated)"), false);
  assert.match(kyb, /const \[uid, setUid\] = useState\(""\)/);
  assert.match(kyb, /value=\{uid\}/);
  assert.match(kyb, /placeholder="0x… \(32-byte attestation uid\)"/);
  assert.equal(/useState\(\s*address/.test(kyb), false);
  assert.equal(kyb.includes("value={address}"), false);
  assert.match(kyb, /Connected wallet \{address \? shortAddress\(address\) : "none"\}/);
  assert.equal(kyb.includes("shortId(address)"), false);
  assert.match(kyb, /errorCopy\("NotProviderRole"\)/);
  assert.match(read("./errors.ts"), /This attestation is for a buyer/);
  assert.match(kyb, /Ask the verifier for a provider attestation \(role 1\), then link it here\./);
  assert.match(kyb, /participantOf/);
  assert.match(kyb, /canRegisterAsProvider\(role\)/);
  assert.match(kyb, /disabled=\{registerBlocked\}/);
  const register = kyb.slice(kyb.indexOf('title="Register as provider"'));
  assert.match(register, /Register as provider/);
  assert.match(register, /<p className="help">Link a provider attestation first<\/p>/);
  assert.equal(register.includes('className="bad"'), false);
  assert.match(register, /<TxStatus record=\{record\} \/>/);
  const verifier = slice(ops, "function VerifierPage", "function AdminPage");
  assert.match(verifier, /Paron verifier \(team-operated, testnet\)/);
  assert.equal(verifier.includes("Paron demo verifier (team-operated)"), false);
  const css = read("../app/globals.css");
  assert.match(css, /\.btn \{[^}]*min-height:\s*44px/);
  assert.match(css, /\.help \{[^}]*--color-text-tertiary/);
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
