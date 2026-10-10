/**
 * Extended testnet seed ("seed-extra"): fills every dashboard page with real onchain rows.
 * Testnet only. Never touches series 4 (CU-JKT-H100-2610) and never uses the H100 model,
 * so the demo script and the H100 index stay clean. Seed keys live only in the box env file
 * (PARON_SEED_ENV, default /workspace/paron-seed/.env). They are never logged or committed.
 *
 * Usage: PARON_SIMULATE=1 node ops/scripts/seed.mjs --extra all
 *        PARON_BROADCAST=1 node ops/scripts/seed.mjs --extra <stage|all>
 * Stages: wallets, series, market, timelock-schedule, lifecycle, timelock-execute, verify
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  defineChain,
  encodeAbiParameters,
  encodeFunctionData,
  formatEther,
  getAddress,
  http,
  keccak256,
  parseAbi,
  toBytes,
  toEventSelector,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { activeChain, repoRoot } from "./chains.mjs";
import { readDeployerKey } from "./key.mjs";

export const CU = 10n ** 18n;
export const USDC = 1_000_000n;
export const KYB_EXPIRY = 1822953600n;
export const FORBIDDEN_SYMBOL = "CU-JKT-H100-2610";
export const STAGES = ["wallets", "series", "market", "timelock-schedule", "lifecycle", "timelock-execute", "verify"];

const GPU_KEYS = {
  A100: "A100-SXM-80GB",
  H200: "H200-SXM-141GB",
  B200: "B200-SXM-180GB",
  GB200: "GB200-NVL72",
};
const FACTOR = { A100: 4500, H200: 14000, B200: 25000, GB200: 35000 };

const utc = (y, m) => BigInt(Date.UTC(y, m, 1) / 1000);
export const OCT = { start: utc(2026, 9), end: utc(2026, 10) };
export const NOV = { start: utc(2026, 10), end: utc(2026, 11) };

const SHORT = { ack: 60n, delivery: 60n, dispute: 90n };
const LONG = { ack: 86400n, delivery: 259200n, dispute: 86400n };

const usd = (x) => BigInt(Math.round(x * 1_000_000));

/** Wallet roster. Providers 7, buyers 6, traders 4, plus applicants that stay Pending / Expired / Revoked. */
export const WALLETS = [
  { label: "P5", kind: "provider", role: 1, country: "ID" },
  { label: "P6", kind: "provider", role: 1, country: "ID" },
  { label: "P7", kind: "provider", role: 1, country: "ID" },
  { label: "P8", kind: "provider", role: 1, country: "MY" },
  { label: "P9", kind: "provider", role: 1, country: "TH" },
  { label: "P10", kind: "provider", role: 1, country: "JP" },
  { label: "P11", kind: "provider", role: 1, country: "VN" },
  { label: "B1", kind: "buyer", role: 2, country: "ID" },
  { label: "B2", kind: "buyer", role: 2, country: "ID" },
  { label: "B3", kind: "buyer", role: 2, country: "SG" },
  { label: "B4", kind: "buyer", role: 2, country: "ID" },
  { label: "B5", kind: "buyer", role: 2, country: "MY" },
  { label: "B6", kind: "buyer", role: 2, country: "ID" },
  { label: "T1", kind: "trader", role: 3, country: "SG" },
  { label: "T2", kind: "trader", role: 3, country: "SG" },
  { label: "T3", kind: "trader", role: 3, country: "ID" },
  { label: "T4", kind: "trader", role: 3, country: "HK" },
  { label: "A1", kind: "pending", role: 2, country: "ID" },
  { label: "A2", kind: "pending", role: 3, country: "SG" },
  { label: "A3", kind: "pending", role: 1, country: "ID" },
  { label: "E1", kind: "expired", role: 2, country: "ID" },
  { label: "E2", kind: "expired", role: 3, country: "SG" },
  { label: "R1", kind: "revoked", role: 2, country: "ID" },
  { label: "R2", kind: "revoked", role: 3, country: "ID" },
  { label: "R3", kind: "revoked", role: 1, country: "ID" },
];
export const entityOf = (label) => keccak256(toBytes(`paron-seedx:${label}`));
export const walletsOfKind = (...kinds) => WALLETS.filter((w) => kinds.includes(w.kind));
const TRADE_WALLETS = ["B1", "B2", "B3", "B4", "B5", "B6", "T1", "T2", "T3", "T4"];

