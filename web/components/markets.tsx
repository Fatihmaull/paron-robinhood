"use client";

import Link from "next/link";
import { formatCoverage, formatUsd, shortId } from "@/lib/format";
import { useSeriesList } from "@/lib/hooks";
import { Panel } from "./ui";

export function Markets({ headline = false }: { headline?: boolean }) {
  const query = useSeriesList();
  const rows = query.data?.data ?? [];
  return (
    <div>
      {headline ? (
        <>
          <p className="kicker">Compute-hour markets</p>
          <h1>Buy GPU capacity that a provider bond stands behind.</h1>
          <p className="lede">
            Primary sales, a secondary book, and redemptions with a public default claim. Testnet demo only.
          </p>
          <div className="actions">
            <Link className="btn" href="/markets">Browse markets</Link>
            <Link className="btn ghost" href="/provider/series/new">List capacity</Link>
          </div>
        </>
      ) : (
        <h1>Markets</h1>
      )}
      <div style={{ height: 16 }} />
      <Panel title="Series">
        {query.isError ? <p className="bad">{query.error instanceof Error ? query.error.message : "Couldn't load markets. Check your connection and retry."}</p> : null}
        {query.isLoading ? <p className="muted">Loading series…</p> : null}
        <table>
          <thead>
            <tr>
              <th>Series</th>
              <th>Window</th>
              <th>Primary</th>
              <th>Last</th>
              <th>Bond / CU</th>
              <th>Coverage</th>
              <th>Record</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.series_id}>
                <td>
                  <Link href={`/markets/${row.series_id}`}>{row.symbol}</Link>
                  <div className="muted">{row.gpu} · {shortId(row.provider.address)}</div>
                </td>
                <td>{row.delivery_window}</td>
                <td>{formatUsd(row.primary_price)}/CU</td>
                <td>{row.last_price ? `${formatUsd(row.last_price)}/CU` : "—"}</td>
                <td>{formatUsd(row.bond_per_cu)}</td>
                <td>{formatCoverage(row.coverage)}</td>
                <td>{row.provider.delivered_cu} / {row.provider.defaulted_cu} / {row.provider.voluntary_defaulted_cu}</td>
                <td>
                  <Link href={`/buy/${row.series_id}`}>Buy</Link>
                  {" · "}
                  <Link href={`/trade/${row.series_id}`}>Trade</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="help">Record is delivered / defaulted / voluntary, counted across the provider.</p>
      </Panel>
    </div>
  );
}
