import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync(new URL("./api.ts", import.meta.url), "utf8");
const indexer = readFileSync(new URL("../../indexer/src/api/create-app.ts", import.meta.url), "utf8");

const routes = [...indexer.matchAll(/app\.get\("\/v1(\/[^"]*)"/g)].map((m) => m[1]);
const toRegex = (route: string) => new RegExp(`^${route.replace(/:[A-Za-z]+/g, "[^/]+")}$`);

// Every string/template literal in api.ts that looks like an API path ("/segment...").
const paths = [...api.matchAll(/["`](\/[a-z][^"`\s]*)["`]/g)].map((m) => m[1].replace(/\$\{[^}]*\}/g, "x").split("?")[0]);

test("indexer route list is parsed", () => {
  assert.ok(routes.length > 15, `parsed ${routes.length} routes`);
  assert.ok(paths.length > 8, `found ${paths.length} web paths`);
});

for (const path of new Set(paths)) {
  test(`web API path ${path} exists in the indexer`, () => {
    assert.ok(routes.some((route) => toRegex(route).test(path)), `${path} is not an indexer route`);
  });
}
