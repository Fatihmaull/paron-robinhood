"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { walletConnectId } from "@/lib/config";
import { canonicalAddress, shortAddress } from "@/lib/format";
import {
  CONNECT_TIMEOUT_MS,
  METAMASK_INSTALL_URL,
  connectErrorMessage,
  pickConnector,
  walletDetected,
  withTimeout,
} from "@/lib/wallet-connect";

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
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const run = useRef(0);
  useEffect(() => setMounted(true), []);
  const connector = pickConnector(connectors);
  const hasEthereum = mounted && typeof window !== "undefined" && "ethereum" in window;
  const detected = mounted && connector != null && walletDetected(connectors, hasEthereum);

  async function start() {
    if (!connector || waiting) return;
    const id = ++run.current;
    setProblem(null);
    setWaiting(true);
    try {
      await withTimeout(connectAsync({ connector }), CONNECT_TIMEOUT_MS);
    } catch (err) {
      if (run.current === id) setProblem(connectErrorMessage(err));
    } finally {
      if (run.current === id) setWaiting(false);
    }
  }

  if (!isConnected || !address) {
    if (mounted && !detected) {
      return (
        <span className="wallet-wrap">
          <a className="btn chrome" href={METAMASK_INSTALL_URL} target="_blank" rel="noopener noreferrer">
            Install MetaMask
          </a>
          <p className="wallet-status help" role="status">No wallet detected. Install MetaMask, then reload.</p>
        </span>
      );
    }
    return (
      <span className="wallet-wrap">
        <button className="btn chrome" type="button" disabled={!mounted || waiting} aria-busy={waiting} onClick={() => void start()}>
          {waiting ? "Waiting for approval…" : "Connect wallet"}
        </button>
        {waiting ? (
          <p className="wallet-status help" role="status">Waiting for approval in MetaMask…</p>
        ) : problem ? (
          <p className="wallet-status help bad" role="alert">{problem}</p>
        ) : null}
      </span>
    );
  }

  return (
    <div className="menu">
      <AccountButton address={address} onClick={() => setOpen((v) => !v)} />
      {open ? (
        <div className="menu-pop">
          <Link href="/faucet" onClick={() => setOpen(false)}>Get test USDC</Link>
          <Link href="/onboarding/kyb" onClick={() => setOpen(false)}>Verification</Link>
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
