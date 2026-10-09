import { planKeeper } from "./decide.mjs";

const dryRun = process.env.KEEPER_DRY_RUN !== "false";
const pollSeconds = Number(process.env.KEEPER_POLL_SECONDS || "60");

if (!dryRun && !process.env.KEEPER_PRIVATE_KEY) {
  console.error("KEEPER_DRY_RUN=false requires KEEPER_PRIVATE_KEY. Refusing to start.");
  process.exit(2);
}

console.log(`Paron keeper dryRun=${dryRun} pollSeconds=${pollSeconds}`);
console.log("No manifest is loaded yet, so this process does not poll a chain.");
console.log("When deployments/<chainId>/<label>.json exists, the loop reads stateOf and follows planKeeper.");
console.log("Demo rule: leave KEEPER_DRY_RUN=true. The judge sends claimDefault.");
console.log("Clock for planKeeper is wall time, deadline plus 2 seconds (D-48), not the latest block timestamp.");

const sample = planKeeper(
  [{ reqId: 2n, state: 1, ackDeadline: 100n, deliveryDeadline: 0n, disputeDeadline: 0n, rulingDeadline: 0n }],
  161,
  { dryRun: true },
);
console.log(sample[0].log);

if (process.env.KEEPER_PRIVATE_KEY && !dryRun) {
  console.error("Live send is not wired until the contracts lane publishes addresses. Staying idle.");
}
