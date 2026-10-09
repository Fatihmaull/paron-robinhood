"use client";

import { formatUsd } from "@/lib/format";
import { useIndex } from "@/lib/hooks";

export default function IndexPage() {
  const query = useIndex();
  const row = query.data?.data;
  return (
    <div>
      <h1>H100 index</h1>
      <p className="lede">Spot reference (synthetic demo data)</p>
      {row ? (
        <section className="panel">
          <div className="row"><span>Status</span><span>{row.status}</span></div>
          <div className="row"><span>Value</span><span>{row.value ? `${formatUsd(row.value)}/CU` : "no eligible prints yet"}</span></div>
          <div className="row"><span>Reference</span><span>{formatUsd(row.reference?.value)}</span></div>
          <div className="row"><span>Entities</span><span>{row.participants}</span></div>
          <div className="row"><span>Eligible volume</span><span>{row.eligible_volume_cu} CU/24h</span></div>
        </section>
      ) : (
        <p className="muted">Loading index…</p>
      )}
    </div>
  );
}
