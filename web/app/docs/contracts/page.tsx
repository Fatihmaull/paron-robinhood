"use client";

import { contractAddress, contractsConfigured, type ContractKey } from "@/lib/config";
import { canonicalAddress } from "@/lib/format";

const KEYS: ContractKey[] = [
  "usdc",
  "eas",
  "providerRegistry",
  "seriesFactory",
  "primarySale",
  "orderBook",
  "redemptionManager",
  "bondVault",
  "printIndex",
  "referenceFeed",
  "conversionTable",
  "timelock",
  "panel",
  "gate",
  "easSchema",
];

export default function ContractsPage() {
  return (
    <div>
      <h1>Contracts</h1>
      <p className="lede">
        {contractsConfigured()
          ? "Addresses from this build. A deploy manifest fills any that were left empty."
          : "Addresses load from the deploy manifest. None are configured in this build."}
      </p>
      <div className="table-scroll">
      <table>
        <thead><tr><th>Contract</th><th>Address</th></tr></thead>
        <tbody>
          {KEYS.map((key) => (
            <tr key={key}>
              <td>{key}</td>
              <td className="num">{canonicalAddress(contractAddress(key))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
