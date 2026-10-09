/**
 * Read-only go/no-go. A missing deployer key is not a chain failure.
 * Signed checks stay pending and are listed in README.
 */
export function assessChain(measurement) {
  const blockers = [];
  if (!measurement?.rpcReachable) blockers.push("rpc-unreachable");
  if (!measurement?.chainIdOk) blockers.push("chain-id-mismatch");
  const producing = measurement?.productionWatch?.advanced === true;
  const tipAge = measurement?.tipAgeSeconds;
  const tipFresh = typeof tipAge === "number" && tipAge >= 0 && tipAge <= 120;
  if (!producing && !tipFresh) blockers.push("blocks-not-producing");
  if (measurement?.gasPriceWei == null) blockers.push("gas-price-unreadable");
  return {
    verdict: blockers.length === 0 ? "go" : "no-go",
    blockers,
  };
}

export function selectActiveKey(primary, fallback) {
  const primaryResult = assessChain(primary);
  if (primaryResult.verdict === "go") {
    return { active: primary.key, verdict: "go", blockers: [], switched: false };
  }
  const fallbackResult = assessChain(fallback);
  if (fallbackResult.verdict === "go") {
    return {
      active: fallback.key,
      verdict: "no-go",
      blockers: primaryResult.blockers,
      switched: true,
      fallback: fallback.key,
    };
  }
  return {
    active: fallback.key,
    verdict: "no-go",
    blockers: primaryResult.blockers,
    switched: true,
    fallback: fallback.key,
    fallbackBlockers: fallbackResult.blockers,
  };
}
