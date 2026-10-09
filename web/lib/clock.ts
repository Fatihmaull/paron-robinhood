/** Claim / finalize / resolve-no-ruling margin. Whole seconds, D-48. */
export const CLAIM_MARGIN_S = 2;

export function syncOffset(serverNowMs: number, clientNowMs: number): number {
  return serverNowMs - clientNowMs;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

export function nowSeconds(nowMs: number): number {
  return Math.floor(nowMs / 1000);
}

/** After-deadline actions: active only when now_s > deadline_s + 2. */
export function afterDeadlineOpen(nowMs: number, deadlineMs: number): boolean {
  return nowSeconds(nowMs) > nowSeconds(deadlineMs) + CLAIM_MARGIN_S;
}

/** Inclusive before-deadline actions (ack, deliver, dispute, declineAndPay). */
export function beforeDeadlineOpen(nowMs: number, deadlineMs: number): boolean {
  return nowSeconds(nowMs) <= nowSeconds(deadlineMs);
}

export function inUnlockGap(nowMs: number, deadlineMs: number): boolean {
  const nowS = nowSeconds(nowMs);
  const deadlineS = nowSeconds(deadlineMs);
  return nowS > deadlineS && nowS <= deadlineS + CLAIM_MARGIN_S;
}
