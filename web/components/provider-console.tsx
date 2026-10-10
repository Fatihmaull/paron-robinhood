"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { isAddress, keccak256, parseUnits, stringToHex } from "viem";
import { useAccount, useSignTypedData } from "wagmi";
import { agentCommandTypes, bondVaultAbi, redemptionManagerAbi, seriesFactoryAbi } from "@/lib/abi";
import { loadParticipant, loadProviderExact, loadProviderQueueFor } from "@/lib/api";
import { beforeDeadlineOpen } from "@/lib/clock";
import { agentUrl, chainId, contractAddress } from "@/lib/config";
import { canonicalAddress, formatCountdown, formatCu, formatUsd, formatWib, shortAddress, shortId } from "@/lib/format";
import { useKyb, useProviderAccount, useProviderQueue } from "@/lib/hooks";
import { kybBannerKind, sameWallet } from "@/lib/provider-select";
import type { Redemption } from "@/lib/types";
import { useData } from "./providers";
import { activeDeadline, useProviderNow } from "./redemption-view";
import { useSend } from "./tx";
import { Field, Panel, TxButton } from "./ui";

export function ProviderConsole({ focus }: { focus?: string }) {
  const account = useProviderAccount();
  const queue = useProviderQueue();
  const nowMs = useProviderNow();
  const provider = account.data?.data;
  const [tab, setTab] = useState(focus ? "requests" : "requests");
  const rows = queue.data?.data ?? [];
  const nextDeadline = rows
    .map((row) => activeDeadline(row))
    .filter((value): value is number => value != null)
    .sort((a, b) => a - b)[0];
  return (
    <div>
      <p className="kicker">Provider console</p>
      <h1>Provider</h1>
      {provider ? <p className="num" title={canonicalAddress(provider.address)}>{shortAddress(provider.address)}</p> : null}
      <p className="lede">
        {provider?.verified ? "Verified by Paron demo verifier" : "Not verified"} · {provider?.status ?? "—"}
      </p>
      {provider ? (
        <div className="stat-grid">
          <section className="panel stat">
            <h2>Bond balance</h2>
            <b>{formatUsd(provider.bond.balance)}</b>
          </section>
          <section className="panel stat">
            <h2>Proceeds</h2>
            <b>{formatUsd(provider.proceeds.net)}</b>
          </section>
          <section className="panel stat">
            <h2>Open requests</h2>
            <b>{provider.open_requests}</b>
          </section>
          <section className="panel stat">
            <h2>Next deadline</h2>
            <b>{nextDeadline ? formatCountdown(nowMs, nextDeadline) : "—"}</b>
          </section>
        </div>
      ) : null}
      <div className="actions">
        <Link className="btn" href="/provider/series/new">List capacity</Link>
      </div>
      <div className="tabs">
        {(["requests", "series", "bond", "agent"] as const).map((id) => (
          <button key={id} type="button" data-active={tab === id} onClick={() => setTab(id)}>
            {id[0]!.toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>
      {tab === "requests" ? (
        <div className="grid">
          {rows.length === 0 ? <Panel><p className="muted">No open requests.</p></Panel> : null}
          {rows.map((row) => (
            <RequestCard key={row.req_id} row={row} highlight={focus === row.req_id} />
          ))}
        </div>
      ) : null}
      {tab === "series" && provider ? (
        <Panel title="Series">
          {provider.series.map((series) => (
            <div className="row" key={series.series_id}>
              <Link href={`/markets/${series.series_id}`}>{series.symbol}</Link>
              <RaisePrice seriesId={series.series_id} />
              <SeriesFinalize seriesId={series.series_id} />
              <WithdrawButton seriesId={series.series_id} />
            </div>
          ))}
        </Panel>
      ) : null}
      {tab === "bond" && provider ? (
        <Panel title="Bond and proceeds">
          <div className="row"><span>Deposited</span><span>{formatUsd(provider.bond.deposited)}</span></div>
          <div className="row"><span>Balance</span><span>{formatUsd(provider.bond.balance)}</span></div>
          <div className="row"><span>Released</span><span>{formatUsd(provider.bond.released)}</span></div>
          <div className="row"><span>Slashed</span><span>{formatUsd(provider.bond.slashed)}</span></div>
          <div className="row"><span>Proceeds net</span><span>{formatUsd(provider.proceeds.net)}</span></div>
          <div className="row"><span>Strikes</span><span>{provider.reputation.strikes}</span></div>
          <p className="help">Withdraw remaining is available after the series is finalized and the window has ended.</p>
        </Panel>
      ) : null}
      {tab === "agent" ? <AgentPanel /> : null}
    </div>
  );
}

function RequestCard({ row, highlight, readOnly = false }: { row: Redemption; highlight: boolean; readOnly?: boolean }) {
  const nowMs = useProviderNow();
  const deadline = activeDeadline(row);
  const before = deadline != null && beforeDeadlineOpen(nowMs, deadline);
  const wantsDecline = row.actions.includes("DECLINE_AND_PAY") || row.state === "REQUESTED" || row.state === "ACKNOWLEDGED";
  const showDecline = wantsDecline && before && (row.state === "REQUESTED" || row.state === "ACKNOWLEDGED");
  const { send, pending } = useSend();
  const [deliverOpen, setDeliverOpen] = useState(highlight && row.state === "ACKNOWLEDGED");
  const [receipt, setReceipt] = useState("");
  const rm = contractAddress("redemptionManager");

  return (
    <Panel title={`Request #${row.req_id} · ${row.state}`}>
      <p>{row.symbol} · {formatCu(row.amount_cu)} · claim {formatUsd(row.claim_usd)}</p>
      {deadline ? <p className="help">Deadline {formatWib(deadline)} (server time). Card clock {formatWib(nowMs)}.</p> : null}
      {readOnly ? null : (
      <div className="actions">
        {(row.actions.includes("ACK") || (row.state === "REQUESTED" && before)) && before ? (
          <TxButton
            onClick={() =>
              void send("ack", { address: rm, abi: redemptionManagerAbi, functionName: "acknowledge", args: [BigInt(row.req_id)] })
            }
          >
            {pending === "ack" ? "Acknowledging…" : "Acknowledge"}
          </TxButton>
        ) : null}
        {(row.actions.includes("MARK_DELIVERED") || row.state === "ACKNOWLEDGED") && before ? (
          <button className="btn ghost" type="button" onClick={() => setDeliverOpen(true)}>Mark delivered</button>
        ) : null}
        {showDecline ? (
          <TxButton
            testId="decline-pay"
            tone="danger-outline"
            onClick={() =>
              void send("decline", {
                address: rm,
                abi: redemptionManagerAbi,
                functionName: "declineAndPay",
                args: [BigInt(row.req_id)],
              })
            }
          >
            Decline & pay
          </TxButton>
        ) : null}
      </div>
      )}
      {wantsDecline && !before && (row.state === "REQUESTED" || row.state === "ACKNOWLEDGED" || row.state === "DEFAULTABLE") ? (
        <p data-testid="decline-closed">Deadline passed. The holder can claim the default.</p>
      ) : null}
      {row.state === "DEFAULTABLE" ? <p><Link href={`/redemptions/${row.req_id}`}>Open the public claim</Link></p> : null}
      {!readOnly && deliverOpen ? (
        <div>
          <p className="help">Demo: access details are hashed, not delivered. Deadline is measured in server time.</p>
          <Field label="Receipt text">
            <textarea value={receipt} onChange={(event) => setReceipt(event.target.value)} />
          </Field>
          <TxButton
            disabled={!receipt || !before}
            onClick={() =>
              void send("deliver", {
                address: rm,
                abi: redemptionManagerAbi,
                functionName: "markDelivered",
                args: [BigInt(row.req_id), keccak256(stringToHex(receipt))],
              })
            }
          >
            Submit delivery
          </TxButton>
        </div>
      ) : null}
    </Panel>
  );
}

function RaisePrice({ seriesId }: { seriesId: string }) {
  const [price, setPrice] = useState("3.10");
  const { send } = useSend();
  return (
    <span className="actions">
      <input style={{ width: 90 }} value={price} onChange={(event) => setPrice(event.target.value)} />
      <TxButton
        onClick={() =>
          void send("raise", {
            address: contractAddress("seriesFactory"),
            abi: seriesFactoryAbi,
            functionName: "raisePrimaryPrice",
            args: [BigInt(seriesId), parseUnits(price, 6)],
          })
        }
      >
        Raise price
      </TxButton>
    </span>
  );
}

function SeriesFinalize({ seriesId }: { seriesId: string }) {
  const { send } = useSend();
  return (
    <TxButton
      onClick={() =>
        void send("finalize-series", {
          address: contractAddress("seriesFactory"),
          abi: seriesFactoryAbi,
          functionName: "finalizeSeries",
          args: [BigInt(seriesId)],
        })
      }
    >
      Finalize series
    </TxButton>
  );
}

function AgentPanel({ readOnly = false }: { readOnly?: boolean }) {
  const url = agentUrl();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [autoAck, setAutoAck] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const registry = contractAddress("providerRegistry");

  if (readOnly) {
    return (
      <Panel title="Agent">
        <p>Agent commands stay off on a read-only dashboard.</p>
      </Panel>
    );
  }

  if (!url) {
    return (
      <Panel title="Agent">
        <p>Agent control endpoint is not configured. Status is read from chain.</p>
        <p className="help">Set NEXT_PUBLIC_AGENT_URL to sign an AgentCommand and POST it to the local agent.</p>
      </Panel>
    );
  }

  return (
    <Panel title="Agent kill switch">
      <label>
        <input type="checkbox" checked={autoAck} onChange={(event) => setAutoAck(event.target.checked)} style={{ width: "auto" }} /> Auto-acknowledge
      </label>
      <TxButton
        onClick={() => {
          void (async () => {
            if (!address) return;
            const expiry = BigInt(Math.floor(Date.now() / 1000) + 300);
            const signature = await signTypedDataAsync({
              domain: { name: "Paron", version: "1", chainId: chainId(), verifyingContract: registry },
              types: agentCommandTypes,
              primaryType: "AgentCommand",
              message: { provider: address, autoAck, nonce: BigInt(Date.now()), expiry },
            });
            await fetch(url, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ provider: address, autoAck, signature }),
            });
            setMessage(autoAck ? "Auto-ack signed." : "Kill switch signed.");
          })();
        }}
      >
        Sign command
      </TxButton>
      {message ? <p>{message}</p> : null}
    </Panel>
  );
}

export function WithdrawButton({ seriesId }: { seriesId: string }) {
  const { send } = useSend();
  return (
    <TxButton
      onClick={() =>
        void send("withdraw", {
          address: contractAddress("bondVault"),
          abi: bondVaultAbi,
          functionName: "withdrawRemaining",
          args: [BigInt(seriesId)],
        })
      }
    >
      Withdraw remaining
    </TxButton>
  );
}

export function ProviderDashboard({ address }: { address: string }) {
  const route = isAddress(address) ? canonicalAddress(address) : null;
  const { address: wallet, isConnected } = useAccount();
  const { snap, source, client } = useData();
  const canAct = Boolean(route) && sameWallet(isConnected ? wallet : null, route);
  const account = useQuery({
    queryKey: ["provider-exact", snap, source, route],
    enabled: Boolean(route),
    queryFn: () => loadProviderExact(snap, source, route as string),
  });
  const queue = useQuery({
    queryKey: ["provider-queue", snap, source, route],
    enabled: Boolean(route),
    queryFn: () => loadProviderQueueFor(snap, source, client, route as string),
  });
  const participant = useQuery({
    queryKey: ["participant", source, route],
    enabled: Boolean(route),
    retry: false,
    queryFn: () => loadParticipant(route as string, source),
  });
  const kyb = useKyb();
  const nowMs = useProviderNow();
  const provider = account.data?.data ?? null;
  const rows = queue.data?.data ?? [];
  const pending = ((kyb.data?.data ?? []) as Array<{ applicant?: string; status?: string }>).some(
    (item) => item.status === "PENDING" && sameWallet(item.applicant, route),
  );
  const verified = participant.data?.data.verified === true;
  const kind = kybBannerKind(verified, pending);
  const [tab, setTab] = useState<"requests" | "series" | "bond" | "agent">("requests");
  const nextDeadline = rows
    .map((row) => activeDeadline(row))
    .filter((value): value is number => value != null)
    .sort((a, b) => a - b)[0];

  if (!route) {
    return (
      <div>
        <h1>Provider</h1>
        <p className="muted">This address is not valid.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Provider</h1>
      <p className="num" title={route}>{shortAddress(route)}</p>
      <div className={`kyb-banner ${kind === "verified" ? "warn" : kind === "pending" ? "info" : "neutral"}`} role="status">
        <span>{kind}</span>
        {kind === "verified" ? null : <Link className="btn" href="/onboarding/kyb">Start KYB</Link>}
      </div>
      {canAct ? null : <p className="muted">Read only. Actions stay off until this wallet is connected.</p>}
      {provider ? (
        <div className="stat-grid">
          <section className="panel stat">
            <h2>Bond balance</h2>
            <b>{formatUsd(provider.bond.balance)}</b>
          </section>
          <section className="panel stat">
            <h2>Proceeds</h2>
            <b>{formatUsd(provider.proceeds.net)}</b>
          </section>
          <section className="panel stat">
            <h2>Open requests</h2>
            <b>{provider.open_requests}</b>
          </section>
          <section className="panel stat">
            <h2>Next deadline</h2>
            <b>{nextDeadline ? formatCountdown(nowMs, nextDeadline) : "—"}</b>
          </section>
        </div>
      ) : null}
      <div className="actions">
        {verified && canAct ? (
          <Link className="btn" href="/provider/series/new">List capacity</Link>
        ) : (
          <button className="btn" type="button" disabled>List capacity</button>
        )}
      </div>
      {verified ? null : <p>Complete KYB to list capacity</p>}
      <div className="tabs">
        {(["requests", "series", "bond", "agent"] as const).map((id) => (
          <button key={id} type="button" data-active={tab === id} onClick={() => setTab(id)}>
            {id[0]!.toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>
      {tab === "requests" ? (
        <div className="grid">
          {rows.length === 0 ? <Panel><p className="muted">No open requests.</p></Panel> : null}
          {rows.map((row) => (
            <RequestCard key={row.req_id} row={row} highlight={false} readOnly={!canAct} />
          ))}
        </div>
      ) : null}
      {tab === "series" ? (
        <Panel title="Series">
          {provider && provider.series.length > 0 ? provider.series.map((series) => (
            <div className="row" key={series.series_id}>
              <Link href={`/markets/${series.series_id}`}>{series.symbol}</Link>
              {canAct ? (
                <>
                  <RaisePrice seriesId={series.series_id} />
                  <SeriesFinalize seriesId={series.series_id} />
                  <WithdrawButton seriesId={series.series_id} />
                </>
              ) : null}
            </div>
          )) : <p className="muted">No series for this provider.</p>}
        </Panel>
      ) : null}
      {tab === "bond" ? (
        <Panel title="Bond and proceeds">
          {provider ? (
            <>
              <div className="row"><span>Deposited</span><span>{formatUsd(provider.bond.deposited)}</span></div>
              <div className="row"><span>Balance</span><span>{formatUsd(provider.bond.balance)}</span></div>
              <div className="row"><span>Released</span><span>{formatUsd(provider.bond.released)}</span></div>
              <div className="row"><span>Slashed</span><span>{formatUsd(provider.bond.slashed)}</span></div>
              <div className="row"><span>Proceeds net</span><span>{formatUsd(provider.proceeds.net)}</span></div>
              <div className="row"><span>Strikes</span><span>{provider.reputation.strikes}</span></div>
            </>
          ) : <p className="muted">No bond on record for this address.</p>}
        </Panel>
      ) : null}
      {tab === "agent" ? <AgentPanel readOnly={!canAct} /> : null}
    </div>
  );
}
