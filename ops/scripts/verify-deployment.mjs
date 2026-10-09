import { activeChain, loadChains, publicRpc } from "../src/chains.mjs";
import { labelPath, readJson, infraPath } from "../src/manifest-store.mjs";
import { assessDeployment } from "../src/verify-deployment.mjs";

const env = process.env;
const config = loadChains();
const chain = activeChain(config, env);
const labelName = env.DEPLOY_LABEL || "stage-1";
const infra = readJson(infraPath(chain.chainId));
const label = readJson(labelPath(chain.chainId, labelName));

if (!infra || !label) {
  console.error(`No manifest at deployments/${chain.chainId}/ for label ${labelName}.`);
  console.error("Run the deploy commands in DEPLOYMENTS.md first. This check does not sign.");
  process.exit(1);
}

const rpc = env[chain.rpc.primaryEnv] || publicRpc(chain);
const result = await assessDeployment({ chain, infra, label, rpc, params: label.params });
for (const line of result.lines) console.log(line);
process.exit(result.ok ? 0 : 2);
