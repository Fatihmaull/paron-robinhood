"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { canonicalAddress } from "@/lib/format";

export default function ProviderPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  useEffect(() => {
    if (isConnected && address && isAddress(address)) {
      router.replace(`/provider/${canonicalAddress(address)}`);
    }
  }, [address, isConnected, router]);

  if (isConnected && address) {
    return (
      <div>
        <h1>Provider</h1>
        <p className="muted">Opening your dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Provider</h1>
      <p className="lede">
        List GPU capacity as compute units. Connect wallet in the top bar to open your provider dashboard with your
        series, redemptions, and agent status.
      </p>
      <section className="panel">
        <h2>Before you list</h2>
        <ol style={{ listStyle: "decimal", paddingLeft: 20, margin: 0, display: "grid", gap: 8 }}>
          <li>Your wallet needs a provider attestation (role 1) from the verifier, linked to your address.</li>
          <li>Each series locks a bond of 1.5× the primary price before any unit exists.</li>
          <li>If a redemption misses its deadline, any wallet can claim the bond for the holder.</li>
        </ol>
        <div style={{ marginTop: 16 }}>
          <Link className="btn ghost" href="/docs#step-13">
            Read the provider steps
          </Link>
        </div>
      </section>
    </div>
  );
}
