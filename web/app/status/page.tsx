"use client";

import { useData } from "@/components/providers";

export default function StatusPage() {
  const { source, origin, indexedBlock } = useData();
  return (
    <div>
      <h1>Status</h1>
      <section className="panel">
        <div className="row"><span>Data source</span><span>{source}</span></div>
        <div className="row"><span>Origin</span><span>{origin}</span></div>
        <div className="row"><span>Indexed block</span><span>{indexedBlock ?? "—"}</span></div>
      </section>
    </div>
  );
}
