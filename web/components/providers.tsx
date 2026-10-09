"use client";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fallback, http, type PublicClient } from "viem";
import { WagmiProvider, createConfig, usePublicClient } from "wagmi";
import { injected } from "wagmi/connectors";
import { median, syncOffset } from "@/lib/clock";
import {
  activeChain,
  agentUrl,
  arbitrumSepolia,
  chainId,
  dataSource,
  robinhoodTestnet,
  rpcUrl,
  rpcUrlBackup,
  walletConnectId,
} from "@/lib/config";
import { snapServerNow } from "@/lib/fixtures";
import type { Meta, Snap } from "@/lib/types";

const projectId = walletConnectId();
const chains = [activeChain(), activeChain().id === 46630 ? arbitrumSepolia : robinhoodTestnet] as const;

// The public RPC fails intermittently (TLS/SNI alerts), so every call retries with backoff,
// and a second RPC (NEXT_PUBLIC_RPC_URL_BACKUP) is used when one is configured.
const rpcHttp = (url: string) => http(url, { retryCount: 3, retryDelay: 400, timeout: 8000 });
const robinhoodUrls = [rpcUrl(), rpcUrlBackup()].filter(Boolean);
const transports = {
  [robinhoodTestnet.id]: robinhoodUrls.length > 1 ? fallback(robinhoodUrls.map(rpcHttp)) : rpcHttp(robinhoodUrls[0]),
  [arbitrumSepolia.id]: rpcHttp("https://sepolia-rollup.arbitrum.io/rpc"),
} as const;

const wagmiConfig = projectId
  ? getDefaultConfig({
      appName: "Paron",
      projectId,
      chains,
      transports,
      ssr: true,
    })
  : createConfig({
      chains,
      connectors: [injected()],
      transports,
      ssr: true,
    });

type Origin = "mock" | "live" | "onchain";

type DataValue = {
  snap: Snap;
  setSnap: (snap: Snap) => void;
  source: "mock" | "live";
  origin: Origin;
  nowMs: number;
  clockLabel: "(server time)" | "(local time)";
  indexedBlock: number | null;
  noteMeta: (meta: Meta, origin: Origin) => void;
  client?: PublicClient;
};

const DataContext = createContext<DataValue | null>(null);

function DataProvider({ children }: { children: React.ReactNode }) {
  const source = dataSource();
  const [snap, setSnap] = useState<Snap>("t2");
  const [origin, setOrigin] = useState<Origin>(source);
  const [offset, setOffset] = useState(0);
  const [tick, setTick] = useState(() => Date.now());
  const [clockLabel, setClockLabel] = useState<"(server time)" | "(local time)">("(server time)");
  const [indexedBlock, setIndexedBlock] = useState<number | null>(null);
  const samples = useRef<number[]>([]);
  const client = usePublicClient();

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (source !== "mock") return;
    setOffset(syncOffset(snapServerNow(snap), Date.now()));
    setClockLabel("(server time)");
    setOrigin("mock");
    samples.current = [];
  }, [snap, source]);

  const noteMeta = useCallback((meta: Meta, next: Origin) => {
    setOrigin(next);
    setIndexedBlock(meta.indexed_block);
    if (next === "onchain") {
      setOffset(0);
      setClockLabel("(local time)");
      return;
    }
    if (next === "live") {
      samples.current = [...samples.current, syncOffset(meta.server_now_ms, Date.now())].slice(-5);
      setOffset(median(samples.current));
      setClockLabel("(server time)");
    }
  }, []);

  const value = useMemo<DataValue>(
    () => ({
      snap,
      setSnap,
      source,
      origin,
      nowMs: tick + offset,
      clockLabel,
      indexedBlock,
      client,
      noteMeta,
    }),
    [snap, source, origin, tick, offset, clockLabel, indexedBlock, client, noteMeta],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error("useData outside provider");
  return value;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [query] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false, networkMode: "always" },
        },
      }),
  );
  const inner = <DataProvider>{children}</DataProvider>;
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={query}>
        {projectId ? <RainbowKitProvider>{inner}</RainbowKitProvider> : inner}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useExpectedChainId(): number {
  return chainId();
}

export function useAgentUrl(): string {
  return agentUrl();
}
