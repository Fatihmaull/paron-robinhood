"use client";

import { formatUsd } from "@/lib/format";
import { indexQuote } from "@/lib/index-quote";
import { useIndex } from "@/lib/hooks";

export default function IndexPage() {
  const query = useIndex();
  const row = query.data?.data;
  const quote = indexQuote(row);
  return (
    <div>
      <h1>H100 index</h1>
      <p className="lede">Demo data</p>
      {row ? (
        <section className="panel">
          <div className="row"><span>Status</span><span>{row.status}</span></div>
          <div className="row"><span>Value</span><span>{row.value ? `${formatUsd(row.value)}/CU` : "no eligible prints yet"}</span></div>
          <div className="row"><span>{quote.label}</span><span>{formatUsd(quote.amount)}</span></div>
          <div className="row"><span>Entities</span><span>{row.participants}</span></div>
          <div className="row"><span>Eligible volume</span><span>{row.eligible_volume_cu} CU/24h</span></div>
        </section>
      ) : query.isError ? (
        <p className="muted" role="status" data-testid="index-unavailable">
          {query.error instanceof Error && (query.error as { code?: string }).code === "INDEXER_SYNCING"
            ? "Indexer syncing, the index will appear once it catches up."
            : "Index unavailable right now. Retrying shortly."}
        </p>
      ) : (
        <p className="muted">Loading index…</p>
      )}
    </div>
  );
}
