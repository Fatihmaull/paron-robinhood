import { defineChain } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Testnet Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});

export { arbitrumSepolia };

export type DataSource = "mock" | "live";

// Next inlines NEXT_PUBLIC_* only for literal `process.env.NEXT_PUBLIC_X` reads. A dynamic
// `process.env[name]` is empty in the browser, so every variable is listed literally here.
const PUBLIC_ENV: Record<string, string | undefined> = {
  NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
  NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
  NEXT_PUBLIC_RPC_URL_BACKUP: process.env.NEXT_PUBLIC_RPC_URL_BACKUP,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_DEPLOY_LABEL: process.env.NEXT_PUBLIC_DEPLOY_LABEL,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  NEXT_PUBLIC_DEMO_PRESETS: process.env.NEXT_PUBLIC_DEMO_PRESETS,
  NEXT_PUBLIC_SHOW_SYNTHETIC_LABEL: process.env.NEXT_PUBLIC_SHOW_SYNTHETIC_LABEL,
  NEXT_PUBLIC_AGENT_URL: process.env.NEXT_PUBLIC_AGENT_URL,
  NEXT_PUBLIC_ADDR_USDC: process.env.NEXT_PUBLIC_ADDR_USDC,
  NEXT_PUBLIC_ADDR_EAS: process.env.NEXT_PUBLIC_ADDR_EAS,
  NEXT_PUBLIC_ADDR_EAS_SCHEMA: process.env.NEXT_PUBLIC_ADDR_EAS_SCHEMA,
  NEXT_PUBLIC_ADDR_PROVIDER_REGISTRY: process.env.NEXT_PUBLIC_ADDR_PROVIDER_REGISTRY,
  NEXT_PUBLIC_ADDR_SERIES_FACTORY: process.env.NEXT_PUBLIC_ADDR_SERIES_FACTORY,
  NEXT_PUBLIC_ADDR_PRIMARY_SALE: process.env.NEXT_PUBLIC_ADDR_PRIMARY_SALE,
  NEXT_PUBLIC_ADDR_ORDER_BOOK: process.env.NEXT_PUBLIC_ADDR_ORDER_BOOK,
  NEXT_PUBLIC_ADDR_REDEMPTION_MANAGER: process.env.NEXT_PUBLIC_ADDR_REDEMPTION_MANAGER,
  NEXT_PUBLIC_ADDR_BOND_VAULT: process.env.NEXT_PUBLIC_ADDR_BOND_VAULT,
  NEXT_PUBLIC_ADDR_PRINT_INDEX: process.env.NEXT_PUBLIC_ADDR_PRINT_INDEX,
  NEXT_PUBLIC_ADDR_REFERENCE_FEED: process.env.NEXT_PUBLIC_ADDR_REFERENCE_FEED,
  NEXT_PUBLIC_ADDR_CONVERSION_TABLE: process.env.NEXT_PUBLIC_ADDR_CONVERSION_TABLE,
  NEXT_PUBLIC_ADDR_TIMELOCK: process.env.NEXT_PUBLIC_ADDR_TIMELOCK,
  NEXT_PUBLIC_ADDR_PANEL: process.env.NEXT_PUBLIC_ADDR_PANEL,
  NEXT_PUBLIC_ADDR_GATE: process.env.NEXT_PUBLIC_ADDR_GATE,
  NEXT_PUBLIC_ADDR_CU_TOKEN_SERIES_4: process.env.NEXT_PUBLIC_ADDR_CU_TOKEN_SERIES_4,
  NEXT_PUBLIC_ON_VERCEL: process.env.NEXT_PUBLIC_ON_VERCEL,
};

function read(name: string, fallback = ""): string {
  return PUBLIC_ENV[name] ?? fallback;
}

/** Production always reads the indexer and the chain. Local dev can still use fixtures. */
export function resolveDataSource(input: {
  explicit: string;
  apiBase: string;
  onVercel: boolean;
  nodeEnv: string;
}): DataSource {
  if (input.nodeEnv === "production") return "live";
  if (input.explicit === "live" || input.explicit === "api") return "live";
  if (input.explicit === "mock") return "mock";
  return input.apiBase || input.onVercel ? "live" : "mock";
}

export function dataSource(): DataSource {
  return resolveDataSource({
    explicit: read("NEXT_PUBLIC_DATA_SOURCE", ""),
    apiBase: apiBase(),
    onVercel: read("NEXT_PUBLIC_ON_VERCEL") === "1",
    nodeEnv: process.env.NODE_ENV ?? "",
  });
}

