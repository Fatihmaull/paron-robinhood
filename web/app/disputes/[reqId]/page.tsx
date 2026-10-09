"use client";

import { useParams } from "next/navigation";
import { RedemptionView } from "@/components/redemption-view";

export default function DisputePage() {
  const params = useParams<{ reqId: string }>();
  return <RedemptionView reqId={params.reqId} />;
}
