"use client";

import Link from "next/link";
import { formatCu, formatUsd, formatWib, shortId } from "@/lib/format";
import { useHolderQueue, useHoldings, useKeeperQueue, useStatement } from "@/lib/hooks";
import { Panel } from "./ui";

const TABS = [
  ["holdings", "Holdings"],
  ["redemptions", "Redemptions"],
  ["claims", "Claims"],
  ["statement", "Statement"],
] as const;

export function Portfolio({ tab }: { tab: string }) {
  return (
    <div>
      <h1>Portfolio</h1>
      <p className="lede">Connect a wallet to read your own balances.</p>
      <div className="tabs">
        {TABS.map(([id, label]) => (
          <Link key={id} href={id === "holdings" ? "/portfolio" : `/portfolio?tab=${id}`} data-active={tab === id}>
            {label}
          </Link>
        ))}
      </div>
      {tab === "holdings" ? <Holdings /> : null}
      {tab === "redemptions" ? <RedemptionList claimsOnly={false} /> : null}
      {tab === "claims" ? <RedemptionList claimsOnly /> : null}
      {tab === "statement" ? <Statement /> : null}
    </div>
  );
}

function Holdings() {
  const query = useHoldings();
  const rows = query.data?.data ?? [];
  if (query.isError) return <p className="bad">{query.error instanceof Error ? query.error.message : "Couldn't load holdings."}</p>;
  return (
    <Panel title="Holdings">
      <div className="table-scroll">
      <table>
        <thead>
          <tr><th>Series</th><th>Balance</th><th>Locked</th><th>Value</th><th></th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.series.series_id}>
              <td><Link href={`/markets/${row.series.series_id}`}>{row.series.symbol}</Link></td>
              <td>{formatCu(row.balance_cu)}</td>
              <td>{formatCu(row.locked_cu)}</td>
              <td>{formatUsd(row.value_at_last_usd)}</td>
              <td>{row.redeemable_now ? <Link href={`/redemptions/new?series=${row.series.series_id}`}>Redeem</Link> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {rows.length === 0 ? <p className="muted">No holdings.</p> : null}
    </Panel>
  );
}

function RedemptionList({ claimsOnly }: { claimsOnly: boolean }) {
  const keepers = useKeeperQueue();
  const holder = useHolderQueue();
  const query = claimsOnly ? keepers : holder;
  const rows = (query.data?.data ?? []).filter((row) => (claimsOnly ? row.state === "DEFAULTABLE" || row.actions.includes("CLAIM_DEFAULT") : true));
  return (
    <Panel title={claimsOnly ? "Claimable defaults" : "Redemptions"}>
      {rows.length === 0 ? <p className="muted">{claimsOnly ? "No claims." : "No redemptions."}</p> : null}
      {rows.map((row) => (
        <div className="row" key={row.req_id}>
          <span>
            <Link href={`/redemptions/${row.req_id}`}>#{row.req_id}</Link> {row.symbol} · {formatCu(row.amount_cu)} · {row.state}
          </span>
          <span>{formatUsd(row.claim_usd)}</span>
        </div>
      ))}
      <p className="help">Claim default is public. Open the request from any wallet.</p>
    </Panel>
  );
}

function Statement() {
  const query = useStatement();
  const rows = query.data?.data ?? [];
  if (query.isError) return <p className="bad">{query.error instanceof Error ? query.error.message : "Statements need the Paron API. Try again shortly."}</p>;
  return (
    <Panel title="Statement">
      <div className="table-scroll">
      <table>
        <thead>
          <tr><th>Time</th><th>Kind</th><th>USDC</th><th>CU</th><th>Tx</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.kind}-${row.ts_ms}-${row.tx_hash}`}>
              <td title={row.ts_iso}>{formatWib(row.ts_ms)}</td>
              <td>{row.kind}</td>
              <td>{formatUsd(row.usdc_delta)}</td>
              <td>{row.cu_delta}</td>
              <td><a href={row.explorer_url}>{shortId(row.tx_hash)}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Panel>
  );
}
