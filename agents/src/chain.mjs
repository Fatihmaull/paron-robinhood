import { assertMaySign, assertRemoteChainId } from "./config.mjs";

const seriesAbi = [
  {
    type: "function",
    name: "getSeries",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [
      {
        name: "s",
        type: "tuple",
        components: [
          { name: "provider", type: "address" },
          { name: "token", type: "address" },
          { name: "gpuModel", type: "bytes32" },
          { name: "factor", type: "uint32" },
          { name: "gpuHours", type: "uint64" },
          { name: "maxSupply", type: "uint256" },
          { name: "primaryPrice", type: "uint256" },
          { name: "bondPerCU", type: "uint256" },
          { name: "windowStart", type: "uint64" },
          { name: "windowEnd", type: "uint64" },
          { name: "ackWindow", type: "uint64" },
          { name: "deliveryWindow", type: "uint64" },
          { name: "disputeWindow", type: "uint64" },
          { name: "minRedemption", type: "uint256" },
          { name: "arbitrator", type: "address" },
          { name: "specHash", type: "bytes32" },
          { name: "termsHash", type: "bytes32" },
          { name: "country", type: "bytes2" },
          { name: "continent", type: "uint8" },
          { name: "institutional", type: "bool" },
          { name: "symbol", type: "string" },
          { name: "paused", type: "bool" },
          { name: "finalized", type: "bool" },
          { name: "soldSupply", type: "uint256" },
        ],
      },
    ],
  },
];

const redemptionAbi = [
  { type: "function", name: "nextReqId", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "stateOf", stateMutability: "view", inputs: [{ name: "reqId", type: "uint256" }], outputs: [{ name: "", type: "uint8" }] },
  {
    type: "function",
    name: "getRequest",
    stateMutability: "view",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "seriesId", type: "uint256" },
          { name: "holder", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deliveryRef", type: "bytes32" },
          { name: "receiptHash", type: "bytes32" },
          { name: "state", type: "uint8" },
          { name: "requestedAt", type: "uint64" },
          { name: "ackDeadline", type: "uint64" },
          { name: "deliveryDeadline", type: "uint64" },
          { name: "disputeDeadline", type: "uint64" },
          { name: "rulingDeadline", type: "uint64" },
          { name: "disputeBond", type: "uint256" },
        ],
      },
    ],
  },
  { type: "function", name: "claimDefault", stateMutability: "nonpayable", inputs: [{ name: "reqId", type: "uint256" }], outputs: [] },
  { type: "function", name: "finalizeRedemption", stateMutability: "nonpayable", inputs: [{ name: "reqId", type: "uint256" }], outputs: [] },
  { type: "function", name: "resolveNoRuling", stateMutability: "nonpayable", inputs: [{ name: "reqId", type: "uint256" }], outputs: [] },
];

const primaryAbi = [
  {
    type: "function",
    name: "buy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "qty", type: "uint256" },
      { name: "maxCost", type: "uint256" },
    ],
    outputs: [{ name: "cost", type: "uint256" }],
  },
  {
    type: "event",
    name: "PrimaryBuy",
    inputs: [
      { name: "seriesId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "qty", type: "uint256", indexed: false },
      { name: "price", type: "uint256", indexed: false },
      { name: "cost", type: "uint256", indexed: false },
      { name: "fee", type: "uint256", indexed: false },
    ],
  },
];

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

const orderAbi = [
  {
    type: "function",
    name: "placeOrder",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "side", type: "uint8" },
      { name: "price", type: "uint256" },
      { name: "qty", type: "uint256" },
      { name: "immediateOrCancel", type: "bool" },
    ],
    outputs: [
      { name: "orderId", type: "uint256" },
      { name: "filledQty", type: "uint256" },
    ],
  },
];

const ZERO = "0x0000000000000000000000000000000000000000";

