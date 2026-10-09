import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { rpcBackoffMs, rpcTransportOptions, rpcUrls } from "./rpc.ts";

test("rpc backoff grows and then caps", () => {
  assert.equal(rpcBackoffMs(1), 400);
  assert.equal(rpcBackoffMs(2), 800);
  assert.equal(rpcBackoffMs(3), 1600);
  assert.equal(rpcBackoffMs(8), 8000);
  assert.ok(rpcBackoffMs(2) > rpcBackoffMs(1));
});

test("a blank backup url is not required", () => {
  assert.deepEqual(rpcUrls("https://rpc.example", ""), ["https://rpc.example"]);
  assert.deepEqual(rpcUrls("https://rpc.example", undefined), ["https://rpc.example"]);
  assert.deepEqual(rpcUrls("https://rpc.example", " https://backup.example "), [
    "https://rpc.example",
    "https://backup.example",
  ]);
});

test("transport options retry three times from the same base delay", () => {
  assert.deepEqual(rpcTransportOptions(), { retryCount: 3, retryDelay: 400, timeout: 8000 });
});

test("web backup env is NEXT_PUBLIC_RPC_URL_BACKUP and the url is not hardcoded", () => {
  const config = readFileSync(new URL("./config.ts", import.meta.url), "utf8");
  const providers = readFileSync(new URL("../components/providers.tsx", import.meta.url), "utf8");
  const rpc = readFileSync(new URL("./rpc.ts", import.meta.url), "utf8");
  assert.match(config, /NEXT_PUBLIC_RPC_URL_BACKUP/);
  assert.match(providers, /rpcUrlBackup\(\)/);
  assert.match(providers, /fallback\(/);
  for (const source of [config, providers, rpc]) {
    assert.equal(source.includes("publicnode.com"), false);
    assert.equal(source.includes("drpc.org"), false);
  }
});
