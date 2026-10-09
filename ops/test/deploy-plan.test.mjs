import assert from "node:assert/strict";
import test from "node:test";
import { actionsFor, assertConstructor, assertParamSet, DEPLOY_STEPS } from "../src/deploy-plan.mjs";
import { buildKnown, resolveArg, resolveArgs } from "../src/encode-step.mjs";
import { loadArtifact, loadParams, runDeployStep } from "../src/deploy-run.mjs";
import { applyReceipts } from "../src/manifest-store.mjs";
import { emptyInfra, emptyLabel, renderDeploymentsMarkdown } from "../src/manifest.mjs";
import { manifestProblems } from "../src/verify-deployment.mjs";

const chain = {
  key: "robinhoodTestnet",
  chainId: 46630,
  eas: { mode: "self-deploy", version: "1.4.0" },
  explorer: { url: "https://explorer.testnet.chain.robinhood.com" },
  rpc: { primaryEnv: "RH_TESTNET_RPC" },
};

test("deploy commands are one per step, in order, and the key is not in the command", () => {
  assert.deepEqual(
    DEPLOY_STEPS.map((step) => step.id),
    ["mock-usdc", "eas-schema", "core", "roles", "seed"],
  );
  for (const step of DEPLOY_STEPS) {
    assert.match(step.command, /^PARON_BROADCAST=1 node ops\/scripts\/deploy\.mjs /);
    assert.equal(step.command.includes("PARON_DEPLOYER_PK="), false);
  }
  const markdown = renderDeploymentsMarkdown({
    active: {
      chainId: 46630,
      readmeChainLine: "Deployed on Robinhood Chain Testnet (46630)",
      explorer: { url: "https://explorer.testnet.chain.robinhood.com" },
    },
    evidence: { verdict: "go", measuredAtUtc: "2026-10-09T04:26:15.171Z", path: "deployments/46630/go-nogo.json" },
    labels: [],
  });
  assert.match(markdown, /GO/);
  assert.match(markdown, /node ops\/scripts\/deploy\.mjs mock-usdc/);
  assert.match(markdown, /node ops\/scripts\/verify-deployment\.mjs/);
  const mock = markdown.indexOf("mock-usdc");
  const seed = markdown.indexOf("deploy.mjs seed");
  assert.ok(mock < seed);
});

test("dry-run does not read the deployer key", async () => {
  const env = new Proxy(
    { CHAIN: "robinhoodTestnet" },
    {
      get(target, prop) {
        if (prop === "PARON_DEPLOYER_PK") throw new Error("key was read");
        return target[prop];
      },
    },
  );
  const result = await runDeployStep("mock-usdc", { env, chain, accountFromKey() { throw new Error("signed"); } });
  assert.equal(result.exitCode, 0);
  assert.equal(result.send, false);
  assert.match(result.lines.join("\n"), /Dry run/);
});

