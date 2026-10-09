import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function repoRoot() {
  return root;
}

export function loadChains() {
  const path = resolve(root, "config/chains.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function activeChain(config = loadChains(), env = process.env) {
  const key = env.CHAIN || config.active;
  const chain = config.chains[key];
  if (!chain) {
    throw new Error(`Unknown chain key ${key}`);
  }
  return chain;
}

export function publicRpc(chain) {
  return chain.rpc.public;
}