/** Seven new series (ids 5..11 on a fresh label). Series 4 is never referenced. */
export const SERIES_X = [
  { key: "s5", symbol: "CU-SBY-A100-2610", provider: "P5", gpu: "A100", hours: 400n, price: usd(1.35), bond: usd(2.025), win: OCT, term: LONG, country: "ID" },
  { key: "s6", symbol: "CU-BDG-H200-2610", provider: "P6", gpu: "H200", hours: 20n, price: usd(4.2), bond: usd(6.3), win: OCT, term: SHORT, country: "ID" },
  { key: "s7", symbol: "CU-MDN-B200-2610", provider: "P7", gpu: "B200", hours: 12n, price: usd(7.5), bond: usd(11.25), win: OCT, term: SHORT, country: "ID" },
  { key: "s8", symbol: "CU-KUL-GB200-2610", provider: "P8", gpu: "GB200", hours: 10n, price: usd(10.5), bond: usd(15.75), win: OCT, term: LONG, country: "MY" },
  { key: "s9", symbol: "CU-BKK-A100-2611", provider: "P9", gpu: "A100", hours: 600n, price: usd(1.4), bond: usd(2.1), win: NOV, term: LONG, country: "TH" },
  { key: "s10", symbol: "CU-TYO-B200-2611", provider: "P10", gpu: "B200", hours: 100n, price: usd(7.6), bond: usd(11.4), win: NOV, term: LONG, country: "JP" },
  { key: "s11", symbol: "CU-HAN-H200-2611", provider: "P11", gpu: "H200", hours: 300n, price: usd(4.1), bond: usd(6.15), win: NOV, term: LONG, country: "VN" },
];
export const maxSupplyOf = (s) => (s.hours * BigInt(FACTOR[s.gpu]) * CU) / 10_000n;
export const bondOf = (s) => (s.bond * maxSupplyOf(s)) / CU;

/** [wallet, series, qty in CU] primary buys. */
const everyone = (key, qty) => TRADE_WALLETS.map((w) => [w, key, qty]);
export const PRIMARY = [
  ["B1", "s5", 20], ["B2", "s5", 15], ["B4", "s5", 10], ["B5", "s5", 25], ["B6", "s5", 10],
  ...everyone("s6", 2),
  ...everyone("s7", 2),
  ["B1", "s8", 5], ["B3", "s8", 6], ["B4", "s8", 5], ["B5", "s8", 8], ["B6", "s8", 6],
  ["B1", "s9", 40], ["B2", "s9", 30], ["B3", "s9", 20], ["B5", "s9", 25], ["B6", "s9", 15], ["T1", "s9", 25],
  ["B1", "s10", 15], ["B2", "s10", 20], ["B3", "s10", 30], ["B4", "s10", 25], ["T2", "s10", 25],
  ["B1", "s11", 10], ["B2", "s11", 25], ["B3", "s11", 40], ["B4", "s11", 35], ["B6", "s11", 20], ["T3", "s11", 30],
];

/** Trades: a maker rests, a taker crosses it immediately. [series, makerWallet, makerSide, price, qty, takerWallet]. */
export const TRADES = [
  ["s9", "B1", "Ask", 1.42, 5, "T2"],
  ["s9", "T1", "Ask", 1.41, 4, "B5"],
  ["s9", "B2", "Ask", 1.43, 3, "B6"],
  ["s9", "T2", "Bid", 1.38, 3, "B1"],
  ["s10", "B3", "Ask", 7.62, 4, "T1"],
  ["s10", "B2", "Ask", 7.6, 3, "B4"],
  ["s10", "T2", "Ask", 7.65, 5, "B1"],
  ["s10", "T2", "Ask", 7.55, 3, "B3"],
  ["s11", "B3", "Ask", 4.12, 6, "T4"],
  ["s11", "B4", "Ask", 4.11, 5, "T2"],
  ["s11", "T3", "Ask", 4.13, 5, "B1"],
  ["s11", "B2", "Ask", 4.09, 4, "B6"],
  ["s11", "B6", "Bid", 4.05, 4, "B3"],
  ["s8", "B4", "Ask", 10.55, 2, "T1"],
  ["s8", "B5", "Ask", 10.52, 3, "B3"],
];
/** Orders that stay open on the books. [series, wallet, side, price, qty]. */
export const RESTING = [
  ["s9", "B1", "Ask", 1.45, 10], ["s9", "B2", "Ask", 1.5, 8], ["s9", "T2", "Bid", 1.35, 12], ["s9", "T4", "Bid", 1.32, 10],
  ["s10", "B3", "Ask", 7.8, 10], ["s10", "B1", "Ask", 7.9, 5], ["s10", "T1", "Bid", 7.4, 8], ["s10", "B5", "Bid", 7.3, 6],
  ["s11", "B3", "Ask", 4.2, 12], ["s11", "B4", "Ask", 4.25, 10], ["s11", "B6", "Bid", 4.0, 8], ["s11", "T4", "Bid", 3.95, 7],
  ["s8", "B3", "Ask", 10.8, 3], ["s8", "B6", "Bid", 10.2, 2],
];
/** Placed then cancelled. */
export const CANCELLED = [
  ["s10", "B2", "Ask", 8.0, 4],
  ["s9", "T3", "Bid", 1.2, 6],
];
export const TIMELOCK_OPS = { total: 10, cancel: 3, execute: 5, delay: 300 };
export const DEFAULT_HOLDERS = TRADE_WALLETS; // s6: ten ack-timeout defaults
export const DISPUTE_HOLDERS = TRADE_WALLETS; // s7: ten disputes
export const DISPUTES_TO_RESOLVE = 7;

export function buildExtraPlan() {
  return {
    wallets: WALLETS.length,
    series: SERIES_X.length,
    primaryBuys: PRIMARY.length,
    trades: TRADES.length,
    resting: RESTING.length,
    cancelled: CANCELLED.length,
    defaults: DEFAULT_HOLDERS.length,
    disputes: DISPUTE_HOLDERS.length,
    timelock: TIMELOCK_OPS,
  };
}

