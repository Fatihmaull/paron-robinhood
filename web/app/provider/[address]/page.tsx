"use client";

import { useParams } from "next/navigation";
import { ProviderDashboard } from "@/components/provider-console";

export default function ProviderAddressPage() {
  const params = useParams<{ address: string }>();
  return <ProviderDashboard address={params.address} />;
}
