import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

// `ponder start` exits with "Database schema required" when no schema is given,
// which Railway shows as a 502. Keep a default in every start path.
describe("production start defaults", () => {
  it("start script passes a schema (default paron) and PORT", () => {
    const start = JSON.parse(read("package.json")).scripts.start as string;
    expect(start).toContain("--schema ${DATABASE_SCHEMA:-paron}");
    expect(start).toContain("--port ${PORT:-42069}");
  });
  it("Dockerfile defaults DATABASE_SCHEMA and PORT", () => {
    const d = read("Dockerfile");
    expect(d).toMatch(/^ENV DATABASE_SCHEMA=paron$/m);
    expect(d).toMatch(/^ENV PORT=42069$/m);
  });
  it("config defaults the schema instead of throwing", () => {
    const c = read("ponder.config.ts");
    expect(c).toContain('process.env.DATABASE_SCHEMA ||= "paron"');
    expect(c).not.toContain("throw new Error('DATABASE_SCHEMA");
  });
});
