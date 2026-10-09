import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadChains, repoRoot } from "../src/chains.mjs";
import { renderDeploymentsMarkdown } from "../src/manifest.mjs";

const config = loadChains();
const active = config.chains[config.active];
const markdown = renderDeploymentsMarkdown({
  active,
  evidence: {
    verdict: config.goNoGo.verdict,
    measuredAtUtc: config.goNoGo.measuredAtUtc,
    path: config.goNoGo.evidence,
  },
  labels: [],
});
const path = resolve(repoRoot(), "DEPLOYMENTS.md");
writeFileSync(path, markdown);
console.log(`Wrote ${path}`);
