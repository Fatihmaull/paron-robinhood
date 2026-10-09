import { bootTrader } from "./service.mjs";
import { createLogger, secretValues } from "../log.mjs";

const manual = process.argv.includes("--manual");
bootTrader(process.env, { manual }).catch((err) => {
  const log = createLogger(process.stdout, secretValues(process.env));
  log.error("trader.refused", { error: err instanceof Error ? err.message : String(err) });
  process.exit(err && (err.code === "CHAIN_REFUSED" || err.code === "REFUSED") ? 2 : 1);
});
