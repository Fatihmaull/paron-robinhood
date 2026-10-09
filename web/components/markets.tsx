"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { canonicalAddress, formatCoverage, formatCu, formatFactor, formatUsd, shortId } from "@/lib/format";
import { useSeriesList } from "@/lib/hooks";
import { marketsNotice, showSeriesCount } from "@/lib/markets-state";
import type { SeriesRow } from "@/lib/types";
import { Panel } from "./ui";

export function Markets({ headline = false, heading = true }: { headline?: boolean; heading?: boolean }) {
  const query = useSeriesList();
  const rows = query.data?.data ?? [];
  const router = useRouter();
  const notice = marketsNotice(query.error);
  const syncing = notice?.kind === "syncing";
  return (
    <div>
      {headline ? (
        <>
          <p className="kicker">Compute-hour markets</p>
          <h1>Where compute is forged into one standard.</h1>
          <p className="lede">
            Physical GPU compute, sold forward. 1 CU = 1 H100-equivalent GPU-hour. Every CU is bonded.
          </p>
          <div className="actions">
            <Link className="btn" href="/markets">Browse markets</Link>
            <Link className="btn ghost" href="/provider/series/new">List capacity</Link>
          </div>
        </>
      ) : heading ? (
        <div className="page-head">
          <div>
            <h1>Markets</h1>
            <p className="lede">Primary sales, a secondary book, and bonded redemptions.</p>
          </div>
          <Link className="btn" href="/provider/series/new">List capacity</Link>
        </div>
      ) : null}
      {headline || heading ? <div style={{ height: 16 }} /> : null}
      <Panel title="Series">
        {notice?.kind === "error" ? <p className="bad">{notice.text}</p> : null}
        {syncing ? <p role="status" data-testid="markets-syncing" style={{ color: "var(--color-info)" }}>{notice.text}</p> : null}
        {query.isLoading || syncing ? (
          <div role="status" aria-label="Loading series" data-testid="series-skeleton">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton row-sk" />)}
          </div>
        ) : null}
        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Series</th>
              <th>Provider</th>
              <th>GPU</th>
              <th className="num">Primary</th>
              <th className="num">Last</th>
              <th className="num">24h vol</th>
              <th className="num">Bond / CU</th>
              <th className="num">Coverage</th>
              <th className="num">Record</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.series_id}
                className="click-row"
                tabIndex={0}
                onClick={() => router.push(`/markets/${row.series_id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") router.push(`/markets/${row.series_id}`);
                }}
              >
                <td>
                  <span className="cell-inline">
                    <span className="sym">{row.symbol}</span>
                    <SalePill row={row} />
                  </span>
                </td>
                <td>
                  {row.provider.verified ? <span className="ok">✓ </span> : null}
                  <span className="num" title={canonicalAddress(row.provider.address)}>{shortId(row.provider.address)}</span>
                  {row.provider.status.toUpperCase() === "ACTIVE" ? null : <span className="pill danger">{row.provider.status}</span>}
                </td>
                <td>
                  {row.gpu} <span className="num muted">{formatFactor(row.factor)}</span>
                </td>
                <td className="num">{formatUsd(row.primary_price)}</td>
                <td className="num">{row.last_price ? formatUsd(row.last_price) : "—"}</td>
                <td className="num">{formatCu(row.volume_24h_cu)}</td>
                <td className="num">
                  {formatUsd(row.bond_per_cu)}
                </td>
                <td className="num">
                  <span className="cell-inline end">
                    {Number(row.coverage) >= 2 ? <span className="pill outline">200% backed</span> : null}
                    {formatCoverage(row.coverage)}
                  </span>
                </td>
                <td className="num">
                  {row.provider.delivered_cu} /{" "}
                  <span className={Number(row.provider.defaulted_cu) > 0 ? "bad" : undefined}>{row.provider.defaulted_cu}</span>
                  {" / "}
                  {row.provider.voluntary_defaulted_cu}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="help">Record = delivered CU / defaulted CU / voluntary defaults, counted across the provider. {showSeriesCount(notice, query.isLoading) ? ` ${rows.length} series.` : null}</p>
      </Panel>
    </div>
  );
}

function SalePill({ row }: { row: SeriesRow }) {
  if (row.finalized) return <span className="pill neutral">Finalized</span>;
  if (row.paused) return <span className="pill warn">Paused</span>;
  if (row.sale_open) return <span className="pill sale">Sale open</span>;
  return <span className="pill outline">Sale closed</span>;
}
