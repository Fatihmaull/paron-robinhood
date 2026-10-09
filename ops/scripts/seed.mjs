import { runCli } from "../src/deploy-run.mjs";

const code = await runCli("seed");
process.exit(code);
