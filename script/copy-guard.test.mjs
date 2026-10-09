import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { lineViolations, productFiles, repoRoot, scanRoot } from "./copy-guard.mjs";

const script = fileURLToPath(new URL("./copy-guard.mjs", import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

test("D-74 phrase fails the guard", () => {
  const affiliated = lineViolations("README.md", "Not affili" + "ated with Example.");
  const endorsed = lineViolations("README.md", "Not endors" + "ed by Example.");
  assert.equal(affiliated.length, 1);
  assert.equal(affiliated[0].rule, "D-74");
  assert.equal(endorsed.length, 1);
  assert.equal(endorsed[0].rule, "D-74");
});

test("partner and feeds fail the guard", () => {
  const partner = lineViolations("web/app/page.tsx", "We are a part" + "ner of the venue.");
  const feeds = lineViolations("web/app/page.tsx", "The market fee" + "ds the benchmark.");
  assert.equal(partner[0].rule, "wording-partner");
  assert.equal(feeds[0].rule, "wording-feeds");
});

test("role names and contract identifiers are not wording hits", () => {
  const text = "Wallet W-FEED signs ReferenceFeed. Deployed on Robinhood Chain Testnet.";
  assert.deepEqual(lineViolations("README.md", text), []);
});

test("cli exits 1 on a file that violates D-74", () => {
  const dir = mkdtempSync(join(tmpdir(), "paron-guard-"));
  const file = join(dir, "bad.md");
  writeFileSync(file, "Disclaimer: endors" + "ed by Example.\n");
  const result = runCli(["--file", file]);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /D-74/);
});

test("cli exits 1 on partner and on feeds", () => {
  const dir = mkdtempSync(join(tmpdir(), "paron-guard-"));
  const partner = join(dir, "partner.md");
  const feeds = join(dir, "feeds.md");
  writeFileSync(partner, "part" + "nership language\n");
  writeFileSync(feeds, "fee" + "ds the index\n");
  const partnerResult = runCli(["--file", partner]);
  const feedsResult = runCli(["--file", feeds]);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(partnerResult.status, 1);
  assert.equal(feedsResult.status, 1);
});

test("cli exits 0 on clean product copy", () => {
  const dir = mkdtempSync(join(tmpdir(), "paron-guard-"));
  const file = join(dir, "ok.md");
  writeFileSync(file, "Deployed on Robinhood Chain Testnet. Testnet demo: tokens have no monetary value.\n");
  const result = runCli(["--file", file]);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /ok/);
});

const PHRASE = "Not affiliated with or endorsed by Example.";

function fixtureTree() {
  const dir = mkdtempSync(join(tmpdir(), "paron-guard-"));
  mkdirSync(join(dir, "docs", "pitch"), { recursive: true });
  mkdirSync(join(dir, "indexer", "src"), { recursive: true });
  mkdirSync(join(dir, "web", "app"), { recursive: true });
  mkdirSync(join(dir, "web", "lib"), { recursive: true });
  writeFileSync(join(dir, "README.md"), "Built by Fatih Maulana with help from Grok Bot.\n");
  writeFileSync(join(dir, "web", "app", "page.tsx"), "export const title = \"Markets\";\n");
  writeFileSync(join(dir, "web", "lib", "copy-guard.test.ts"), `const sample = ${JSON.stringify(PHRASE)};\n`);
  writeFileSync(join(dir, "docs", "pitch", "deck.md"), `${PHRASE}\n`);
  writeFileSync(join(dir, "indexer", "src", "note.ts"), `${PHRASE}\n`);
  return dir;
}

test("docs, pitch, indexer, and the excluded web test stay green", () => {
  const dir = fixtureTree();
  const hits = scanRoot(dir);
  const cli = runCli(["--root", dir]);
  rmSync(dir, { recursive: true, force: true });
  assert.deepEqual(hits, []);
  assert.equal(cli.status, 0, cli.stderr);
});

test("the same phrase in product copy or the README fails", () => {
  const dir = fixtureTree();
  writeFileSync(join(dir, "web", "app", "page.tsx"), `export const note = ${JSON.stringify(PHRASE)};\n`);
  const pageHits = scanRoot(dir);
  const pageCli = runCli(["--root", dir]);
  writeFileSync(join(dir, "web", "app", "page.tsx"), "export const title = \"Markets\";\n");
  writeFileSync(join(dir, "README.md"), `${PHRASE}\n`);
  const readmeHits = scanRoot(dir);
  const readmeCli = runCli(["--root", dir]);
  rmSync(dir, { recursive: true, force: true });
  assert.deepEqual(pageHits.map((hit) => hit.file), ["web/app/page.tsx"]);
  assert.equal(pageHits[0].rule, "D-74");
  assert.equal(pageCli.status, 1, pageCli.stderr);
  assert.match(pageCli.stderr, /web\/app\/page\.tsx/);
  assert.doesNotMatch(pageCli.stderr, /docs\//);
  assert.deepEqual(readmeHits.map((hit) => hit.file), ["README.md"]);
  assert.equal(readmeCli.status, 1, readmeCli.stderr);
});

test("a violation under web/ fails the root scan", () => {
  const dir = mkdtempSync(join(tmpdir(), "paron-guard-"));
  mkdirSync(join(dir, "web"), { recursive: true });
  writeFileSync(join(dir, "README.md"), "Paron\n");
  writeFileSync(join(dir, "web", "page.tsx"), "const note = \"part" + "ner\";\n");
  const hits = scanRoot(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(hits.length, 1);
  assert.equal(hits[0].rule, "wording-partner");
});

test("the live scan never leaves README.md and web/", () => {
  const files = productFiles(repoRoot).map((file) => file.slice(repoRoot.length + 1).split("\\").join("/"));
  assert.ok(files.includes("README.md"));
  assert.ok(files.some((file) => file.startsWith("web/")));
  assert.equal(files.includes("web/lib/copy-guard.test.ts"), false);
  for (const file of files) {
    assert.ok(file === "README.md" || file.startsWith("web/"), file);
  }
  const docs = readFileSync(join(repoRoot, "docs/knowledge-base/paron-gaps.md"), "utf8");
  assert.match(docs, /affiliated|endorsed by/i);
  assert.deepEqual(scanRoot(repoRoot), []);
});