/** Approximate gas per action, rounded up from the stage-1 receipts. Used for the simulate estimate. */
const GAS = {
  eth: 30_000, mint: 90_000, approve: 80_000, apply: 260_000, attestEach: 220_000, link: 140_000, revoke: 120_000,
  register: 150_000, createSeries: 1_800_000, buy: 330_000, place: 450_000, take: 700_000, cancel: 130_000,
  request: 280_000, ack: 90_000, deliver: 90_000, confirm: 300_000, dispute: 300_000, claim: 300_000,
  resolve: 200_000, schedule: 160_000, tcancel: 70_000, execute: 130_000, decline: 300_000,
};

export function estimatePlan() {
  const p = buildExtraPlan();
  const funded = WALLETS.length;
  const mints = walletsOfKind("provider", "buyer", "trader").length;
  const approved = walletsOfKind("provider", "buyer", "trader").length;
  const asks = new Set();
  for (const [s, w, side] of [...TRADES.map((t) => [t[0], t[1], t[2]]), ...TRADES.map((t) => [t[0], t[5], t[2] === "Ask" ? "Bid" : "Ask"]), ...RESTING, ...CANCELLED]) {
    if (side === "Ask") asks.add(`${w}:${s}`);
  }
  const rows = {
    wallets:
      funded * GAS.eth + mints * GAS.mint + WALLETS.length * GAS.apply + (WALLETS.length - 3 - 3 + 3 + 2) * GAS.attestEach +
      approved * GAS.link + 3 * GAS.revoke + p.series * GAS.register,
    series:
      p.series * (GAS.approve + GAS.createSeries) + TRADE_WALLETS.length * GAS.approve + p.primaryBuys * GAS.buy,
    market:
      TRADE_WALLETS.length * GAS.approve + asks.size * GAS.approve + p.trades * (GAS.place + GAS.take) + (p.resting + p.cancelled) * GAS.place + p.cancelled * GAS.cancel,
    "timelock-schedule": p.timelock.total * GAS.schedule + p.timelock.cancel * GAS.tcancel,
    lifecycle:
      TRADE_WALLETS.length * GAS.approve + (p.defaults + p.disputes + 7) * GAS.request + p.defaults * GAS.claim +
      p.disputes * (GAS.ack + GAS.deliver + GAS.dispute) + DISPUTES_TO_RESOLVE * GAS.resolve + 6 * (GAS.ack + GAS.deliver + GAS.confirm) + GAS.decline,
    "timelock-execute": p.timelock.execute * GAS.execute,
  };
  return rows;
}

// ---------- environment, keys, state ----------

export function loadEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const keyVar = (label) => `SEEDX_${label}_PK`;

function ensureKeys(envPath, env) {
  mkdirSync(dirname(envPath), { recursive: true });
  let added = 0;
  for (const w of WALLETS) {
    if (env[keyVar(w.label)]) continue;
    const pk = generatePrivateKey();
    appendFileSync(envPath, `${keyVar(w.label)}=${pk}\n`);
    env[keyVar(w.label)] = pk;
    added += 1;
  }
  try {
    chmodSync(envPath, 0o600);
  } catch {}
  return added;
}

function loadState(path) {
  if (!existsSync(path)) return { done: {}, ids: {}, counts: {}, hashes: [] };
  return JSON.parse(readFileSync(path, "utf8"));
}

const ERC20 = parseAbi([
  "function approve(address spender,uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to,uint256 amount)",
]);
const EAS = parseAbi([
  "function attest((bytes32 schema,(address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value) data) request) payable returns (bytes32)",
  "function multiAttest((bytes32 schema,(address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value)[] data)[] requests) payable returns (bytes32[])",
  "function revoke((bytes32 schema,(bytes32 uid,uint256 value) data) request) payable",
]);
const GATE = parseAbi(["function linkAttestation(bytes32 uid)", "function isVerified(address) view returns (bool)"]);
const REGISTRY = parseAbi(["function registerProvider()", "function isListable(address) view returns (bool)"]);
const FACTORY = parseAbi([
  "function createSeries((bytes32 gpuModel,uint64 gpuHours,uint256 primaryPrice,uint256 bondPerCU,uint64 windowStart,uint64 windowEnd,uint64 ackWindow,uint64 deliveryWindow,uint64 disputeWindow,uint256 minRedemption,address arbitrator,bytes32 specHash,bytes32 termsHash,bytes2 country,uint8 continent,bool institutional,string symbol) p) returns (uint256 seriesId,address token)",
  "function nextSeriesId() view returns (uint256)",
]);
const SALE = parseAbi(["function buy(uint256 seriesId,uint256 qty,uint256 maxCost) returns (uint256)"]);
const BOOK = parseAbi([
  "function placeOrder(uint256 seriesId,uint8 side,uint256 price,uint256 qty,bool immediateOrCancel) returns (uint256 orderId,uint256 filledQty)",
  "function cancelOrder(uint256 orderId)",
]);
const RM = parseAbi([
  "function requestRedemption(uint256 seriesId,uint256 amount,bytes32 deliveryRef) returns (uint256)",
  "function acknowledge(uint256 reqId)",
  "function markDelivered(uint256 reqId,bytes32 receiptHash)",
  "function confirm(uint256 reqId)",
  "function dispute(uint256 reqId)",
  "function claimDefault(uint256 reqId)",
  "function declineAndPay(uint256 reqId)",
  "function resolveNoRuling(uint256 reqId)",
  "function stateOf(uint256 reqId) view returns (uint8)",
  "function getRequest(uint256 reqId) view returns ((uint256 seriesId,address holder,uint256 amount,bytes32 deliveryRef,bytes32 receiptHash,uint8 state,uint64 requestedAt,uint64 ackDeadline,uint64 deliveryDeadline,uint64 disputeDeadline,uint64 rulingDeadline,uint256 disputeBond))",
]);
const CT = parseAbi(["function setFactor(bytes32 gpuModel,uint32 factor)", "function factorOf(bytes32) view returns (uint32)"]);
const TL = parseAbi([
  "function schedule(address target,uint256 value,bytes data,bytes32 predecessor,bytes32 salt,uint256 delay)",
  "function execute(address target,uint256 value,bytes payload,bytes32 predecessor,bytes32 salt) payable",
  "function cancel(bytes32 id)",
  "function hashOperation(address target,uint256 value,bytes data,bytes32 predecessor,bytes32 salt) view returns (bytes32)",
  "function isOperationPending(bytes32) view returns (bool)",
  "function isOperationReady(bytes32) view returns (bool)",
  "function isOperationDone(bytes32) view returns (bool)",
  "function getMinDelay() view returns (uint256)",
]);

