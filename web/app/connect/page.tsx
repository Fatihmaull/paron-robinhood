"use client";

import { WalletConnect } from "@/components/wallet";

export default function ConnectPage() {
  return (
    <div>
      <h1>Connect wallet</h1>
      <p className="lede">Use a browser wallet on Robinhood Chain Testnet. WalletConnect appears when a project id is configured.</p>
      <WalletConnect />
    </div>
  );
}
