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
 * nowSeconds is the chain timestamp. The UI clock (D-48) is separate.
 * resolveNoRuling covers a no-ruling refund and the one-time reopen (D-46, T12b).
 */
function asBig(value) {
  return typeof value === "bigint" ? value : BigInt(value);
}

export function decideKeeper(request, nowSeconds) {
  const reqId = request.reqId;
  const state = Number(request.state);
  const now = asBig(nowSeconds);
  if (state === RedemptionState.Requested && now > asBig(request.ackDeadline)) {
    return { action: "claimDefault", reqId };
  }
  if (state === RedemptionState.Acknowledged && now > asBig(request.deliveryDeadline)) {
    return { action: "claimDefault", reqId };
  }
  if (state === RedemptionState.Defaultable) {
    return { action: "claimDefault", reqId };
  }
  if (state === RedemptionState.Delivered && now > asBig(request.disputeDeadline)) {
    return { action: "finalizeRedemption", reqId };
  }
  if (state === RedemptionState.Disputed && now > asBig(request.rulingDeadline)) {
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
