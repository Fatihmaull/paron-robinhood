import { buildSeedPlan } from "./seed-plan.mjs";

export const ZERO = "0x0000000000000000000000000000000000000000";

export const SCHEMA_PARTICIPANT =
  "ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)";
export const SCHEMA_KYB =
  "KybApplication(bytes32 entityId,uint8 role,bytes2 country,bytes32 dataHash)";

/** Demo constructor set from dev doc 04 §5. The deploy script reads config/params/{demo,prod}.json. */
export const DEMO_PARAMS = {
  bounds: {
    ackMin: 60,
    ackMax: 72 * 3600,
    deliveryMin: 60,
    deliveryMax: 7 * 86400,
    disputeMin: 90,
    disputeMax: 7 * 86400,
  },
  rulingWindow: 120,
  timelockDelay: 300,
  allowOpenWindow: true,
  enforceCalendarMonth: true,
  leadTime: 0,
  bondFloorBps: 15_000,
  primaryFeeBps: 100,
  takerFeeBps: 15,
  makerFeeBps: 0,
  maxPrimaryFeeBps: 500,
  maxTakerFeeBps: 100,
  disputeBondBps: 500,
  minDisputeBond: 5_000_000,
  maxLevels: 10,
  maxFillsPerTx: 10,
  factors: {
    "H100-SXM-80GB": 10_000,
    "H200-SXM-141GB": 14_000,
    "B200-SXM-180GB": 25_000,
    "GB200-NVL72": 35_000,
    "A100-SXM-80GB": 4_500,
  },
  printIndex: {
    windowLength: 86_400,
    minVolume: "1000000000000000000",
    minParticipants: 2,
    maxCarryForward: 259_200,
  },
  panelThreshold: 2,
  mockUsdcName: "Mock USDC",
  mockUsdcSymbol: "mUSDC",
  faucetAmount: 5_000_000_000,
  faucetCooldown: 3600,
};

export function assertParamSet(paramSet, params) {
  if (paramSet === "prod" && params.allowOpenWindow) {
    throw new Error("PARAM_SET=prod cannot set allowOpenWindow");
  }
}

export function windowBounds(bounds = {}) {
  const num = (value) => (value == null || value === "" ? 0 : Number(value));
  return {
    minAck: num(bounds.minAck ?? bounds.ackMin),
    maxAck: num(bounds.maxAck ?? bounds.ackMax),
    minDelivery: num(bounds.minDelivery ?? bounds.deliveryMin),
    maxDelivery: num(bounds.maxDelivery ?? bounds.deliveryMax),
    minDispute: num(bounds.minDispute ?? bounds.disputeMin),
    maxDispute: num(bounds.maxDispute ?? bounds.disputeMax),
  };
}

export function normalizeParams(file) {
  const index = file.printIndex || file.index || {};
  return {
    ...file,
    bounds: windowBounds(file.bounds),
    printIndex: {
      windowLength: Number(index.windowLength ?? 0),
      minVolume: String(index.minVolume ?? "0"),
      minParticipants: Number(index.minParticipants ?? 0),
      maxCarryForward: Number(index.maxCarryForward ?? 0),
    },
    panelThreshold: file.panelThreshold ?? 2,
    makerFeeBps: file.makerFeeBps ?? 0,
    maxFillsPerTx: file.maxFillsPerTx ?? null,
  };
}

export const VERIFY_COMMAND = "node ops/scripts/verify-deployment.mjs";

export const DEPLOY_STEPS = [
  {
    id: "mock-usdc",
    title: "MockUSDC",
    command: "PARON_BROADCAST=1 node ops/scripts/deploy.mjs mock-usdc",
    writes: "deployments/<chainId>/infra.json → mockUsdc",
  },
  {
    id: "eas-schema",
    title: "EAS schema registration",
    command: "PARON_BROADCAST=1 node ops/scripts/deploy.mjs eas-schema",
    writes: "deployments/<chainId>/infra.json → eas, schemas",
  },
  {
    id: "core",
    title: "Core contracts",
    command: "PARON_BROADCAST=1 node ops/scripts/deploy.mjs core",
    writes: "deployments/<chainId>/<label>.json → contracts",
  },
  {
    id: "roles",
    title: "Roles, Safe, and timelock",
    command: "PARON_BROADCAST=1 node ops/scripts/deploy.mjs roles",
    writes: "deployments/<chainId>/<label>.json → roles, contracts.TimelockController",
  },
  {
    id: "seed",
    title: "Seed",
    command: "PARON_BROADCAST=1 node ops/scripts/deploy.mjs seed",
    writes: "deployments/<chainId>/<label>.json → seed",
  },
];

