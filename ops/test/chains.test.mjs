import assert from "node:assert/strict";
import test from "node:test";
import { activeChain, loadChains } from "../src/chains.mjs";

test("the locked chain is Robinhood Chain Testnet", () => {
  const config = loadChains();
  assert.equal(config.active, "robinhoodTestnet");
  assert.equal(config.goNoGo.verdict, "go");
  const chain = activeChain(config, {});
  assert.equal(chain.chainId, 46630);
  assert.equal(chain.eas.mode, "self-deploy");
  assert.equal(chain.safe.mode, "ui");
  assert.equal(config.chains.arbitrumSepolia.eas.address, "0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE");
  assert.equal(config.chains.arbitrumSepolia.safe.mode, "allowlist");
});
