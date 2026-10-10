"use client";

import { useParams } from "next/navigation";
import { OperatorLink } from "@/components/operator-link";
import { RedemptionView } from "@/components/redemption-view";

export default function DisputePage() {
  const params = useParams<{ reqId: string }>();
  return (
    <>
      <OperatorLink />
      <RedemptionView reqId={params.reqId} />
    </>
  );
}
