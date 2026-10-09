"use client";

import { Markets } from "@/components/markets";

export default function TradeIndexPage() {
  return (
    <div>
      <h1>Trade</h1>
      <p className="lede">Pick a series to open the order ticket.</p>
      <Markets heading={false} />
    </div>
  );
}