test("broadcast without bytecode does not write a manifest or echo the key", async () => {
  const secret = "22".repeat(32);
  let saved = false;
  const result = await runDeployStep("mock-usdc", {
    env: { PARON_BROADCAST: "1", PARON_DEPLOYER_PK: `0x${secret}` },
    chain,
    loadArtifact: () => null,
    accountFromKey() { throw new Error("should not derive"); },
    store: { loadState() { return { infra: emptyInfra(46630), label: emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" }), labelExisted: false }; }, saveState() { saved = true; } },
  });
  assert.equal(result.exitCode, 2);
  assert.equal(saved, false);
  assert.equal(result.lines.join("\n").includes(secret), false);
});

test("broadcast of MockUSDC writes infra and not the key", async () => {
  const secret = "33".repeat(32);
  let saved = null;
  const artifact = { abi: [{ type: "constructor", inputs: [{ type: "string" }, { type: "string" }] }], bytecode: "0x6001" };
  const result = await runDeployStep("mock-usdc", {
    env: { PARON_BROADCAST: "1", PARON_DEPLOYER_PK: secret, DEPLOY_LABEL: "stage-1" },
    chain,
    loadArtifact: () => artifact,
    accountFromKey: async () => ({ address: "0x00000000000000000000000000000000000000a1" }),
    sender: {
      async broadcast() {
        return [{ kind: "deploy", contract: "MockUSDC", address: "0x00000000000000000000000000000000000000b1", txHash: "0xabc", block: 10, from: "0x00000000000000000000000000000000000000a1", status: "success" }];
      },
    },
    store: {
      loadState() {
        return { infra: emptyInfra(46630), label: emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" }), labelExisted: false };
      },
      saveState(_chain, _label, state) { saved = state; },
    },
  });
  assert.equal(result.exitCode, 0);
  assert.equal(result.wrote, true);
  assert.equal(saved.infra.mockUsdc.address, "0x00000000000000000000000000000000000000b1");
  assert.equal(JSON.stringify(saved).includes(secret), false);
});

test("core broadcast refuses to overwrite a label", async () => {
  const result = await runDeployStep("core", {
    env: { PARON_BROADCAST: "1", PARON_DEPLOYER_PK: "44".repeat(32), MAX_FILLS_PER_TX: "8" },
    chain,
    loadArtifact: () => ({ abi: [{ type: "constructor", inputs: [] }], bytecode: "0x6001" }),
    accountFromKey: async () => ({ address: "0x00000000000000000000000000000000000000a1" }),
    store: {
      loadState() {
        return { infra: emptyInfra(46630), label: emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" }), labelExisted: true, label: { ...emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" }), contracts: { SeriesFactory: { address: "0x00000000000000000000000000000000000000b1" } } } };
      },
      saveState() { throw new Error("saved"); },
    },
  });
  assert.equal(result.exitCode, 2);
  assert.match(result.lines.join("\n"), /overwrite/);
});

test("constructor arity mismatch stops before send", () => {
  assert.throws(() => assertConstructor("MockUSDC", [{ type: "constructor", inputs: [] }], [{ name: "name" }, { name: "symbol" }]), /constructor/);
});

test("prod cannot enable allowOpenWindow", () => {
  assert.throws(() => assertParamSet("prod", { allowOpenWindow: true }), /allowOpenWindow/);
});

test("predicted addresses fill later constructor refs", () => {
  const actions = actionsFor("core", { chain, env: {} });
  const known = buildKnown({
    actions,
    from: "0x00000000000000000000000000000000000000a1",
    nonce: 5,
    predict: (_from, nonce) => `0x${nonce.toString(16).padStart(40, "0")}`,
    env: { W_VERIFIER: "0x00000000000000000000000000000000000000c1", SAFE_ADDRESS: "0x00000000000000000000000000000000000000d1" },
    params: { timelockDelay: 300, printIndex: { windowLength: 1, minVolume: "1", minParticipants: 2, maxCarryForward: 3 }, bounds: {}, allowOpenWindow: true, enforceCalendarMonth: true, leadTime: 0, bondFloorBps: 1, primaryFeeBps: 1, takerFeeBps: 1, makerFeeBps: 0, maxLevels: 10, maxFillsPerTx: 4, rulingWindow: 120, disputeBondBps: 500, minDisputeBond: 1, panelThreshold: 2 },
    infra: { mockUsdc: { address: "0x00000000000000000000000000000000000000e1" }, eas: { address: "0x00000000000000000000000000000000000000e2" }, schemas: { ParticipantVerified: { uid: "0x" + "ab".repeat(32) } } },
  });
  const registry = actions.find((action) => action.contract === "ProviderRegistry" && action.kind === "deploy");
  const gate = resolveArg(registry.args[0], known);
  const rm = resolveArg(registry.args[1], known);
  assert.equal(gate, known.EASGate);
  assert.equal(rm, known.RedemptionManager);
  assert.notEqual(gate, rm);
});

test("roles step deploys the timelock and does not put it in core", () => {
  const core = actionsFor("core", { chain, env: {} }).map((action) => action.contract);
  const roles = actionsFor("roles", { env: {} }).map((action) => action.contract);
  assert.equal(core.includes("TimelockController"), false);
  assert.equal(roles[0], "TimelockController");
});

test("manifest problems stay empty only when L2 and L3 can read addresses", () => {
  const infra = emptyInfra(46630);
  const label = emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" });
  assert.ok(manifestProblems(infra, label).length > 0);
  infra.mockUsdc = { address: "0x00000000000000000000000000000000000000b1" };
  infra.eas = { address: "0x00000000000000000000000000000000000000b2" };
  infra.schemas.ParticipantVerified = { uid: "0x" + "ab".repeat(32) };
  label.contracts.SeriesFactory = { address: "0x00000000000000000000000000000000000000b3" };
  label.roles.timelock = "0x00000000000000000000000000000000000000b4";
  assert.deepEqual(manifestProblems(infra, label), []);
});

test("compiled artifacts accept the plan calldata", async () => {
  if (!loadArtifact("MockUSDC") || !loadArtifact("EAS") || !loadArtifact("TimelockController")) return;
  const viem = await import("viem");
  const { params } = loadParams({ PARAM_SET: "demo" });
  const env = {
    W_VERIFIER: "0x00000000000000000000000000000000000000c1",
    SAFE_ADDRESS: "0x00000000000000000000000000000000000000d1",
    W_ADMIN: "0x00000000000000000000000000000000000000d2",
    TREASURY_ADDRESS: "0x00000000000000000000000000000000000000d3",
    W_ARB_1: "0x00000000000000000000000000000000000000a1",
    W_ARB_2: "0x00000000000000000000000000000000000000a2",
    W_ARB_3: "0x00000000000000000000000000000000000000a3",
    W_FEED: "0x00000000000000000000000000000000000000f1",
    TEAM_EOA_1: "0x00000000000000000000000000000000000000e1",
    TEAM_EOA_2: "0x00000000000000000000000000000000000000e2",
    REFERENCE_FEED: "1",
    PARON_SAFE_MODE: "allowlist",
  };
  const from = "0x00000000000000000000000000000000000000b1";
  for (const step of ["mock-usdc", "eas-schema", "core", "roles"]) {
    const actions = actionsFor(step, { chain, env });
    const known = buildKnown({
      actions,
      from,
      nonce: 3,
      predict: (_from, nonce) => `0x${(0x1000 + nonce).toString(16).padStart(40, "0")}`,
      env,
      params,
      infra: {
        mockUsdc: { address: "0x0000000000000000000000000000000000000011" },
        eas: { address: "0x0000000000000000000000000000000000000012" },
        schemas: {},
      },
      chain,
    });
    for (const action of actions) {
      if (action.kind !== "deploy" && action.kind !== "call") continue;
      const artifact = loadArtifact(action.contract);
      assert.ok(artifact, action.contract);
      if (action.kind === "deploy") {
        assertConstructor(action.contract, artifact.abi, action.args);
        const data = viem.encodeDeployData({
          abi: artifact.abi,
          bytecode: artifact.bytecode,
          args: resolveArgs(action.args, known),
        });
        assert.match(data, /^0x/);
      }
      if (action.kind === "call") {
        const data = viem.encodeFunctionData({
          abi: artifact.abi,
          functionName: action.method,
          args: resolveArgs(action.args, known),
        });
        assert.match(data, /^0x/);
      }
    }
  }
});

test("schema uid matches viem encodePacked", async () => {
  const { encodePacked, keccak256 } = await import("viem");
  const { schemaUid } = await import("../src/schema-uid.mjs");
  const { SCHEMA_PARTICIPANT, SCHEMA_KYB } = await import("../src/deploy-plan.mjs");
  const zero = "0x0000000000000000000000000000000000000000";
  for (const schema of [SCHEMA_PARTICIPANT, SCHEMA_KYB]) {
    assert.equal(schemaUid(schema), keccak256(encodePacked(["string", "address", "bool"], [schema, zero, true])));
  }
});

test("applyReceipts records the eas schema uid for the indexer", () => {
  const applied = applyReceipts({
    infra: emptyInfra(46630),
    label: emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" }),
    stepId: "eas-schema",
    receipts: [{ contract: "SchemaRegistry", schemaName: "ParticipantVerified", schema: "ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)", uid: "0xuid", txHash: "0x1" }],
    chain,
    env: {},
    params: null,
  });
  assert.equal(applied.infra.schemas.ParticipantVerified.uid, "0xuid");
});
