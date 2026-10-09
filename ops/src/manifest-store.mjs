import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { repoRoot } from "./chains.mjs";
import { emptyInfra, emptyLabel } from "./manifest.mjs";

export function infraPath(chainId, root = repoRoot()) {
  return resolve(root, "deployments", String(chainId), "infra.json");
}

export function labelPath(chainId, label, root = repoRoot()) {
  return resolve(root, "deployments", String(chainId), `${label}.json`);
}

export function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function explorerUrl(chain, address) {
  const base = chain.explorer?.url?.replace(/\/$/, "") || "";
  return address ? `${base}/address/${address}` : "";
}

export function applyReceipts({ infra, label, stepId, receipts, chain, env, params }) {
  const nextInfra = structuredClone(infra);
  const nextLabel = structuredClone(label);
  nextLabel.log = nextLabel.log || [];
  for (const receipt of receipts) {
    nextLabel.log.push({
      step: stepId,
      txHash: receipt.txHash || null,
      status: receipt.status || "sent",
    });
    if (stepId === "mock-usdc" && receipt.contract === "MockUSDC") {
      nextInfra.mockUsdc = {
        address: receipt.address,
        txHash: receipt.txHash,
        block: receipt.block,
        verified: false,
        minter: receipt.from,
      };
    }
    if (stepId === "eas-schema" && receipt.contract === "EAS") {
      nextInfra.eas = {
        mode: chain.eas?.mode || "self-deploy",
        address: receipt.address,
        schemaRegistry: receipt.schemaRegistry || null,
        version: chain.eas?.version || null,
        txHashes: [receipt.txHash],
        verified: false,
      };
    }
    if (stepId === "eas-schema" && receipt.schemaName) {
      nextInfra.schemas[receipt.schemaName] = {
        uid: receipt.uid,
        schema: receipt.schema,
        revocable: true,
        resolver: "0x0000000000000000000000000000000000000000",
        txHash: receipt.txHash,
      };
    }
    if (receipt.kind === "deploy" && (stepId === "core" || stepId === "roles")) {
      nextLabel.contracts[receipt.contract] = {
        address: receipt.address,
        txHash: receipt.txHash,
        block: receipt.block,
        verified: false,
        explorerUrl: explorerUrl(chain, receipt.address),
      };
    }
  }
  if (stepId === "eas-schema" && chain.eas?.mode === "existing") {
    nextInfra.eas = {
      mode: "existing",
      address: chain.eas.address,
      schemaRegistry: chain.eas.schemaRegistry,
      version: chain.eas.version || null,
      txHashes: receipts.map((row) => row.txHash).filter(Boolean),
      verified: true,
    };
  }
  if (stepId === "core") {
    nextLabel.deployer = receipts[0]?.from || null;
    nextLabel.paramSet = env.PARAM_SET || "demo";
    nextLabel.params = params;
    const first = receipts.find((row) => row.block != null);
    nextLabel.startBlock = first?.block ?? null;
    nextLabel.deployedAt = { block: first?.block ?? null, timestampUtc: new Date().toISOString() };
    nextLabel.nonceStart = receipts[0]?.nonce ?? null;
  }
  if (stepId === "roles") {
    const timelock = receipts.find((row) => row.contract === "TimelockController");
    nextLabel.roles.timelock = timelock?.address || nextLabel.roles.timelock;
    nextLabel.roles.safe = env.SAFE_ADDRESS || null;
    nextLabel.roles.treasury = env.TREASURY_ADDRESS || env.SAFE_ADDRESS || null;
    nextLabel.roles.verifier = env.W_VERIFIER || null;
    nextLabel.roles.adminEoa = env.W_ADMIN || null;
    nextLabel.roles.minter = nextLabel.deployer;
    nextLabel.roles.adminMode = env.PARON_SAFE_MODE === "allowlist" ? "allowlist" : nextLabel.roles.adminMode;
    nextLabel.roles.timelockExecutor = "0x0000000000000000000000000000000000000000";
    nextLabel.roles.timelockProposers = [env.SAFE_ADDRESS, env.W_ADMIN].filter(Boolean);
    nextLabel.roles.panelMembers = [env.W_ARB_1, env.W_ARB_2, env.W_ARB_3].filter(Boolean);
    if (env.PARON_SAFE_MODE === "allowlist") {
      nextLabel.roles.timelockProposers = [env.W_ADMIN, env.TEAM_EOA_1, env.TEAM_EOA_2].filter(Boolean);
    }
    nextInfra.safe = env.SAFE_ADDRESS
      ? {
          address: env.SAFE_ADDRESS,
          owners: [],
          threshold: 2,
          createdVia: "ui",
          testTxHash: null,
        }
      : nextInfra.safe;
  }
  if (stepId === "seed") {
    nextLabel.seed.mode = env.SEED_MODE || "stage";
    nextLabel.seed.phasesCompleted = [1, 2];
  }
  return { infra: nextInfra, label: nextLabel };
}

export function loadState(chain, labelName) {
  const infra = readJson(infraPath(chain.chainId)) || emptyInfra(chain.chainId);
  const existing = readJson(labelPath(chain.chainId, labelName));
  const label =
    existing ||
    emptyLabel({
      chainId: chain.chainId,
      chainKey: chain.key,
      label: labelName,
      paramSet: "demo",
    });
  return { infra, label, labelExisted: Boolean(existing) };
}

export function saveState(chain, labelName, state) {
  writeJson(infraPath(chain.chainId), state.infra);
  writeJson(labelPath(chain.chainId, labelName), state.label);
}
