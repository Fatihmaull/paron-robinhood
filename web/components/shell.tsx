"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAccount, useBalance, useBlockNumber, useChainId, useSwitchChain } from "wagmi";
import { formatUsd } from "@/lib/format";
import { catchupText, nextCatchupState, QUIET_CATCHUP, type CatchupMemory, type HealthSnapshot } from "@/lib/indexer-banner";
import { indexStripActivity } from "@/lib/index-quote";
import { USER_NAV } from "@/lib/nav-links";
import { navNeedsMenu } from "@/lib/nav-fit";
import { rpcBackoffMs } from "@/lib/rpc";
import { apiBase, chainId, deployLabel, wrongNetworkCopy } from "@/lib/config";
import { formatCu } from "@/lib/format";
import { useIndex } from "@/lib/hooks";
import type { Snap } from "@/lib/types";
import { useData } from "./providers";
import { HeaderWallet } from "./wallet";

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
    query: {
      enabled: source === "live",
      refetchInterval: 30_000,
      retry: 3,
      retryDelay: (attemptIndex) => rpcBackoffMs(attemptIndex + 1),
    },
  });
  const balance = useBalance({ address });
  const [open, setOpen] = useState(false);
  const [fit, setFit] = useState<"pending" | "inline" | "menu">("pending");
  const headerRef = useRef<HTMLElement>(null);
  const [catchupMemory, setCatchupMemory] = useState<CatchupMemory>(QUIET_CATCHUP);
  const [healthBlock, setHealthBlock] = useState<number | null>(null);
  useEffect(() => {
    if (source !== "live" || !apiBase()) {
      setCatchupMemory(QUIET_CATCHUP);
      return;
    }
    let dead = false;
    const check = async () => {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      try {
        const res = await fetch(`${apiBase()}/health`, { signal: ctrl.signal });
        const body = (await res.json()) as { data?: HealthSnapshot };
        if (!res.ok) throw new Error(`health ${res.status}`);
        if (!dead) {
          setHealthBlock(typeof body.data?.indexed_block === "number" ? body.data.indexed_block : null);
          setCatchupMemory((prev) => nextCatchupState(prev, body.data ?? null));
        }
      } catch {
        // A failed poll is not a healthy reading. Leave the banner streak alone.
        if (!dead) setHealthBlock(null);
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
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    const header = headerRef.current;
    if (!header || path === "/") return;
    let dead = false;
    const apply = () => {
      if (dead) return;
      const links = header.querySelector<HTMLElement>(".nav-links-measure");
      const brand = header.querySelector<HTMLElement>(".brand");
      const wallet = header.querySelector<HTMLElement>(".nav-wallet");
      const chip = header.querySelector<HTMLElement>(":scope > .chip");
      if (!links || !brand || !wallet) return;
      const cs = getComputedStyle(header);
      const gap = Number.parseFloat(cs.columnGap || "0") || 0;
      const padding = (Number.parseFloat(cs.paddingLeft) || 0) + (Number.parseFloat(cs.paddingRight) || 0);
      const chipVisible = !!chip && getComputedStyle(chip).display !== "none";
      const menu = navNeedsMenu({
        headerWidth: header.clientWidth,
        padding,
        gap,
        gaps: chipVisible ? 4 : 3,
        brand: brand.getBoundingClientRect().width,
        links: links.scrollWidth,
        chip: chipVisible ? chip.getBoundingClientRect().width : 0,
        wallet: wallet.getBoundingClientRect().width,
      });
      setFit(menu ? "menu" : "inline");
      if (!menu) setOpen(false);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    const fonts = document.fonts?.ready.then(apply);
    return () => {
      dead = true;
      ro.disconnect();
      void fonts;
    };
  }, [path, address, isConnected]);
  const strip = index.data?.data;
  const activity = indexStripActivity(strip);
  const ref = strip?.reference?.value;
  const wrong = isConnected && walletChain !== chainId();
  const lowGas = balance.data != null && balance.data.value < 5_000_000_000_000_000n;
  const head = block.data != null ? Number(block.data) : null;
  const catchup = source === "live" ? catchupText(catchupMemory) : null;
  const devMock = source === "mock" && process.env.NODE_ENV !== "production";
  const banner = devMock
    ? `Mock data (fixtures). Transactions are disabled. Snapshot ${snap}.`
    : origin === "onchain"
      ? "Live data unavailable. Showing onchain reads only."
      : catchup;
  const bannerTone = devMock ? "mock" : catchup && banner === catchup ? "info" : "warn";

  if (path === "/") return children;

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav" data-fit={fit} ref={headerRef}>
        <Link className="brand" href="/">
          <img src="/brand/paron-lockup.svg" alt="Paron" height={24} />
        </Link>
        <button className="btn ghost menu-toggle" type="button" aria-expanded={open} aria-controls="dashboard-nav" onClick={() => setOpen((v) => !v)}>
          Menu
        </button>
        <nav className="nav-links nav-links-measure" aria-hidden="true">
          {USER_NAV.map(([href, label]) => (
            <Link key={href} href={href} tabIndex={-1}>
              {label}
            </Link>
          ))}
        </nav>
        <nav className={`nav-links ${open ? "open" : ""}`} id="dashboard-nav">
          {USER_NAV.map(([href, label]) => (
            <Link key={href} href={href} data-active={path === href || path.startsWith(`${href}/`)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-spacer" />
        <span className="chip"><span className="dot" /><span className="chip-wide">{chainId() === 421614 ? "Arbitrum Sepolia" : "Robinhood Chain Testnet"}</span><span className="chip-narrow">{`Testnet · ${chainId()}`}</span></span>
        <span className="nav-wallet">
          <HeaderWallet />
        </span>
      </header>
      <div className="strip">
        <span className="strip-main">
          <span style={{ color: "var(--color-text-primary)" }}>H100 index</span>
          {strip ? <span className={`pill ${strip.status === "OK" ? "ok" : strip.status === "THIN" ? "thin" : "dis"}`}>{strip.status}</span> : null}
          <span className="num">
            {strip?.status === "OK" && strip.value ? `${formatUsd(strip.value)}/CU` : strip?.status === "THIN" && strip.value ? `last OK ${formatUsd(strip.value)}/CU` : strip?.status === "DISRUPTED" ? "do not use for settlement" : strip?.status === "THIN" ? "no eligible prints yet" : ""}
          </span>
          {activity ? <span>· {activity.participants} entities · <span className="num">{formatCu(activity.volumeCu).replace(" CU", "")}</span> CU/24h</span> : null}
        </span>
        <span className="strip-ref">
          <span className="sep" />
          {ref ? "Reference price (demo data)" : "Demo data"}
          <span className="num">{ref ? formatUsd(ref) : ""}</span>
        </span>
      </div>
      {banner ? (
        <div
          className={`banner ${bannerTone}`}
          data-testid={bannerTone === "info" ? "indexer-banner" : "mock-banner"}
          role={bannerTone === "info" ? "status" : undefined}
        >
          {banner}
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
          {" · "}
          <Link href="/legal/risk">Risk</Link>
          {" · "}
          <Link href="/legal/disclaimer">Disclaimer</Link>
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
