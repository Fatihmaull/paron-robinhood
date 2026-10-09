const steps = [
  {
    id: "check-1-distribute",
    needs: "W-DEP key and the two funded Robinhood accounts",
    command: "node ops/scripts/seed.mjs  # step A-1 only, after PARON_BROADCAST=1",
  },
  {
    id: "check-2-deploy-verify",
    needs: "W-DEP keystore paron-deployer or DEPLOYER_PRIVATE_KEY",
    command: "forge script script/DeployAll.s.sol --sig \"run()\" --rpc-url $RH_TESTNET_RPC --account paron-deployer --broadcast --verify",
  },
  {
    id: "check-3-schema-attest",
    needs: "W-VERIFIER key (D-54). Soft fail stays on Robinhood with GATE_KIND=registry",
    command: "node ops/scripts/seed.mjs  # steps A-3 and A-4 after smoke infra exists",
  },
  {
    id: "check-4-safe",
    needs: "Fatih signs in to Safe{Wallet} on Robinhood Testnet. Soft fail: safe.mode=allowlist",
    command: "browser: create a 2-of-3 Safe and execute a 0 ETH self-transfer",
  },
  {
    id: "check-5-ponder",
    needs: "INDEXER_RPC_URL secret plus the smoke deployment. No extra signature if the event exists",
    command: "ponder dev  # indexer lane, startBlock from deployments/<chainId>/smoke-1.json",
  },
];

console.log("Smoke and go/no-go steps that sign or need a Fatih login. Nothing is broadcast by this process.");
for (const step of steps) {
  console.log(`\n${step.id}`);
  console.log(`  needs: ${step.needs}`);
  console.log(`  command: ${step.command}`);
}
if (process.env.PARON_BROADCAST === "1") {
  console.error("\nThis wrapper does not broadcast. DeployAll lives in contracts/ (lane L1).");
  process.exitCode = 2;
}
