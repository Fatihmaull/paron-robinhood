import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { DOCS_NOTES, DOCS_STEPS } from "./docs-content.ts";
import { navNeedsMenu } from "./nav-fit.ts";
import { USER_NAV } from "./nav-links.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("docs is the first app nav item, immediately left of Markets", () => {
  assert.deepEqual(USER_NAV.slice(0, 2), [
    ["/docs", "Docs"],
    ["/markets", "Markets"],
  ]);
  const shell = read("../components/shell.tsx");
  assert.equal((shell.match(/USER_NAV\.map/g) ?? []).length, 2);
  assert.equal(existsSync(join(process.cwd(), "app", "docs", "page.tsx")), true);
});

test("the docs page is one heading, one image per step, and no video", () => {
  const page = read("../app/docs/page.tsx");
  assert.equal((page.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.equal(page.includes("<video"), false);
  assert.equal(page.includes(["/", "demo"].join("")), false);
  assert.match(page, /width=\{step\.width\}/);
  assert.match(page, /height=\{step\.height\}/);
  assert.match(page, /alt=\{step\.alt\}/);
  assert.match(page, /className="grid docs"/);
  assert.match(page, /aria-label="Contents"/);
  assert.match(page, /className="panel operator-tools"/);
  assert.equal(DOCS_STEPS.length, 17);
  const images = new Set(DOCS_STEPS.map((step) => step.image));
  assert.equal(images.size, DOCS_STEPS.length);
  for (const step of DOCS_STEPS) {
    assert.ok(step.title.length > 0);
    assert.ok(step.text.length > 0);
    assert.ok(step.alt.length > 0);
    assert.equal(step.width > 0 && step.height > 0, true);
    assert.match(step.image, /^\/docs\/.+\.png$/);
    assert.equal(step.width, 1280);
    const file = join(process.cwd(), "public", step.image.slice(1));
    assert.equal(existsSync(file), true, step.image);
  }
  const joined = `${page}\n${read("./docs-content.ts")}`;
  assert.equal(new RegExp(["\\bpart" + "ner\\b", "\\bfe" + "eds\\b"].join("|"), "i").test(joined), false);
  assert.equal(new RegExp("not affili" + "ated", "i").test(joined), false);
  assert.equal(/0x[0-9a-fA-F]{40}/.test(joined), false);
  assert.match(joined, /Become a provider/);
  assert.match(joined, /OPERATOR tab in the footer of the landing page/);
  assert.match(joined, /Bond\/CU of \$4\.50/);
  assert.match(DOCS_STEPS[4].text, /"Demo data" label in the top bar/);
  assert.match(DOCS_STEPS[4].text, /Verified by Paron verifier \(team-operated, testnet\)/);
  assert.match(joined, /Good to know/);
  assert.equal(DOCS_NOTES.length, 4);
  assert.match(DOCS_NOTES.join(" "), /Demo data/);
  assert.match(DOCS_NOTES.join(" "), /sample/);
  assert.match(
    DOCS_NOTES.join("\n"),
    /To register as a provider your wallet needs a provider attestation \(role 1\) issued on Verifier and linked here first\. A buyer attestation can't register\./,
  );
  assert.equal(joined.includes("Paron demo verifier (team-operated)"), false);
  const css = read("../app/globals.css");
  assert.match(css, /\.grid\.docs \{[^}]*grid-template-columns:/);
  const narrow = css.slice(css.indexOf("@media (max-width: 860px)"));
  assert.match(narrow, /\.grid\.docs[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.operator-tools a \{[^}]*min-height:\s*44px/);
  assert.match(css, /\.grid\.docs img \{[^}]*max-width:\s*100%/);
});

test("a short wallet still collapses the header before Docs can clip it", () => {
  const shortWallet = 148;
  const links = 860;
  const wide = {
    padding: 64,
    gap: 20,
    gaps: 4,
    brand: 105,
    links,
    chip: 190,
    wallet: shortWallet,
  };
  assert.equal(navNeedsMenu({ ...wide, headerWidth: 1280 }), true);
  assert.equal(navNeedsMenu({ ...wide, headerWidth: 1024 }), true);
  assert.equal(
    navNeedsMenu({
      headerWidth: 390,
      padding: 24,
      gap: 8,
      gaps: 3,
      brand: 80,
      links,
      chip: 0,
      wallet: shortWallet,
    }),
    true,
  );
});
