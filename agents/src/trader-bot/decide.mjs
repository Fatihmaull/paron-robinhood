const CU = 10n ** 18n;

export const BOT_STEPS = [
  { id: "S-03", method: "buy", qty: 10n * CU, maxCost: 30_000_000n },
  { id: "S-04", method: "approve", spender: "OrderBook", amount: 5n * CU },
  { id: "S-05", method: "placeOrder", side: "Ask", sideIndex: 1, price: 3_200_000n, qty: 5n * CU, immediateOrCancel: false },
];

function same(a, b) {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

/**
 * One-shot bot. Fires only on PrimaryBuy of the live series by W-BUY.
 * Ignores the trader's own buy so S-03 does not loop.
 */
export function evaluateTrigger({
  event,
  seriesId = 4n,
  buyer,
  trader,
  armed = true,
  holdingCu = 0n,
  openAsk = false,
}) {
  if (!armed) return { fire: false, reason: "not-armed", steps: [] };
  if (!event || event.name !== "PrimaryBuy") return { fire: false, reason: "not-primary-buy", steps: [] };
  if (BigInt(event.seriesId) !== BigInt(seriesId)) return { fire: false, reason: "other-series", steps: [] };
  if (same(event.buyer, trader)) return { fire: false, reason: "self-buy", steps: [] };
  if (!same(event.buyer, buyer)) return { fire: false, reason: "other-buyer", steps: [] };
  if (holdingCu > 0n || openAsk) return { fire: false, reason: "one-shot", steps: [] };
  return { fire: true, reason: "primary-buy", steps: BOT_STEPS };
}

export function nextStep(steps, index, { reverted = false } = {}) {
  if (reverted) return { stop: true, reason: "revert", step: steps[index] ?? null };
  if (index >= steps.length) return { stop: true, reason: "done", step: null };
  return { stop: false, reason: "continue", step: steps[index] };
}
