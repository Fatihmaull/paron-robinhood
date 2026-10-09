import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  bondVaultAbi,
  conversionTableAbi,
  cuTokenAbi,
  easAbi,
  easGateAbi,
  orderBookAbi,
  panelArbitratorAbi,
  primarySaleAbi,
  printIndexAbi,
  providerRegistryAbi,
  redemptionManagerAbi,
  referenceFeedAbi,
  registryGateAbi,
  seriesFactoryAbi,
  timelockAbi,
} from "../src/abi/temporary-event-abis.js";
import type { Abi } from "viem";

const here = dirname(fileURLToPath(import.meta.url));
const copied = resolve(here, "../src/abi/shared");
const source = resolve(here, "../../shared/abi");

const indexed: Record<string, Abi> = {
  SeriesFactory: seriesFactoryAbi,
  ProviderRegistry: providerRegistryAbi,
  ConversionTable: conversionTableAbi,
  BondVault: bondVaultAbi,
  PrimarySale: primarySaleAbi,
  OrderBook: orderBookAbi,
  RedemptionManager: redemptionManagerAbi,
  PanelArbitrator: panelArbitratorAbi,
  PrintIndex: printIndexAbi,
  ReferenceFeed: referenceFeedAbi,
  EASGate: easGateAbi,
  RegistryGate: registryGateAbi,
  EAS: easAbi,
  TimelockController: timelockAbi,
  CUToken: cuTokenAbi,
};

describe("shared abi copy", () => {
  it("matches shared/abi when the monorepo checkout is present", () => {
    expect(existsSync(source)).toBe(true);
    const names = readdirSync(source).filter((name) => name.endsWith(".json")).sort();
    expect(names.length).toBeGreaterThan(0);
    expect(readdirSync(copied).filter((name) => name.endsWith(".json")).sort()).toEqual(names);
    for (const name of names) {
      expect(JSON.parse(readFileSync(resolve(copied, name), "utf8"))).toEqual(
        JSON.parse(readFileSync(resolve(source, name), "utf8")),
      );
    }
  });

  it("indexes only events that exist on the ABI", () => {
    const required: Record<string, string[]> = {
      SeriesFactory: ["SeriesCreated", "RoleGranted"],
      BondVault: ["BondDeposited", "BondReleased"],
      RedemptionManager: ["RedemptionReopened", "Ruled"],
      PrintIndex: ["PrintRecorded", "IndexParamsUpdated"],
      EASGate: ["AttestationLinked"],
      EAS: ["Attested"],
      TimelockController: ["CallScheduled", "RoleGranted"],
      CUToken: ["Transfer"],
    };
    for (const [name, events] of Object.entries(required)) {
      const abi = indexed[name];
      for (const eventName of events) {
        expect(abi.some((item) => item.type === "event" && item.name === eventName)).toBe(true);
      }
    }
    expect(bondVaultAbi.some((item) => item.type === "event" && item.name === "RoleGranted")).toBe(false);
    expect(redemptionManagerAbi.some((item) => item.type === "event" && item.name === "RoleGranted")).toBe(false);
    const linked = easGateAbi.find((item) => item.type === "event" && item.name === "AttestationLinked");
    expect(linked && linked.type === "event" ? linked.inputs.map((input) => input.name) : []).toEqual([
      "account",
      "uid",
      "entityId",
    ]);
    const submitted = panelArbitratorAbi.find((item) => item.type === "event" && item.name === "RulingSubmitted");
    expect(submitted && submitted.type === "event" ? submitted.inputs.map((input) => input.name) : []).toEqual([
      "reqId",
      "ruling",
      "signers",
    ]);
  });
});
