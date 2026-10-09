"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
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

function useNoted<T>(key: unknown[], queryFn: () => Promise<{ data: T; meta: Meta; origin: "mock" | "live" | "onchain" }>) {
  const { noteMeta } = useData();
  const query = useQuery({ queryKey: key, queryFn });
  useEffect(() => {
    if (query.data) noteMeta(query.data.meta, query.data.origin);
  }, [query.data, noteMeta]);
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
  return useNoted(["holdings", snap, source], () => loadHoldings(snap, source, client));
}

export function useProviderQueue() {
  const { snap, source, client } = useData();
  return useNoted(["provider-queue", snap, source], () => loadProviderRedemptions(snap, source, client));
}

export function useProviderAccount() {
  const { snap, source, client } = useData();
  return useNoted(["provider", snap, source], () => loadProvider(snap, source, client));
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
  return useNoted(["statement", snap, source], () => loadStatement(snap, source));
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
