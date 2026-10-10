import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getAddress } from "viem";
import { shortAddress } from "./format.ts";
import { simulationRequest } from "./tx-sim.ts";

const CALLER = "0x3F8fBCD4b4196Ea3c1c020F09Fc9a590bB246ae9" as const;
const ZERO = "0x0000000000000000000000000000000000000000";

test("contract simulation uses the connected account, not the zero address", () => {
  const request = {
    address: "0x00000000000000000000000000000000000000a1" as const,
    functionName: "faucet",
    args: [] as const,
  };
  const call = simulationRequest(request, CALLER);
  assert.equal(call.account, CALLER);
  assert.notEqual(call.account.toLowerCase(), ZERO);
  assert.equal(call.functionName, "faucet");
  assert.equal(call.address, request.address);
  const tx = readFileSync(new URL("../components/tx.tsx", import.meta.url), "utf8");
  assert.match(tx, /simulateContract\(simulationRequest\(request, address\)/);
  assert.equal(tx.includes("simulateContract(args)"), false);
});

test("header addresses keep a lowercase 0x prefix", () => {
  const checksum = getAddress("0xa1fa0000000000000000000000000000000095df");
  const short = shortAddress(checksum.toLowerCase());
  assert.match(short, /^0xA1FA…/);
  assert.equal(short.startsWith("0X"), false);
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const landing = readFileSync(new URL("../app/landing.css", import.meta.url), "utf8");
  const tour = readFileSync(new URL("../components/landing/tour-screens.tsx", import.meta.url), "utf8");
  assert.match(css, /\.nav-wallet[\s\S]*text-transform:\s*none/);
  assert.match(landing, /\.m-wallet[\s\S]*text-transform:\s*none/);
  assert.match(landing, /\.c-p[\s\S]*text-transform:\s*none/);
  assert.match(tour, /0xA1FA…95DF/);
  assert.equal(tour.includes("0XA1FA"), false);
});

test("faucet shows tx status, and Place order stays shut on the wrong network", () => {
  const ops = readFileSync(new URL("../components/ops.tsx", import.meta.url), "utf8");
  const series = readFileSync(new URL("../components/series-view.tsx", import.meta.url), "utf8");
  const tx = readFileSync(new URL("../components/tx.tsx", import.meta.url), "utf8");
  assert.match(ops, /<TxStatus record=\{record\} \/>/);
  assert.match(series, /disabled=\{wrongNetwork\}/);
  assert.match(series, /Place order/);
  assert.match(tx, /step: label/);
  assert.match(tx, /record\.step/);
});
