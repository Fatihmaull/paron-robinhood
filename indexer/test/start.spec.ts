import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

// `ponder start` exits with "Database schema required" when no schema is given,
// which Railway shows as a 502. Keep a default in every start path.
describe("production start defaults", () => {
  it("start script goes through the per-commit schema wrapper", () => {
    const start = JSON.parse(read("package.json")).scripts.start as string;
    expect(start).toBe("node script/start.mjs");
    const w = read("script/start.mjs");
    expect(w).toContain("RAILWAY_GIT_COMMIT_SHA");
    expect(w).toContain('process.env.PORT || "42069"');
    expect(w).toContain('"--schema", schema');
  });
  it("Dockerfile defaults PORT and does not pin the schema", () => {
    const d = read("Dockerfile");
    expect(d).not.toMatch(/^ENV DATABASE_SCHEMA=/m);
    expect(d).toMatch(/^ENV PORT=42069$/m);
  });
  it("config defaults the schema instead of throwing", () => {
    const c = read("ponder.config.ts");
    expect(c).toContain('process.env.DATABASE_SCHEMA ||= "paron"');
    expect(c).not.toContain("throw new Error('DATABASE_SCHEMA");
  });
});
