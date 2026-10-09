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
    "No stage or rehearsal deployment is in this repository yet. Contract addresses appear here after `DeployAll` (contracts lane) and `ops/scripts/seed.mjs` run with a testnet key.",
    "",
    "## Address table",
    "",
    "| Chain | Label | Contract | Address | Verified | Explorer |",
    "|---|---|---|---|---|---|",
  ];
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