function deploy(contract, args) {
  return { kind: "deploy", contract, args };
}

function call(contract, method, args) {
  return { kind: "call", contract, method, args };
}

export function easActions(chain) {
  const actions = [];
  if (chain.eas?.mode === "self-deploy") {
    actions.push(deploy("SchemaRegistry", []));
    actions.push(deploy("EAS", [{ name: "registry", ref: "SchemaRegistry" }]));
  }
  for (const schema of [SCHEMA_PARTICIPANT, SCHEMA_KYB]) {
    actions.push(
      call("SchemaRegistry", "register", [
        { name: "schema", value: schema },
        { name: "resolver", value: ZERO },
        { name: "revocable", value: true },
      ]),
    );
  }
  return actions;
}

export function coreActions(env = {}) {
  const registryGate = env.GATE_KIND === "registry";
  const actions = [];
  if (registryGate) {
    actions.push(deploy("RegistryGate", [{ name: "admin", ref: "deployer" }]));
  } else {
    actions.push(
      deploy("EASGate", [
        { name: "eas", ref: "EAS" },
        { name: "schemaUid", ref: "ParticipantVerified" },
        { name: "trustedAttesters", ref: "W-VERIFIER" },
        { name: "admin", ref: "deployer" },
      ]),
    );
  }
  actions.push(
    deploy("ConversionTable", [{ name: "admin", ref: "deployer" }]),
    deploy("ProviderRegistry", [
      { name: "gate", ref: "gate" },
      { name: "redemptionManager", ref: "RedemptionManager" },
      { name: "admin", ref: "deployer" },
    ]),
    deploy("BondVault", [
      { name: "settlementToken", ref: "MockUSDC" },
      { name: "factory", ref: "SeriesFactory" },
      { name: "redemptionManager", ref: "RedemptionManager" },
    ]),
    deploy("CUToken", []),
    deploy("PrintIndex", [
      { name: "orderBook", ref: "OrderBook" },
      { name: "redemptionManager", ref: "RedemptionManager" },
      { name: "factory", ref: "SeriesFactory" },
      { name: "admin", ref: "deployer" },
      { name: "params", ref: "params.index" },
    ]),
    deploy("SeriesFactory", [
      { name: "registry", ref: "ProviderRegistry" },
      { name: "conversionTable", ref: "ConversionTable" },
      { name: "bondVault", ref: "BondVault" },
      { name: "cuTokenImpl", ref: "CUToken" },
      { name: "primarySale", ref: "PrimarySale" },
      { name: "redemptionManager", ref: "RedemptionManager" },
      { name: "gate", ref: "gate" },
      { name: "settlementToken", ref: "MockUSDC" },
      { name: "admin", ref: "deployer" },
      { name: "bounds", ref: "params.bounds" },
      { name: "allowOpenWindow", ref: "params.allowOpenWindow" },
      { name: "enforceCalendarMonth", ref: "params.enforceCalendarMonth" },
      { name: "leadTime", ref: "params.leadTime" },
    ]),
    deploy("PrimarySale", [
      { name: "factory", ref: "SeriesFactory" },
      { name: "settlementToken", ref: "MockUSDC" },
      { name: "gate", ref: "gate" },
      { name: "treasury", ref: "treasury" },
      { name: "primaryFeeBps", ref: "params.primaryFeeBps" },
      { name: "admin", ref: "deployer" },
    ]),
    deploy("OrderBook", [
      { name: "factory", ref: "SeriesFactory" },
      { name: "settlementToken", ref: "MockUSDC" },
      { name: "gate", ref: "gate" },
      { name: "printIndex", ref: "PrintIndex" },
      { name: "treasury", ref: "treasury" },
      { name: "takerFeeBps", ref: "params.takerFeeBps" },
      { name: "maxFillsPerTx", ref: "params.maxFillsPerTx" },
      { name: "admin", ref: "deployer" },
    ]),
    deploy("RedemptionManager", [
      { name: "factory", ref: "SeriesFactory" },
      { name: "bondVault", ref: "BondVault" },
      { name: "registry", ref: "ProviderRegistry" },
      { name: "printIndex", ref: "PrintIndex" },
      { name: "settlementToken", ref: "MockUSDC" },
      { name: "rulingWindow", ref: "params.rulingWindow" },
    ]),
    deploy("PanelArbitrator", [
      { name: "members", ref: "panel" },
      { name: "threshold", ref: "params.panelThreshold" },
      { name: "redemptionManager", ref: "RedemptionManager" },
      { name: "admin", ref: "deployer" },
    ]),
  );
  if (env.REFERENCE_FEED === "1") {
    actions.push(
      deploy("ReferenceFeed", [
        { name: "admin", ref: "deployer" },
        { name: "feedSigner", ref: "W-FEED" },
        { name: "label", value: "synthetic demo data" },
      ]),
    );
  }
  actions.push(
    call("SeriesFactory", "setOrderBook", [{ name: "orderBook", ref: "OrderBook" }]),
    call("SeriesFactory", "setArbitratorAllowed", [
      { name: "arbitrator", ref: "PanelArbitrator" },
      { name: "allowed", value: true },
    ]),
  );
  return actions;
}

