"use client";

import Link from "next/link";
import { useState } from "react";
import { parseUnits } from "viem";
import { erc20Abi, redemptionManagerAbi } from "@/lib/abi";
import { afterDeadlineOpen, beforeDeadlineOpen, inUnlockGap } from "@/lib/clock";
import { contractAddress } from "@/lib/config";
import { errorCopy } from "@/lib/errors";
import { disputeBond, formatCountdown, formatCu, formatUsd, formatWib, shortId } from "@/lib/format";
import { PROVIDER_T1_SERVER_MS, snapServerNow } from "@/lib/fixtures";
import { useRedemption } from "@/lib/hooks";
import type { Redemption } from "@/lib/types";
import { useData } from "./providers";
import { useSend } from "./tx";
import { Field, Panel, TxButton } from "./ui";

const STATE_PILL: Record<string, { label: string; tone: string }> = {
  REQUESTED: { label: "Waiting for provider ack", tone: "req" },
  ACKNOWLEDGED: { label: "Provider acknowledged", tone: "ack" },
  DELIVERED: { label: "Delivered · review", tone: "del" },
  DEFAULTABLE: { label: "Deadline missed", tone: "dfa" },
  DISPUTED: { label: "In dispute", tone: "dsp" },
  DEFAULTED: { label: "Defaulted · paid", tone: "dft" },
  FINALIZED: { label: "Completed", tone: "fin" },
  REFUNDED: { label: "Refunded · CU returned", tone: "ref" },
};

function StatePill({ state }: { state: string }) {
  const known = STATE_PILL[state];
  if (!known) return <span className="pill outline">{state}</span>;
  return <span className={`pill ${known.tone}`}>{known.label}</span>;
}

export function activeDeadline(row: Redemption): number | null {
  if (row.state === "REQUESTED") return row.ack_deadline_ms;
  if (row.state === "ACKNOWLEDGED") return row.delivery_deadline_ms;
  if (row.state === "DELIVERED") return row.dispute_deadline_ms;
  if (row.state === "DISPUTED") return row.ruling_deadline_ms;
  if (row.state === "DEFAULTABLE") return row.ack_deadline_ms ?? row.delivery_deadline_ms;
  return row.next_deadline_ms;
}

