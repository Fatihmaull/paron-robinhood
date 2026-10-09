import { bootKeeper } from "./service.mjs";
import { createLogger, secretValues } from "../log.mjs";

bootKeeper(process.env).catch((err) => {
  const log = createLogger(process.stdout, secretValues(process.env));
  log.error("keeper.refused", { error: err instanceof Error ? err.message : String(err) });
  process.exit(err && (err.code === "CHAIN_REFUSED" || err.code === "REFUSED") ? 2 : 1);
});
