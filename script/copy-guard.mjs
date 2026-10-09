import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * D-74 grep guard for product copy and the root README.
 * Disclaimer text is allowed in the pitch deck and in docs/, which this scan
 * does not read. Wording rule: the words "partner" and "feeds" are also banned
 * in that same product surface.
 *
 * Patterns are built from parts so this file can be scanned later without
 * matching itself.
 */

const SKIP_DIRS = new Set(["node_modules", ".next", ".git"]);
const EXT = /\.(ts|tsx|css|md|json|mjs)$/;

export const RULES = [
  {
    id: "D-74",
    label: ["affili" + "ated", "endors" + "ed by"].join("|"),
    pattern: new RegExp(["affili" + "ated", "endors" + "ed by"].join("|"), "i"),
  },
  {
    id: "wording-partner",
    label: "partner",
    pattern: new RegExp("\\b" + "part" + "ner(?:ed|s|ship)?" + "\\b", "i"),
  },
  {
    id: "wording-feeds",
    label: "feeds",
    pattern: new RegExp("\\b" + "fee" + "ds" + "\\b", "i"),
  },
];

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function lineViolations(filePath, text) {
  const hits = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const rule of RULES) {
      if (rule.pattern.test(lines[i])) {
        hits.push({
          file: filePath,
          line: i + 1,
          rule: rule.id,
          excerpt: lines[i].trim().slice(0, 180),
        });
      }
    }
  }
  return hits;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const info = statSync(path);
    if (info.isDirectory()) walk(path, out);
    else if (EXT.test(name)) out.push(path);
  }
  return out;
}

/** Product surface: root README.md and web/. docs/ is intentionally outside. */
export function productFiles(root) {
  const files = [];
  const readme = join(root, "README.md");
  try {
    if (statSync(readme).isFile()) files.push(readme);
  } catch {
    // A fixture root may omit the README.
  }
  const web = join(root, "web");
  try {
    if (statSync(web).isDirectory()) files.push(...walk(web));
  } catch {
    // A single-file check has no web tree.
  }
  return files;
}

export function scanRoot(root) {
  const hits = [];
  for (const file of productFiles(root)) {
    const text = readFileSync(file, "utf8");
    hits.push(...lineViolations(relative(root, file), text));
  }
  return hits;
}

export function scanFile(file) {
  return lineViolations(file, readFileSync(file, "utf8"));
}

function report(hits) {
  if (hits.length === 0) {
    process.stdout.write("copy-guard: ok\n");
    return 0;
  }
  for (const hit of hits) {
    process.stderr.write(`copy-guard: ${hit.rule} ${hit.file}:${hit.line}: ${hit.excerpt}\n`);
  }
  process.stderr.write(`copy-guard: ${hits.length} violation(s)\n`);
  return 1;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

export function main(argv) {
  const fileFlag = argv.indexOf("--file");
  if (fileFlag !== -1) {
    const file = argv[fileFlag + 1];
    if (!file) {
      process.stderr.write("copy-guard: --file needs a path\n");
      return 2;
    }
    return report(scanFile(resolve(file)));
  }
  const rootFlag = argv.indexOf("--root");
  const root = rootFlag !== -1 ? resolve(argv[rootFlag + 1] ?? "") : repoRoot;
  if (!root) {
    process.stderr.write("copy-guard: --root needs a path\n");
    return 2;
  }
  return report(scanRoot(root));
}

if (isDirectRun()) {
  process.exit(main(process.argv.slice(2)));
}
