import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWED_CHAIN_IDS = [46630, 421614];

const ON = new Set(["on", "true", "1"]);

const ADDRESS_ENV = {
  seriesFactory: "SERIES_FACTORY_ADDRESS",
  primarySale: "PRIMARY_SALE_ADDRESS",
  orderBook: "ORDER_BOOK_ADDRESS",
  redemptionManager: "REDEMPTION_MANAGER_ADDRESS",
  settlementToken: "SETTLEMENT_TOKEN_ADDRESS",
};

export function repoRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..");
}

export function flagOn(value) {
  return ON.has(String(value ?? "").trim().toLowerCase());
}

export function assertChainId(raw) {
  const id = Number(raw);
  if (!ALLOWED_CHAIN_IDS.includes(id)) {
    const err = new Error("Refusing to start. CHAIN_ID must be 46630 or 421614.");
    err.code = "CHAIN_REFUSED";
    throw err;
  }
  return id;
}

export function assertRemoteChainId(remoteId, expected) {
  const id = Number(remoteId);
  if (!ALLOWED_CHAIN_IDS.includes(id)) {
    const err = new Error(`Refusing to start. RPC chain id ${id} is not 46630 or 421614.`);
    err.code = "CHAIN_REFUSED";
    throw err;
  }
  if (id !== Number(expected)) {
    const err = new Error(`Refusing to start. RPC chain id ${id} does not match CHAIN_ID ${expected}.`);
    err.code = "CHAIN_REFUSED";
    throw err;
  }
  return id;
}

export function killSwitchOn(env, service) {
  const names = ["AGENT_KILL_SWITCH", "PROVIDER_AGENT_KILL_SWITCH"];
  if (service === "keeper") names.push("KEEPER_KILL_SWITCH");
  if (service === "trader-bot") names.push("TRADER_BOT_KILL_SWITCH");
  return names.some((name) => flagOn(env[name]));
}

function readJson(path, readFile) {
  return JSON.parse(readFile(path, "utf8"));
}

export function readDeployment(chainId, label, { readFile = readFileSync, root = repoRoot() } = {}) {
  const dir = join(root, "deployments", String(chainId));
  const stagePath = join(dir, `${label}.json`);
  let stage;
  try {
    stage = readJson(stagePath, readFile);
  } catch (err) {
    if (err && err.code === "ENOENT") return emptyAddresses();
    throw err;
  }
  if (Number(stage.chainId) !== Number(chainId)) {
    const err = new Error(`Deployment file chainId ${stage.chainId} does not match CHAIN_ID ${chainId}.`);
    err.code = "CHAIN_REFUSED";
    throw err;
  }
  const contracts = stage.contracts ?? {};
  const pick = (name) => contracts[name]?.address || "";
  const addresses = {
    seriesFactory: pick("SeriesFactory"),
    primarySale: pick("PrimarySale"),
    orderBook: pick("OrderBook"),
    redemptionManager: pick("RedemptionManager"),
    settlementToken: pick("MockUSDC") || pick("USDC") || pick("SettlementToken"),
  };
  if (!addresses.settlementToken) {
    try {
      const infra = readJson(join(dir, "infra.json"), readFile);
      addresses.settlementToken = infra.mockUsdc?.address || infra.usdc?.address || "";
    } catch (err) {
      if (!err || err.code !== "ENOENT") throw err;
    }
  }
  return addresses;
}

function emptyAddresses() {
  return {
    seriesFactory: "",
    primarySale: "",
    orderBook: "",
    redemptionManager: "",
    settlementToken: "",
  };
}

export function resolveAddresses(env, chainId, opts) {
  const label = env.DEPLOY_LABEL || "stage-1";
  const fromFile = readDeployment(chainId, label, opts);
  const addresses = {};
  for (const [key, name] of Object.entries(ADDRESS_ENV)) {
    addresses[key] = env[name] || fromFile[key] || "";
  }
  return { label, addresses };
}

export function publicConfig(env, service, opts) {
  const chainId = assertChainId(env.CHAIN_ID);
  const { label, addresses } = resolveAddresses(env, chainId, opts);
  const keyEnv = service === "keeper" ? "KEEPER_PRIVATE_KEY" : "TRADER_BOT_PRIVATE_KEY";
  const dryName = service === "keeper" ? "KEEPER_DRY_RUN" : "TRADER_BOT_DRY_RUN";
  const pollRaw = service === "keeper" ? env.KEEPER_POLL_SECONDS : env.TRADER_BOT_POLL_SECONDS;
  const pollDefault = service === "keeper" ? 60 : 15;
  const pollSeconds = Number(pollRaw || pollDefault);
  return {
    service,
    chainId,
    label,
    rpcUrl: env.AGENT_RPC_URL || "",
    addresses,
    dryRun: env[dryName] !== "false",
    killSwitch: killSwitchOn(env, service),
    pollSeconds: Number.isFinite(pollSeconds) && pollSeconds > 0 ? pollSeconds : pollDefault,
    keyEnv,
    hasKey: Boolean(env[keyEnv]),
    seriesId: env.TRADER_BOT_SERIES_ID || "4",
    buyer: env.W_BUY || "",
    trader: env.W_TRD || "",
    trigger: env.TRADER_BOT_TRIGGER || "auto",
    manual: env.TRADER_BOT_TRIGGER === "manual",
  };
}

export function assertMaySign(cfg) {
  if (cfg.killSwitch) {
    const err = new Error("Refusing to sign. Kill switch is on.");
    err.code = "REFUSED";
    throw err;
  }
  if (cfg.dryRun) {
    const err = new Error("Refusing to sign. Dry run is on.");
    err.code = "REFUSED";
    throw err;
  }
  if (!cfg.hasKey) {
    const err = new Error(`Refusing to sign. ${cfg.keyEnv} is unset.`);
    err.code = "REFUSED";
    throw err;
  }
}

export function requireSendConfig(cfg, needed) {
  if (cfg.dryRun || cfg.killSwitch) return;
  if (!cfg.hasKey) {
    const err = new Error(`${cfg.keyEnv} is required when sending.`);
    err.code = "REFUSED";
    throw err;
  }
  if (!cfg.rpcUrl) {
    const err = new Error("AGENT_RPC_URL is required when sending.");
    err.code = "REFUSED";
    throw err;
  }
  for (const name of needed) {
    if (!cfg.addresses[name]) {
      const err = new Error(`${ADDRESS_ENV[name]} is required when sending.`);
      err.code = "REFUSED";
      throw err;
    }
  }
}
