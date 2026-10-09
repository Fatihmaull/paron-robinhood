import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { activeChain, loadChains, publicRpc, repoRoot } from "./chains.mjs";
import {
  DEPLOY_STEPS,
  DEMO_PARAMS,
  actionsFor,
  assertConstructor,
  assertParamSet,
} from "./deploy-plan.mjs";
import { buildKnown, resolveArgs } from "./encode-step.mjs";
import { missingSeedKeys, readDeployerKey, redact } from "./key.mjs";
import { applyReceipts, loadState, saveState } from "./manifest-store.mjs";

export function modeOf(env = process.env) {
  const broadcast = env.PARON_BROADCAST === "1";
  const simulate = env.PARON_SIMULATE === "1";
  if (broadcast && simulate) {
    throw new Error("Set only one of PARON_BROADCAST=1 and PARON_SIMULATE=1");
  }
  if (broadcast) return "broadcast";
  if (simulate) return "simulate";
  return "dry-run";
}

export function loadArtifact(contract, root = repoRoot()) {
  const path = resolve(root, "contracts/out", `${contract}.sol`, `${contract}.json`);
  if (!existsSync(path)) return null;
  const json = JSON.parse(readFileSync(path, "utf8"));
  const bytecode = json.bytecode?.object || json.bytecode;
  if (!bytecode || bytecode === "0x") return null;
  return { abi: json.abi || [], bytecode };
}

function paramsFrom(env) {
  const paramSet = env.PARAM_SET || "demo";
  const params = structuredClone(DEMO_PARAMS);
  if (env.MAX_FILLS_PER_TX) params.maxFillsPerTx = Number(env.MAX_FILLS_PER_TX);
  assertParamSet(paramSet, params);
  return { paramSet, params };
}

function formatAction(action) {
  if (action.kind === "seed") {
    return `seed ${action.method} signer=${action.signer} action=${action.contract} ${action.symbol || ""}`.trim();
  }
  const args = (action.args || []).map((arg) => `${arg.name}=${arg.ref || JSON.stringify(arg.value)}`).join(" ");
  if (action.kind === "roles") return `roles ${action.note}`;
  if (action.kind === "call") return `call ${action.contract}.${action.method} ${args}`.trim();
  return `deploy ${action.contract} ${args}`.trim();
}

export function describeStep(stepId, { chain, env }) {
  const meta = DEPLOY_STEPS.find((step) => step.id === stepId);
  const actions = actionsFor(stepId, { chain, env });
  const lines = [
    `${meta.title}`,
    `command: ${meta.command}`,
    `writes: ${meta.writes}`,
    "key: PARON_DEPLOYER_PK from the environment only (64 hex chars; a leading 0x is accepted). It is not printed.",
  ];
  if (stepId === "seed") {
    lines.push("Other seed signers use KEY_W_VERIFIER, KEY_W_P_JKT, KEY_W_P_BTM, KEY_W_P_SGP, and KEY_W_BUY2 or KEY_W_FEED when that step is in the plan. W-DEP uses PARON_DEPLOYER_PK.");
  }
  for (const action of actions) lines.push(formatAction(action));
  return lines;
}

function requiredArtifacts(actions) {
  const names = new Set();
  for (const action of actions) {
    if (action.kind === "deploy" || action.kind === "call") names.add(action.contract);
  }
  return [...names];
}

