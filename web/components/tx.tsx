"use client";

import { useState } from "react";
import type { Abi } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { CLAIM_DEFAULT_GAS_LIMIT } from "@/lib/config";
import { afterDeadlineOpen } from "@/lib/clock";
import { STALE_DEADLINE_REVERTS, revertName } from "@/lib/errors";
import { useData } from "./providers";

type WriteReq = {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
};

export function useSend() {
  const { source, nowMs } = useData();
  const client = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(
    label: string,
    request: WriteReq,
    opts?: { deadlineMs?: number; staleOk?: boolean },
  ) {
    if (source === "mock") return;
    setPending(label);
    setError(null);
    setNote(null);
    const args = request as never;
    try {
      if (client) {
        try {
          await client.simulateContract(args);
        } catch (err) {
          const name = revertName(err);
          const stale =
            opts?.staleOk &&
            opts.deadlineMs != null &&
            name != null &&
            STALE_DEADLINE_REVERTS.has(name) &&
            afterDeadlineOpen(nowMs, opts.deadlineMs);
          if (stale) {
            setNote("Waiting for the next block…");
            await writeContractAsync({ ...request, gas: CLAIM_DEFAULT_GAS_LIMIT } as never);
            return;
          }
          throw err;
        }
      }
      await writeContractAsync(args);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setPending(null);
    }
  }

  return { send, pending, note, error, setNote };
}
