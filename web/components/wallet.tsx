"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortId } from "@/lib/format";

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
      <button className="btn ghost" type="button" onClick={() => setOpen((v) => !v)}>
        {shortId(address)}
      </button>
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