export function rolesActions(env = {}) {
  const allowlist = env.PARON_SAFE_MODE === "allowlist";
  return [
    deploy("TimelockController", [
      { name: "minDelay", ref: "params.timelockDelay" },
      { name: "proposers", ref: allowlist ? "admin-eoas" : "safe-and-admin" },
      { name: "executors", value: [ZERO] },
      { name: "admin", value: ZERO },
    ]),
    {
      kind: "roles",
      contract: "AccessControl",
      method: "grantRole",
      note: "DEFAULT_ADMIN_ROLE to the timelock. ADMIN_ROLE and PAUSER_ROLE to the Safe, or to the admin EOA when PARON_SAFE_MODE=allowlist. VERIFIER_ROLE to W-VERIFIER on RegistryGate. Deployer renounces those roles. MINTER_ROLE on MockUSDC stays with the deployer.",
    },
  ];
}

export function actionsFor(stepId, { chain, env = {} } = {}) {
  if (stepId === "mock-usdc") {
    return [
      deploy("MockUSDC", [
        { name: "admin", ref: "deployer" },
        { name: "minter", ref: "deployer" },
      ]),
    ];
  }
  if (stepId === "eas-schema") return easActions(chain || { eas: { mode: "self-deploy" } });
  if (stepId === "core") return coreActions(env);
  if (stepId === "roles") return rolesActions(env);
  if (stepId === "seed") return seedActions(env);
  throw new Error(`Unknown deploy step ${stepId}`);
}

export function seedActions(env = {}) {
  const plan = buildSeedPlan({
    mode: env.SEED_MODE || "stage",
    label: env.DEPLOY_LABEL || "stage-1",
    callout: env.SEED_CALLOUT !== "false",
    referenceFeed: env.REFERENCE_FEED === "1",
  });
  return plan.steps.map((step) => ({
    kind: "seed",
    contract: step.action,
    method: step.step,
    signer: step.signer,
    args: [],
    note: step.note || "",
    symbol: step.symbol || "",
    step,
  }));
}

export function constructorInputs(abi) {
  const ctor = (abi || []).find((item) => item.type === "constructor");
  if (!ctor) return 0;
  return ctor.inputs?.length ?? 0;
}

export function assertConstructor(contract, abi, args) {
  const expected = args.length;
  const actual = constructorInputs(abi);
  if (actual !== expected) {
    throw new Error(
      `${contract} constructor has ${actual} inputs; this plan passes ${expected}. Broadcast stopped.`,
    );
  }
}
