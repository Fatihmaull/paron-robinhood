import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  landingAnnounce,
  landingBuyer,
  landingFacts,
  landingFooter,
  landingHow,
  landingIndexNote,
  landingLedger,
  landingLinks,
  landingNav,
  landingProvider,
  landingSteps,
} from "./landing-copy.ts";

const copy = [
  landingAnnounce,
  landingIndexNote,
  ...landingNav.map((item) => `${item.href} ${item.label}`),
  ...landingFooter.map((item) => `${item.href} ${item.label}`),
  ...Object.values(landingLinks),
  ...landingFacts.map((item) => `${item.title} ${item.detail}`),
  ...landingHow.map((item) => `${item.title} ${item.kicker} ${item.body}`),
  ...landingLedger.map((item) => `${item.label} ${item.value}`),
  ...landingBuyer.map((item) => `${item.strong} ${item.text}`),
  ...landingProvider.map((item) => `${item.strong} ${item.text}`),
  ...landingSteps.map((item) => `${item.title} ${item.detail}`),
].join("\n");

function pageExists(href: string): boolean {
  const parts = href.split("/").filter(Boolean);
  return existsSync(join(process.cwd(), "app", ...parts, "page.tsx"));
}

test("landing links point at routes that exist", () => {
  const hrefs = [
    ...landingNav.map((item) => item.href),
    ...landingFooter.map((item) => item.href),
    ...Object.values(landingLinks),
  ];
  for (const href of hrefs) {
    if (href.startsWith("#")) continue;
    assert.equal(pageExists(href), true, href);
  }
  assert.equal(landingLinks.launch, "/markets");
});

test("S0 steps are buy, ask, redeem, default, and claim", () => {
  assert.deepEqual(
    landingSteps.map((step) => step.title),
    ["Buy", "Ask", "Redeem", "Default", "Claim"],
  );
});

test("facts and the bond ledger stay testnet-accurate", () => {
  assert.match(copy, /1 CU/);
  assert.match(copy, /1\.5×/);
  assert.match(copy, /MockUSDC/);
  assert.match(copy, /46630/);
  assert.match(copy, /Testnet only/);
  assert.match(copy, /KYB/);
  assert.equal(copy.includes("$2.50"), false);
  assert.equal(copy.includes("100 CU"), false);
  assert.equal(copy.includes("$375"), false);
  assert.equal(copy.includes("$250"), false);
  assert.equal(/partner|feeds/i.test(copy), false);
  assert.match(landingLedger.map((row) => row.value).join(" "), /\$3\.00 \/ CU/);
  assert.match(landingLedger.map((row) => row.value).join(" "), /\$4\.50 \/ CU/);
});

test("landing headline stays sans and a missing reference has fallback copy", () => {
  const view = readFileSync(new URL("../components/landing.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/landing.css", import.meta.url), "utf8");
  assert.match(view, /No reference yet/);
  assert.match(css, /\.landing \.hero h1 \{[^}]*--font-inter-tight/s);
  assert.match(css, /\.landing \.nav \{[^}]*display:\s*block/s);
});

test("landing motion is 38-64s and glass stays off the dashboard", () => {
  const css = readFileSync(new URL("../app/landing.css", import.meta.url), "utf8");
  assert.match(css, /38s/);
  assert.match(css, /52s/);
  assert.match(css, /64s/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  const shadows = css.match(/box-shadow\s*:[^;]+/g) ?? [];
  assert.deepEqual(shadows, ["box-shadow: none"]);
  const globals = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const book = globals.slice(globals.indexOf(".book-row {"), globals.indexOf(".book-row.ask"));
  assert.equal(book.includes("linear-gradient"), false);
});

test("wizard demo preset is the 2610 stage series", () => {
  const wizard = readFileSync(new URL("../components/wizard.tsx", import.meta.url), "utf8");
  assert.match(wizard, /symbol: "CU-JKT-H100-2610"/);
  assert.equal(wizard.includes("CU-JKT-H100-2611"), false);
});
