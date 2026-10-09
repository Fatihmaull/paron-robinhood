"use client";

import { useParams } from "next/navigation";
import { SeriesView } from "@/components/series-view";

export default function BuySeriesPage() {
  const params = useParams<{ seriesId: string }>();
  return <SeriesView seriesId={params.seriesId} tab="buy" />;
}
