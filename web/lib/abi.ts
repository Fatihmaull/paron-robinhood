/**
 * Contract ABIs from shared/abi (exported by the contracts package).
 * EAS `attest` and the OZ TimelockController are not Paron contracts, so those
 * two fragments stay here. next.config copies deployments/<chainId> into
 * NEXT_PUBLIC_ADDR_* when those variables are unset. Mock mode does not call these ABIs.
 *
 * getSeries appends soldSupply after the stored series fields. SeriesParams
 * for createSeries matches the exported tuple order.
 */
import type { Abi } from "viem";
import bondVaultJson from "../../shared/abi/BondVault.json";
import conversionTableJson from "../../shared/abi/ConversionTable.json";
import cuTokenJson from "../../shared/abi/CUToken.json";
import easGateJson from "../../shared/abi/EASGate.json";
import mockUsdcJson from "../../shared/abi/MockUSDC.json";
import orderBookJson from "../../shared/abi/OrderBook.json";
import panelJson from "../../shared/abi/PanelArbitrator.json";
import primarySaleJson from "../../shared/abi/PrimarySale.json";
import printIndexJson from "../../shared/abi/PrintIndex.json";
import providerRegistryJson from "../../shared/abi/ProviderRegistry.json";
import redemptionManagerJson from "../../shared/abi/RedemptionManager.json";
import referenceFeedJson from "../../shared/abi/ReferenceFeed.json";
import seriesFactoryJson from "../../shared/abi/SeriesFactory.json";

export const bondVaultAbi = bondVaultJson as Abi;
export const conversionTableAbi = conversionTableJson as Abi;
export const cuTokenAbi = cuTokenJson as Abi;
export const easGateAbi = easGateJson as Abi;
export const mockUsdcAbi = mockUsdcJson as Abi;
export const orderBookAbi = orderBookJson as Abi;
export const panelAbi = panelJson as Abi;
export const primarySaleAbi = primarySaleJson as Abi;
export const printIndexAbi = printIndexJson as Abi;
export const providerRegistryAbi = providerRegistryJson as Abi;
export const redemptionManagerAbi = redemptionManagerJson as Abi;
export const referenceFeedAbi = referenceFeedJson as Abi;
export const seriesFactoryAbi = seriesFactoryJson as Abi;

/** USDC approve / balance reads. MockUSDC is the ERC-20 used on testnet. */
export const erc20Abi = mockUsdcAbi;

/** EAS core (eas-contracts), not exported under shared/abi. */
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
  {
    type: "function",
    name: "revoke",
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
              { name: "uid", type: "bytes32" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [],
  },
] as const satisfies Abi;

/** OpenZeppelin TimelockController. Not a Paron contract. */
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
] as const satisfies Abi;

export const agentCommandTypes = {
  AgentCommand: [
    { name: "provider", type: "address" },
    { name: "autoAck", type: "bool" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint64" },
  ],
} as const;
