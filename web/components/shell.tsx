"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useBlockNumber, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUsd } from "@/lib/format";
import { apiBase, chainId, deployLabel, walletConnectId, wrongNetworkCopy } from "@/lib/config";
import { formatCu } from "@/lib/format";
import { useIndex } from "@/lib/hooks";
import type { Snap } from "@/lib/types";
import { useData } from "./providers";
import { WalletConnect } from "./wallet";

const LINKS = [
  ["/markets", "Markets"],
  ["/buy", "Buy"],
  ["/trade", "Trade"],
  ["/portfolio", "Portfolio"],
  ["/provider", "Provider"],
  ["/index", "Index"],
  ["/data", "Data"],
  ["/demo", "Demo"],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { snap, setSnap, source, origin, indexedBlock } = useData();
  const index = useIndex();
  const { address, isConnected } = useAccount();
  const walletChain = useChainId();
  const { switchChain } = useSwitchChain();
  const block = useBlockNumber({
    watch: false,
    // /v1/health carries the indexed block; the chain head is only needed for the lag banner, so poll it rarely.
    query: { enabled: source === "live", refetchInterval: 30_000, retry: false },
  });
  const balance = useBalance({ address });
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [healthBlock, setHealthBlock] = useState<number | null>(null);
  useEffect(() => {
    if (source !== "live" || !apiBase()) return;
    let dead = false;
    const check = async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch(`${apiBase()}/health`, { signal: ctrl.signal });
        const body = (await res.json()) as { data?: { synced?: boolean; indexed_block?: number } };
        if (!res.ok) throw new Error(`health ${res.status}`);
        if (!dead) {
          setSyncing(body.data?.synced === false);
          setHealthBlock(typeof body.data?.indexed_block === "number" ? body.data.indexed_block : null);
        }
      } catch {
        if (!dead) {
          setSyncing(false);
          setHealthBlock(null);
        }
      } finally {
        clearTimeout(timer);
      }
    };
    void check();
    const id = setInterval(check, 10000);
    return () => {
      dead = true;
      clearInterval(id);
    };
  }, [source]);
  const strip = index.data?.data;
  const ref = strip?.reference?.value;
  const wrong = isConnected && walletChain !== chainId();
  const lowGas = balance.data != null && balance.data.value < 5_000_000_000_000_000n;
  const head = block.data != null ? Number(block.data) : null;
  const lag = !syncing && source === "live" && origin === "live" && head != null && indexedBlock != null && head > indexedBlock;
  const banner = source === "mock"
    ? `Mock data (fixtures). Transactions are disabled. Snapshot ${snap}.`
    : origin === "onchain"
      ? "Live data unavailable. Showing onchain reads only."
      : lag
        ? `Indexer catching up (block ${indexedBlock} of ${head}). Onchain actions still work; lists may lag a few seconds.`
        : null;

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <Link className="brand" href="/">
          <img src="/brand/paron-lockup.svg" alt="Paron" height={24} />
        </Link>
        <button className="btn ghost menu-toggle" type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          Menu
        </button>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} data-active={path === href || path.startsWith(`${href}/`)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-spacer" />
        <span className="chip"><span className="dot" /><span className="chip-wide">{chainId() === 421614 ? "Arbitrum Sepolia" : "Robinhood Chain Testnet"}</span><span className="chip-narrow">{`Testnet · ${chainId()}`}</span></span>
        {walletConnectId() ? <ConnectButton label="Connect wallet" /> : <WalletConnect />}
      </header>
      <div className="strip">
        <span className="strip-main">
          <span style={{ color: "var(--color-text-primary)" }}>H100 index</span>
          {strip ? <span className={`pill ${strip.status === "OK" ? "ok" : strip.status === "THIN" ? "thin" : "dis"}`}>{strip.status}</span> : null}
          <span className="num" style={{ color: "var(--color-text-primary)" }}>
            {strip?.status === "OK" && strip.value ? `${formatUsd(strip.value)}/CU` : strip?.status === "THIN" && strip.value ? `last OK ${formatUsd(strip.value)}/CU` : strip?.status === "DISRUPTED" ? "do not use for settlement" : strip?.status === "THIN" ? "no eligible prints yet" : ""}
          </span>
          {strip?.status === "OK" ? <span>· {strip.participants} entities · <span className="num">{formatCu(strip.eligible_volume_cu).replace(" CU", "")}</span> CU/24h</span> : null}
        </span>
        <span className="strip-ref">
          <span className="sep" />
          Spot reference (synthetic demo data)
          <span className="num" style={{ color: "var(--color-text-primary)" }}>{ref ? formatUsd(ref) : ""}</span>
        </span>
      </div>
      {banner ? (
        <div className={`banner ${source === "mock" ? "mock" : "warn"}`} data-testid="mock-banner">
          {banner}
        </div>
      ) : null}
      {syncing ? (
        <div className="banner info" data-testid="syncing-banner" role="status">
          Indexer syncing, data may be delayed.
        </div>
      ) : null}
      {wrong ? (
        <div className="banner danger">
          {wrongNetworkCopy()}{" "}
          <button className="btn ghost" type="button" onClick={() => switchChain({ chainId: chainId() })}>
            Switch
          </button>
        </div>
      ) : null}
      {lowGas ? (
        <div className="banner warn">Low gas balance. Get testnet ETH: see the faucet page.</div>
      ) : null}
      {source === "mock" && process.env.NODE_ENV === "development" ? (
        <div className="snapshot" data-testid="snapshot-switch">
          <span>Fixture snapshot</span>
          {(["t0", "t1", "t2", "t3"] as Snap[]).map((item) => (
            <button key={item} type="button" data-on={snap === item} onClick={() => setSnap(item)}>
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <main className="main" id="main" tabIndex={-1}>{children}</main>
      <footer className="utilbar" data-testid="utilbar">
        <span className="utilbar-links">
          <Link href="/docs/contracts">Docs</Link>
          {" · "}
          {apiBase() ? <a href={`${apiBase()}/health`}>API</a> : <Link href="/data">API</Link>}
          {" · "}
          <a href="https://github.com/Fatihmaull/paron-robinhood">GitHub</a>
          <span className="utilbar-note">
            {chainId() === 421614
              ? "Deployed on Arbitrum Sepolia (fallback). Testnet demo: tokens have no monetary value."
              : "Deployed on Robinhood Chain Testnet. Testnet demo: tokens have no monetary value."}
          </span>
        </span>
        <span className="num">
          Build {deployLabel()} · Chain {chainId()} · Block {source === "mock" ? (indexedBlock ?? "—") : (healthBlock ?? head ?? "—")}
        </span>
      </footer>
    </div>
  );
}
