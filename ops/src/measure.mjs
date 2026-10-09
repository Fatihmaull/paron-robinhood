const ADDR = {
  safeL2: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
  safe: "0x41675C099F32341bf84BFc5382aF534df5C7461a",
  proxyFactory: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
  fallbackHandler: "0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99",
  multiSend: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
  multiSendCallOnly: "0x9641d764fc13c8B624c04430C7356C1C7C8102e2",
  signMessageLib: "0xd53cd0aB83D845Ac265BE939c57F53AD838012c9",
  createCall: "0x9b35Af71d77eaf8d7e40252370304687390A1A52",
  simulateTxAccessor: "0x3d4BA2E0884aa488718476ca2FB8Efc291A46199",
  multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
  create2Deployer: "0x4e59b44847b379578588920cA78FbF26c0B4956C",
  usdgTest: "0x7E955252E15c84f5768B83c41a71F9eba181802F",
  wethRh: "0x7943e237c7F95DA44E0301572D358911207852Fa",
  easArb: "0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE",
  schemaRegistryArb: "0x45CB6Fa0870a8Af06796Ac15915619a0f22cd475",
  eip712ProxyArb: "0x8E807011c16E538B2dEEf1dc652EFe7724E09397",
  circleUsdcArb: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  anvilDev: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  arbSys: "0x0000000000000000000000000000000000000064",
};

const SEL = {
  version: "0x54fd4d50",
  name: "0x06fdde03",
  decimals: "0x313ce567",
  symbol: "0x95d89b41",
  arbOSVersion: "0x051038f2",
  getSchemaRegistry: "0xf10b5cc8",
};

