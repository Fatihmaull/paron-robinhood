import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { assertChainId, assertMaySign, assertRemoteChainId, publicConfig, readDeployment } from "../src/config.mjs";
import { bootKeeper, tickKeeper } from "../src/keeper/service.mjs";
import { startLoop } from "../src/loop.mjs";
import { createLogger, redact } from "../src/log.mjs";
import { bootTrader, tickTrader } from "../src/trader-bot/service.mjs";

const KEY = `0x${"11".repeat(32)}`;
const request = {
  reqId: 2n,
  seriesId: 4n,
  state: 4,
  ackDeadline: 0n,
  deliveryDeadline: 0n,
  disputeDeadline: 0n,
  rulingDeadline: 0n,
};

function capture() {
  const lines = [];
  return {
    lines,
    log: createLogger({ write: (chunk) => lines.push(chunk) }, [KEY]),
  };
}

function harness() {
  return {
    schedule() {
      return 1;
    },
    clear() {},
    on() {},
  };
}

test("chain id must be 46630 or 421614", () => {
  assert.equal(assertChainId("46630"), 46630);
  assert.equal(assertChainId(421614), 421614);
  assert.throws(() => assertChainId("1"), /46630 or 421614/);
  assert.throws(() => assertChainId(""), /46630 or 421614/);
  assert.throws(() => assertRemoteChainId(8453, 46630), /RPC chain id 8453/);
  assert.throws(() => assertRemoteChainId(421614, 46630), /does not match CHAIN_ID/);
  assert.equal(assertRemoteChainId(46630, 46630), 46630);
});

