/**
 * Map deployments/<chainId>/infra.json and <label>.json (paron-deployments/v1)
 * onto NEXT_PUBLIC_ADDR_* names. A missing manifest yields no addresses.
 * This never sets DATA_SOURCE.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const DEPLOY_SCHEMA = "paron-deployments/v1";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_BYTES32 = `0x${"0".repeat(64)}`;

/** Label contract name → env var. CUToken is the implementation, not a series token. */
const CONTRACT_ENV: Record<string, string> = {
  ProviderRegistry: "NEXT_PUBLIC_ADDR_PROVIDER_REGISTRY",
  SeriesFactory: "NEXT_PUBLIC_ADDR_SERIES_FACTORY",
  PrimarySale: "NEXT_PUBLIC_ADDR_PRIMARY_SALE",
  OrderBook: "NEXT_PUBLIC_ADDR_ORDER_BOOK",
  RedemptionManager: "NEXT_PUBLIC_ADDR_REDEMPTION_MANAGER",
  BondVault: "NEXT_PUBLIC_ADDR_BOND_VAULT",
  PrintIndex: "NEXT_PUBLIC_ADDR_PRINT_INDEX",
  ReferenceFeed: "NEXT_PUBLIC_ADDR_REFERENCE_FEED",
  ConversionTable: "NEXT_PUBLIC_ADDR_CONVERSION_TABLE",
  TimelockController: "NEXT_PUBLIC_ADDR_TIMELOCK",
  PanelArbitrator: "NEXT_PUBLIC_ADDR_PANEL",
  RegistryGate: "NEXT_PUBLIC_ADDR_GATE",
  EASGate: "NEXT_PUBLIC_ADDR_GATE",
};

export function addressOf(value: unknown): `0x${string}` | null {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(value)) return null;
  if (value.toLowerCase() === ZERO_ADDRESS) return null;
  return value as `0x${string}`;
}

export function bytes32Of(value: unknown): `0x${string}` | null {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) return null;
  if (value.toLowerCase() === ZERO_BYTES32) return null;
  return value as `0x${string}`;
}

function accepted(doc: unknown): doc is Record<string, unknown> {
  if (!doc || typeof doc !== "object") return false;
  const version = (doc as { schemaVersion?: unknown }).schemaVersion;
  return version == null || version === DEPLOY_SCHEMA;
}

function nestedAddress(doc: Record<string, unknown>, key: string): `0x${string}` | null {
  const row = doc[key];
  if (!row || typeof row !== "object") return null;
  return addressOf((row as { address?: unknown }).address);
}

export function addressesFromManifests(infra: unknown, label: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (accepted(infra)) {
    const usdc = nestedAddress(infra, "mockUsdc");
    if (usdc) out.NEXT_PUBLIC_ADDR_USDC = usdc;
    const eas = nestedAddress(infra, "eas");
    if (eas) out.NEXT_PUBLIC_ADDR_EAS = eas;
    const schemas = infra.schemas;
    if (schemas && typeof schemas === "object") {
      const participant = (schemas as { ParticipantVerified?: unknown }).ParticipantVerified;
      if (participant && typeof participant === "object") {
        const uid = bytes32Of((participant as { uid?: unknown }).uid);
        if (uid) out.NEXT_PUBLIC_ADDR_EAS_SCHEMA = uid;
      }
    }
  }
  if (accepted(label)) {
    const contracts = label.contracts;
    if (contracts && typeof contracts === "object") {
      const names = Object.keys(CONTRACT_ENV).filter((name) => name !== "EASGate");
      names.push("EASGate");
      for (const name of names) {
        const row = (contracts as Record<string, unknown>)[name];
        if (!row || typeof row !== "object") continue;
        const addr = addressOf((row as { address?: unknown }).address);
        const env = CONTRACT_ENV[name];
        if (addr && env) out[env] = addr;
      }
    }
  }
  return out;
}

/** A non-empty env value wins. Empty or missing values take the manifest. */
export function fillUnset(
  env: Record<string, string | undefined>,
  found: Record<string, string>,
): Record<string, string> {
  const applied: Record<string, string> = {};
  for (const [key, value] of Object.entries(found)) {
    if (!env[key]) applied[key] = value;
  }
  return applied;
}

function readManifest(file: string): unknown {
  try {
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, "utf8")) as unknown;
  } catch {
    return null;
  }
}

export function loadManifestAddresses(
  root: string,
  env: Record<string, string | undefined>,
): Record<string, string> {
  const chainId = env.NEXT_PUBLIC_CHAIN_ID === "421614" ? "421614" : "46630";
  const label = env.NEXT_PUBLIC_DEPLOY_LABEL || "stage-1";
  if (!/^[A-Za-z0-9._-]+$/.test(label)) return {};
  const dir = path.join(root, "deployments", chainId);
  const found = addressesFromManifests(
    readManifest(path.join(dir, "infra.json")),
    readManifest(path.join(dir, `${label}.json`)),
  );
  return fillUnset(env, found);
}
