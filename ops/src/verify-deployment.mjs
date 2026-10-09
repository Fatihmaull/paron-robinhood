/** Read-only checks against a written manifest. Does not read a private key. */

const SELECTORS = {
  decimals: "0x313ce567",
  version: "0x54fd4d50",
  hasRole: "0x91d14854",
  getMinDelay: "0xf27a0c92",
};

const EXECUTOR_ROLE = "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const ZERO = "0x0000000000000000000000000000000000000000";

export function manifestProblems(infra, label) {
  const problems = [];
  if (!infra?.mockUsdc?.address) problems.push("mockUsdc address is missing");
  if (!infra?.eas?.address || infra.eas.address === "self-deploy") problems.push("eas address is missing");
  if (!infra?.schemas?.ParticipantVerified?.uid) problems.push("ParticipantVerified uid is missing");
  if (!label?.contracts || Object.keys(label.contracts).length === 0) problems.push("core contract addresses are missing");
  if (!label?.roles?.timelock) problems.push("timelock address is missing");
  if (label?.roles?.timelockExecutor && label.roles.timelockExecutor !== ZERO) {
    problems.push("timelock executor is not the zero address");
  }
  return problems;
}

async function rpc(rpcUrl, method, params, fetchImpl) {
  const response = await fetchImpl(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (body.error) throw new Error(body.error.message || "rpc error");
  return body.result;
}

function padAddress(address) {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

export async function assessDeployment({ chain, infra, label, rpc: rpcUrl, fetchImpl = fetch, params = null }) {
  const lines = [];
  const problems = manifestProblems(infra, label);
  for (const problem of problems) lines.push(`missing: ${problem}`);
  if (problems.length) return { ok: false, lines };

  const chainId = await rpc(rpcUrl, "eth_chainId", [], fetchImpl);
  if (Number(chainId) !== chain.chainId) {
    lines.push(`chain id ${chainId} does not match ${chain.chainId}`);
    return { ok: false, lines };
  }
  lines.push(`chain id ${chain.chainId}`);

  const addresses = [
    ["MockUSDC", infra.mockUsdc.address],
    ["EAS", infra.eas.address],
    ...Object.entries(label.contracts).map(([name, row]) => [name, row.address]),
  ];
  for (const [name, address] of addresses) {
    const code = await rpc(rpcUrl, "eth_getCode", [address, "latest"], fetchImpl);
    if (!code || code === "0x") {
      lines.push(`${name} has no code at ${address}`);
      return { ok: false, lines };
    }
    lines.push(`${name} code ${(code.length - 2) / 2} bytes`);
  }

  const decimals = await rpc(rpcUrl, "eth_call", [{ to: infra.mockUsdc.address, data: SELECTORS.decimals }, "latest"], fetchImpl);
  if (Number(decimals) !== 6) {
    lines.push(`MockUSDC decimals ${decimals}`);
    return { ok: false, lines };
  }
  lines.push("MockUSDC decimals 6");

  if (chain.eas?.mode === "self-deploy") {
    const version = await rpc(rpcUrl, "eth_call", [{ to: infra.eas.address, data: SELECTORS.version }, "latest"], fetchImpl);
    lines.push(`EAS version call ${version}`);
  }

  if (label.roles.timelock && params?.timelockDelay != null) {
    const delay = await rpc(rpcUrl, "eth_call", [{ to: label.roles.timelock, data: SELECTORS.getMinDelay }, "latest"], fetchImpl);
    const got = Number(delay);
    if (got !== params.timelockDelay) {
      lines.push(`timelock delay ${got}, expected ${params.timelockDelay}`);
      return { ok: false, lines };
    }
    lines.push(`timelock delay ${got}`);
    const data = SELECTORS.hasRole + EXECUTOR_ROLE.slice(2) + padAddress(ZERO);
    const open = await rpc(rpcUrl, "eth_call", [{ to: label.roles.timelock, data }, "latest"], fetchImpl);
    if (BigInt(open) !== 1n) {
      lines.push("timelock EXECUTOR_ROLE is not open");
      return { ok: false, lines };
    }
    lines.push("timelock executor is open");
  }

  lines.push("Read-only verification passed. No key was read.");
  return { ok: true, lines };
}
