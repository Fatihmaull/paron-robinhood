import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Hex } from "viem";

export type ChainFile = {
  key: string;
  chainId: number;
  rpc: { public: string };
  explorer: { url: string };
  eas?: { mode?: string; address?: string };
};

export type ContractRef = {
  address: Hex;
  block?: number;
};

export type Deployment = {
  chainKey: string;
  chainId: number;
  explorerUrl: string;
  rpcUrl: string;
  startBlock: number | "latest";
  contracts: Record<string, ContractRef>;
  easAddress: Hex | null;
  participantSchema: Hex | null;
  kybSchema: Hex | null;
  treasury: Hex;
  redemptionManager: Hex;
  orderBook: Hex;
};

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "../..");
const repoRoot = resolve(packageRoot, "..");

const ZERO = "0x0000000000000000000000000000000000000000" as Hex;

/** Non-zero placeholders so `ponder dev` boots before L4 writes a manifest. */
const PLACEHOLDER: Record<string, Hex> = {
  SeriesFactory: "0x0000000000000000000000000000000000000001",
  ProviderRegistry: "0x0000000000000000000000000000000000000002",
  ConversionTable: "0x0000000000000000000000000000000000000003",
  BondVault: "0x0000000000000000000000000000000000000004",
  PrimarySale: "0x0000000000000000000000000000000000000005",
  OrderBook: "0x0000000000000000000000000000000000000006",
  RedemptionManager: "0x0000000000000000000000000000000000000007",
  PanelArbitrator: "0x0000000000000000000000000000000000000008",
  PrintIndex: "0x0000000000000000000000000000000000000009",
  ReferenceFeed: "0x000000000000000000000000000000000000000a",
  EASGate: "0x000000000000000000000000000000000000000b",
  RegistryGate: "0x000000000000000000000000000000000000000c",
  EAS: "0x000000000000000000000000000000000000000d",
  TimelockController: "0x000000000000000000000000000000000000000e",
  Treasury: "0x000000000000000000000000000000000000000f",
};

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function chainsPath(): string {
  const root = resolve(repoRoot, "config/chains.json");
  if (existsSync(root)) return root;
  return resolve(packageRoot, "config/chains.json");
}

function asHex(value: unknown): Hex | null {
  if (typeof value !== "string") return null;
  if (!/^0x[0-9a-fA-F]{40}$/.test(value) && !/^0x[0-9a-fA-F]{64}$/.test(value)) return null;
  return value.toLowerCase() as Hex;
}

function contractAddress(raw: unknown): Hex | null {
  if (!raw || typeof raw !== "object") return asHex(raw);
  return asHex((raw as { address?: unknown }).address);
}

export function loadDeployment(): Deployment {
  const file = readJson<Record<string, ChainFile>>(chainsPath());
  const chainKey = process.env.CHAIN || "robinhoodTestnet";
  const chain = file?.[chainKey];
  if (!chain) throw new Error(`Unknown CHAIN "${chainKey}" in ${chainsPath()}`);

  const label = process.env.DEPLOY_LABEL || "stage-1";
  const manifestPath = resolve(repoRoot, "deployments", String(chain.chainId), `${label}.json`);
  const infraPath = resolve(repoRoot, "deployments", String(chain.chainId), "infra.json");
  const manifest = readJson<Record<string, unknown>>(manifestPath);
  const infra = readJson<Record<string, unknown>>(infraPath);

  const contracts: Record<string, ContractRef> = {};
  for (const [name, address] of Object.entries(PLACEHOLDER)) {
    contracts[name] = { address };
  }

  const manifestContracts = manifest?.contracts;
  if (manifestContracts && typeof manifestContracts === "object") {
    for (const [name, raw] of Object.entries(manifestContracts as Record<string, unknown>)) {
      const address = contractAddress(raw);
      if (!address) continue;
      const block = raw && typeof raw === "object" ? (raw as { block?: unknown }).block : undefined;
      contracts[name] = {
        address,
        block: typeof block === "number" ? block : undefined,
      };
    }
  }

  const roles = manifest?.roles as { treasury?: unknown } | undefined;
  const treasury = asHex(roles?.treasury) ?? contracts.Treasury?.address ?? PLACEHOLDER.Treasury;
  if (treasury) contracts.Treasury = { address: treasury.length === 42 ? treasury : PLACEHOLDER.Treasury };

  const easFromInfra = infra?.eas && typeof infra.eas === "object" ? asHex((infra.eas as { address?: unknown }).address) : null;
  const easFromChain = chain.eas?.address && chain.eas.address !== "self-deploy" ? asHex(chain.eas.address) : null;
  const easAddress = asHex(process.env.EAS_ADDRESS) ?? easFromInfra ?? easFromChain ?? contracts.EAS?.address ?? null;
  if (easAddress && easAddress !== ZERO) contracts.EAS = { address: easAddress };

  const schemas = infra?.schemas as Record<string, { uid?: unknown } | null> | undefined;
  const participantSchema =
    asHex(process.env.SCHEMA_UID_PARTICIPANT_VERIFIED) ?? asHex(schemas?.ParticipantVerified?.uid) ?? null;
  const kybSchema = asHex(process.env.SCHEMA_UID_KYB_APPLICATION) ?? asHex(schemas?.KybApplication?.uid) ?? null;

  const startBlock =
    typeof manifest?.startBlock === "number" ? manifest.startBlock : ("latest" as const);

  const rpcUrl = process.env.INDEXER_RPC_URL || chain.rpc.public;

  return {
    chainKey,
    chainId: chain.chainId,
    explorerUrl: chain.explorer.url.replace(/\/$/, ""),
    rpcUrl,
    startBlock,
    contracts,
    easAddress: easAddress && easAddress !== ZERO ? easAddress : null,
    participantSchema,
    kybSchema,
    treasury: (contracts.Treasury?.address ?? PLACEHOLDER.Treasury) as Hex,
    redemptionManager: (contracts.RedemptionManager?.address ?? PLACEHOLDER.RedemptionManager) as Hex,
    orderBook: (contracts.OrderBook?.address ?? PLACEHOLDER.OrderBook) as Hex,
  };
}

export function contractAddressOf(deployment: Deployment, name: string): Hex {
  return deployment.contracts[name]?.address ?? PLACEHOLDER[name] ?? ZERO;
}