test("addresses come from the deployment file or env", () => {
  const root = mkdtempSync(join(tmpdir(), "paron-deploy-"));
  mkdirSync(join(root, "deployments", "46630"), { recursive: true });
  writeFileSync(
    join(root, "deployments", "46630", "stage-1.json"),
    JSON.stringify({
      chainId: 46630,
      contracts: {
        SeriesFactory: { address: "0x1111111111111111111111111111111111111111" },
        PrimarySale: { address: "0x2222222222222222222222222222222222222222" },
        OrderBook: { address: "0x3333333333333333333333333333333333333333" },
        RedemptionManager: { address: "0x4444444444444444444444444444444444444444" },
      },
    }),
  );
  writeFileSync(
    join(root, "deployments", "46630", "infra.json"),
    JSON.stringify({ mockUsdc: { address: "0x5555555555555555555555555555555555555555" } }),
  );
  const loaded = readDeployment(46630, "stage-1", { root });
  assert.equal(loaded.seriesFactory, "0x1111111111111111111111111111111111111111");
  assert.equal(loaded.settlementToken, "0x5555555555555555555555555555555555555555");
  const cfg = publicConfig(
    {
      CHAIN_ID: "46630",
      SERIES_FACTORY_ADDRESS: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
    "keeper",
    { root },
  );
  assert.equal(cfg.addresses.seriesFactory, "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  assert.equal(cfg.addresses.redemptionManager, "0x4444444444444444444444444444444444444444");
  assert.equal(cfg.dryRun, true);
  assert.equal(cfg.keyEnv, "KEEPER_PRIVATE_KEY");
  writeFileSync(join(root, "deployments", "46630", "stage-1.json"), JSON.stringify({ chainId: 1, contracts: {} }));
  assert.throws(() => readDeployment(46630, "stage-1", { root }), /does not match CHAIN_ID/);
});

test("repo stage-1 file loads testnet addresses without a network call", () => {
  const loaded = readDeployment(46630, "stage-1");
  assert.match(loaded.seriesFactory, /^0x[0-9a-fA-F]{40}$/);
  assert.match(loaded.primarySale, /^0x[0-9a-fA-F]{40}$/);
  assert.match(loaded.orderBook, /^0x[0-9a-fA-F]{40}$/);
  assert.match(loaded.redemptionManager, /^0x[0-9a-fA-F]{40}$/);
  assert.match(loaded.settlementToken, /^0x[0-9a-fA-F]{40}$/);
});

test("logs redact private keys", () => {
  const { lines, log } = capture();
  log.info("keeper.start", { privateKey: KEY, note: `leak ${KEY}` });
  const text = lines.join("");
  assert.equal(text.includes(KEY), false);
  assert.match(text, /\[redacted\]/);
  assert.equal(JSON.parse(text).msg, "keeper.start");
  assert.deepEqual(redact({ rpcUrl: "https://example.invalid/secret" }), { rpcUrl: "[redacted]" });
});

test("kill switch and series pause stop keeper sends", async () => {
  const sends = [];
  const paused = await tickKeeper({
    requests: [request],
    nowSeconds: 10,
    cfg: { dryRun: false, killSwitch: false },
    seriesPaused: async () => true,
    send: async (action) => sends.push(action),
    log: capture().log,
  });
  assert.deepEqual(paused, []);
  assert.equal(sends.length, 0);
  const killed = await tickKeeper({
    requests: [request],
    nowSeconds: 10,
    cfg: { dryRun: false, killSwitch: true },
    seriesPaused: async () => false,
    send: async (action) => sends.push(action),
    log: capture().log,
  });
  assert.deepEqual(killed, []);
  assert.equal(sends.length, 0);
});

test("dry-run signs nothing and a live tick calls send once", async () => {
  const sends = [];
  const dry = await tickKeeper({
    requests: [request],
    nowSeconds: 10,
    cfg: { dryRun: true, killSwitch: false },
    seriesPaused: async () => false,
    send: async (action) => sends.push(action),
    log: capture().log,
  });
  assert.deepEqual(dry, []);
  assert.equal(sends.length, 0);
  assert.throws(() => assertMaySign({ dryRun: true, killSwitch: false, hasKey: true, keyEnv: "KEEPER_PRIVATE_KEY" }), /Dry run/);
  assert.throws(() => assertMaySign({ dryRun: false, killSwitch: true, hasKey: true, keyEnv: "KEEPER_PRIVATE_KEY" }), /Kill switch/);
  const live = await tickKeeper({
    requests: [request],
    nowSeconds: 10,
    cfg: { dryRun: false, killSwitch: false },
    seriesPaused: async () => false,
    send: async (action) => sends.push(action.action),
    log: capture().log,
  });
  assert.deepEqual(live, ["claimDefault"]);
  assert.deepEqual(sends, ["claimDefault"]);
});

test("keeper boot stays idle without an RPC URL and shuts down", async () => {
  const { log, lines } = capture();
  let cleared = false;
  const { loop } = await bootKeeper(
    { CHAIN_ID: "46630", KEEPER_DRY_RUN: "true", KEEPER_PRIVATE_KEY: KEY },
    { log, ...harness(), clear: () => { cleared = true; }, root: mkdtempSync(join(tmpdir(), "paron-empty-")) },
  );
  loop.stop();
  assert.equal(loop.stopped, true);
  assert.equal(cleared, true);
  assert.equal(lines.join("").includes(KEY), false);
  assert.match(lines.join(""), /keeper.idle/);
});

test("trader dry-run, kill switch, and pause do not send", async () => {
  const event = { id: "buy-1", name: "PrimaryBuy", seriesId: 4n, buyer: "0x2222222222222222222222222222222222222222" };
  const cfg = {
    seriesId: "4",
    buyer: event.buyer,
    trader: "0x3333333333333333333333333333333333333333",
    dryRun: true,
    killSwitch: false,
  };
  const sends = [];
  const send = async (step) => sends.push(step.id);
  const seen = new Set();
  const dry = await tickTrader({
    events: [event],
    cfg,
    holdingCu: 0n,
    openAsk: false,
    seriesPaused: async () => false,
    send,
    log: capture().log,
    seen,
  });
  assert.deepEqual(dry, []);
  assert.equal(sends.length, 0);
  assert.equal(seen.has("buy-1"), true);
  const again = await tickTrader({
    events: [event],
    cfg: { ...cfg, dryRun: false },
    holdingCu: 0n,
    openAsk: false,
    seriesPaused: async () => false,
    send,
    log: capture().log,
    seen,
  });
  assert.deepEqual(again, []);
  const killed = await tickTrader({
    events: [{ ...event, id: "buy-2" }],
    cfg: { ...cfg, dryRun: false, killSwitch: true },
    holdingCu: 0n,
    openAsk: false,
    seriesPaused: async () => false,
    send,
    log: capture().log,
    seen: new Set(),
  });
  assert.deepEqual(killed, []);
  const paused = await tickTrader({
    events: [{ ...event, id: "buy-3" }],
    cfg: { ...cfg, dryRun: false, killSwitch: false },
    holdingCu: 0n,
    openAsk: false,
    seriesPaused: async () => true,
    send,
    log: capture().log,
    seen: new Set(),
  });
  assert.deepEqual(paused, []);
  assert.equal(sends.length, 0);
});

test("a live trader send stops after a reverted step", async () => {
  const sends = [];
  const sent = await tickTrader({
    events: [{ id: "buy-4", name: "PrimaryBuy", seriesId: 4n, buyer: "0x2222222222222222222222222222222222222222" }],
    cfg: {
      seriesId: "4",
      buyer: "0x2222222222222222222222222222222222222222",
      trader: "0x3333333333333333333333333333333333333333",
      dryRun: false,
      killSwitch: false,
    },
    holdingCu: 0n,
    openAsk: false,
    seriesPaused: async () => false,
    send: async (step) => {
      sends.push(step.id);
      if (step.id === "S-04") throw new Error("revert");
    },
    log: capture().log,
    seen: new Set(),
  });
  assert.deepEqual(sent, ["S-03"]);
  assert.deepEqual(sends, ["S-03", "S-04"]);
});

test("sending without a key is refused before a loop starts", async () => {
  await assert.rejects(
    () => bootTrader({ CHAIN_ID: "46630", TRADER_BOT_DRY_RUN: "false" }, { ...harness(), root: mkdtempSync(join(tmpdir(), "paron-empty-")) }),
    /TRADER_BOT_PRIVATE_KEY is required/,
  );
});

test("SIGINT and SIGTERM stop the loop", () => {
  const handlers = {};
  let cleared = 0;
  const previous = process.exit;
  let code = null;
  process.exit = (value) => {
    code = value;
  };
  try {
    const loop = startLoop({
      intervalMs: 1000,
      tick: async () => {},
      log: capture().log,
      schedule: () => 7,
      clear: () => {
        cleared += 1;
      },
      on: (signal, fn) => {
        handlers[signal] = fn;
      },
    });
    handlers.SIGTERM();
    assert.equal(loop.stopped, true);
    assert.equal(cleared, 1);
    assert.equal(code, 0);
    handlers.SIGINT();
    assert.equal(cleared, 1);
  } finally {
    process.exit = previous;
  }
});

test("provider and agent kill-switch env flags stop the trader config", () => {
  const cfg = publicConfig({ CHAIN_ID: "421614", PROVIDER_AGENT_KILL_SWITCH: "on", TRADER_BOT_DRY_RUN: "false" }, "trader-bot", {
    root: mkdtempSync(join(tmpdir(), "paron-empty-")),
  });
  assert.equal(cfg.killSwitch, true);
  assert.equal(cfg.dryRun, false);
  const shared = publicConfig({ CHAIN_ID: "46630", AGENT_KILL_SWITCH: "true" }, "keeper", {
    root: mkdtempSync(join(tmpdir(), "paron-empty-")),
  });
  assert.equal(shared.killSwitch, true);
});
