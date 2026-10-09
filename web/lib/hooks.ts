"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import {
  DEMO_PROVIDER,
  type QueueScope,
  queuePath,
  loadBook,
  loadGpus,
  loadHoldings,
  loadIndex,
  loadKyb,
  loadPrints,
  loadProvider,
  loadProviderRedemptions,
  loadRedemption,
  loadSeries,
  loadSeriesList,
  loadStatement,
  loadTimelock,
} from "@/lib/api";
import type { Meta } from "@/lib/types";
import { useData } from "@/components/providers";

function useNoted<T>(key: unknown[], queryFn: () => Promise<{ data: T; meta: Meta; origin: "mock" | "live" | "onchain" }>, note = true) {
  const { noteMeta } = useData();
  const query = useQuery({ queryKey: key, queryFn });
  useEffect(() => {
    if (note && query.data) noteMeta(query.data.meta, query.data.origin);
  }, [note, query.data, noteMeta]);
  return query;
}

export function useSeriesList() {
  const { snap, source, client } = useData();
  return useNoted(["series", snap, source], () => loadSeriesList(snap, source, client));
}

export function useSeries(seriesId: string) {
  const { snap, source, client } = useData();
  return useNoted(["series", seriesId, snap, source], () => loadSeries(snap, source, seriesId, client));
}

export function useBook(seriesId: string) {
  const { snap, source, client } = useData();
  return useNoted(["book", seriesId, snap, source], () => loadBook(snap, source, seriesId, client));
}

export function useRedemption(reqId: string) {
  const { snap, source, client } = useData();
  return useNoted(["redemption", reqId, snap, source], () => loadRedemption(snap, source, reqId, client));
}

export function useHoldings() {
  const { snap, source, client } = useData();
  const { address } = useAccount();
  return useNoted(["holdings", snap, source, address ?? null], () => loadHoldings(snap, source, client, address), source !== "live" || Boolean(address));
}

function useQueue(scope: QueueScope, enabled = true) {
  const { snap, source, client } = useData();
  return useNoted(["redemption-queue", snap, source, queuePath(scope)], () => loadProviderRedemptions(snap, source, client, scope), enabled);
}

/** The connected provider's queue (demo provider when no wallet is connected). */
export function useProviderQueue() {
  const { address } = useAccount();
  return useQueue({ provider: address ?? DEMO_PROVIDER });
}

/** Open defaults, deliveries and rulings across all providers (keepers, claim list). */
export function useKeeperQueue() {
  return useQueue("keepers");
}

/** Redemptions the connected wallet holds. */
export function useHolderQueue() {
  const { address } = useAccount();
  const { source } = useData();
  return useQueue({ holder: address ?? "" }, source !== "live" || Boolean(address));
}

export function useProviderAccount() {
  const { snap, source, client } = useData();
  const { address } = useAccount();
  return useNoted(["provider", snap, source, address ?? null], () => loadProvider(snap, source, client, address ?? DEMO_PROVIDER));
}

export function useIndex() {
  const { snap, source, client } = useData();
  return useNoted(["index", snap, source], () => loadIndex(snap, source, client));
}

export function usePrints() {
  const { snap, source, client } = useData();
  return useNoted(["prints", snap, source], () => loadPrints(snap, source, client));
}

export function useStatement() {
  const { snap, source } = useData();
  const { address } = useAccount();
  return useNoted(["statement", snap, source, address ?? null], () => loadStatement(snap, source, address), source !== "live" || Boolean(address));
}

export function useGpus() {
  const { snap, source } = useData();
  return useNoted(["gpus", snap, source], () => loadGpus(snap, source));
}

export function useTimelock() {
  const { source } = useData();
  return useNoted(["timelock", source], () => loadTimelock(source));
}

export function useKyb() {
  const { source } = useData();
  return useNoted(["kyb", source], () => loadKyb(source));
}
