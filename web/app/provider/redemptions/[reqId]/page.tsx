"use client";

import { useParams } from "next/navigation";
import { ProviderConsole } from "@/components/provider-console";

export default function ProviderRedemptionPage() {
  const params = useParams<{ reqId: string }>();
  return <ProviderConsole focus={params.reqId} />;
}
