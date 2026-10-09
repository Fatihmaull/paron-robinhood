/** Demo seed amounts from dev doc 05. Phase 3 stays out of stage labels. */

export const USDC = 1_000_000n;
export const CU = 10n ** 18n;

export const KYB_EXPIRY = 1822953600n;
export const CONTINENT_AS = 2;

export const GPU = {
  H100: { key: "H100-SXM-80GB", factor: 10_000 },
  H200: { key: "H200-SXM-141GB", factor: 14_000 },
  B200: { key: "B200-SXM-180GB", factor: 25_000 },
};

export const TARGET_USDC = {
  provider: 10_000n * USDC,
  buyer: 1_000n * USDC,
  trader: 1_000n * USDC,
};

export const ACTORS = [
  { label: "W-P-JKT", role: 1, country: "ID", entity: "0x" + "e1".repeat(32), target: "provider" },
  { label: "W-P-BTM", role: 1, country: "ID", entity: "0x" + "e4".repeat(32), target: "provider" },
  { label: "W-P-SGP", role: 1, country: "SG", entity: "0x" + "e5".repeat(32), target: "provider" },
  { label: "W-BUY", role: 2, country: "ID", entity: "0x" + "e2".repeat(32), target: "buyer" },
  { label: "W-BUY2", role: 2, country: "ID", entity: "0x" + "e2".repeat(32), target: "buyer" },
  { label: "W-TRD", role: 3, country: "SG", entity: "0x" + "e3".repeat(32), target: "trader" },
];

export const SERIES = [
  {
    step: "F-1",
    symbol: "CU-JKT-H100-2611",
    provider: "W-P-JKT",
    gpu: "H100",
    gpuHours: 720n,
    primaryPrice: 3_000_000n,
    bondPerCU: 4_500_000n,
    windowStart: 1793491200n,
    windowEnd: 1796083200n,
    country: "ID",
    expectedSeriesId: 1n,
  },
  {
    step: "F-2",
    symbol: "CU-BTM-H200-2611",
    provider: "W-P-BTM",
    gpu: "H200",
    gpuHours: 1000n,
    primaryPrice: 4_060_000n,
    bondPerCU: 6_090_000n,
    windowStart: 1793491200n,
    windowEnd: 1796083200n,
    country: "ID",
    expectedSeriesId: 2n,
  },
  {
    step: "F-3",
    symbol: "CU-SGP-B200-2612",
    provider: "W-P-SGP",
    gpu: "B200",
    gpuHours: 744n,
    primaryPrice: 3_000_000n,
    bondPerCU: 4_500_000n,
    windowStart: 1796083200n,
    windowEnd: 1798761600n,
    country: "SG",
    expectedSeriesId: 3n,
  },
];

export const ALLOWANCES = [
  { owner: "W-BUY", spender: "PrimarySale", amount: 60_000_000n, forStep: "S-02" },
  { owner: "W-BUY", spender: "OrderBook", amount: 3_104_650n, forStep: "S-12" },
  { owner: "W-BUY2", spender: "OrderBook", amount: 16_024_000n, forStep: "S-06" },
  { owner: "W-BUY2", spender: "PrimarySale", amount: 3_000_000n, forStep: "F-4" },
  { owner: "W-BUY2", spender: "RedemptionManager", amount: 5_000_000n, forStep: "phase-4" },
  { owner: "W-TRD", spender: "PrimarySale", amount: 30_000_000n, forStep: "S-03" },
  { owner: "W-P-BTM", spender: "BondVault", amount: 8_526_000_000n, forStep: "F-2" },
  { owner: "W-P-SGP", spender: "BondVault", amount: 8_370_000_000n, forStep: "F-3" },
  { owner: "W-P-JKT", spender: "BondVault", amount: 3_240_000_000n, forStep: "F-1" },
];

export function maxSupply(series) {
  const factor = BigInt(GPU[series.gpu].factor);
  return (series.gpuHours * factor * CU) / 10_000n;
}

export function bondDeposit(series) {
  return (series.bondPerCU * maxSupply(series)) / CU;
}

