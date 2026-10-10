import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shortAddress } from "./format.ts";
import { navNeedsMenu } from "./nav-fit.ts";

const SAMPLE = "0x3F8fBCD4b4196Ea3c1c020F09Fc9a590bB246ae9";

test("header wallet address is 6 leading chars and 4 trailing", () => {
  assert.equal(shortAddress(SAMPLE), "0x3F8f…6ae9");
  assert.equal(shortAddress(SAMPLE.toLowerCase()), "0x3F8f…6ae9");
  assert.equal(shortAddress(null), "—");
});

test("a wide connected wallet collapses the nav instead of clipping it", () => {
  const wideWallet = navNeedsMenu({
    headerWidth: 1024,
    padding: 64,
    gap: 20,
    gaps: 4,
    brand: 105,
    links: 640,
    chip: 190,
    wallet: 380,
  });
  assert.equal(wideWallet, true);
  const shortWallet = navNeedsMenu({
    headerWidth: 1440,
    padding: 64,
    gap: 20,
    gaps: 4,
    brand: 105,
    links: 640,
    chip: 190,
    wallet: 140,
  });
  assert.equal(shortWallet, false);
  const mid = navNeedsMenu({
    headerWidth: 1100,
    padding: 64,
    gap: 20,
    gaps: 4,
    brand: 105,
    links: 640,
    chip: 190,
    wallet: 140,
  });
  assert.equal(mid, true);
});

test("header wallet renders the short address and the old full-width rule is gone", () => {
  const wallet = readFileSync(new URL("../components/wallet.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const shell = readFileSync(new URL("../components/shell.tsx", import.meta.url), "utf8");
  assert.match(wallet, /shortAddress\(address\)/);
  assert.equal(wallet.includes("shortId(address)"), false);
  assert.match(shell, /navNeedsMenu/);
  assert.match(shell, /data-fit/);
  assert.match(css, /\.nav-wallet[\s\S]*max-width:\s*11\.5rem/);
  assert.equal(css.includes("min(42ch, 46vw)"), false);
  assert.equal(css.includes("tv-attr-logo"), false);
});