export function chainId(): number {
  const raw = Number(read("NEXT_PUBLIC_CHAIN_ID", "46630"));
  return raw === 421614 ? 421614 : 46630;
}

export function rpcUrl(): string {
  return read("NEXT_PUBLIC_RPC_URL", "https://rpc.testnet.chain.robinhood.com");
}

/** Optional second RPC. Empty = none. */
export function rpcUrlBackup(): string {
  return read("NEXT_PUBLIC_RPC_URL_BACKUP", "");
}

export function apiBase(): string {
  return read("NEXT_PUBLIC_API_BASE_URL", "").replace(/\/$/, "");
}

export function deployLabel(): string {
  return read("NEXT_PUBLIC_DEPLOY_LABEL", "stage-1");
}

export function walletConnectId(): string {
  return read("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID", "");
}

export function demoPresets(): boolean {
  return read("NEXT_PUBLIC_DEMO_PRESETS", "true") !== "false";
}

export function showSyntheticLabel(): boolean {
  return read("NEXT_PUBLIC_SHOW_SYNTHETIC_LABEL", "true") !== "false";
}

export function agentUrl(): string {
  return read("NEXT_PUBLIC_AGENT_URL", "");
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
export const ZERO_BYTES32 = `0x${"0".repeat(64)}` as const;

/** Unmeasured. T6-01 has no gas snapshot yet. */
export const CLAIM_DEFAULT_GAS_LIMIT = 300_000n;

const ADDR_KEYS = {
  usdc: "NEXT_PUBLIC_ADDR_USDC",
  eas: "NEXT_PUBLIC_ADDR_EAS",
  easSchema: "NEXT_PUBLIC_ADDR_EAS_SCHEMA",
  providerRegistry: "NEXT_PUBLIC_ADDR_PROVIDER_REGISTRY",
  seriesFactory: "NEXT_PUBLIC_ADDR_SERIES_FACTORY",
  primarySale: "NEXT_PUBLIC_ADDR_PRIMARY_SALE",
  orderBook: "NEXT_PUBLIC_ADDR_ORDER_BOOK",
  redemptionManager: "NEXT_PUBLIC_ADDR_REDEMPTION_MANAGER",
  bondVault: "NEXT_PUBLIC_ADDR_BOND_VAULT",
  printIndex: "NEXT_PUBLIC_ADDR_PRINT_INDEX",
  referenceFeed: "NEXT_PUBLIC_ADDR_REFERENCE_FEED",
  conversionTable: "NEXT_PUBLIC_ADDR_CONVERSION_TABLE",
  timelock: "NEXT_PUBLIC_ADDR_TIMELOCK",
  panel: "NEXT_PUBLIC_ADDR_PANEL",
  gate: "NEXT_PUBLIC_ADDR_GATE",
  cuTokenSeries4: "NEXT_PUBLIC_ADDR_CU_TOKEN_SERIES_4",
} as const;

export type ContractKey = keyof typeof ADDR_KEYS;

export function contractAddress(key: ContractKey): `0x${string}` {
  const value = read(ADDR_KEYS[key], "").trim();
  if (key === "easSchema") {
    if (/^0x[0-9a-fA-F]{64}$/.test(value) && value.toLowerCase() !== ZERO_BYTES32) {
      return value as `0x${string}`;
    }
    return ZERO_BYTES32;
  }
  if (/^0x[0-9a-fA-F]{40}$/.test(value) && value.toLowerCase() !== ZERO_ADDRESS) {
    return value as `0x${string}`;
  }
  return ZERO_ADDRESS;
}

export function contractsConfigured(): boolean {
  return contractAddress("seriesFactory") !== ZERO_ADDRESS;
}

export function activeChain() {
  return chainId() === 421614 ? arbitrumSepolia : robinhoodTestnet;
}

/** Block explorer page for a transaction hash on the active chain (46630 uses the Robinhood testnet explorer). */
export function explorerTxUrl(hash: string): string {
  const base = activeChain().blockExplorers?.default.url ?? robinhoodTestnet.blockExplorers.default.url;
  return `${base.replace(/\/$/, "")}/tx/${hash}`;
}

export function wrongNetworkCopy(): string {
  if (chainId() === 421614) {
    return "Your wallet is on another network. Paron runs on Arbitrum Sepolia (421614).";
  }
  return "Your wallet is on another network. Paron runs on Robinhood Chain Testnet (46630).";
}
