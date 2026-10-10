import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { kybBannerKind, retryLiveStatus, sameWallet, selectProviderAddress } from "./provider-select.ts";

const UNKNOWN = "0x3F8fBCD4b4196Ea3c1c020F09Fc9a590bB246ae9";
const LISTED = "0xda147f898cf5f1a0c891cf40d8b9e7f772491d0f";

test("an unknown wallet never becomes a provider detail path", () => {
  const listed = [{ address: LISTED, status: "ACTIVE" as const }];
  const target = selectProviderAddress(UNKNOWN, listed);
  assert.equal(target, LISTED);
  assert.notEqual(target?.toLowerCase(), UNKNOWN.toLowerCase());
  assert.equal(selectProviderAddress(LISTED.toUpperCase(), listed), LISTED);
  assert.equal(selectProviderAddress(undefined, listed), LISTED);
  assert.equal(selectProviderAddress(UNKNOWN, []), null);
  const indexer = readFileSync(new URL("../../indexer/src/api/create-app.ts", import.meta.url), "utf8");
  assert.match(indexer, /app\.get\("\/v1\/providers\/:addr"/);
  assert.match(indexer, /app\.get\("\/v1\/providers"/);
  const api = readFileSync(new URL("./api.ts", import.meta.url), "utf8");
  assert.equal(api.includes(".catch(firstActive)"), false);
  assert.match(api, /selectProviderAddress/);
  assert.match(api, /\/providers\/\$\{target\}/);
});

test("a 404 is not fetched twice", () => {
  assert.equal(retryLiveStatus(404), false);
  assert.equal(retryLiveStatus(400), false);
  assert.equal(retryLiveStatus(503), true);
  assert.equal(retryLiveStatus(0), true);
  const api = readFileSync(new URL("./api.ts", import.meta.url), "utf8");
  assert.match(api, /retryLiveStatus\(error\.status\)/);
});

test("kyb banner kinds and the owner check", () => {
  assert.equal(kybBannerKind(false, false), "not KYB");
  assert.equal(kybBannerKind(false, true), "pending");
  assert.equal(kybBannerKind(true, false), "verified");
  assert.equal(kybBannerKind(true, true), "verified");
  assert.equal(sameWallet(UNKNOWN, UNKNOWN.toLowerCase()), true);
  assert.equal(sameWallet(null, UNKNOWN), false);
  assert.equal(sameWallet(UNKNOWN, LISTED), false);
});

test("the provider dashboard keeps the heading, the KYB gate, and a read-only notice", () => {
  const page = readFileSync(new URL("../app/provider/page.tsx", import.meta.url), "utf8");
  const dash = readFileSync(new URL("../components/provider-console.tsx", import.meta.url), "utf8");
  assert.match(page, /Connect wallet/);
  assert.match(page, /\/provider\/\$\{canonicalAddress\(address\)\}/);
  assert.match(dash, /<h1>Provider<\/h1>/);
  assert.match(dash, /shortAddress\(route\)/);
  assert.match(dash, /Complete KYB to list capacity/);
  assert.match(dash, /Start KYB/);
  assert.match(dash, /Read only\. Actions stay off until this wallet is connected\./);
  assert.match(dash, /kybBannerKind/);
  assert.match(dash, /readOnly=\{!canAct\}/);
});
