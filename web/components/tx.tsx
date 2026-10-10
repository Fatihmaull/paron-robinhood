"use client";

import { useState } from "react";
import type { Abi, PublicClient } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { CLAIM_DEFAULT_GAS_LIMIT, explorerTxUrl } from "@/lib/config";
import { afterDeadlineOpen } from "@/lib/clock";
import { STALE_DEADLINE_REVERTS, revertName } from "@/lib/errors";
import { shortId } from "@/lib/format";
import { useData } from "./providers";

export type TxPhase = "pending" | "success" | "failed";

export type TxRecord = {
  phase: TxPhase;
  hash?: string;
  message?: string;
};

function failureMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";
  if (/user rejected|user denied|rejected the request/i.test(raw)) return "Transaction rejected.";
  return "Transaction failed.";
}

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
  const [record, setRecord] = useState<TxRecord | null>(null);

  async function send(
    label: string,
    request: WriteReq,
    opts?: { deadlineMs?: number; staleOk?: boolean },
  ): Promise<boolean> {
    if (source === "mock") return false;
    setPending(label);
    setError(null);
    setNote(null);
    setRecord({ phase: "pending" });
    let hash: string | undefined;
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
          if (!stale) throw err;
          setNote("Waiting for the next block…");
          hash = await writeContractAsync({ ...request, gas: CLAIM_DEFAULT_GAS_LIMIT } as never);
          setRecord({ phase: "pending", hash });
          await settle(client, hash);
          setRecord({ phase: "success", hash });
          return true;
        }
      }
      hash = await writeContractAsync(args);
      setRecord({ phase: "pending", hash });
      if (client) await settle(client, hash);
      setRecord({ phase: "success", hash });
      return true;
    } catch (err) {
      const message = failureMessage(err);
      setError(message);
      setRecord({ phase: "failed", hash, message });
      return false;
    } finally {
      setPending(null);
    }
  }

  return { send, pending, note, error, setNote, record };
}

async function settle(client: PublicClient, hash: string) {
  const receipt = await client.waitForTransactionReceipt({ hash: hash as `0x${string}` });
  if (receipt.status !== "success") throw new Error("Transaction failed.");
}

export function TxStatus({ record }: { record: TxRecord | null }) {
  if (!record) return null;
  const label = record.phase === "pending" ? "Pending" : record.phase === "success" ? "Success" : "Failed";
  return (
    <p className={`tx-status ${record.phase}`} role="status" data-testid="tx-status">
      {label}
      {record.hash ? (
        <>
          {" · "}
          <a className="ext" href={explorerTxUrl(record.hash)} data-testid="tx-explorer">
            {shortId(record.hash)}
          </a>
        </>
      ) : null}
      {record.phase === "failed" && record.message ? ` · ${record.message}` : null}
    </p>
  );
}
