"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Portfolio } from "@/components/portfolio";

function PortfolioRoute() {
  const params = useSearchParams();
  return <Portfolio tab={params.get("tab") ?? "holdings"} />;
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<p className="muted">Loading portfolio…</p>}>
      <PortfolioRoute />
    </Suspense>
  );
}