export function RedemptionView({ reqId }: { reqId: string }) {
  const query = useRedemption(reqId);
  const { nowMs, clockLabel, snap } = useData();
  const row = query.data?.data;
  if (query.isLoading) return <p className="muted">Loading redemption…</p>;
  if (!row) {
    return (
      <div>
        <h1>Redemption #{reqId}</h1>
        <p>This request is not in snapshot {snap}. Switch to t2 for request 2 before the claim, or t3 after it.</p>
      </div>
    );
  }
  const deadline = activeDeadline(row);
  return (
    <div>
      <p className="kicker">Public redemption</p>
      <h1 className="sym">Redemption #{row.req_id}</h1>
      <p className="lede">
        <span className="num">{row.symbol}</span> · <span className="num">{formatCu(row.amount_cu)}</span>{" "}
        <StatePill state={row.state} />
        {row.stored_state !== row.state ? <span className="muted"> stored {row.stored_state}</span> : null}
      </p>
      <div className="grid two">
        <Panel>
          <StateCopy row={row} nowMs={nowMs} deadline={deadline} clockLabel={clockLabel} />
          <ClaimBlock row={row} nowMs={nowMs} deadline={deadline} clockLabel={clockLabel} />
          <HolderActions row={row} nowMs={nowMs} deadline={deadline} />
          <PublicActions row={row} nowMs={nowMs} deadline={deadline} />
          {row.reopened_from_req_id ? <p>Reopened from #{row.reopened_from_req_id}.</p> : null}
          {row.reopened_to_req_id ? <p>Reopened as #{row.reopened_to_req_id}.</p> : null}
        </Panel>
        <Panel title="Timeline">
          {(row.timeline ?? []).map((event) => (
            <div className="row" key={`${event.event}-${event.ts_ms}`}>
              <span>{event.event}<div className="muted">{formatWib(event.ts_ms)}</div></span>
              <a href={event.explorer_url}>{shortId(event.tx_hash)}</a>
            </div>
          ))}
          <div className="row"><span>Holder</span><span>{shortId(row.holder)}</span></div>
          <div className="row"><span>Provider</span><span>{shortId(row.provider)}</span></div>
          <div className="row"><span>Server now</span><span>{formatWib(nowMs)} {clockLabel}</span></div>
        </Panel>
      </div>
    </div>
  );
}

function StateCopy({
  row,
  nowMs,
  deadline,
  clockLabel,
}: {
  row: Redemption;
  nowMs: number;
  deadline: number | null;
  clockLabel: string;
}) {
  if (row.state === "DEFAULTED") {
    return <p className="bad">Default paid. {formatUsd(row.payout)} sent to {shortId(row.holder)}.</p>;
  }
  if (row.state === "FINALIZED") return <p className="ok">Finalized. Bond released {formatUsd(row.bond_released)}.</p>;
  if (!deadline) return <p>{row.state}</p>;
  const remaining = formatCountdown(nowMs, deadline);
  const passed = nowMs > deadline;
  return (
    <div>
      <div className="clock" data-testid="countdown">{remaining}</div>
      <p className="muted">
        {passed ? `Deadline passed ${remaining.replace("-", "")} ago.` : "until the deadline"} {clockLabel}
      </p>
      {row.state === "DEFAULTABLE" || row.state === "REQUESTED" ? (
        <p>If it passes, anyone can claim {formatUsd(row.claim_usd)} for the holder.</p>
      ) : null}
    </div>
  );
}

function ClaimBlock({
  row,
  nowMs,
  deadline,
  clockLabel,
}: {
  row: Redemption;
  nowMs: number;
  deadline: number | null;
  clockLabel: string;
}) {
  const { send, pending, note, error } = useSend();
  const [paid, setPaid] = useState(false);
  const listed = row.actions.includes("CLAIM_DEFAULT") || row.state === "DEFAULTABLE";
  if (!listed || deadline == null) return null;
  const open = afterDeadlineOpen(nowMs, deadline);
  const gap = inUnlockGap(nowMs, deadline);
  const when = formatWib(deadline);
  return (
    <div className="rc-alert">
      <h2>Claim default on #{row.req_id}</h2>
      <p>{row.stored_state === "ACKNOWLEDGED" ? "The provider missed the delivery deadline." : "The provider missed the acknowledgment deadline."}</p>
      <p>Anyone can trigger the payout. No admin, no oracle.</p>
      <div className="row"><span>Holder receives</span><span>{formatUsd(row.claim_usd)} ({formatCu(row.amount_cu)})</span></div>
      <div className="row"><span>Paid to</span><span>{shortId(row.holder)} (holder)</span></div>
      <div className="row"><span>You pay</span><span>gas only</span></div>
      <TxButton
        testId="claim-default"
        tone="danger"
        armed={open}
        disabled={!open}
        reason={open ? undefined : "Unlocks when the deadline passes."}
        onClick={() => {
          void send(
            "claim",
            {
              address: contractAddress("redemptionManager"),
              abi: redemptionManagerAbi,
              functionName: "claimDefault",
              args: [BigInt(row.req_id)],
            },
            { staleOk: true, deadlineMs: deadline },
          ).then(() => {
            if (!error) setPaid(true);
          });
        }}
      >
        {pending === "claim" ? "Checking on-chain…" : "Claim default"}
      </TxButton>
      {!open ? <p className="help">Unlocks when the deadline passes.</p> : null}
      {gap ? <p className="help">The button stays shut for 2 seconds after the deadline second.</p> : null}
      <p className="help" data-testid="claim-status">
        {formatWib(nowMs)} {clockLabel}. Deadline {when}. Opens after {formatWib(deadline + 2000)}. {open ? "Time-eligible." : "Not yet."}{" "}
        {errorCopy("NotDefaultable", { deadline: when })}
      </p>
      {note ? <p className="warn">{note}</p> : null}
      {error ? <p className="bad">{error}</p> : null}
      {paid ? (
        <div className="panel success">
          <p>Default paid. {formatUsd(row.claim_usd)} sent to {shortId(row.holder)}.</p>
          <p>Provider strike recorded.</p>
          <Link href={`/markets/${row.series_id}`}>View series</Link>
        </div>
      ) : null}
    </div>
  );
}

function HolderActions({ row, nowMs, deadline }: { row: Redemption; nowMs: number; deadline: number | null }) {
  const { send, pending } = useSend();
  const [openDispute, setOpenDispute] = useState(false);
  const [receipt, setReceipt] = useState("");
  const canDispute = row.actions.includes("DISPUTE") || (row.state === "DELIVERED" && deadline != null && beforeDeadlineOpen(nowMs, deadline));
  const canConfirm = row.actions.includes("CONFIRM") || row.state === "DELIVERED";
  if (!canDispute && !canConfirm && row.state !== "DELIVERED") return null;
  const bond = disputeBond(row.claim_usd);
  return (
    <div>
      {canConfirm ? (
        <TxButton
          onClick={() =>
            void send("confirm", {
              address: contractAddress("redemptionManager"),
              abi: redemptionManagerAbi,
              functionName: "confirm",
              args: [BigInt(row.req_id)],
            })
          }
        >
          {pending === "confirm" ? "Confirming…" : "Confirm"}
        </TxButton>
      ) : null}
      {canDispute ? (
        <button className="btn ghost" type="button" onClick={() => setOpenDispute(true)}>
          Dispute
        </button>
      ) : null}
      {openDispute ? (
        <div>
          <p>Dispute bond {formatUsd(bond)} (the greater of 5% of the claim and $5).</p>
          <p className="help">Demo: access details are hashed, not delivered.</p>
          <Field label="What was missing">
            <textarea value={receipt} onChange={(event) => setReceipt(event.target.value)} />
          </Field>
          <TxButton
            tone="ghost"
            disabled={deadline != null && !beforeDeadlineOpen(nowMs, deadline)}
            onClick={() => {
              void (async () => {
                const usdc = contractAddress("usdc");
                const rm = contractAddress("redemptionManager");
                await send("approve-bond", {
                  address: usdc,
                  abi: erc20Abi,
                  functionName: "approve",
                  args: [rm, parseUnits(bond, 6)],
                });
                await send("dispute", {
                  address: rm,
                  abi: redemptionManagerAbi,
                  functionName: "dispute",
                  args: [BigInt(row.req_id)],
                });
              })();
            }}
          >
            Post dispute
          </TxButton>
        </div>
      ) : null}
    </div>
  );
}

function PublicActions({ row, nowMs, deadline }: { row: Redemption; nowMs: number; deadline: number | null }) {
  const { send, pending, note } = useSend();
  const finalizeOpen = row.state === "DELIVERED" && deadline != null && afterDeadlineOpen(nowMs, deadline);
  const resolveOpen = row.state === "DISPUTED" && deadline != null && afterDeadlineOpen(nowMs, deadline);
  if (row.state !== "DELIVERED" && row.state !== "DISPUTED") return null;
  return (
    <div className="actions">
      {row.state === "DELIVERED" ? (
        <TxButton
          disabled={!finalizeOpen}
          reason="Unlocks when the deadline passes."
          onClick={() =>
            void send(
              "finalize",
              {
                address: contractAddress("redemptionManager"),
                abi: redemptionManagerAbi,
                functionName: "finalizeRedemption",
                args: [BigInt(row.req_id)],
              },
              { staleOk: true, deadlineMs: deadline ?? undefined },
            )
          }
        >
          {pending === "finalize" ? "Finalizing…" : "Finalize"}
        </TxButton>
      ) : null}
      {row.state === "DISPUTED" ? (
        <TxButton
          disabled={!resolveOpen}
          reason="Unlocks when the deadline passes."
          onClick={() =>
            void send(
              "resolve",
              {
                address: contractAddress("redemptionManager"),
                abi: redemptionManagerAbi,
                functionName: "resolveNoRuling",
                args: [BigInt(row.req_id)],
              },
              { staleOk: true, deadlineMs: deadline ?? undefined },
            )
          }
        >
          Resolve no-ruling
        </TxButton>
      ) : null}
      {note ? <p className="warn">{note}</p> : null}
      <p className="help">resolveNoRuling can reopen the request once, before the grace window ends.</p>
    </div>
  );
}

export function providerCardNow(nowMs: number, snapServer: number, snapIsT1: boolean): number {
  if (!snapIsT1) return nowMs;
  return PROVIDER_T1_SERVER_MS + (nowMs - snapServer);
}

export function useProviderNow(): number {
  const { nowMs, snap } = useData();
  return providerCardNow(nowMs, snapServerNow(snap), snap === "t1");
}
