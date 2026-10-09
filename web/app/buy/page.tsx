"use client";

import { Markets } from "@/components/markets";

export default function BuyIndexPage() {
  return (
    <div>
      <h1>Buy</h1>
      <p className="lede">Pick a series to open the primary buy box.</p>
      <Markets heading={false} />
    </div>
  );
}