async function rpc(url, method, params, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 240) };
    }
    return { ok: res.ok, status: res.status, ms: Date.now() - started, json };
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - started, error: String(err.name || err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

function decodeString(data) {
  if (!data || data === "0x" || data.length < 130) return null;
  const hex = data.slice(2);
  const offset = Number(BigInt(`0x${hex.slice(0, 64)}`));
  const len = Number(BigInt(`0x${hex.slice(offset * 2, offset * 2 + 64)}`));
  const strHex = hex.slice(offset * 2 + 64, offset * 2 + 64 + len * 2);
  return Buffer.from(strHex, "hex").toString("utf8");
}

function codeBytes(code) {
  if (!code || code === "0x") return 0;
  return (code.length - 2) / 2;
}

async function httpGet(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, ms: Date.now() - started, body: text.slice(0, 280) };
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - started, error: String(err.name || err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function measureChain(chain) {
  const out = {
    key: chain.key,
    rpc: chain.rpc.public,
    expectedChainId: chain.chainId,
    measuredAtUtc: new Date().toISOString(),
  };
  const id = await rpc(chain.rpc.public, "eth_chainId", []);
  out.rpcReachable = Boolean(id.json?.result);
  out.rpcMs = id.ms;
  out.rpcError = id.error || id.json?.error || null;
  out.chainIdHex = id.json?.result ?? null;
  out.chainId = out.chainIdHex ? Number(BigInt(out.chainIdHex)) : null;
  out.chainIdOk = out.chainId === chain.chainId;

  const [bn, gas, sync, prio] = await Promise.all([
    rpc(chain.rpc.public, "eth_blockNumber", []),
    rpc(chain.rpc.public, "eth_gasPrice", []),
    rpc(chain.rpc.public, "eth_syncing", []),
    rpc(chain.rpc.public, "eth_maxPriorityFeePerGas", []),
  ]);
  out.blockNumber = bn.json?.result ? Number(BigInt(bn.json.result)) : null;
  out.gasPriceWei = gas.json?.result ? BigInt(gas.json.result).toString() : null;
  out.gasPriceGwei = out.gasPriceWei ? Number(out.gasPriceWei) / 1e9 : null;
  out.maxPriorityFeeWei = prio.json?.result ? BigInt(prio.json.result).toString() : null;
  out.syncing = sync.json?.result ?? null;

  const latest = await rpc(chain.rpc.public, "eth_getBlockByNumber", ["latest", false]);
  const block = latest.json?.result;
  if (block) {
    out.latest = {
      number: Number(BigInt(block.number)),
      timestamp: Number(BigInt(block.timestamp)),
      hash: block.hash,
      txCount: (block.transactions || []).length,
      baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas).toString() : null,
    };
    out.tipAgeSeconds = Math.floor(Date.now() / 1000) - out.latest.timestamp;
  } else {
    out.latest = null;
    out.tipAgeSeconds = null;
  }

  if (out.blockNumber) {
    const idxs = Array.from({ length: 20 }, (_, i) => out.blockNumber - i);
    const blocks = await Promise.all(
      idxs.map((n) => rpc(chain.rpc.public, "eth_getBlockByNumber", [`0x${n.toString(16)}`, false])),
    );
    const stamps = blocks
      .map((item) => item.json?.result)
      .filter(Boolean)
      .map((row) => ({
        number: Number(BigInt(row.number)),
        timestamp: Number(BigInt(row.timestamp)),
        tx: (row.transactions || []).length,
      }))
      .sort((a, b) => a.number - b.number);
    const deltas = [];
    for (let i = 1; i < stamps.length; i += 1) deltas.push(stamps[i].timestamp - stamps[i - 1].timestamp);
    deltas.sort((a, b) => a - b);
    const spanSeconds = stamps.length ? stamps.at(-1).timestamp - stamps[0].timestamp : null;
    const spanBlocks = stamps.length ? stamps.at(-1).number - stamps[0].number : null;
    out.cadence = {
      samples: stamps.length,
      spanBlocks,
      spanSeconds,
      blocksPerSecond: spanSeconds > 0 ? spanBlocks / spanSeconds : null,
      deltaMin: deltas[0] ?? null,
      deltaMax: deltas.at(-1) ?? null,
      deltaMedian: deltas.length ? deltas[Math.floor(deltas.length / 2)] : null,
      zeroDeltaCount: deltas.filter((d) => d === 0).length,
    };
  }

  const startBlock = out.blockNumber;
  const watchStarted = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const again = await rpc(chain.rpc.public, "eth_blockNumber", []);
  const endBlock = again.json?.result ? Number(BigInt(again.json.result)) : null;
  out.productionWatch = {
    seconds: (Date.now() - watchStarted) / 1000,
    startBlock,
    endBlock,
    advanced: endBlock != null && startBlock != null && endBlock > startBlock,
    blocksAdvanced: endBlock != null && startBlock != null ? endBlock - startBlock : null,
  };

  const names = Object.keys(ADDR);
  const codes = await Promise.all(names.map((name) => rpc(chain.rpc.public, "eth_getCode", [ADDR[name], "latest"])));
  out.codes = {};
  names.forEach((name, index) => {
    const code = codes[index].json?.result ?? null;
    const bytes = codeBytes(code);
    out.codes[name] = {
      address: ADDR[name],
      bytes,
      hasCode: bytes > 0,
      eip7702: typeof code === "string" && code.startsWith("0xef0100"),
    };
  });

  async function call(to, data) {
    const response = await rpc(chain.rpc.public, "eth_call", [{ to, data }, "latest"]);
    return response.json?.result ?? null;
  }
  out.calls = {};
  if (out.codes.arbSys.hasCode) {
    const version = await call(ADDR.arbSys, SEL.arbOSVersion);
    out.calls.arbOSVersion = typeof version === "string" ? Number(BigInt(version)) : null;
  }
  for (const key of ["easArb", "schemaRegistryArb", "usdgTest", "circleUsdcArb"]) {
    if (!out.codes[key].hasCode) {
      out.calls[key] = null;
      continue;
    }
    const version = await call(ADDR[key], SEL.version);
    const name = await call(ADDR[key], SEL.name);
    const decimals = await call(ADDR[key], SEL.decimals);
    const symbol = await call(ADDR[key], SEL.symbol);
    const rec = {
      version: typeof version === "string" && version.length > 66 ? decodeString(version) : null,
      name: typeof name === "string" ? decodeString(name) : null,
      symbol: typeof symbol === "string" ? decodeString(symbol) : null,
      decimals: typeof decimals === "string" && decimals !== "0x" ? Number(BigInt(decimals)) : null,
    };
    if (key === "easArb") {
      const registry = await call(ADDR.easArb, SEL.getSchemaRegistry);
      rec.schemaRegistry = typeof registry === "string" ? `0x${registry.slice(-40)}` : null;
    }
    out.calls[key] = rec;
  }

  if (out.blockNumber) {
    const from = `0x${(out.blockNumber - 2).toString(16)}`;
    const logs = await rpc(chain.rpc.public, "eth_getLogs", [
      { fromBlock: from, toBlock: "latest", address: ADDR.multicall3 },
    ]);
    out.getLogs = { ok: Array.isArray(logs.json?.result), ms: logs.ms, error: logs.json?.error || logs.error || null };
    const old = await rpc(chain.rpc.public, "eth_getBlockByNumber", [
      `0x${Math.max(1, out.blockNumber - 500000).toString(16)}`,
      false,
    ]);
    out.historicalBlockOffset500000 = Boolean(old.json?.result?.number);
  }

  const [safeConfig, safeTx, explorer] = await Promise.all([
    httpGet(chain.safe?.txService === false
      ? "https://safe-config.safe.global/api/v1/chains/421614/"
      : `https://safe-config.safe.global/api/v1/chains/${chain.chainId}/`),
    httpGet(chain.key === "robinhoodTestnet"
      ? "https://api.safe.global/tx-service/robinhood-testnet/api/v1/about/"
      : "https://api.safe.global/tx-service/arbitrum-sepolia/api/v1/about/"),
    httpGet(chain.explorer.url),
  ]);
  out.safeConfig = { status: safeConfig.status, ok: safeConfig.ok, snippet: safeConfig.body || safeConfig.error };
  out.safeTxService = { status: safeTx.status, ok: safeTx.ok, snippet: safeTx.body || safeTx.error };
  out.explorer = { url: chain.explorer.url, status: explorer.status, ok: explorer.ok };
  out.easPredeployedAtArbAddress = Boolean(out.codes.easArb.hasCode);
  return out;
}
