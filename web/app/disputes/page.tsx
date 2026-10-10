"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OperatorLink } from "@/components/operator-link";

export default function DisputesPage() {
  const router = useRouter();
  const [reqId, setReqId] = useState("");
  return (
    <div>
      <OperatorLink />
      <h1>Disputes</h1>
      <p className="lede">Open a request that is already in dispute.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const id = reqId.trim();
          if (id) router.push(`/disputes/${id}`);
        }}
      >
        <label>
          Request id
          <input value={reqId} onChange={(event) => setReqId(event.target.value)} inputMode="numeric" />
        </label>
        <button className="btn" type="submit">Open</button>
      </form>
    </div>
  );
}
