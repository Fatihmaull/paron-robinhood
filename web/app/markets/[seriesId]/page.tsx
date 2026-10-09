"use client";

import { useParams } from "next/navigation";
import { SeriesView } from "@/components/series-view";

export default function SeriesPage() {
  const params = useParams<{ seriesId: string }>();
  return <SeriesView seriesId={params.seriesId} tab="overview" />;
}
