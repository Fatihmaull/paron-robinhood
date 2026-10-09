import { DEPLOY_STEPS, VERIFY_COMMAND } from "../src/deploy-plan.mjs";

console.log("Signing steps. Nothing is broadcast by this process.");
console.log("The deployer key is PARON_DEPLOYER_PK on the integrator machine. It is not passed on the command line.");
for (const step of DEPLOY_STEPS) {
  console.log(`\n${step.id}`);
  console.log(`  command: ${step.command}`);
  console.log(`  dry-run: ${step.command.replace("PARON_BROADCAST=1 ", "")}`);
}
console.log(`\nverify\n  command: ${VERIFY_COMMAND}`);
if (process.env.PARON_BROADCAST === "1") {
  console.error("\nThis wrapper does not broadcast. Run the command for one step.");
  process.exitCode = 2;
}