function chainOf(id, rpcUrl) {
  return {
    id,
    name: id === 46630 ? "robinhoodTestnet" : "arbitrumSepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  };
}

async function clients(cfg) {
  const { createPublicClient, createWalletClient, http } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");
  const chain = chainOf(cfg.chainId, cfg.rpcUrl);
  const publicClient = createPublicClient({ chain, transport: http(cfg.rpcUrl) });
  const remoteId = await publicClient.getChainId();
  assertRemoteChainId(remoteId, cfg.chainId);
  return {
    publicClient,
    wallet() {
      assertMaySign(cfg);
      const key = process.env[cfg.keyEnv];
      const account = privateKeyToAccount(key);
      return createWalletClient({ account, chain, transport: http(cfg.rpcUrl) });
    },
  };
}

export async function attachChain(cfg) {
  const { publicClient, wallet } = await clients(cfg);
  let cursor = null;

  async function series(seriesId) {
    return publicClient.readContract({
      address: cfg.addresses.seriesFactory,
      abi: seriesAbi,
      functionName: "getSeries",
      args: [BigInt(seriesId)],
    });
  }

  return {
    async seriesPaused(seriesId) {
      const row = await series(seriesId);
      return Boolean(row.paused);
    },
    async readRequests() {
      const next = await publicClient.readContract({
        address: cfg.addresses.redemptionManager,
        abi: redemptionAbi,
        functionName: "nextReqId",
      });
      const rows = [];
      for (let reqId = 1n; reqId < next; reqId += 1n) {
        const request = await publicClient.readContract({
          address: cfg.addresses.redemptionManager,
          abi: redemptionAbi,
          functionName: "getRequest",
          args: [reqId],
        });
        if (!request.holder || request.holder.toLowerCase() === ZERO) continue;
        const state = await publicClient.readContract({
          address: cfg.addresses.redemptionManager,
          abi: redemptionAbi,
          functionName: "stateOf",
          args: [reqId],
        });
        rows.push({
          reqId,
          seriesId: request.seriesId,
          state: Number(state),
          ackDeadline: request.ackDeadline,
          deliveryDeadline: request.deliveryDeadline,
          disputeDeadline: request.disputeDeadline,
          rulingDeadline: request.rulingDeadline,
        });
      }
      return rows;
    },
    async readBuys() {
      if (cursor == null) cursor = await publicClient.getBlockNumber();
      const latest = await publicClient.getBlockNumber();
      if (latest < cursor) return [];
      const logs = await publicClient.getLogs({
        address: cfg.addresses.primarySale,
        event: primaryAbi[1],
        fromBlock: cursor,
        toBlock: latest,
      });
      cursor = latest + 1n;
      return logs.map((log) => ({
        id: `${log.transactionHash}:${log.logIndex}`,
        name: "PrimaryBuy",
        seriesId: log.args.seriesId,
        buyer: log.args.buyer,
      }));
    },
    async holdingCu(seriesId, account) {
      if (!account) return 0n;
      const row = await series(seriesId);
      if (!row.token || row.token.toLowerCase() === ZERO) return 0n;
      return publicClient.readContract({
        address: row.token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [account],
      });
    },
    async sendKeeper(action) {
      const client = wallet();
      const hash = await client.writeContract({
        address: cfg.addresses.redemptionManager,
        abi: redemptionAbi,
        functionName: action.action,
        args: [BigInt(action.reqId)],
      });
      return { hash };
    },
    async sendTrader(step, seriesId) {
      const client = wallet();
      if (step.method === "buy") {
        const hash = await client.writeContract({
          address: cfg.addresses.primarySale,
          abi: primaryAbi,
          functionName: "buy",
          args: [BigInt(seriesId), step.qty, step.maxCost],
        });
        return { hash };
      }
      if (step.method === "approve") {
        const row = await series(seriesId);
        const hash = await client.writeContract({
          address: row.token,
          abi: erc20Abi,
          functionName: "approve",
          args: [cfg.addresses.orderBook, step.amount],
        });
        return { hash };
      }
      if (step.method === "placeOrder") {
        const hash = await client.writeContract({
          address: cfg.addresses.orderBook,
          abi: orderAbi,
          functionName: "placeOrder",
          args: [BigInt(seriesId), step.sideIndex, step.price, step.qty, step.immediateOrCancel],
        });
        return { hash };
      }
      throw new Error(`Unknown trader step ${step.method}`);
    },
  };
}
