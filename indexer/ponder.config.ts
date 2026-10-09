import { createConfig, factory } from "ponder";
import type { AbiEvent } from "viem";
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
} from "./src/abi/temporary-event-abis.js";
import { contractAddressOf, loadDeployment } from "./src/config/load.js";

/**
 * Postgres (Railway) when DATABASE_URL is set. PGlite when it is empty, so
 * `pnpm dev` does not need a database.
 *
 * Ponder stores indexed tables in the Postgres schema named by DATABASE_SCHEMA.
 * That name must stay the same for the life of a deployment. A new value makes
 * Ponder backfill into a different schema. `ponder start` refuses to boot
 * without a schema (even on PGlite), so it defaults to "paron" here, in the
 * Dockerfile, and in the `start` script.
 */
process.env.DATABASE_SCHEMA ||= "paron";

const deployment = loadDeployment();
const address = (name: string) => contractAddressOf(deployment, name);
const startBlock = deployment.startBlock;
const chain = {
  [deployment.chainKey]: {
    address: address("SeriesFactory"),
    startBlock,
  },
};

const staticChain = (name: string) => ({
  [deployment.chainKey]: {
    address: address(name),
    startBlock,
  },
});

export default createConfig({
  database: process.env.DATABASE_URL
    ? { kind: "postgres", connectionString: process.env.DATABASE_URL }
    : { kind: "pglite" },
  chains: {
    [deployment.chainKey]: {
      id: deployment.chainId,
      rpc: process.env.INDEXER_RPC_URL_BACKUP
        ? [deployment.rpcUrl, process.env.INDEXER_RPC_URL_BACKUP]
        : deployment.rpcUrl,
    },
  },
  contracts: {
    SeriesFactory: { abi: seriesFactoryAbi, chain },
    ProviderRegistry: { abi: providerRegistryAbi, chain: staticChain("ProviderRegistry") },
    ConversionTable: { abi: conversionTableAbi, chain: staticChain("ConversionTable") },
    BondVault: { abi: bondVaultAbi, chain: staticChain("BondVault") },
    PrimarySale: { abi: primarySaleAbi, chain: staticChain("PrimarySale") },
    OrderBook: { abi: orderBookAbi, chain: staticChain("OrderBook") },
    RedemptionManager: { abi: redemptionManagerAbi, chain: staticChain("RedemptionManager") },
    PanelArbitrator: { abi: panelArbitratorAbi, chain: staticChain("PanelArbitrator") },
    PrintIndex: { abi: printIndexAbi, chain: staticChain("PrintIndex") },
    ReferenceFeed: { abi: referenceFeedAbi, chain: staticChain("ReferenceFeed") },
    EASGate: { abi: easGateAbi, chain: staticChain("EASGate") },
    RegistryGate: { abi: registryGateAbi, chain: staticChain("RegistryGate") },
    EAS: { abi: easAbi, chain: staticChain("EAS") },
    TimelockController: { abi: timelockAbi, chain: staticChain("TimelockController") },
    CUToken: {
      abi: cuTokenAbi,
      chain: {
        [deployment.chainKey]: {
          address: factory({
            address: address("SeriesFactory"),
            event: seriesFactoryAbi.find((item) => item.type === "event" && item.name === "SeriesCreated") as AbiEvent,
            parameter: "token",
          }),
          startBlock,
        },
      },
    },
  },
});
