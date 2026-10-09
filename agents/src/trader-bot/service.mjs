import { publicConfig, requireSendConfig } from "../config.mjs";
import { startLoop } from "../loop.mjs";
import { createLogger, secretValues } from "../log.mjs";
import { evaluateTrigger, nextStep } from "./decide.mjs";

function id(value) {
  return value == null ? "" : String(value);
}

export async function tickTrader({ events, cfg, holdingCu, openAsk, seriesPaused, send, log, seen }) {
  const sent = [];
  for (const event of events) {
    if (event.id && seen?.has(event.id)) continue;
    if (event.id && seen) seen.add(event.id);
    const decision = evaluateTrigger({
      event,
      seriesId: BigInt(cfg.seriesId),
      buyer: cfg.buyer,
      trader: cfg.trader,
      armed: true,
      holdingCu,
      openAsk,
    });
    if (!decision.fire) {
      log.info("trader.skip", { reason: decision.reason, seriesId: id(event.seriesId) });
      continue;
    }
    if (cfg.killSwitch) {
      log.info("trader.stopped", { reason: "kill-switch", seriesId: id(cfg.seriesId) });
      continue;
    }
    let paused = false;
    try {
      paused = await seriesPaused(cfg.seriesId);
    } catch (err) {
      log.warn("trader.pause-read-failed", { error: err instanceof Error ? err.message : String(err) });
      paused = true;
    }
    if (paused) {
      log.info("trader.stopped", { reason: "series-paused", seriesId: id(cfg.seriesId) });
      continue;
    }
    for (let index = 0; index < decision.steps.length; index += 1) {
      const step = nextStep(decision.steps, index);
      if (step.stop) break;
      if (cfg.dryRun) {
        log.info("trader.dry-run", { step: step.step.id, method: step.step.method });
        continue;
      }
      try {
        await send(step.step);
      } catch (err) {
        log.warn("trader.revert", { step: step.step.id, error: err instanceof Error ? err.message : String(err) });
        break;
      }
      sent.push(step.step.id);
      log.info("trader.sent", { step: step.step.id, method: step.step.method });
    }
  }
  return sent;
}

export async function bootTrader(env = process.env, deps = {}) {
  const log = deps.log ?? createLogger(process.stdout, secretValues(env));
  const cfg = publicConfig(env, "trader-bot", deps);
  if (deps.manual) cfg.manual = true;
  requireSendConfig(cfg, ["primarySale", "orderBook", "seriesFactory", "settlementToken"]);
  log.info("trader.start", {
    chainId: cfg.chainId,
    dryRun: cfg.dryRun,
    killSwitch: cfg.killSwitch,
    pollSeconds: cfg.pollSeconds,
    trigger: cfg.manual ? "manual" : cfg.trigger,
    keyEnv: cfg.keyEnv,
    hasKey: cfg.hasKey,
    seriesId: cfg.seriesId,
    deployLabel: cfg.label,
  });
  const seen = new Set();
  let manualDone = false;
  let io = deps.io;
  if (!io) {
    if (cfg.rpcUrl && !cfg.manual) {
      const { attachChain } = await import("../chain.mjs");
      const chain = await attachChain(cfg);
      io = {
        readBuys: () => chain.readBuys(),
        seriesPaused: (seriesId) => chain.seriesPaused(seriesId),
        holdingCu: () => chain.holdingCu(cfg.seriesId, cfg.trader),
        send: (step) => chain.sendTrader(step, cfg.seriesId),
      };
    } else {
      io = {
        readBuys: async () => [],
        seriesPaused: async () => false,
        holdingCu: async () => 0n,
        send: async () => {
          throw new Error("Refusing to sign.");
        },
      };
      if (!cfg.manual) log.info("trader.idle", { reason: "AGENT_RPC_URL unset" });
    }
  }
  const tick = async () => {
    let events = [];
    if (cfg.manual) {
      if (!manualDone) {
        manualDone = true;
        events = [{ id: "manual", name: "PrimaryBuy", seriesId: BigInt(cfg.seriesId), buyer: cfg.buyer }];
      }
    } else {
      events = deps.events ? await deps.events() : await io.readBuys();
    }
    const holdingCu = deps.holdingCu != null ? deps.holdingCu : await io.holdingCu();
    const openAsk = deps.openAsk ?? false;
    return tickTrader({
      events,
      cfg,
      holdingCu,
      openAsk,
      seriesPaused: (seriesId) => io.seriesPaused(seriesId),
      send: (step) => io.send(step),
      log,
      seen,
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
  return { cfg, loop, seen };
}
