"use client";

import { formatUsd, formatWib } from "@/lib/format";
import { usePrints } from "@/lib/hooks";
import { TAPE_UNAVAILABLE } from "@/lib/onchain";

export default function DataPage() {
  const query = usePrints();
  const rows = query.data?.data ?? [];
  return (
    <div>
      <h1>Prints</h1>
      <p className="lede">Eligible H100 prints. CSV export matches the data contract columns.</p>
      {query.data?.origin === "onchain" ? <p>{TAPE_UNAVAILABLE}</p> : null}
      <div className="table-scroll">
      <table>
        <thead>
          <tr><th>Time</th><th>Series</th><th>Price</th><th>Qty</th><th>Notional</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatWib(row.ts_ms)}</td>
              <td>{row.series ?? row.series_id}</td>
              <td>{formatUsd(row.cu_price)}</td>
              <td>{row.qty_cu}</td>
              <td>{formatUsd(row.notional_usd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <p className="help">curl example: GET /v1/prints?gpu=H100&amp;limit=3</p>
    </div>
  );
}
