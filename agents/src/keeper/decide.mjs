/** Chain states from dev doc 01. Defaultable is derived and may be returned by stateOf. */
export const RedemptionState = {
  None: 0,
  Requested: 1,
  Acknowledged: 2,
  Delivered: 3,
  Defaultable: 4,
  Disputed: 5,
  Defaulted: 6,
  Finalized: 7,
  Refunded: 8,
};

/**
 * Keeper actions are permissionless. declineAndPay is the provider's call and
 * only legal before the deadline (D-47), so the keeper never selects it.
 *
 * nowSeconds is wall clock, the same clock as the claim-default button (D-48):
 * past the deadline by 2 seconds. Do not pass the latest block timestamp.
 * On a quiet ArbOS chain that timestamp stays frozen until a transaction is
 * mined, which is the older P5-16 / P6-18 rule and is not used.
 * A Requested or Acknowledged row whose stateOf() is not yet Defaultable is
 * still armed; the transaction reverts if the included block is early.
 * resolveNoRuling covers a no-ruling refund and the one-time reopen (D-46, T12b).
 * There is no refundedAfterWindow flag.
 */
export const ARM_MARGIN_SECONDS = 2n;

function asBig(value) {
  return typeof value === "bigint" ? value : BigInt(value);
}

function pastDeadline(now, deadline) {
  return now > asBig(deadline) + ARM_MARGIN_SECONDS;
}

export function decideKeeper(request, nowSeconds) {
  const reqId = request.reqId;
  const state = Number(request.state);
  const now = asBig(nowSeconds);
  if (state === RedemptionState.Defaultable) {
    return { action: "claimDefault", reqId };
  }
  if (state === RedemptionState.Requested && pastDeadline(now, request.ackDeadline)) {
    return { action: "claimDefault", reqId };
  }
  if (state === RedemptionState.Acknowledged && pastDeadline(now, request.deliveryDeadline)) {
    return { action: "claimDefault", reqId };
  }
  if (state === RedemptionState.Delivered && pastDeadline(now, request.disputeDeadline)) {
    return { action: "finalizeRedemption", reqId };
  }
  if (state === RedemptionState.Disputed && pastDeadline(now, request.rulingDeadline)) {
    return { action: "resolveNoRuling", reqId };
  }
  return { action: "wait", reqId };
}

export function planKeeper(requests, nowSeconds, { dryRun = true } = {}) {
  return requests.map((request) => {
    const decision = decideKeeper(request, nowSeconds);
    if (decision.action === "wait") return { ...decision, send: false };
    if (dryRun) {
      return { ...decision, send: false, log: `would ${decision.action}(${decision.reqId})` };
    }
    return { ...decision, send: true };
  });
}
