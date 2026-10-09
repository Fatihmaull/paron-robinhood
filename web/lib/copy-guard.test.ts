import assert from "node:assert/strict";
import { test } from "node:test";
import { repoRoot, scanRoot } from "../../script/copy-guard.mjs";

test("web/ and README carry no affiliation or banned wording", () => {
  assert.deepEqual(scanRoot(repoRoot), []);
});