export function assertStageAllows(mode, label) {
  if (mode === "rehearsal" && String(label).startsWith("stage-")) {
    throw new Error("SEED_MODE=rehearsal is refused when DEPLOY_LABEL starts with stage-");
  }
  if (mode !== "stage" && mode !== "rehearsal") {
    throw new Error(`SEED_MODE must be stage or rehearsal, got ${mode}`);
  }
}

export function buildSeedPlan({ mode = "stage", label = "stage-1", callout = true, referenceFeed = false } = {}) {
  assertStageAllows(mode, label);
  const steps = [];
  steps.push({
    phase: 1,
    step: "A-1",
    signer: "W-DEP",
    action: "topUpEth",
    note: "Send ETH up to ETH_TARGET_WEI. Skip a wallet already at the target.",
  });
  for (const actor of ACTORS) {
    steps.push({
      phase: 1,
      step: "A-2",
      signer: "W-DEP",
      action: "mintUsdc",
      to: actor.label,
      amount: TARGET_USDC[actor.target],
      note: "Mint target minus balanceOf. Do not add on top of an existing balance.",
    });
  }
  steps.push({
    phase: 1,
    step: "A-3",
    signer: "W-VERIFIER",
    action: "multiAttest",
    schema: "ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)",
    recipients: ACTORS.map((actor) => ({
      label: actor.label,
      role: actor.role,
      country: actor.country,
      entity: actor.entity,
      expiry: KYB_EXPIRY.toString(),
    })),
    note: "D-54: one EAS multiAttest from W-VERIFIER. Safe is not the attester for the hackathon.",
  });
  for (const actor of ACTORS) {
    steps.push({ phase: 1, step: "A-4", signer: "W-DEP", action: "linkAttestation", account: actor.label });
    if (actor.role === 1) {
      steps.push({ phase: 1, step: "A-5", signer: actor.label, action: "registerProvider" });
    }
  }
  for (const row of ALLOWANCES) {
    steps.push({ phase: 1, step: "A-6", signer: row.owner, action: "approve", spender: row.spender, amount: row.amount, forStep: row.forStep });
  }
  for (const series of SERIES) {
    const supply = maxSupply(series);
    const bond = bondDeposit(series);
    steps.push({
      phase: 2,
      step: series.step,
      signer: series.provider,
      action: "createSeries",
      symbol: series.symbol,
      gpuKey: GPU[series.gpu].key,
      gpuHours: series.gpuHours.toString(),
      primaryPrice: series.primaryPrice.toString(),
      bondPerCU: series.bondPerCU.toString(),
      maxSupply: supply.toString(),
      bondDeposit: bond.toString(),
      windowStart: series.windowStart.toString(),
      windowEnd: series.windowEnd.toString(),
      ackWindow: "60",
      deliveryWindow: "60",
      disputeWindow: "90",
      minRedemption: CU.toString(),
      country: series.country,
      continent: CONTINENT_AS,
      institutional: false,
      expectedSeriesId: series.expectedSeriesId.toString(),
    });
  }
  if (callout) {
    steps.push(
      { phase: 2, step: "F-4", signer: "W-BUY2", action: "buy", seriesSymbol: "CU-SGP-B200-2612", qty: CU.toString(), maxCost: "3000000" },
      { phase: 2, step: "F-4", signer: "W-BUY2", action: "approveCu", spender: "OrderBook", amount: CU.toString() },
      { phase: 2, step: "F-4", signer: "W-BUY2", action: "placeOrder", side: "Ask", price: "3100000", qty: CU.toString(), immediateOrCancel: false },
    );
  }
  if (referenceFeed) {
    steps.push({
      phase: 2,
      step: "F-5",
      signer: "W-FEED",
      action: "pushReference",
      value: "3000000",
      gpus: ["H100-SXM-80GB", "H200-SXM-141GB", "B200-SXM-180GB"],
      label: "synthetic demo data",
    });
  }
  if (mode === "rehearsal") {
    steps.push({
      phase: 3,
      step: "S-01",
      signer: "W-P-JKT",
      action: "skipped-in-ops-seed",
      note: "Phase 3 is live from the UI on stage, or the rehearsal runner. This seed script stops after phase 2.",
    });
  }
  return {
    mode,
    label,
    phases: mode === "rehearsal" ? [1, 2] : [1, 2],
    refusesPhase3OnStage: true,
    steps,
  };
}