export async function runDeployStep(stepId, deps) {
  const env = deps.env || process.env;
  const chain = deps.chain || activeChain(loadChains(), env);
  const mode = modeOf(env);
  const lines = describeStep(stepId, { chain, env });
  if (mode === "dry-run") {
    lines.push("Dry run. No key was read. No transaction was signed.");
    return { exitCode: 0, mode, lines, send: false, wrote: false };
  }

  let key;
  try {
    key = readDeployerKey(env);
    if (stepId === "seed") {
      const signers = actionsFor("seed", { chain, env }).map((action) => action.signer);
      const missing = missingSeedKeys(signers, env);
      if (missing.length) {
        lines.push(`Refusing to sign. Missing ${missing.join(", ")}.`);
        return { exitCode: 2, mode, lines, send: false, wrote: false };
      }
    }
  } catch (err) {
    lines.push(redact(err.message, []));
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }

  const { paramSet, params } = paramsFrom(env);
  if (stepId === "core" && params.maxFillsPerTx == null) {
    lines.push("Refusing to sign. Set MAX_FILLS_PER_TX after the 01 T-02 forge snapshot.");
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }
  if (stepId === "roles" && env.PARON_SAFE_MODE !== "allowlist" && !env.SAFE_ADDRESS) {
    lines.push("Refusing to sign. Set SAFE_ADDRESS, or PARON_SAFE_MODE=allowlist after the Safe soft-fail.");
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }

  const labelName = env.DEPLOY_LABEL || "stage-1";
  const store = deps.store || { loadState, saveState };
  const state = store.loadState(chain, labelName);
  if (stepId === "mock-usdc" && state.infra.mockUsdc?.address) {
    lines.push(`mockUsdc already recorded at ${state.infra.mockUsdc.address}. Nothing sent.`);
    return { exitCode: 0, mode, lines, send: false, wrote: false };
  }
  if (stepId === "core" && state.labelExisted) {
    lines.push(`Refusing to overwrite deployments/${chain.chainId}/${labelName}.json.`);
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }
  if ((stepId === "roles" || stepId === "seed") && !state.labelExisted) {
    lines.push("Refusing to sign. Run the core command first so the label manifest exists.");
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }

  const actions = actionsFor(stepId, { chain, env });
  const loader = deps.loadArtifact || loadArtifact;
  const missing = requiredArtifacts(actions).filter((name) => !loader(name));
  if (stepId === "seed" || missing.length) {
    const why = stepId === "seed"
      ? "Seed calldata waits for contracts/out from the contracts lane."
      : `Missing bytecode for ${missing.join(", ")}.`;
    lines.push(`Refusing to ${mode}. ${why} Re-run the same command when the artifacts exist. No transaction was signed.`);
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }

  for (const action of actions) {
    if (action.kind !== "deploy") continue;
    const artifact = loader(action.contract);
    try {
      assertConstructor(action.contract, artifact.abi, action.args);
    } catch (err) {
      lines.push(redact(err.message, [key]));
      return { exitCode: 2, mode, lines, send: false, wrote: false };
    }
  }

  let account;
  try {
    account = await deps.accountFromKey(key);
  } catch (err) {
    lines.push(redact(err.message, [key]));
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }
  lines.push(`deployer: ${account.address}`);

  try {
    if (mode === "simulate") {
      const estimates = await deps.sender.simulate({
        account,
        actions,
        chain,
        env,
        params,
        loader,
        infra: state.infra,
        label: state.label,
      });
      lines.push(`Simulated ${estimates.length} transactions. Nothing was broadcast.`);
      return { exitCode: 0, mode, lines, send: false, wrote: false, estimates };
    }
    const receipts = await deps.sender.broadcast({
      account,
      actions,
      chain,
      env,
      params,
      loader,
      infra: state.infra,
      label: state.label,
    });
    const next = applyReceipts({
      infra: state.infra,
      label: state.label,
      stepId,
      receipts,
      chain,
      env: { ...env, PARAM_SET: paramSet },
      params,
    });
    store.saveState(chain, labelName, next);
    lines.push(`Wrote deployments/${chain.chainId}/infra.json and deployments/${chain.chainId}/${labelName}.json.`);
    return { exitCode: 0, mode, lines, send: true, wrote: true, receipts };
  } catch (err) {
    lines.push(redact(err.message || String(err), [key]));
    return { exitCode: 2, mode, lines, send: false, wrote: false };
  }
}

export async function accountFromKey(key) {
  try {
    const { privateKeyToAccount } = await import("viem/accounts");
    return privateKeyToAccount(key);
  } catch {
    throw new Error("npm install in ops/ before simulate or broadcast (viem 2.57.3).");
  }
}

export function printResult(result) {
  for (const line of result.lines) console.log(line);
  return result.exitCode;
}

export async function runCli(stepId, env = process.env) {
  if (!DEPLOY_STEPS.some((step) => step.id === stepId)) {
    console.error("Usage: node ops/scripts/deploy.mjs <mock-usdc|eas-schema|core|roles|seed>");
    return 1;
  }
  const chain = activeChain(loadChains(), env);
  const rpc = env[chain.rpc.primaryEnv] || publicRpc(chain);
  const result = await runDeployStep(stepId, {
    env,
    chain,
    accountFromKey,
    sender: await liveSender(rpc),
  });
  return printResult(result);
}

const ROLE_ABI = [
  {
    type: "function",
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "callerConfirmation", type: "address" },
    ],
  },
];

const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
  ADMIN_ROLE: "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775",
  PAUSER_ROLE: "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a",
  VERIFIER_ROLE: "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09",
};

