import { publicConfig, requireSendConfig } from "../config.mjs";
import { startLoop } from "../loop.mjs";
import { createLogger, secretValues } from "../log.mjs";
import { planKeeper } from "./decide.mjs";

const idle = {
  readRequests: async () => [],
  seriesPaused: async () => false,
  send: async () => {
    throw new Error("Refusing to sign.");
  },
};

function id(value) {
  return value == null ? "" : String(value);
}

export async function tickKeeper({ requests, nowSeconds, cfg, seriesPaused, send, log }) {
  const sent = [];
  for (const request of requests) {
    const row = planKeeper([request], nowSeconds, { dryRun: true })[0];
    if (row.action === "wait") continue;
    const fields = { action: row.action, reqId: id(row.reqId), seriesId: id(request.seriesId) };
    if (cfg.killSwitch) {
      log.info("keeper.stopped", { ...fields, reason: "kill-switch" });
      continue;
    }
    let paused = false;
    if (request.seriesId != null) {
      try {
        paused = await seriesPaused(request.seriesId);
      } catch (err) {
        log.warn("keeper.pause-read-failed", { ...fields, error: err instanceof Error ? err.message : String(err) });
        paused = true;
      }
    }
    if (paused) {
      log.info("keeper.stopped", { ...fields, reason: "series-paused" });
      continue;
    }
    if (cfg.dryRun) {
      log.info("keeper.dry-run", { ...fields, note: row.log ?? `would ${row.action}(${id(row.reqId)})` });
      continue;
    }
    await send({ action: row.action, reqId: row.reqId });
    sent.push(row.action);
    log.info("keeper.sent", fields);
  }
  return sent;
}

export async function bootKeeper(env = process.env, deps = {}) {
  const log = deps.log ?? createLogger(process.stdout, secretValues(env));
  const cfg = publicConfig(env, "keeper", deps);
  requireSendConfig(cfg, ["redemptionManager", "seriesFactory"]);
  log.info("keeper.start", {
    chainId: cfg.chainId,
    dryRun: cfg.dryRun,
    killSwitch: cfg.killSwitch,
    pollSeconds: cfg.pollSeconds,
    keyEnv: cfg.keyEnv,
    hasKey: cfg.hasKey,
    deployLabel: cfg.label,
  });
  let io = deps.io;
  if (!io) {
    if (cfg.rpcUrl) {
      const { attachChain } = await import("../chain.mjs");
      const chain = await attachChain(cfg);
      io = {
        readRequests: () => chain.readRequests(),
        seriesPaused: (seriesId) => chain.seriesPaused(seriesId),
        send: (action) => chain.sendKeeper(action),
      };
    } else {
      io = idle;
      log.info("keeper.idle", { reason: "AGENT_RPC_URL unset" });
    }
  }
  const tick = async () => {
    const requests = deps.requests ? await deps.requests() : await io.readRequests();
    return tickKeeper({
      requests,
      nowSeconds: deps.now ? deps.now() : Math.floor(Date.now() / 1000),
      cfg,
      seriesPaused: (seriesId) => io.seriesPaused(seriesId),
      send: (action) => io.send(action),
      log,
    });
  };
  await tick().catch((err) => {
    log.error("tick.failed", { error: err instanceof Error ? err.message : String(err) });
  });
  const loop = startLoop({
    intervalMs: cfg.pollSeconds * 1000,
    tick,
    log,
    schedule: deps.schedule,
    clear: deps.clear,
    on: deps.on,
  });
  return { cfg, loop };
}
