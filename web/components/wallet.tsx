"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { walletConnectId } from "@/lib/config";
import { canonicalAddress, shortAddress } from "@/lib/format";

function AccountButton({ address, onClick }: { address: string; onClick: () => void }) {
  const full = canonicalAddress(address);
  return (
    <button className="btn ghost" type="button" title={full} onClick={onClick}>
      {shortAddress(address)}
    </button>
  );
}

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const injected = connectors[0];

  if (!isConnected || !address) {
    return (
      <button
        className="btn chrome"
        type="button"
        disabled={!injected || isPending}
        onClick={() => injected && connect({ connector: injected })}
      >
        Connect wallet
      </button>
    );
  }

  return (
    <div className="menu">
      <AccountButton address={address} onClick={() => setOpen((v) => !v)} />
      {open ? (
        <div className="menu-pop">
          <Link href="/faucet" onClick={() => setOpen(false)}>Get test USDC</Link>
          <Link href="/onboarding/kyb" onClick={() => setOpen(false)}>Verification</Link>
          <Link href="/verifier" onClick={() => setOpen(false)}>Verifier</Link>
          <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
          <Link href="/ops/keepers" onClick={() => setOpen(false)}>Keepers</Link>
          <Link href="/arbiter" onClick={() => setOpen(false)}>Arbiter</Link>
          <button type="button" onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : null}
    </div>
  );
}

function RainbowHeaderWallet() {
  return (
    <ConnectButton.Custom>
      {({ account, mounted, openAccountModal, openConnectModal }) => {
        if (!mounted || !account) {
          return (
            <button className="btn chrome" type="button" disabled={!mounted} onClick={openConnectModal}>
              Connect wallet
            </button>
          );
        }
        return <AccountButton address={account.address} onClick={openAccountModal} />;
      }}
    </ConnectButton.Custom>
  );
}

export function HeaderWallet() {
  if (walletConnectId()) return <RainbowHeaderWallet />;
  return <WalletConnect />;
}
