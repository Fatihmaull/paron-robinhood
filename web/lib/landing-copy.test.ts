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
  landingSample,
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

test("the H100 index page is not the app root route", () => {
  const shell = readFileSync(new URL("../components/shell.tsx", import.meta.url), "utf8");
  const nav = readFileSync(new URL("./nav-links.ts", import.meta.url), "utf8");
  assert.match(nav, /\["\/h100-index", "Index"\]/);
  assert.match(shell, /USER_NAV/);
  assert.equal(shell.includes('["/index", "Index"]'), false);
  assert.equal(nav.includes('["/index", "Index"]'), false);
  assert.equal(existsSync(join(process.cwd(), "app", "h100-index", "page.tsx")), true);
  assert.equal(existsSync(join(process.cwd(), "app", "index", "page.tsx")), false);
});

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

test("S0 steps match the documented demo path", () => {
  assert.deepEqual(
    landingSteps.map((step) => step.title),
    ["Buy", "Ask", "Redeem", "Default", "Claim", "KYB", "Timelock"],
  );
  const detail = landingSteps.map((step) => step.detail).join(" ");
  assert.match(detail, /20 CU/);
  assert.match(detail, /\$3\.20/);
  assert.match(detail, /8 CU/);
  assert.match(detail, /10 CU/);
  assert.match(detail, /Claim the default/);
  assert.match(detail, /Approve KYB/);
  assert.match(detail, /timelock/);
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

test("landing hero uses the production headline type and one framed shot", () => {
  const view = readFileSync(new URL("../components/landing.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/landing.css", import.meta.url), "utf8");
  const charts = readFileSync(new URL("../components/charts.tsx", import.meta.url), "utf8");
  const legal = readFileSync(new URL("../app/legal/risk/page.tsx", import.meta.url), "utf8");
  const globals = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.equal(landingSample.amount, "$2.50");
  assert.match(landingSample.note, /illustration/);
  assert.equal(view.includes("landingSample"), false);
  assert.equal(view.includes("useIndex"), false);
  assert.equal(view.includes("indexQuote"), false);
  assert.match(view, /IntersectionObserver/);
  assert.match(view, /heroSkyline/);
  assert.match(view, /Become a provider/);
  assert.match(view, /Browse markets/);
  const imgs = view.match(/<img\b[^>]*>/g) ?? [];
  assert.equal(imgs.length, 1);
  assert.equal(/demo/i.test(imgs[0]), false);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.rv\.in/);
  assert.match(charts, /attributionLogo:\s*false/);
  assert.equal(globals.includes("tv-attr-logo"), false);
  assert.equal(charts.includes("tradingview.com"), false);
  assert.match(legal, /Lightweight Charts/);
  assert.match(legal, /https:\/\/www\.tradingview\.com\//);
  assert.equal(/<img/i.test(legal), false);
  assert.match(css, /\.landing \.hero h1 \{[^}]*--font-inter-tight/s);
  assert.match(css, /\.landing \.hero h1 em \{[^}]*--font-instrument-serif/s);
  assert.match(css, /\.landing \.hero h1 em \{[^}]*font-weight:\s*400/s);
  assert.match(css, /\.landing \.nav \{[^}]*display:\s*block/s);
});

test("landing hero does not loop a curtain and glass stays off the dashboard", () => {
  const css = readFileSync(new URL("../app/landing.css", import.meta.url), "utf8");
  assert.equal(css.includes("38s"), false);
  assert.equal(css.includes("52s"), false);
  assert.equal(css.includes("64s"), false);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*\.rv \{[^}]*transition:\s*none/);
  const hero = css.slice(css.indexOf(".landing .hero {"), css.indexOf(".landing .facts"));
  assert.equal(/animation\s*:/.test(hero), false);
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
