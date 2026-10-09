import { runCli } from "../src/deploy-run.mjs";

const code = await runCli(process.argv[2]);
process.exit(code);
