import { buildSeedPlan } from "../src/seed-plan.mjs";

const mode = process.env.SEED_MODE || "stage";
const label = process.env.DEPLOY_LABEL || "stage-1";
const callout = process.env.SEED_CALLOUT !== "false";
const broadcast = process.env.PARON_BROADCAST === "1";

let plan;
try {
  plan = buildSeedPlan({ mode, label, callout, referenceFeed: process.env.REFERENCE_FEED === "1" });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

console.log(`Paron seed plan mode=${plan.mode} label=${plan.label} steps=${plan.steps.length}`);
for (const step of plan.steps) {
  const amount = step.amount ?? step.bondDeposit ?? step.maxCost ?? "";
  console.log(`${step.step} phase ${step.phase} signer=${step.signer} action=${step.action} ${step.symbol || step.to || ""} ${amount}`);
}

if (!broadcast) {
  console.log("Dry run. No transaction was signed. Set PARON_BROADCAST=1 and the KEY_* variables to send.");
  process.exit(0);
}

const missing = ["KEY_W_DEP", "KEY_W_VERIFIER", "KEY_W_P_JKT", "KEY_W_P_BTM", "KEY_W_P_SGP"].filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Refusing to sign. Missing ${missing.join(", ")}.`);
  process.exit(2);
}

console.error("Broadcast path is armed, but DeployAll addresses are not in deployments/ yet. Refusing to send.");
console.error("Run the contracts-lane DeployAll first, then re-run this script. It will top up to target and skip steps already onchain.");
process.exit(2);
