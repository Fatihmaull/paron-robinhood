"use client";

import { useEffect, useRef } from "react";
import { ColorType, createChart, LineSeries, type UTCTimestamp } from "lightweight-charts";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { PrintRow } from "@/lib/types";

export function PrintChart({ prints }: { prints: PrintRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const chart = createChart(node, {
      height: 220,
      layout: { background: { type: ColorType.Solid, color: "#141a15" }, textColor: "#c5d4c2" },
      grid: { vertLines: { color: "#243028" }, horzLines: { color: "#243028" } },
      timeScale: { timeVisible: true },
    });
    const series = chart.addSeries(LineSeries, { color: "#d6ff4a" });
    const points = [...prints]
      .sort((a, b) => a.ts_ms - b.ts_ms)
      .map((print) => ({ time: Math.floor(print.ts_ms / 1000) as UTCTimestamp, value: Number(print.cu_price) }));
    if (points.length > 0) series.setData(points);
    chart.timeScale().fitContent();
    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: node.clientWidth });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [prints]);
  return <div ref={ref} />;
}

/** Chart coordinates are display-only. Money in the tables stays decimal strings. */
export function BondChart({ balance, released, slashed }: { balance: string; released: string; slashed: string }) {
  const data = [
    { name: "Balance", value: Number(balance) },
    { name: "Released", value: Number(released) },
    { name: "Slashed", value: Number(slashed) },
  ];
  return (
    <div style={{ height: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#8d9b8a" />
          <YAxis stroke="#8d9b8a" />
          <Bar dataKey="value" fill="#d6ff4a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
