import assert from "node:assert/strict";
import test from "node:test";
import {
  CANCELLED, DEFAULT_HOLDERS, DISPUTE_HOLDERS, FORBIDDEN_SYMBOL, NOV, OCT, PRIMARY, RESTING, SERIES_X, TIMELOCK_OPS,
  TRADES, WALLETS, bondOf, buildExtraPlan, entityOf, estimatePlan, maxSupplyOf, walletsOfKind,
} from "../src/seed-extra.mjs";

const labels = new Set(WALLETS.map((w) => w.label));

test("series: 7 new, distinct symbols, never series 4 or H100", () => {
  assert.equal(SERIES_X.length, 7);
  assert.equal(new Set(SERIES_X.map((s) => s.symbol)).size, 7);
  for (const s of SERIES_X) {
    assert.notEqual(s.symbol, FORBIDDEN_SYMBOL);
    assert.notEqual(s.gpu, "H100");
    assert.ok(s.bond * 10_000n >= s.price * 15_000n, `${s.symbol} bond floor`);
    assert.ok(maxSupplyOf(s) >= 28n * 10n ** 18n);
    assert.ok(bondOf(s) <= 10_000_000_000n, "bond fits the 10k USDC provider mint");
    assert.ok(s.win === OCT || s.win === NOV);
    assert.equal(s.win.end > s.win.start, true);
  }
  assert.equal(new Set(SERIES_X.map((s) => s.provider)).size, 7);
});

test("wallets: unique labels and entities, mixed KYB kinds", () => {
  assert.equal(labels.size, WALLETS.length);
  assert.equal(new Set(WALLETS.map((w) => entityOf(w.label))).size, WALLETS.length);
  assert.equal(walletsOfKind("provider").length, 7);
  assert.equal(walletsOfKind("buyer").length, 6);
  assert.equal(walletsOfKind("trader").length, 4);
  assert.equal(walletsOfKind("pending").length >= 1, true);
  assert.equal(walletsOfKind("expired").length >= 1, true);
  assert.equal(walletsOfKind("revoked").length >= 1, true);
});

test("page targets", () => {
  const plan = buildExtraPlan();
  assert.ok(4 + plan.series >= 10, "series");
  assert.ok(4 + walletsOfKind("provider").length >= 10, "providers");
  assert.ok(RESTING.length >= 12 && RESTING.length <= 15, "resting orders");
  assert.ok(new Set(RESTING.map((r) => r[0])).size >= 3 && new Set(RESTING.map((r) => r[0])).size <= 4, "series with orders");
  assert.ok(TRADES.length >= 10);
  assert.ok(new Set(TRADES.map((t) => t[5])).size >= 5, "different takers");
  assert.equal(DEFAULT_HOLDERS.length, 10);
  assert.equal(DISPUTE_HOLDERS.length, 10);
  assert.ok(TIMELOCK_OPS.total >= 8 && TIMELOCK_OPS.cancel >= 1 && TIMELOCK_OPS.execute >= 1);
  assert.ok(TIMELOCK_OPS.execute + TIMELOCK_OPS.cancel < TIMELOCK_OPS.total);
});

test("trades and orders are valid", () => {
  const keys = new Set(SERIES_X.map((s) => s.key));
  for (const [s, mk, side, price, qty, tk] of TRADES) {
    assert.ok(keys.has(s) && labels.has(mk) && labels.has(tk) && mk !== tk);
    assert.ok(side === "Ask" || side === "Bid");
    assert.equal(Math.round(price * 100) % 1, 0);
    assert.ok(qty > 0);
  }
  for (const [s, w, , price] of [...RESTING, ...CANCELLED]) {
    assert.ok(keys.has(s) && labels.has(w));
    assert.equal(Math.abs(price * 100 - Math.round(price * 100)) < 1e-9, true, "tick 0.01");
  }
});

test("sellers hold enough CU from primary", () => {
  const held = new Map();
  for (const [w, s, q] of PRIMARY) held.set(`${w}:${s}`, (held.get(`${w}:${s}`) || 0) + q);
  const need = new Map();
  const add = (w, s, q) => need.set(`${w}:${s}`, (need.get(`${w}:${s}`) || 0) + q);
  for (const [s, mk, side, , q, tk] of TRADES) add(side === "Ask" ? mk : tk, s, q);
  for (const [s, w, side, , q] of [...RESTING, ...CANCELLED]) if (side === "Ask") add(w, s, q);
  for (const [k, q] of need) assert.ok((held.get(k) || 0) >= q, `${k} needs ${q}, holds ${held.get(k) || 0}`);
  const supply = new Map(SERIES_X.map((s) => [s.key, Number(maxSupplyOf(s) / 10n ** 18n)]));
  const sold = new Map();
  for (const [, s, q] of PRIMARY) sold.set(s, (sold.get(s) || 0) + q);
  for (const [s, q] of sold) assert.ok(q <= supply.get(s), `${s} oversold`);
});

test("portfolio: at least 4 buyers hold 3+ series", () => {
  const per = new Map();
  for (const [w, s] of PRIMARY) per.set(w, new Set([...(per.get(w) || []), s]));
  assert.ok([...per].filter(([w, set]) => w.startsWith("B") && set.size >= 3).length >= 4);
});

test("gas estimate is positive", () => {
  for (const v of Object.values(estimatePlan())) assert.ok(v > 0);
});
