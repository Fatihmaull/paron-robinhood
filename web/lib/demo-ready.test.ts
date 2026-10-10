import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { explorerTxUrl } from "./config.ts";
import { demoDataLabel } from "./landing-copy.ts";
import { shortAddress } from "./format.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("chain 46630 transactions link to the testnet explorer", () => {
  assert.equal(
    explorerTxUrl("0xabc"),
    "https://explorer.testnet.chain.robinhood.com/tx/0xabc",
  );
});

test("demo data is one label and money stays grouped", () => {
  assert.equal(demoDataLabel, "Demo data");
  const shell = read("../components/shell.tsx");
  const index = read("../app/h100-index/page.tsx");
  const legal = read("../app/legal/risk/page.tsx");
  assert.match(shell, /Demo data/);
  assert.match(index, /Demo data/);
  assert.equal(shell.includes("Reference price (demo data)"), false);
  assert.equal(index.includes("Reference price (demo data)"), false);
  assert.equal(legal.includes("synthetic demo data"), false);
});

test("demo path states, wallet gate, and the short provider address", () => {
  const redemption = read("../components/redemption-view.tsx");
  const series = read("../components/series-view.tsx");
  const ui = read("../components/ui.tsx");
  const tx = read("../components/tx.tsx");
  const provider = read("../components/provider-console.tsx");
  const ops = read("../components/ops.tsx");
  const css = read("../app/globals.css");
  const address = read("../components/address.tsx");
  assert.match(redemption, /Request not found\./);
  assert.match(series, /Series not found/);
  assert.match(ui, /Connect wallet/);
  assert.match(ui, /Wrong network/);
  assert.match(tx, /Pending/);
  assert.match(tx, /Success/);
  assert.match(tx, /Failed/);
  assert.match(tx, /explorerTxUrl/);
  assert.match(provider, /<h1>Provider<\/h1>/);
  assert.match(provider, /shortAddress/);
  assert.match(ops, /PENDING: \{ label: "Pending", tone: "warn" \}/);
  assert.match(address, /shortAddress/);
  assert.match(address, /title=\{parts\.full\}/);
  assert.equal(address.includes("addr-wide"), false);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /button\.addr-copy[\s\S]*min-height:\s*44px/);
  assert.match(css, /button\.addr-copy[\s\S]*min-width:\s*44px/);
  assert.match(address, /aria-live="polite"/);
  assert.match(address, /Copied/);
  assert.match(address, /1500/);
  assert.match(css, /button\.addr-copy \{[^}]*font-family:\s*var\(--font-mono\)/);
  assert.match(css, /addr-narrow/);
  assert.equal(shortAddress("0x3F8fBCD4b4196Ea3c1c020F09Fc9a590bB246ae9"), "0x3F8f…6ae9");
});
