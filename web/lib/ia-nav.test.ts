import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";
import { resolveDataSource } from "./config.ts";
import { landingFooter, landingLinks, landingNav, providerEntryPath } from "./landing-copy.ts";
import { navNeedsMenu } from "./nav-fit.ts";
import { USER_NAV } from "./nav-links.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

function walk(dir: string, visit: (file: string) => void) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, visit);
    else if (/\.(ts|tsx)$/.test(name)) visit(path);
  }
}

test("user nav is markets through data", () => {
  assert.deepEqual(
    USER_NAV.map((item) => item[1]),
    ["Docs", "Markets", "Buy", "Trade", "Portfolio", "Redemptions", "Faucet", "Index", "Data"],
  );
  assert.equal(USER_NAV[0][0], "/docs");
  assert.equal(USER_NAV[1][0], "/markets");
  const shell = read("../components/shell.tsx");
  const wallet = read("../components/wallet.tsx");
  assert.match(shell, /USER_NAV/);
  assert.equal(shell.includes('["/provider"'), false);
  assert.equal(shell.includes('["/demo"'), false);
  assert.equal(shell.includes('["/operator"'), false);
  assert.equal(shell.includes('["/verifier"'), false);
  assert.equal(wallet.includes("/verifier"), false);
  assert.equal(wallet.includes("/admin"), false);
  assert.equal(wallet.includes("/ops/keepers"), false);
  assert.equal(wallet.includes("/arbiter"), false);
});

test("provider and operator entries stay on the landing", () => {
  const shell = read("../components/shell.tsx");
  const landing = read("../components/landing.tsx");
  assert.equal(shell.includes("For providers"), false);
  assert.equal(shell.includes('href="/provider"'), false);
  assert.equal(shell.includes('href="/operator"'), false);
  assert.match(landing, /Become a provider/);
  assert.match(landing, /providerEntryPath/);
  assert.equal(landingFooter.some((item) => item.href === "/operator"), true);
});

test("landing nav puts Docs immediately left of Markets", () => {
  assert.deepEqual(
    landingNav.slice(0, 2).map((item) => [item.href, item.label]),
    [
      ["/docs", "Docs"],
      ["/markets", "Markets"],
    ],
  );
  const landing = read("../components/landing.tsx");
  const css = read("../app/landing.css");
  const footer = read("../components/shell.tsx");
  assert.match(landing, /aria-controls="landing-nav"/);
  assert.match(landing, /landingNav\.map/);
  assert.match(landing, />\s*Menu\s*</);
  assert.match(css, /\.landing \.menu-toggle \{[^}]*display:\s*none/);
  assert.match(css, /\.landing \.nav ul a \{[^}]*min-height:\s*44px/);
  assert.match(css, /\.landing \.pill \{[^}]*min-height:\s*44px/);
  const narrow = css.slice(css.indexOf("@media (max-width: 1024px)"));
  assert.match(narrow, /\.landing \.menu-toggle \{[^}]*display:\s*inline-flex/);
  assert.match(narrow, /\.landing \.nav nav\.open ul \{[^}]*display:\s*flex/);
  assert.match(footer, /href="\/docs\/contracts"/);
  assert.deepEqual(
    landingFooter.map((item) => item.label),
    ["Markets", "Data", "Operator"],
  );
});

test("landing CTAs keep the announcement path and a footer operator link", () => {
  assert.equal(landingLinks.launch, "/markets");
  assert.equal(landingLinks.provider, "/provider");
  assert.equal(landingLinks.announce, "#demo");
  assert.equal(
    landingNav.some((item) => item.href === "/demo" || item.href === "/provider" || item.href === "/operator"),
    false,
  );
  assert.deepEqual(
    landingFooter.map((item) => item.label),
    ["Markets", "Data", "Operator"],
  );
  assert.equal(landingFooter.find((item) => item.label === "Operator")?.href, "/operator");
  const landing = read("../components/landing.tsx");
  assert.equal(landing.includes("Launch demo"), false);
  assert.equal(landing.includes('href="/demo"'), false);
  assert.equal(landing.includes("landingLinks.demo"), false);
  assert.match(landing, /See the demo path/);
  assert.match(landing, /Become a provider/);
  assert.match(landing, /Browse markets/);
  assert.match(landing, /providerEntryPath/);
  assert.equal(providerEntryPath(false, null), "/provider");
  assert.equal(providerEntryPath(true, true), "/provider");
  assert.equal(providerEntryPath(true, null), "/provider");
  assert.equal(providerEntryPath(true, false), "/onboarding/kyb");
});

test("no component outside the landing links to /demo", () => {
  const route = ["/", "demo"].join("");
  const needle = new RegExp(`["'\`]${route}["'\`]`);
  const allow = new Set(["components/landing.tsx", "lib/landing-copy.ts", "lib/ia-nav.test.ts"]);
  const hits: string[] = [];
  for (const root of ["components", "app", "lib"]) {
    walk(join(process.cwd(), root), (file) => {
      const rel = relative(process.cwd(), file);
      if (allow.has(rel)) return;
      if (needle.test(readFileSync(file, "utf8"))) hits.push(rel);
    });
  }
  assert.deepEqual(hits, []);
});

test("operator tools lists the operator pages", () => {
  const page = read("../app/operator/page.tsx");
  assert.match(page, /<h1>Operator tools<\/h1>/);
  for (const href of ["/verifier", "/admin", "/ops/keepers", "/arbiter", "/disputes"]) {
    assert.match(page, new RegExp(href.replaceAll("/", "\\/")));
  }
  assert.match(read("../components/ops.tsx"), /OperatorLink/);
  assert.match(read("../app/disputes/page.tsx"), /OperatorLink/);
});

test("production never selects mock fixtures", () => {
  assert.equal(resolveDataSource({ explicit: "mock", apiBase: "", onVercel: false, nodeEnv: "production" }), "live");
  assert.equal(resolveDataSource({ explicit: "", apiBase: "", onVercel: false, nodeEnv: "production" }), "live");
  assert.equal(resolveDataSource({ explicit: "mock", apiBase: "", onVercel: false, nodeEnv: "development" }), "mock");
  assert.equal(resolveDataSource({ explicit: "", apiBase: "https://api.example", onVercel: false, nodeEnv: "development" }), "live");
  assert.equal(resolveDataSource({ explicit: "", apiBase: "", onVercel: false, nodeEnv: "development" }), "mock");
});

test("the demo data label stays visible when the header is narrow", () => {
  const css = read("../app/globals.css");
  const shell = read("../components/shell.tsx");
  const index = read("../app/h100-index/page.tsx");
  const landing = read("../components/landing.tsx");
  const narrow = css.slice(css.indexOf("@media (max-width: 860px)"));
  assert.equal(/\.strip\s*\{[^}]*display:\s*none/.test(narrow), false);
  assert.match(shell, /Demo data/);
  assert.match(index, /Demo data/);
  assert.match(shell, /Reference price \(demo data\)/);
  assert.equal(index.includes("Reference price (demo data)"), false);
  assert.equal(landing.includes("className=\"strip"), false);
});

test("the provider side link counts toward the nav fit", () => {
  assert.equal(
    navNeedsMenu({
      headerWidth: 1280,
      padding: 64,
      gap: 20,
      gaps: 5,
      brand: 105,
      links: 900,
      chip: 190,
      wallet: 140,
      side: 120,
    }),
    true,
  );
});
