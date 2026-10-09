/**
 * Copy repo-root deployments/<chainId>/{*.json} into indexer/deployments so a
 * Railway build with Root Directory `indexer` still sees the manifests.
 * Run from the indexer directory after a new deploy: `node script/sync-deployments.mjs`.
 */
import { cpSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../deployments");
const dest = resolve(here, "../deployments");
let n = 0;
for (const chain of readdirSync(source, { withFileTypes: true })) {
  if (!chain.isDirectory()) continue;
  mkdirSync(resolve(dest, chain.name), { recursive: true });
  for (const f of readdirSync(resolve(source, chain.name))) {
    if (!f.endsWith(".json") || f === "go-nogo.json") continue;
    cpSync(resolve(source, chain.name, f), resolve(dest, chain.name, f));
    n++;
  }
}
console.log(`copied ${n} deployment files into deployments/`);