async function liveSender(rpc) {
  const prepared = async (viem, account, actions, loader, env, params, infra, label) => {
    const client = viem.createPublicClient({ transport: viem.http(rpc) });
    const nonce = await client.getTransactionCount({ address: account.address });
    const known = buildKnown({
      actions,
      from: account.address,
      nonce,
      predict: (from, next) => viem.getContractAddress({ from, nonce: next }),
      env,
      params,
      infra,
    });
    const encoded = [];
    for (const action of actions) {
      if (action.kind === "roles") {
        encoded.push(...roleCalls(viem, account.address, known, env, label));
        continue;
      }
      const artifact = loader(action.contract);
      const args = resolveArgs(action.args || [], known);
      if (action.kind === "deploy") {
        encoded.push({
          action,
          to: null,
          data: viem.encodeDeployData({ abi: artifact.abi, bytecode: artifact.bytecode, args }),
        });
      } else {
        const to = known[action.contract];
        if (!to) throw new Error(`No address for ${action.contract}. Nothing was sent.`);
        encoded.push({
          action,
          to,
          data: viem.encodeFunctionData({ abi: artifact.abi, functionName: action.method, args }),
        });
      }
    }
    return { client, encoded, known };
  };

  return {
    async simulate({ account, actions, loader, env, params, infra, label }) {
      const viem = await import("viem");
      const { client, encoded } = await prepared(viem, account, actions, loader, env, params, infra, label);
      const estimates = [];
      for (const row of encoded) {
        const gas = await client.estimateGas({ account: account.address, to: row.to || undefined, data: row.data });
        estimates.push({ contract: row.action.contract, method: row.action.method || "deploy", gas: gas.toString() });
      }
      return estimates;
    },
    async broadcast({ account, actions, loader, env, params, infra, label }) {
      const viem = await import("viem");
      const { client, encoded } = await prepared(viem, account, actions, loader, env, params, infra, label);
      const wallet = viem.createWalletClient({ account, transport: viem.http(rpc) });
      const receipts = [];
      for (const row of encoded) {
        const hash = await wallet.sendTransaction({ to: row.to, data: row.data });
        const receipt = await client.waitForTransactionReceipt({ hash });
        receipts.push({
          kind: row.action.kind,
          contract: row.action.contract,
          address: receipt.contractAddress || row.to,
          txHash: hash,
          block: Number(receipt.blockNumber),
          from: account.address,
          status: receipt.status,
          schemaName: schemaName(row),
          schema: row.action.args?.find((arg) => arg.name === "schema")?.value,
        });
      }
      return receipts;
    },
  };
}

function roleCalls(viem, deployer, known, env, label) {
  const timelock = known.TimelockController;
  if (!timelock) throw new Error("Timelock address was not predicted. Nothing was sent.");
  const admin = env.PARON_SAFE_MODE === "allowlist" ? env.W_ADMIN : env.SAFE_ADDRESS;
  if (!admin) throw new Error("No account for ADMIN_ROLE. Nothing was sent.");
  const targets = Object.entries(label?.contracts || {}).filter(([, row]) => row?.address);
  if (!targets.length) throw new Error("Core addresses are not in the label manifest. Nothing was sent.");
  const rows = [];
  const callRole = (to, contract, method, role, account) => {
    rows.push({
      action: { kind: "call", contract, method, args: [] },
      to,
      data: viem.encodeFunctionData({
        abi: ROLE_ABI,
        functionName: method,
        args: method === "renounceRole" ? [role, deployer] : [role, account],
      }),
    });
  };
  for (const [name, row] of targets) {
    callRole(row.address, name, "grantRole", ROLES.DEFAULT_ADMIN_ROLE, timelock);
    callRole(row.address, name, "grantRole", ROLES.ADMIN_ROLE, admin);
    callRole(row.address, name, "grantRole", ROLES.PAUSER_ROLE, admin);
    if (name === "RegistryGate" && env.W_VERIFIER) {
      callRole(row.address, name, "grantRole", ROLES.VERIFIER_ROLE, env.W_VERIFIER);
    }
    callRole(row.address, name, "renounceRole", ROLES.DEFAULT_ADMIN_ROLE, deployer);
  }
  if (known.MockUSDC) {
    callRole(known.MockUSDC, "MockUSDC", "grantRole", ROLES.DEFAULT_ADMIN_ROLE, timelock);
    callRole(known.MockUSDC, "MockUSDC", "renounceRole", ROLES.DEFAULT_ADMIN_ROLE, deployer);
  }
  return rows;
}

function schemaName(row) {
  const schema = row.action.args?.find((arg) => arg.name === "schema")?.value;
  if (!schema) return null;
  return schema.startsWith("ParticipantVerified") ? "ParticipantVerified" : "KybApplication";
}
