// Railway start wrapper. `ponder start` refuses to boot when the Postgres schema was last used by a
// different build ("Schema was previously used by a different Ponder app"). Railway starts the new
// container while the old one still serves, so every deploy after the first failed and the old build
// kept running. Fix: one schema per git commit. Each deploy backfills into a fresh schema (about a
// minute on this testnet), then the old container is replaced. Old schemas can be dropped any time.
import { spawn } from "node:child_process";

const port = process.env.PORT || "42069";
const sha = (process.env.RAILWAY_GIT_COMMIT_SHA || process.env.SOURCE_COMMIT || "").slice(0, 8);
const schema = process.env.PONDER_SCHEMA || (process.env.DATABASE_URL && sha ? `paron_${sha}` : process.env.DATABASE_SCHEMA || "paron");

console.log(`[start] schema=${schema} port=${port}`);
const child = spawn("ponder", ["start", "--schema", schema, "--port", port], {
  stdio: "inherit",
  env: { ...process.env, PORT: port, DATABASE_SCHEMA: schema },
});
for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => child.kill(sig));
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
