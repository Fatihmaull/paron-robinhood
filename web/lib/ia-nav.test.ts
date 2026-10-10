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
    ["Markets", "Buy", "Trade", "Portfolio", "Redemptions", "Faucet", "Index", "Data"],
  );
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

test("for providers sits outside the user row", () => {
  const shell = read("../components/shell.tsx");
  const css = read("../app/globals.css");
  assert.match(shell, /For providers/);
  assert.match(shell, /nav-menu-section/);
  assert.match(shell, />Providers</);
  assert.match(css, /a\.for-providers[\s\S]*?#a6a6a6/);
  assert.match(css, /a\.for-providers[\s\S]*?border-radius:\s*0/);
  assert.equal(/className="pill[^"]*for-providers|for-providers[^"]*pill/.test(shell), false);
});

test("landing CTAs keep one demo entry and a footer operator link", () => {
  assert.equal(landingLinks.launch, "/markets");
  assert.equal(landingLinks.demo, "/demo");
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
  assert.equal((landing.match(/landingLinks\.demo/g) ?? []).length, 1);
  assert.match(landing, /Launch demo/);
  assert.equal(landing.includes("Open demo"), false);
  assert.match(landing, /Become a provider/);
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
