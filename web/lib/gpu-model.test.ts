import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { keccak256, stringToHex, toBytes } from "viem";
import { gpuModelId } from "./gpu-model.ts";

const H100 = "H100-SXM-80GB";

test("gpu model id is keccak256 of the raw name, not a padded hex string", () => {
  assert.equal(gpuModelId(H100), keccak256(toBytes(H100)));
  assert.equal(gpuModelId(H100), "0x6273682290aae97d07a2b6fb8e1c4bea67de8d0c92bbe970b9d8eccc869df185");
  assert.notEqual(gpuModelId(H100), stringToHex(H100, { size: 32 }));
  assert.equal(gpuModelId("A100-SXM-80GB"), keccak256(toBytes("A100-SXM-80GB")));
});

test("contract lookups use the keccak key and setFactor keeps the padded A100 key", () => {
  const wizard = readFileSync(new URL("../components/wizard.tsx", import.meta.url), "utf8");
  const onchain = readFileSync(new URL("./onchain.ts", import.meta.url), "utf8");
  const ops = readFileSync(new URL("../components/ops.tsx", import.meta.url), "utf8");

  assert.match(wizard, /gpuModel: gpuModelId\(draft\.gpu\)/);
  assert.match(wizard, /factorOf",\s*args: \[gpuModelId\(draft\.gpu\)\]/);
  assert.match(onchain, /const key = gpuModelId\(gpu\)/);
  assert.match(ops, /functionName: "poke", args: \[gpuModelId\("H100-SXM-80GB"\)\]/);
  assert.match(ops, /const gpu = stringToHex\("A100-SXM-80GB", \{ size: 32 \}\)/);
  assert.equal(ops.includes('gpuModelId("A100-SXM-80GB")'), false);
});
