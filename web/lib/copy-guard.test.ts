import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

// Built from parts so this file does not match its own pattern.
const BANNED = new RegExp(["affili" + "ated", "endors" + "ed by"].join("|"), "i");
const WORDS = new RegExp(["\\bpart" + "ner\\b", "\\bfe" + "eds\\b"].join("|"), "i");
const SKIP = new Set(["node_modules", ".next", ".git", "copy-guard.test.ts"]);
const EXT = /\.(ts|tsx|css|md|json|mjs)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (EXT.test(name)) out.push(path);
  }
  return out;
}

test("web/ and README carry no affiliation copy", () => {
  const files = [...walk(process.cwd()), join(process.cwd(), "..", "README.md")];
  const hits = files.filter((file) => BANNED.test(readFileSync(file, "utf8")));
  assert.deepEqual(hits, []);
});

test("docs tutorial avoids banned words", () => {
  const docs = readFileSync(join(process.cwd(), "lib", "docs-content.ts"), "utf8");
  const page = readFileSync(join(process.cwd(), "app", "docs", "page.tsx"), "utf8");
  const joined = `${docs}\n${page}`;
  assert.equal(WORDS.test(joined), false);
  assert.equal(BANNED.test(joined), false);
  assert.equal(joined.includes(["/", "demo"].join("")), false);
});
