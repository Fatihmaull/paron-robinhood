import assert from "node:assert/strict";
import test from "node:test";
import { getAddress, type Address, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  encodeRulingFragment,
  packageUrl,
  parseRulingPackage,
  reviewRulingPackage,
  RULING_TYPES,
  rulingDomain,
  type RulingPackage,
} from "./ruling-package.ts";

const arbitrator = getAddress("0x1111111111111111111111111111111111111111");

function blank(signatures: Hex[] = []): RulingPackage {
  return {
    chainId: 46630,
    arbitrator,
    reqId: "2",
    outcome: 1,
    rulingDeadline: "1893456000",
    signatures,
  };
}

async function sign(account: ReturnType<typeof privateKeyToAccount>, pkg: RulingPackage): Promise<Hex> {
  return account.signTypedData({
    domain: rulingDomain(pkg.chainId, pkg.arbitrator),
    types: RULING_TYPES,
    primaryType: "Ruling",
    message: {
      reqId: BigInt(pkg.reqId),
      outcome: pkg.outcome,
      rulingDeadline: BigInt(pkg.rulingDeadline),
    },
  });
}

test("a ruling package round-trips through the url fragment", () => {
  const pkg = blank(["0x" + "ab".repeat(65) as Hex]);
  const url = packageUrl("https://paron.example", "/arbiter/cases/2", pkg);
  assert.match(url, /^https:\/\/paron\.example\/arbiter\/cases\/2#sig=/);
  assert.equal(url.includes("?"), false);
  assert.deepEqual(parseRulingPackage(url), pkg);
  assert.deepEqual(parseRulingPackage(`#${encodeRulingFragment(pkg)}`), pkg);
  assert.equal(parseRulingPackage("not-json"), null);
  assert.equal(parseRulingPackage("#sig=%7B%7D"), null);
});

test("submit stays shut until two distinct panel members have signed", async () => {
  const first = privateKeyToAccount(generatePrivateKey());
  const second = privateKeyToAccount(generatePrivateKey());
  const outsider = privateKeyToAccount(generatePrivateKey());
  const pkg = blank();
  const members = [first.address, second.address] as Address[];
  const one = blank([await sign(first, pkg)]);
  const alone = await reviewRulingPackage(one, members, 2);
  assert.equal(alone.ready, false);
  assert.match(alone.reason ?? "", /1\/2/);

  const both = blank([one.signatures[0], await sign(second, pkg)]);
  const ready = await reviewRulingPackage(both, members, 2);
  assert.equal(ready.ready, true);
  assert.equal(ready.reason, null);
  assert.equal(ready.signers.length, 2);

  const repeated = blank([one.signatures[0], one.signatures[0]]);
  const dup = await reviewRulingPackage(repeated, members, 2);
  assert.match(dup.reason ?? "", /repeats a signer/);

  const foreign = blank([await sign(outsider, pkg)]);
  const out = await reviewRulingPackage(foreign, members, 2);
  assert.match(out.reason ?? "", /not on the panel/);

  const unread = await reviewRulingPackage(both, [], 2);
  assert.match(unread.reason ?? "", /not loaded/);
});
