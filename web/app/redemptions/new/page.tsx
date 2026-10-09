"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RedeemForm } from "@/components/series-view";

function RedeemRoute() {
  const params = useSearchParams();
  return <RedeemForm seriesId={params.get("series") ?? "4"} />;
}

export default function RedeemPage() {
  return (
    <div>
      <h1>Redeem</h1>
      <Suspense fallback={<p className="muted">Loading redemption form…</p>}>
        <RedeemRoute />
      </Suspense>
    </div>
  );
}
