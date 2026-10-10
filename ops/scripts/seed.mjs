import { runCli } from "../src/deploy-run.mjs";

if (process.argv.includes("--extra")) {
  const { runExtraCli } = await import("../src/seed-extra.mjs");
  process.exit(await runExtraCli());
}

const code = await runCli("seed");
process.exit(code);
