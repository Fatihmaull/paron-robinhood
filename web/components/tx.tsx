"use client";

import { useState } from "react";
import type { Abi, PublicClient } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { CLAIM_DEFAULT_GAS_LIMIT, explorerTxUrl } from "@/lib/config";
import { afterDeadlineOpen } from "@/lib/clock";
import { STALE_DEADLINE_REVERTS, failureReason, revertName } from "@/lib/errors";
import { shortId } from "@/lib/format";
import { simulationRequest } from "@/lib/tx-sim";
import { useData } from "./providers";

export type TxPhase = "pending" | "success" | "failed";

export type TxRecord = {
  phase: TxPhase;
  /** send() label of this step, such as approve or buy. */
  step?: string;
  hash?: string;
  message?: string;
};

function failureMessage(err: unknown): string {
  return failureReason(err);
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
  const { address } = useAccount();
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
    setRecord({ phase: "pending", step: label });
    let hash: string | undefined;
    const args = request as never;
    try {
      if (client && address) {
        try {
          await client.simulateContract(simulationRequest(request, address) as never);
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
          setRecord({ phase: "pending", step: label, hash });
          await settle(client, hash);
          setRecord({ phase: "success", step: label, hash });
          return true;
        }
      }
      hash = await writeContractAsync(args);
      setRecord({ phase: "pending", step: label, hash });
      if (client) await settle(client, hash);
      setRecord({ phase: "success", step: label, hash });
      return true;
    } catch (err) {
      const message = failureMessage(err);
      setError(message);
      setRecord({ phase: "failed", step: label, hash, message });
      return false;
    } finally {
      setPending(null);
    }
  }

  return { send, pending, note, error, setNote, record };
}

async function settle(client: PublicClient, hash: string) {
  const receipt = await client.waitForTransactionReceipt({ hash: hash as `0x${string}` });
  if (receipt.status === "success") return;
  const tx = await client.getTransaction({ hash: hash as `0x${string}` });
  if (tx.to) {
    await client.call({
      account: tx.from,
      to: tx.to,
      data: tx.input,
      value: tx.value,
      blockNumber: receipt.blockNumber,
    });
  }
  throw new Error("Transaction failed.");
}

export function TxStatus({ record }: { record: TxRecord | null }) {
  if (!record) return null;
  const label = record.phase === "pending" ? "Pending" : record.phase === "success" ? "Success" : "Failed";
  return (
    <p className={`tx-status ${record.phase}`} role="status" data-testid="tx-status">
      {label}
      {record.step ? ` · ${record.step}` : null}
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
