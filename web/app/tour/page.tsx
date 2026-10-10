"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MotionFilm } from "@/components/motion-tour/player";
import "../motion-tour.css";

function Film() {
  const params = useSearchParams();
  const raw = params.get("t");
  const frozen = raw != null;
  const initialMs = raw != null && Number.isFinite(Number(raw)) ? Number(raw) : 0;
  return <MotionFilm initialMs={initialMs} frozen={frozen} />;
}

export default function TourPage() {
  return (
    <Suspense fallback={null}>
      <Film />
    </Suspense>
  );
}
