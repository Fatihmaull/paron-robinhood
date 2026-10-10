"use client";

import { useParams } from "next/navigation";
import { ArbiterPage } from "@/components/ops";

export default function Page() {
  const params = useParams<{ reqId: string }>();
  return <ArbiterPage reqId={params.reqId} />;
}
