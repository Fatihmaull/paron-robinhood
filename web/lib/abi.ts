/**
 * Human-readable stand-in until L1 exports shared/abi.
 *
 * SeriesParams / getSeries field order is an assumption from 01 §5.1
 * (input fields only; soldSupply stays on PrimarySale):
 * gpuModel, gpuHours, primaryPrice, bondPerCU, windowStart, windowEnd,
 * ackWindow, deliveryWindow, disputeWindow, minRedemption, arbitrator,
 * specHash, termsHash, country, continent, institutional, symbol.
 * getSeries stored tuple prefixes provider, token and inserts factor + maxSupply
 * after gpuHours, and suffixes paused, finalized.
 */

export const erc20Abi = [
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
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "nonces",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const mockUsdcAbi = [
  ...erc20Abi,
  {
    type: "function",
    name: "faucet",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "error",
    name: "FaucetCooldown",
    inputs: [{ name: "nextAt", type: "uint64" }],
  },
] as const;

const seriesComponents = [
  { name: "gpuModel", type: "bytes32" },
  { name: "gpuHours", type: "uint64" },
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
] as const;

const storedSeriesComponents = [
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
] as const;

export const seriesFactoryAbi = [
  {
    type: "function",
    name: "createSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "params", type: "tuple", components: seriesComponents }],
    outputs: [{ name: "seriesId", type: "uint256" }],
  },
  {
    type: "function",
    name: "createSeriesWithPermit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "params", type: "tuple", components: seriesComponents },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [{ name: "seriesId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getSeries",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [{ name: "s", type: "tuple", components: storedSeriesComponents }],
  },
  {
    type: "function",
    name: "seriesCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isSaleOpen",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "raisePrimaryPrice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "newPrice", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "finalizeSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "pauseSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "unpauseSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const primarySaleAbi = [
  {
    type: "function",
    name: "buy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "qty", type: "uint256" },
      { name: "maxCost", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "quote",
    stateMutability: "view",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "qty", type: "uint256" },
    ],
    outputs: [
      { name: "cost", type: "uint256" },
      { name: "fee", type: "uint256" },
    ],
  },
] as const;

export const orderBookAbi = [
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
  {
    type: "function",
    name: "cancelOrder",
    stateMutability: "nonpayable",
    inputs: [{ name: "orderId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getLevels",
    stateMutability: "view",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "side", type: "uint8" },
      { name: "depth", type: "uint256" },
    ],
    outputs: [
      { name: "prices", type: "uint256[]" },
      { name: "qtys", type: "uint256[]" },
    ],
  },
] as const;

export const redemptionManagerAbi = [
  {
    type: "function",
    name: "requestRedemption",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seriesId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "deliveryRef", type: "bytes32" },
    ],
    outputs: [{ name: "reqId", type: "uint256" }],
  },
  {
    type: "function",
    name: "acknowledge",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "markDelivered",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reqId", type: "uint256" },
      { name: "receiptHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "confirm",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "finalizeRedemption",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "dispute",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimDefault",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "declineAndPay",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "resolveNoRuling",
    stateMutability: "nonpayable",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "stateOf",
    stateMutability: "view",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "getRequest",
    stateMutability: "view",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [
      {
        name: "r",
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
  {
    type: "function",
    name: "reopenedFrom",
    stateMutability: "view",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "disputeBondFor",
    stateMutability: "view",
    inputs: [{ name: "reqId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const providerRegistryAbi = [
  {
    type: "function",
    name: "registerProvider",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "isListable",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getProvider",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "status", type: "uint8" }],
  },
] as const;

export const easGateAbi = [
  {
    type: "function",
    name: "linkAttestation",
    stateMutability: "nonpayable",
    inputs: [{ name: "uid", type: "bytes32" }],
    outputs: [],
  },
] as const;

export const easAbi = [
  {
    type: "function",
    name: "attest",
    stateMutability: "payable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

export const bondVaultAbi = [
  {
    type: "function",
    name: "bondOf",
    stateMutability: "view",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [
      {
        name: "b",
        type: "tuple",
        components: [
          { name: "provider", type: "address" },
          { name: "deposited", type: "uint256" },
          { name: "balance", type: "uint256" },
          { name: "released", type: "uint256" },
          { name: "slashed", type: "uint256" },
          { name: "finalized", type: "bool" },
          { name: "withdrawn", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "withdrawRemaining",
    stateMutability: "nonpayable",
    inputs: [{ name: "seriesId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const printIndexAbi = [
  {
    type: "function",
    name: "statusOf",
    stateMutability: "view",
    inputs: [{ name: "gpu", type: "bytes32" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [{ name: "gpu", type: "bytes32" }],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
  {
    type: "function",
    name: "poke",
    stateMutability: "nonpayable",
    inputs: [{ name: "gpu", type: "bytes32" }],
    outputs: [],
  },
] as const;

export const referenceFeedAbi = [
  {
    type: "function",
    name: "latestRoundData",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
  {
    type: "function",
    name: "label",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const conversionTableAbi = [
  {
    type: "function",
    name: "setFactor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "gpuModel", type: "bytes32" },
      { name: "factor", type: "uint32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "factorOf",
    stateMutability: "view",
    inputs: [{ name: "gpuModel", type: "bytes32" }],
    outputs: [{ name: "", type: "uint32" }],
  },
] as const;

export const timelockAbi = [
  {
    type: "function",
    name: "schedule",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "predecessor", type: "bytes32" },
      { name: "salt", type: "bytes32" },
      { name: "delay", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "execute",
    stateMutability: "payable",
    inputs: [
      { name: "target", type: "address" },
      { name: "value", type: "uint256" },
      { name: "payload", type: "bytes" },
      { name: "predecessor", type: "bytes32" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getMinDelay",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isOperationReady",
    stateMutability: "view",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "isOperationDone",
    stateMutability: "view",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const panelAbi = [
  {
    type: "function",
    name: "rule",
    stateMutability: "nonpayable",
    inputs: [
      { name: "reqId", type: "uint256" },
      { name: "ruling", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

export const agentCommandTypes = {
  AgentCommand: [
    { name: "provider", type: "address" },
    { name: "autoAck", type: "bool" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint64" },
  ],
} as const;
