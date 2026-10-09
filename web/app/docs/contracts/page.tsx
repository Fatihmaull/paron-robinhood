"use client";

import { contractAddress, contractsConfigured, type ContractKey } from "@/lib/config";

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
];

export default function ContractsPage() {
  return (
    <div>
      <h1>Contracts</h1>
      <p className="lede">
        {contractsConfigured()
          ? "Addresses from this build's environment."
          : "Addresses load from the deploy manifest. None are configured in this build."}
      </p>
      <table>
        <thead><tr><th>Contract</th><th>Address</th></tr></thead>
        <tbody>
          {KEYS.map((key) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{contractAddress(key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
