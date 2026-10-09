import { DEPLOY_STEPS, VERIFY_COMMAND } from "./deploy-plan.mjs";

export const SCHEMA_VERSION = "paron-deployments/v1";

export function emptyInfra(chainId) {
  return {
    schemaVersion: SCHEMA_VERSION,
    chainId,
    mockUsdc: null,
    eas: null,
    schemas: {
      ParticipantVerified: null,
      KybApplication: null,
    },
    safe: null,
    kyb: { attester: null, attestations: [] },
  };
}

export function emptyLabel({ chainId, chainKey, label, paramSet = "demo" }) {
  return {
    schemaVersion: SCHEMA_VERSION,
    label,
    chainId,
    chainKey,
    paramSet,
    params: null,
    deployer: null,
    nonceStart: null,
    git: { commit: null, dirty: null },
    toolchain: {
      forge: "1.8.5",
      solc: ["0.8.37", "0.8.29"],
      ozVersion: "5.6.1",
      easContracts: "1.9.0",
      forgeStd: null,
    },
    startBlock: null,
    deployedAt: null,
    infraRef: "infra.json",
    contracts: {},
    roles: {
      timelock: null,
      safe: null,
      treasury: null,
      panelMembers: [],
      panelThreshold: 2,
      feedSigner: null,
      minter: null,
      adminMode: chainId === 46630 ? "safe" : "allowlist",
      verifier: null,
      adminEoa: null,
      timelockProposers: [],
      timelockExecutor: "0x0000000000000000000000000000000000000000",
    },
    seed: {
      mode: null,
      phasesCompleted: [],
      actors: {},
      series: {},
      orders: {},
      attestations: {},
      reference: {},
    },
    log: [],
  };
}

export function renderDeploymentsMarkdown({ active, evidence, labels = [] }) {
  const lines = [
    "# Paron deployments",
    "",
    "Generated from `deployments/`. Do not edit addresses by hand.",
    "",
    `Active chain: **${active.readmeChainLine}**`,
    "",
    `Go/no-go: **${evidence.verdict.toUpperCase()}** on ${evidence.measuredAtUtc} (read-only). Evidence: \`${evidence.path}\`.`,
    "",
    "No stage deployment has been written yet. The integrator runs the commands below from a trusted machine. This agent does not receive the deployer key.",
    "",
    "## Commands",
    "",
    "Set `PARON_DEPLOYER_PK` in the environment of that machine (64 hex characters, no `0x` prefix; a leading `0x` is accepted). Do not put the key on the command line. The scripts read it only from the environment and never print it.",
    "",
    "The same command with `PARON_BROADCAST` unset is a dry run (no key read, nothing signed). Replace `PARON_BROADCAST=1` with `PARON_SIMULATE=1` to estimate gas and not broadcast.",
    "",
    "Run in this order. Each line is one step. Timelock is deployed in the roles step, immediately before the grants, because no core constructor takes its address. `setArbitratorAllowed` stays in the core step, while the deployer is still admin.",
    "",
  ];
  DEPLOY_STEPS.forEach((step, index) => {
    lines.push(`${index + 1}. \`${step.command}\``);
    lines.push(`   ${step.title}. Writes \`${step.writes}\`.`);
  });
  lines.push(
    "",
    "Before step 4, create the 2-of-3 Safe in Safe{Wallet} and export `SAFE_ADDRESS`. If that soft-fails, set `PARON_SAFE_MODE=allowlist` instead. `maxFillsPerTx` is read from `config/params`. `MAX_FILLS_PER_TX` overrides it. Seed signers other than the deployer use `KEY_W_VERIFIER`, `KEY_W_P_JKT`, `KEY_W_P_BTM`, `KEY_W_P_SGP`, `KEY_W_BUY`, `KEY_W_TRD`, plus `KEY_W_BUY2` or `KEY_W_FEED` when that action is in the plan.",
    "",
    `Then, read-only, no key: \`${VERIFY_COMMAND}\``,
    "",
    "L2 and L3 read `deployments/<chainId>/infra.json` and `deployments/<chainId>/<label>.json` (`paron-deployments/v1`).",
    "",
    "## Address table",
    "",
    "| Chain | Label | Contract | Address | Verified | Explorer |",
    "|---|---|---|---|---|---|",
  );
  if (labels.length === 0) {
    lines.push(`| ${active.chainId} | — | — | pending deploy | — | ${active.explorer.url} |`);
  }
  for (const label of labels) {
    const contracts = label.contracts || {};
    const names = Object.keys(contracts);
    if (names.length === 0) {
      lines.push(`| ${label.chainId} | ${label.label} | — | pending | — | ${active.explorer.url} |`);
    }
    for (const name of names) {
      const row = contracts[name];
      lines.push(`| ${label.chainId} | ${label.label} | ${name} | \`${row.address}\` | ${row.verified ? "yes" : "no"} | ${row.explorerUrl || ""} |`);
    }
  }
  lines.push(
    "",
    "## Roles the hackathon deployment records",
    "",
    "- `VERIFIER_ROLE` and the EAS attester are `W-VERIFIER` (D-54).",
    "- Timelock proposers are the Safe and `W-ADMIN`. Executor is the zero address, so any account can execute after the delay.",
    "- `MINTER_ROLE` on MockUSDC stays with `W-DEP` until after Demo Day.",
    "",
    "Series `CU-JKT-H100-2610` is forged live on stage. It is absent from the stage manifest on purpose.",
    "",
  );
  return lines.join("\n");
}
