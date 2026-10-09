import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadChains, repoRoot } from "../src/chains.mjs";
import { measureChain } from "../src/measure.mjs";
import { assessChain, selectActiveKey } from "../src/verdict.mjs";

const config = loadChains();
const primary = config.chains.robinhoodTestnet;
const fallback = config.chains.arbitrumSepolia;
const primaryMeasure = await measureChain(primary);
const fallbackMeasure = await measureChain(fallback);
const decision = selectActiveKey(
  { ...primaryMeasure, key: primary.key },
  { ...fallbackMeasure, key: fallback.key },
);

function writeEvidence(measurement, verdict) {
  const dir = resolve(repoRoot(), "deployments", String(measurement.expectedChainId));
  mkdirSync(dir, { recursive: true });
  const body = {
    schemaVersion: "paron-go-nogo/v1",
    verdict: verdict.verdict,
    blockers: verdict.blockers,
    signedChecks: "pending-key",
    measurement,
  };
  const path = resolve(dir, "go-nogo.json");
  writeFileSync(path, `${JSON.stringify(body, null, 2)}\n`);
  return path;
}

const primaryVerdict = assessChain(primaryMeasure);
const fallbackVerdict = assessChain(fallbackMeasure);
writeEvidence(primaryMeasure, primaryVerdict);
writeEvidence(fallbackMeasure, fallbackVerdict);

const summary = {
  decision,
  robinhood: {
    verdict: primaryVerdict.verdict,
    chainId: primaryMeasure.chainId,
    blockNumber: primaryMeasure.blockNumber,
    tipAgeSeconds: primaryMeasure.tipAgeSeconds,
    gasPriceGwei: primaryMeasure.gasPriceGwei,
    blocksAdvanced: primaryMeasure.productionWatch?.blocksAdvanced,
    watchSeconds: primaryMeasure.productionWatch?.seconds,
    arbOSVersion: primaryMeasure.calls?.arbOSVersion,
    easPredeployed: primaryMeasure.easPredeployedAtArbAddress,
    safeConfigStatus: primaryMeasure.safeConfig?.status,
  },
  arbitrumSepolia: {
    verdict: fallbackVerdict.verdict,
    chainId: fallbackMeasure.chainId,
    gasPriceGwei: fallbackMeasure.gasPriceGwei,
    easVersion: fallbackMeasure.calls?.easArb?.version ?? null,
  },
};
console.log(JSON.stringify(summary, null, 2));
if (decision.switched) {
  console.error("Primary chain failed read-only checks. Set config/chains.json active to", decision.active);
  process.exitCode = 2;
}
