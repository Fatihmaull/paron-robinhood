import assert from "node:assert/strict";
import test from "node:test";
import { emptyLabel, renderDeploymentsMarkdown } from "../src/manifest.mjs";

test("hackathon label records an open timelock executor and W-VERIFIER slot", () => {
  const label = emptyLabel({ chainId: 46630, chainKey: "robinhoodTestnet", label: "stage-1" });
  assert.equal(label.roles.timelockExecutor, "0x0000000000000000000000000000000000000000");
  assert.equal(label.roles.verifier, null);
  assert.equal(label.schemaVersion, "paron-deployments/v1");
  assert.equal("rehearsal" in label, false);
});

test("deployments markdown names the active chain and has no invented addresses", () => {
  const markdown = renderDeploymentsMarkdown({
    active: {
      chainId: 46630,
      readmeChainLine: "Deployed on Robinhood Chain Testnet (46630)",
      explorer: { url: "https://explorer.testnet.chain.robinhood.com" },
    },
    evidence: { verdict: "go", measuredAtUtc: "2026-10-09T04:20:18.521Z", path: "deployments/46630/go-nogo.json" },
    labels: [],
  });
  assert.match(markdown, /GO/);
  assert.match(markdown, /pending deploy/);
  assert.doesNotMatch(markdown, /0x1111111111111111111111111111111111111111/);
});
