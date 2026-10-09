/**
 * Copy repo-root shared/abi into this package. Railway's build context is
 * `indexer/`, so the indexer cannot import `../../shared/abi` at runtime.
 * Run from the indexer directory: `node script/sync-shared-abi.mjs`.
 */
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../shared/abi");
const dest = resolve(here, "../src/abi/shared");

mkdirSync(dest, { recursive: true });
for (const name of readdirSync(dest)) {
  if (name.endsWith(".json")) rmSync(resolve(dest, name));
}
for (const name of readdirSync(source)) {
  if (!name.endsWith(".json")) continue;
  cpSync(resolve(source, name), resolve(dest, name));
}
console.log(`copied ${readdirSync(dest).filter((name) => name.endsWith(".json")).length} ABIs into src/abi/shared`);