const SIG_REQUESTED = toEventSelector("RedemptionRequested(uint256,uint256,address,uint256,bytes32,uint64)");
const SIG_ORDER = toEventSelector("OrderPlaced(uint256,uint256,address,uint8,uint256,uint256)");
const SIG_ATTESTED = toEventSelector("Attested(address,address,bytes32,bytes32)");
const ZERO32 = `0x${"00".repeat(32)}`;
const MAX = 2n ** 256n - 1n;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cc = (code) => `0x${Buffer.from(code, "utf8").toString("hex")}`;
const cu = (n) => BigInt(n) * CU;

export async function runExtraCli(argv = process.argv, envIn = process.env) {
  const idx = argv.indexOf("--extra");
  const stageArg = argv[idx + 1] && !argv[idx + 1].startsWith("--") ? argv[idx + 1] : "all";
  const simulate = envIn.PARON_SIMULATE === "1";
  const broadcast = envIn.PARON_BROADCAST === "1";
  const stages = stageArg === "all" ? STAGES : [stageArg];
  for (const s of stages) if (!STAGES.includes(s)) throw new Error(`Unknown stage ${s}. Use one of ${STAGES.join(", ")}.`);

  const chainCfg = activeChain(undefined, envIn);
  const label = envIn.DEPLOY_LABEL || "stage-1";
  const manifest = JSON.parse(readFileSync(resolve(repoRoot(), `deployments/${chainCfg.chainId}/${label}.json`), "utf8"));
  const infra = JSON.parse(readFileSync(resolve(repoRoot(), `deployments/${chainCfg.chainId}/infra.json`), "utf8"));
  const addr = (name) => {
    const a = manifest.contracts?.[name]?.address;
    if (!a) throw new Error(`No ${name} in manifest`);
    return getAddress(a);
  };
  const A = {
    usdc: getAddress(infra.mockUsdc.address),
    eas: getAddress(infra.eas.address),
    gate: addr("EASGate"),
    registry: addr("ProviderRegistry"),
    factory: addr("SeriesFactory"),
    sale: addr("PrimarySale"),
    book: addr("OrderBook"),
    vault: addr("BondVault"),
    rm: addr("RedemptionManager"),
    panel: addr("PanelArbitrator"),
    table: addr("ConversionTable"),
    timelock: addr("TimelockController"),
  };
  const schemaParticipant = infra.schemas.ParticipantVerified.uid;
  const schemaKyb = infra.schemas.KybApplication.uid;

  const rpc = envIn.RH_TESTNET_RPC || chainCfg.rpc.public;
  const chain = defineChain({
    id: chainCfg.chainId,
    name: "robinhoodTestnet",
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
  });
  const client = createPublicClient({ chain, transport: http(rpc, { retryCount: 4, retryDelay: 600, timeout: 30_000 }) });
  const walletClient = createWalletClient({ chain, transport: http(rpc, { retryCount: 2, retryDelay: 600, timeout: 30_000 }) });

  const envPath = envIn.PARON_SEED_ENV || "/workspace/paron-seed/.env";
  const statePath = envIn.PARON_SEED_STATE || "/workspace/paron-seed/state.json";
  const env = { ...loadEnvFile(envPath) };
  const deployer = privateKeyToAccount(readDeployerKey(envIn));
  const state = loadState(statePath);
  const save = () => writeFileSync(statePath, JSON.stringify(state, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2));

  if (simulate || !broadcast) {
    const est = estimatePlan();
    const gasPrice = await client.getGasPrice();
    const bal = await client.getBalance({ address: deployer.address });
    const walletEth = BigInt(envIn.SEEDX_WALLET_ETH_WEI || "400000000000000");
    let totalGas = 0n;
    for (const v of Object.values(est)) totalGas += BigInt(v);
    const cost = (totalGas * gasPrice * 3n) / 1n; // 3x gas price margin
    const funding = walletEth * BigInt(WALLETS.length);
    const need = cost + funding;
    console.log(JSON.stringify({ mode: "simulate", plan: buildExtraPlan(), gasByStage: est, gasPriceWei: gasPrice.toString() }, null, 2));
    console.log(`total gas ~${totalGas} units; fee at 3x gas price ${formatEther(cost)} ETH (deployer share only; wallet gas comes from funding)`);
    console.log(`wallet funding ${WALLETS.length} x ${formatEther(walletEth)} = ${formatEther(funding)} ETH`);
    console.log(`deployer balance ${formatEther(bal)} ETH, estimated need ${formatEther(need)} ETH`);
    if (bal < need) {
      console.log(`SHORTFALL ${formatEther(need - bal)} ETH. Nothing was sent.`);
      return 2;
    }
    console.log("Deployer balance covers the estimate. Nothing was sent (set PARON_BROADCAST=1 to send).");
    return 0;
  }

  if (chainCfg.chainId !== 46630 || !label.startsWith("stage-")) throw new Error("seed-extra is for the Robinhood testnet stage label only.");
  for (const s of SERIES_X) {
    if (s.symbol === FORBIDDEN_SYMBOL || s.gpu === "H100") throw new Error("Plan touches series 4 or H100. Refused.");
  }
  ensureKeys(envPath, env);
  const accounts = new Map(WALLETS.map((w) => [w.label, privateKeyToAccount(env[keyVar(w.label)])]));
  accounts.set("DEP", deployer);
  const acc = (l) => {
    const a = accounts.get(l);
    if (!a) throw new Error(`No wallet ${l}`);
    return a;
  };

  const nonces = new Map();
  let txCount = 0;
  const stageCounts = {};
  let currentStage = "";
  async function send(account, to, abi, fn, args, tag, value = 0n) {
    const data = encodeFunctionData({ abi, functionName: fn, args });
    return sendRaw(account, to, data, tag, value);
  }
  async function sendRaw(account, to, data, tag, value = 0n) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        let nonce = nonces.get(account.address);
        if (nonce === undefined) nonce = await client.getTransactionCount({ address: account.address, blockTag: "pending" });
        let gas;
        try {
          gas = await client.estimateGas({ account: account.address, to, data, value });
        } catch (e) {
          throw new Error(`${tag}: estimateGas failed: ${String(e.shortMessage || e.message).slice(0, 300)}`);
        }
        const hash = await walletClient.sendTransaction({ account, to, data, value, nonce, gas: (gas * 13n) / 10n });
        nonces.set(account.address, nonce + 1);
        const receipt = await client.waitForTransactionReceipt({ hash, pollingInterval: 300, timeout: 90_000 });
        if (receipt.status !== "success") throw new Error(`${tag}: reverted ${hash}`);
        txCount += 1;
        stageCounts[currentStage] = (stageCounts[currentStage] || 0) + 1;
        state.counts[currentStage] = (state.counts[currentStage] || 0) + 1;
        state.hashes.push({ stage: currentStage, tag, hash });
        return receipt;
      } catch (e) {
        const msg = String(e.message);
        if (/nonce/i.test(msg) && attempt < 3) {
          nonces.delete(account.address);
          await sleep(1000);
          continue;
        }
        throw e;
      }
    }
  }
  async function step(key, fn) {
    if (state.done[key]) return;
    await fn();
    state.done[key] = true;
    save();
  }
  const chainNow = async () => Number((await client.getBlock()).timestamp);
  async function waitUntil(ts, why) {
    for (;;) {
      const n = await chainNow();
      if (n > ts) return;
      console.log(`  waiting ${ts - n + 1}s for ${why}`);
      await sleep(Math.min((ts - n + 1) * 1000, 15_000));
    }
  }
  const seriesId = (key) => {
    const v = state.ids[`series.${key}`];
    if (!v) throw new Error(`series ${key} not created yet`);
    return BigInt(v);
  };
  const tokenOf = (key) => getAddress(state.ids[`token.${key}`]);

  const stageFns = {
    async wallets() {
      const walletEth = BigInt(envIn.SEEDX_WALLET_ETH_WEI || "400000000000000");
      for (const w of WALLETS) {
        await step(`fund.${w.label}`, async () => {
          const bal = await client.getBalance({ address: acc(w.label).address });
          if (bal < walletEth) await sendRaw(deployer, acc(w.label).address, "0x", `fund ${w.label}`, walletEth - bal);
        });
      }
      for (const w of walletsOfKind("provider", "buyer", "trader")) {
        await step(`mint.${w.label}`, async () => {
          const target = w.kind === "provider" ? 10_000n * USDC : 3_000n * USDC;
          const bal = await client.readContract({ address: A.usdc, abi: ERC20, functionName: "balanceOf", args: [acc(w.label).address] });
          if (bal < target) await send(deployer, A.usdc, ERC20, "mint", [acc(w.label).address, target - bal], `mint ${w.label}`);
        });
      }
      for (const w of WALLETS) {
        await step(`apply.${w.label}`, async () => {
          const data = encodeAbiParameters(
            [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes2" }, { type: "bytes32" }],
            [entityOf(w.label), w.role, cc(w.country), keccak256(toBytes(`kyb-docs:${w.label}`))],
          );
          const r = await send(
            acc(w.label), A.eas, EAS, "attest",
            [{ schema: schemaKyb, data: { recipient: acc(w.label).address, expirationTime: 0n, revocable: true, refUID: ZERO32, data, value: 0n } }],
            `kyb apply ${w.label}`,
          );
          const log = r.logs.find((l) => l.address.toLowerCase() === A.eas.toLowerCase() && l.topics[0] === SIG_ATTESTED);
          if (!log) throw new Error(`no Attested log for ${w.label}`);
          state.ids[`app.${w.label}`] = log.data;
        });
      }
      const approveRow = (w, expiry) => ({
        recipient: acc(w.label).address, expirationTime: 0n, revocable: true, refUID: state.ids[`app.${w.label}`],
        data: encodeAbiParameters(
          [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes2" }, { type: "uint64" }],
          [entityOf(w.label), w.role, cc(w.country), expiry],
        ),
        value: 0n,
      });
      const harvest = (r, group) => {
        for (const l of r.logs) {
          if (l.address.toLowerCase() !== A.eas.toLowerCase() || l.topics[0] !== SIG_ATTESTED) continue;
          const rcpt = getAddress(`0x${l.topics[1].slice(-40)}`);
          const w = group.find((g) => acc(g.label).address === rcpt);
          if (w) state.ids[`appr.${w.label}`] = l.data;
        }
      };
      const okGroup = walletsOfKind("provider", "buyer", "trader");
      await step("approve.ok", async () => {
        const r = await send(deployer, A.eas, EAS, "multiAttest", [[{ schema: schemaParticipant, data: okGroup.map((w) => approveRow(w, KYB_EXPIRY)) }]], "kyb approve batch");
        harvest(r, okGroup);
      });
      const exp = walletsOfKind("expired");
      const rev = walletsOfKind("revoked");
      await step("approve.expiring", async () => {
        const soon = BigInt((await chainNow()) + 240);
        const r = await send(deployer, A.eas, EAS, "multiAttest", [[{ schema: schemaParticipant, data: [...exp.map((w) => approveRow(w, soon)), ...rev.map((w) => approveRow(w, KYB_EXPIRY))] }]], "kyb approve expiring+revoked");
        harvest(r, [...exp, ...rev]);
      });
      for (const w of okGroup) {
        await step(`link.${w.label}`, async () => {
          await send(deployer, A.gate, GATE, "linkAttestation", [state.ids[`appr.${w.label}`]], `link ${w.label}`);
        });
      }
      for (const w of rev) {
        await step(`revoke.${w.label}`, async () => {
          await send(deployer, A.eas, EAS, "revoke", [{ schema: schemaParticipant, data: { uid: state.ids[`appr.${w.label}`], value: 0n } }], `revoke ${w.label}`);
        });
      }
      for (const w of walletsOfKind("provider")) {
        await step(`register.${w.label}`, async () => {
          await send(acc(w.label), A.registry, REGISTRY, "registerProvider", [], `register ${w.label}`);
        });
      }
    },

    async series() {
      for (const s of SERIES_X) {
        await step(`vaultapprove.${s.provider}`, async () => {
          await send(acc(s.provider), A.usdc, ERC20, "approve", [A.vault, MAX], `approve vault ${s.provider}`);
        });
        await step(`create.${s.key}`, async () => {
          const params = {
            gpuModel: keccak256(toBytes(GPU_KEYS[s.gpu])), gpuHours: s.hours, primaryPrice: s.price, bondPerCU: s.bond,
            windowStart: s.win.start, windowEnd: s.win.end, ackWindow: s.term.ack, deliveryWindow: s.term.delivery,
            disputeWindow: s.term.dispute, minRedemption: CU, arbitrator: A.panel, specHash: ZERO32, termsHash: ZERO32,
            country: cc(s.country), continent: 2, institutional: false, symbol: s.symbol,
          };
          const r = await send(acc(s.provider), A.factory, FACTORY, "createSeries", [params], `createSeries ${s.symbol}`);
          const log = r.logs.find((l) => l.address.toLowerCase() === A.factory.toLowerCase() && l.topics.length === 4);
          if (!log) throw new Error(`SeriesCreated missing for ${s.symbol}`);
          state.ids[`series.${s.key}`] = BigInt(log.topics[1]).toString();
          state.ids[`token.${s.key}`] = getAddress(`0x${log.topics[3].slice(-40)}`);
          if (BigInt(log.topics[1]) === 4n) throw new Error("Series id 4 must never be created or touched.");
        });
      }
      for (const l of TRADE_WALLETS) {
        await step(`saleapprove.${l}`, async () => {
          await send(acc(l), A.usdc, ERC20, "approve", [A.sale, MAX], `approve sale ${l}`);
        });
      }
      let i = 0;
      for (const [l, key, qty] of PRIMARY) {
        const s = SERIES_X.find((x) => x.key === key);
        await step(`buy.${i++}.${l}.${key}`, async () => {
          const cost = (cu(qty) * s.price + CU - 1n) / CU;
          await send(acc(l), A.sale, SALE, "buy", [seriesId(key), cu(qty), cost], `buy ${l} ${key} ${qty}`);
        });
      }
    },

    async market() {
      for (const l of TRADE_WALLETS) {
        await step(`bookusdc.${l}`, async () => {
          await send(acc(l), A.usdc, ERC20, "approve", [A.book, MAX], `approve book usdc ${l}`);
        });
      }
      const sellers = new Set();
      for (const [s, mk, side, , , tk] of TRADES) {
        if (side === "Ask") sellers.add(`${mk}:${s}`);
        else sellers.add(`${tk}:${s}`);
      }
      for (const [s, w, side] of [...RESTING, ...CANCELLED]) if (side === "Ask") sellers.add(`${w}:${s}`);
      for (const k of sellers) {
        const [w, s] = k.split(":");
        await step(`bookcu.${k}`, async () => {
          await send(acc(w), tokenOf(s), parseAbi(["function approve(address spender,uint256 amount) returns (bool)"]), "approve", [A.book, MAX], `approve book cu ${k}`);
        });
      }
      const place = async (w, s, side, price, qty, ioc, tag) =>
        send(acc(w), A.book, BOOK, "placeOrder", [seriesId(s), side === "Ask" ? 1 : 0, usd(price), cu(qty), ioc], tag);
      const orderIdFrom = (r, who) => {
        const log = r.logs.find((l) => l.address.toLowerCase() === A.book.toLowerCase() && l.topics[0] === SIG_ORDER && l.topics[3].toLowerCase().endsWith(acc(who).address.slice(2).toLowerCase()));
        return log ? BigInt(log.topics[1]).toString() : null;
      };
      let i = 0;
      for (const [s, mk, side, price, qty, tk] of TRADES) {
        const n = i++;
        await step(`trade.${n}.maker`, async () => {
          const r = await place(mk, s, side, price, qty, false, `maker ${n} ${mk} ${s}`);
          const id = orderIdFrom(r, mk);
          if (!id) throw new Error(`maker order ${n} did not rest (crossed an existing order?)`);
          state.ids[`order.trade${n}`] = id;
        });
        await step(`trade.${n}.taker`, async () => {
          await place(tk, s, side === "Ask" ? "Bid" : "Ask", price, qty, true, `taker ${n} ${tk} ${s}`);
        });
      }
      i = 0;
      for (const [s, w, side, price, qty] of RESTING) {
        const n = i++;
        await step(`rest.${n}`, async () => {
          const r = await place(w, s, side, price, qty, false, `rest ${n} ${w} ${s}`);
          const id = orderIdFrom(r, w);
          if (!id) throw new Error(`resting order ${n} did not rest`);
          state.ids[`order.rest${n}`] = id;
        });
      }
      i = 0;
      for (const [s, w, side, price, qty] of CANCELLED) {
        const n = i++;
        await step(`cancelled.${n}`, async () => {
          const r = await place(w, s, side, price, qty, false, `to-cancel ${n} ${w} ${s}`);
          const id = orderIdFrom(r, w);
          if (!id) throw new Error(`order to cancel ${n} did not rest`);
          await send(acc(w), A.book, BOOK, "cancelOrder", [BigInt(id)], `cancel ${n}`);
        });
      }
    },

    async "timelock-schedule"() {
      const minDelay = await client.readContract({ address: A.timelock, abi: TL, functionName: "getMinDelay" });
      const delay = BigInt(Math.max(Number(minDelay), TIMELOCK_OPS.delay));
      const gpus = ["A100", "H200", "B200", "GB200", "A100", "H200", "B200", "GB200", "A100", "H200"];
      for (let n = 0; n < TIMELOCK_OPS.total; n++) {
        await step(`tl.schedule.${n}`, async () => {
          const gpuModel = keccak256(toBytes(GPU_KEYS[gpus[n]]));
          const current = await client.readContract({ address: A.table, abi: CT, functionName: "factorOf", args: [gpuModel] });
          const data = encodeFunctionData({ abi: CT, functionName: "setFactor", args: [gpuModel, current] }); // no-op: same factor
          const salt = keccak256(toBytes(`paron-seedx-op-${n}`));
          const id = await client.readContract({ address: A.timelock, abi: TL, functionName: "hashOperation", args: [A.table, 0n, data, ZERO32, salt] });
          await send(deployer, A.timelock, TL, "schedule", [A.table, 0n, data, ZERO32, salt, delay], `tl schedule ${n}`);
          state.ids[`tl.${n}`] = JSON.stringify({ id, data, salt, at: await chainNow(), delay: delay.toString() });
        });
      }
      for (let n = TIMELOCK_OPS.total - TIMELOCK_OPS.cancel; n < TIMELOCK_OPS.total; n++) {
        await step(`tl.cancel.${n}`, async () => {
          const op = JSON.parse(state.ids[`tl.${n}`]);
          await send(deployer, A.timelock, TL, "cancel", [op.id], `tl cancel ${n}`);
        });
      }
    },

    async lifecycle() {
      for (const l of TRADE_WALLETS) {
        await step(`rmapprove.${l}`, async () => {
          await send(acc(l), A.usdc, ERC20, "approve", [A.rm, MAX], `approve rm ${l}`);
        });
      }
      const reqIdFrom = (r) => {
        const log = r.logs.find((x) => x.address.toLowerCase() === A.rm.toLowerCase() && x.topics[0] === SIG_REQUESTED);
        if (!log) throw new Error("RedemptionRequested missing");
        return BigInt(log.topics[1]);
      };
      const request = async (name, w, s, qty) => {
        const key = `req.${name}`;
        if (!state.ids[key]) {
          const r = await send(acc(w), A.rm, RM, "requestRedemption", [seriesId(s), cu(qty), keccak256(toBytes(`delivery:${name}`))], `request ${name}`);
          state.ids[key] = reqIdFrom(r).toString();
          save();
        }
        return BigInt(state.ids[key]);
      };
      const provOf = (s) => SERIES_X.find((x) => x.key === s).provider;
      const receipt = (name) => keccak256(toBytes(`receipt:${name}`));

      // s5: long windows. Requested, Acknowledged, Delivered, Finalized x2, voluntary default.
      await step("s5.requested", async () => { await request("s5-r1", "B1", "s5", 2); });
      await step("s5.acked", async () => { const id = await request("s5-r2", "B2", "s5", 2); await send(acc("P5"), A.rm, RM, "acknowledge", [id], "ack s5-r2"); });
      await step("s5.delivered", async () => {
        const id = await request("s5-r3", "B4", "s5", 2);
        await send(acc("P5"), A.rm, RM, "acknowledge", [id], "ack s5-r3");
        await send(acc("P5"), A.rm, RM, "markDelivered", [id, receipt("s5-r3")], "deliver s5-r3");
      });
      for (const [name, w, q] of [["s5-r4", "B5", 3], ["s5-r5", "B1", 2]]) {
        await step(`s5.final.${name}`, async () => {
          const id = await request(name, w, "s5", q);
          await send(acc("P5"), A.rm, RM, "acknowledge", [id], `ack ${name}`);
          await send(acc("P5"), A.rm, RM, "markDelivered", [id, receipt(name)], `deliver ${name}`);
          await send(acc(w), A.rm, RM, "confirm", [id], `confirm ${name}`);
        });
      }
      await step("s5.decline", async () => {
        const id = await request("s5-r6", "B6", "s5", 1);
        await send(acc("P5"), A.rm, RM, "declineAndPay", [id], "decline s5-r6");
      });

      // s6: ten defaults. All requests first, two get acknowledged (default on delivery deadline), then claim.
      const defIds = [];
      for (let n = 0; n < DEFAULT_HOLDERS.length; n++) {
        await step(`s6.req.${n}`, async () => {
          const id = await request(`s6-d${n}`, DEFAULT_HOLDERS[n], "s6", 1);
          if (n < 2) await send(acc("P6"), A.rm, RM, "acknowledge", [id], `ack s6-d${n}`);
        });
        defIds.push(BigInt(state.ids[`req.s6-d${n}`]));
      }
      // s7: ten disputes. Fast sequence per holder so each dispute lands inside the 90s dispute window.
      const disIds = [];
      for (let n = 0; n < DISPUTE_HOLDERS.length; n++) {
        await step(`s7.dispute.${n}`, async () => {
          const w = DISPUTE_HOLDERS[n];
          const id = await request(`s7-x${n}`, w, "s7", 1);
          await send(acc("P7"), A.rm, RM, "acknowledge", [id], `ack s7-x${n}`);
          await send(acc("P7"), A.rm, RM, "markDelivered", [id, receipt(`s7-x${n}`)], `deliver s7-x${n}`);
          await send(acc(w), A.rm, RM, "dispute", [id], `dispute s7-x${n}`);
          state.ids[`ruling.${n}`] = String(await chainNow() + 125);
        });
        disIds.push(BigInt(state.ids[`req.s7-x${n}`]));
      }
      // claims: poll until each default is claimable (ack or delivery deadline passed).
      for (let n = 0; n < defIds.length; n++) {
        await step(`s6.claim.${n}`, async () => {
          const id = defIds[n];
          for (;;) {
            const st = await client.readContract({ address: A.rm, abi: RM, functionName: "stateOf", args: [id] });
            if (Number(st) === 4) break; // Defaultable
            await sleep(3000);
          }
          await send(acc(DEFAULT_HOLDERS[n]), A.rm, RM, "claimDefault", [id], `claim s6-d${n}`);
        });
      }
      for (let n = 0; n < DISPUTES_TO_RESOLVE; n++) {
        await step(`s7.resolve.${n}`, async () => {
          await waitUntil(Number(state.ids[`ruling.${n}`]), `ruling window ${n}`);
          await send(deployer, A.rm, RM, "resolveNoRuling", [disIds[n]], `resolve s7-x${n}`);
        });
      }
    },

    async "timelock-execute"() {
      for (let n = 0; n < TIMELOCK_OPS.execute; n++) {
        await step(`tl.execute.${n}`, async () => {
          const op = JSON.parse(state.ids[`tl.${n}`]);
          await waitUntil(op.at + Number(op.delay) + 2, `timelock op ${n} ready`);
          await send(deployer, A.timelock, TL, "execute", [A.table, 0n, op.data, ZERO32, op.salt], `tl execute ${n}`);
        });
      }
    },

    async verify() {
      console.log("verify: run /workspace/paron-seed/counts.sh against the indexer API and check each page.");
    },
  };

  const startBal = await client.getBalance({ address: deployer.address });
  console.log(`deployer ${deployer.address} balance ${formatEther(startBal)} ETH`);
  for (const s of stages) {
    currentStage = s;
    console.log(`== stage ${s}`);
    await stageFns[s]();
    save();
    console.log(`   stage ${s} done, txs this run: ${stageCounts[s] || 0}`);
  }
  const endBal = await client.getBalance({ address: deployer.address });
  console.log(`done. txs this run ${txCount}; deployer balance ${formatEther(endBal)} ETH (spent ${formatEther(startBal - endBal)})`);
  return 0;
}
