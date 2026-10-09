import { describe, expect, it } from "vitest";
import type { Abi } from "viem";
import * as abis from "../src/abi/temporary-event-abis.js";
import { CONTRACT_EVENTS } from "../src/config/events.js";

const ABI_OF: Record<string, Abi> = {
  SeriesFactory: abis.seriesFactoryAbi,
  ProviderRegistry: abis.providerRegistryAbi,
  ConversionTable: abis.conversionTableAbi,
  BondVault: abis.bondVaultAbi,
  PrimarySale: abis.primarySaleAbi,
  OrderBook: abis.orderBookAbi,
  RedemptionManager: abis.redemptionManagerAbi,
  PanelArbitrator: abis.panelArbitratorAbi,
  PrintIndex: abis.printIndexAbi,
  ReferenceFeed: abis.referenceFeedAbi,
  EASGate: abis.easGateAbi,
  RegistryGate: abis.registryGateAbi,
  EAS: abis.easAbi as unknown as Abi,
  TimelockController: abis.timelockAbi as unknown as Abi,
  CUToken: abis.cuTokenAbi,
};

describe("indexer event config vs ABI", () => {
  it("covers every contract in ponder.config", () => {
    expect(Object.keys(CONTRACT_EVENTS).sort()).toEqual(Object.keys(ABI_OF).sort());
  });
  for (const [contract, events] of Object.entries(CONTRACT_EVENTS)) {
    it(`${contract}: every configured event exists in its ABI`, () => {
      const names = new Set(ABI_OF[contract].filter((i) => i.type === "event").map((i) => (i as { name: string }).name));
      const missing = events.filter((e) => !names.has(e));
      expect(missing, `${contract} missing events`).toEqual([]);
    });
  }
});
