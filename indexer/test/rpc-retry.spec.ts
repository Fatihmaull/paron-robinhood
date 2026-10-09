import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { indexerRpcTransport, rpcBackoffMs, rpcEndpoints, withRpcRetry } from "../src/rpc/retry.js";

describe("indexer rpc retry", () => {
  it("waits longer after each failure", () => {
    expect(rpcBackoffMs(1)).toBe(400);
    expect(rpcBackoffMs(2)).toBe(800);
    expect(rpcBackoffMs(3)).toBe(1600);
    expect(rpcBackoffMs(8)).toBe(8000);
  });

  it("ignores a missing or blank backup url", () => {
    expect(rpcEndpoints("https://rpc.example", undefined)).toEqual(["https://rpc.example"]);
    expect(rpcEndpoints("https://rpc.example", null)).toEqual(["https://rpc.example"]);
    expect(rpcEndpoints("https://rpc.example", "")).toEqual(["https://rpc.example"]);
    expect(rpcEndpoints("https://rpc.example", "   ")).toEqual(["https://rpc.example"]);
  });

  it("adds a backup only when one is configured", () => {
    expect(rpcEndpoints("https://primary.example", " https://backup.example ")).toEqual([
      "https://primary.example",
      "https://backup.example",
    ]);
  });

  it("builds a transport when the backup env is unset", () => {
    const previous = process.env.INDEXER_RPC_URL_BACKUP;
    delete process.env.INDEXER_RPC_URL_BACKUP;
    const transport = indexerRpcTransport("https://rpc.example", process.env.INDEXER_RPC_URL_BACKUP);
    if (previous === undefined) delete process.env.INDEXER_RPC_URL_BACKUP;
    else process.env.INDEXER_RPC_URL_BACKUP = previous;
    expect(typeof transport).toBe("function");
  });

  it("retries with backoff and then returns", async () => {
    const sleeps: number[] = [];
    let calls = 0;
    const value = await withRpcRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new Error("temporary rpc failure");
        return "ok";
      },
      {
        sleep: async (ms) => {
          sleeps.push(ms);
        },
      },
    );
    expect(value).toBe("ok");
    expect(calls).toBe(3);
    expect(sleeps).toEqual([400, 800]);
  });

  it("stops after the retry budget", async () => {
    let calls = 0;
    await expect(
      withRpcRetry(
        async () => {
          calls += 1;
          throw new Error("still down");
        },
        { retries: 3, sleep: async () => {} },
      ),
    ).rejects.toThrow("still down");
    expect(calls).toBe(3);
  });

  it("ponder config keeps the optional backup env and the retry transport", () => {
    const source = readFileSync(new URL("../ponder.config.ts", import.meta.url), "utf8");
    expect(source).toContain("indexerRpcTransport");
    expect(source).toContain("INDEXER_RPC_URL_BACKUP");
    expect(source).not.toContain("goldsky");
    expect(source).not.toContain("publicnode.com");
    expect(source).not.toContain("drpc.org");
  });
});
