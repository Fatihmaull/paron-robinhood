"use client";

import { useEffect } from "react";
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

  return (
    <div>
      <h1>Provider</h1>
      {!isConnected || !address ? <p>Connect wallet</p> : <p className="muted">Opening your dashboard.</p>}
    </div>
  );
}
