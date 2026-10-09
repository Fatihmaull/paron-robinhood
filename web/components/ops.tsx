"use client";

import Link from "next/link";
import { useState } from "react";
import { encodeAbiParameters, encodeFunctionData, stringToHex } from "viem";
import { useAccount } from "wagmi";
import {
  conversionTableAbi,
  easAbi,
  easGateAbi,
  mockUsdcAbi,
  panelAbi,
  printIndexAbi,
  providerRegistryAbi,
  redemptionManagerAbi,
  seriesFactoryAbi,
  timelockAbi,
} from "@/lib/abi";
import { contractAddress } from "@/lib/config";
import { asBytes32 } from "@/lib/settlement";
import { demoChecks } from "@/lib/demo";
import { errorCopy } from "@/lib/errors";
import { formatFactor, formatWib, shortId } from "@/lib/format";
import { useKeeperQueue, useKyb, useTimelock } from "@/lib/hooks";
import { useData } from "./providers";
import { useSend } from "./tx";
import { Field, Panel, TxButton } from "./ui";

const ZERO32 = `0x${"0".repeat(64)}` as `0x${string}`;

export function FaucetPage() {
  const { send, pending, error } = useSend();
  const [done, setDone] = useState(false);
  return (
    <div>
      <h1>Get test USDC</h1>
      <p className="lede">Sends 5,000 test USDC. Once per hour.</p>
      <Panel>
        <TxButton
          onClick={() => {
            void send("faucet", {
              address: contractAddress("usdc"),
              abi: mockUsdcAbi,
              functionName: "faucet",
            }).then((ok) => {
              if (ok) setDone(true);
            });
          }}
        >
          {pending === "faucet" ? "Sending…" : "Get test USDC"}
        </TxButton>
        {done && !error ? <p className="ok">5,000 test USDC added.</p> : null}
        {error?.includes("FaucetCooldown") ? <p className="warn">{errorCopy("FaucetCooldown", { nextAt: "the time in the error" })}</p> : null}
        {error && !error.includes("FaucetCooldown") ? <p className="bad">{error}</p> : null}
        <p className="help">Low gas balance. Get testnet ETH from the chain faucet, then come back for mUSDC.</p>
      </Panel>
    </div>
  );
}

export function KybPage() {
  const { send, pending, error } = useSend();
  const [uid, setUid] = useState("");
  const { address } = useAccount();
  return (
    <div>
      <h1>Verification</h1>
      <p className="lede">
        Link an attestation from the Paron demo verifier (team-operated), then register as a provider if the role is 1.
      </p>
      <Panel title="Link attestation">
        <Field label="Attestation uid">
          <input value={uid} onChange={(event) => setUid(event.target.value)} placeholder="0x…" />
        </Field>
        <TxButton
          disabled={!uid.startsWith("0x") || uid.length !== 66}
          onClick={() =>
            void send("link", {
              address: contractAddress("gate"),
              abi: easGateAbi,
              functionName: "linkAttestation",
              args: [uid as `0x${string}`],
            })
          }
        >
          {pending === "link" ? "Linking…" : "Link attestation"}
        </TxButton>
        <p className="help">Connected wallet {address ? shortId(address) : "none"}. A buyer attestation cannot list capacity.</p>
        <p className="help">{errorCopy("NotProviderRole")}</p>
        {error ? <p className="bad">{error}</p> : null}
      </Panel>
      <div style={{ height: 12 }} />
      <Panel title="Register as provider">
        <TxButton
          onClick={() =>
            void send("register", {
              address: contractAddress("providerRegistry"),
              abi: providerRegistryAbi,
              functionName: "registerProvider",
            })
          }
        >
          {pending === "register" ? "Registering…" : "Register as provider"}
        </TxButton>
      </Panel>
    </div>
  );
}

export function KeepersPage() {
  const queue = useKeeperQueue();
  const { send, pending } = useSend();
  const rows = queue.data?.data ?? [];
  const claims = rows.filter((row) => row.state === "DEFAULTABLE" || row.actions.includes("CLAIM_DEFAULT"));
  const finals = rows.filter((row) => row.state === "DELIVERED");
  const rulings = rows.filter((row) => row.state === "DISPUTED");
  const rm = contractAddress("redemptionManager");
  return (
    <div>
      <h1>Keepers</h1>
      <p className="lede">Five permissionless queues. Buttons send the contract call from the connected wallet.</p>
      <div className="grid">
        <Queue title="claimDefault" empty="No defaultable requests.">
          {claims.map((row) => (
            <Row key={row.req_id} label={`#${row.req_id} ${row.symbol}`}>
              <TxButton tone="danger" onClick={() => void send(`c-${row.req_id}`, { address: rm, abi: redemptionManagerAbi, functionName: "claimDefault", args: [BigInt(row.req_id)] }, { staleOk: true, deadlineMs: row.ack_deadline_ms ?? undefined })}>
                {pending === `c-${row.req_id}` ? "Sending…" : "Claim default"}
              </TxButton>
            </Row>
          ))}
        </Queue>
        <Queue title="finalizeRedemption" empty="No deliveries waiting out the dispute window.">
          {finals.map((row) => (
            <Row key={row.req_id} label={`#${row.req_id}`}>
              <TxButton onClick={() => void send(`f-${row.req_id}`, { address: rm, abi: redemptionManagerAbi, functionName: "finalizeRedemption", args: [BigInt(row.req_id)] })}>Finalize</TxButton>
            </Row>
          ))}
        </Queue>
        <Queue title="resolveNoRuling" empty="No requests waiting on a ruling window.">
          {rulings.map((row) => (
            <Row key={row.req_id} label={`#${row.req_id}`}>
              <TxButton onClick={() => void send(`r-${row.req_id}`, { address: rm, abi: redemptionManagerAbi, functionName: "resolveNoRuling", args: [BigInt(row.req_id)] }, { staleOk: true })}>Resolve</TxButton>
            </Row>
          ))}
        </Queue>
        <Queue title="finalizeSeries" empty="Windows in this snapshot are still open.">
          <p className="muted">Call finalizeSeries once windowEnd has passed.</p>
          <TxButton onClick={() => void send("fs", { address: contractAddress("seriesFactory"), abi: seriesFactoryAbi, functionName: "finalizeSeries", args: [4n] })}>Finalize series 4</TxButton>
        </Queue>
        <Queue title="poke" empty="">
          <TxButton onClick={() => void send("poke", { address: contractAddress("printIndex"), abi: printIndexAbi, functionName: "poke", args: [stringToHex("H100-SXM-80GB", { size: 32 })] })}>
            {pending === "poke" ? "Poking…" : "Poke H100"}
          </TxButton>
        </Queue>
      </div>
    </div>
  );
}

function Queue({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  return (
    <Panel title={title}>
      {empty ? <p className="muted">{empty}</p> : null}
      {children}
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span>{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function VerifierPage() {
  const apps = useKyb();
  const { send, pending, error } = useSend();
  const [applicant, setApplicant] = useState("0x6666666666666666666666666666666666666666");
  const [entity, setEntity] = useState(`0x${"e6".repeat(32)}`);
  const [role, setRole] = useState("1");
  const [country, setCountry] = useState("ID");
  const [expiry, setExpiry] = useState("1822953600");
  const list = (apps.data?.data ?? []) as Array<{ uid: string; applicant: string; status: string; role?: { name: string } }>;

  return (
    <div>
      <div className="page-head">
        <h1>Verifier</h1>
        <span className="pill outline">Paron demo verifier (team-operated)</span>
      </div>
      <p className="lede">Manual EAS attest. The signer is the verifier EOA. Revoke stays on this page once an attestation uid is known.</p>
      <div className="grid two">
      <Panel title="Applications">
        {list.length === 0 ? <p className="muted">No pending applications.</p> : null}
        <div className="actions" aria-label="KYB statuses">
          <KybPill status="PENDING" />
          <KybPill status="APPROVED" />
          <KybPill status="EXPIRED" />
          <KybPill status="REVOKED" />
          <KybPill status="WITHDRAWN" />
        </div>
        {list.map((item) => (
          <div className="row" key={item.uid}>
            <span>{shortId(item.applicant)} · {item.role?.name ?? "Applicant"}</span>
            <KybPill status={item.status} />
          </div>
        ))}
      </Panel>
      <Panel title="Issue attestation">
        <Field label="Applicant"><input value={applicant} onChange={(event) => setApplicant(event.target.value)} /></Field>
        <Field label="Entity id (bytes32)"><input value={entity} onChange={(event) => setEntity(event.target.value)} /></Field>
        <Field label="Role">
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="1">1 Provider</option>
            <option value="2">2 Buyer</option>
            <option value="3">3 Trader</option>
            <option value="4">4 Market maker</option>
          </select>
        </Field>
        <Field label="Country"><input value={country} onChange={(event) => setCountry(event.target.value)} /></Field>
        <Field label="Expiry (unix seconds)"><input value={expiry} onChange={(event) => setExpiry(event.target.value)} /></Field>
        <TxButton
          onClick={() => {
            const data = encodeAbiParameters(
              [
                { type: "bytes32" },
                { type: "uint8" },
                { type: "bytes2" },
                { type: "uint64" },
              ],
              [entity as `0x${string}`, Number(role), stringToHex(country.slice(0, 2), { size: 2 }), BigInt(expiry)],
            );
            void send("attest", {
              address: contractAddress("eas"),
              abi: easAbi,
              functionName: "attest",
              args: [
                {
                  schema: asBytes32(contractAddress("easSchema")),
                  data: {
                    recipient: applicant as `0x${string}`,
                    expirationTime: BigInt(expiry),
                    revocable: true,
                    refUID: ZERO32,
                    data,
                    value: 0n,
                  },
                },
              ],
            });
          }}
        >
          {pending === "attest" ? "Signing…" : "Issue attestation"}
        </TxButton>
        {error ? <p className="bad">{error}</p> : null}
        <p className="help">Schema ParticipantVerified(bytes32 entityId, uint8 role, bytes2 country, uint64 expiry).</p>
      </Panel>
      </div>
    </div>
  );
}

export function AdminPage() {
  const ops = useTimelock();
  const { send, pending, error } = useSend();
  const [factor, setFactor] = useState("0.4500");
  const rows = ops.data?.data ?? [];
  const ready = rows.filter((op) => op.status === "READY").length;
  const waiting = rows.filter((op) => op.status === "PENDING" || op.status === "WAITING").length;
  const delay = rows[0]?.delay_s ?? 300;
  const table = contractAddress("conversionTable");
  const timelock = contractAddress("timelock");
  const gpu = stringToHex("A100-SXM-80GB", { size: 32 });

  function payload(next: string) {
    const raw = BigInt(Math.round(Number(next) * 10_000));
    return encodeFunctionData({
      abi: conversionTableAbi,
      functionName: "setFactor",
      args: [gpu, Number(raw)],
    });
  }

  return (
    <div>
      <h1>Admin</h1>
      <p className="lede">Schedule setFactor from the admin wallet. Execute is open to any wallet. There is no Safe protocol-kit in this app.</p>
      <div className="stat-grid three">
        <Panel title="Ready to execute"><b className="stat-value">{ready}</b></Panel>
        <Panel title="Waiting for delay"><b className="stat-value">{waiting}</b></Panel>
        <Panel title="Timelock delay"><b className="stat-value">{Math.floor(delay / 60)}:{String(delay % 60).padStart(2, "0")}</b></Panel>
      </div>
      <Panel title="Ready operations">
        {rows.length === 0 ? <p className="muted">No operations ready to execute. Schedule a factor change below.</p> : null}
        {rows.map((op) => (
          <div key={op.operation_id}>
            <div className="row"><span>{op.target_name}.{op.decoded.function}</span><OpPill status={op.status} /></div>
            <div className="row"><span>A100 factor</span><span>{formatFactor(op.decoded.args.new_factor)}</span></div>
            <div className="row"><span>Ready</span><span>{formatWib(op.ready_at_ms)}</span></div>
            <p className="help">Fixture calldata is a placeholder. Execute encodes setFactor locally. Salt {shortId(op.salt)}.</p>
            <TxButton
              onClick={() =>
                void send("execute", {
                  address: timelock,
                  abi: timelockAbi,
                  functionName: "execute",
                  args: [op.target as `0x${string}`, 0n, payload(op.decoded.args.new_factor ?? "0.4500"), op.predecessor as `0x${string}`, op.salt as `0x${string}`],
                })
              }
            >
              {pending === "execute" ? "Executing…" : "Execute"}
            </TxButton>
          </div>
        ))}
      </Panel>
      <div style={{ height: 12 }} />
      <Panel title="Schedule factor">
        <Field label="New A100 factor (1e4 display)">
          <input value={factor} onChange={(event) => setFactor(event.target.value)} />
        </Field>
        <TxButton
          onClick={() => {
            const salt = stringToHex(`paron-${factor}`, { size: 32 });
            void send("schedule", {
              address: timelock,
              abi: timelockAbi,
              functionName: "schedule",
              args: [table, 0n, payload(factor), ZERO32, salt, 300n],
            });
          }}
        >
          {pending === "schedule" ? "Scheduling…" : "Schedule"}
        </TxButton>
        {error ? <p className="bad">{error}</p> : null}
        <p className="help">Demo delay is 5 minutes. Treasury reads stay on the series bond panel.</p>
      </Panel>
    </div>
  );
}

const KYB_PILLS = {
  PENDING: { label: "Pending", tone: "info" },
  APPROVED: { label: "Approved", tone: "ok" },
  EXPIRED: { label: "Expired", tone: "warn" },
  REVOKED: { label: "Revoked", tone: "danger" },
  WITHDRAWN: { label: "Withdrawn", tone: "neutral" },
} as const;

function KybPill({ status }: { status: string }) {
  const known = KYB_PILLS[status as keyof typeof KYB_PILLS];
  if (!known) return <span className="pill neutral">{status}</span>;
  return <span className={`pill ${known.tone}`}>{known.label}</span>;
}

const OP_PILLS = {
  PENDING: { label: "Pending", tone: "warn" },
  WAITING: { label: "Pending", tone: "warn" },
  READY: { label: "Ready", tone: "ok" },
  DONE: { label: "Done", tone: "neutral" },
  EXECUTED: { label: "Done", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "outline" },
} as const;

function OpPill({ status }: { status: string }) {
  const known = OP_PILLS[status as keyof typeof OP_PILLS];
  if (!known) return <span className="pill neutral">{status}</span>;
  return <span className={`pill ${known.tone}`}>{known.label}</span>;
}

export function DemoPage() {
  const { snap, source } = useData();
  const checks = demoChecks(snap);
  return (
    <div>
      <h1>Demo</h1>
      <p className="lede">Checklist derived from indexed events in snapshot {snap}. Source: {source === "mock" ? "fixtures" : "API"}.</p>
      <Panel>
        {checks.map((item) => (
          <div className="row" key={item.id}>
            <span>{item.done ? "Done" : "Pending"} · {item.label}</span>
            <Link href={item.href}>Open</Link>
          </div>
        ))}
      </Panel>
    </div>
  );
}

export function ArbiterPage() {
  const { send, pending } = useSend();
  const [reqId, setReqId] = useState("2");
  const [ruling, setRuling] = useState("1");
  return (
    <div>
      <h1>Panel</h1>
      <p className="lede">rule() is members-only. There is no arbiter role. A 2-of-3 panel collects signatures out of band; this page sends rule() when the caller is a member.</p>
      <Panel>
        <Field label="Request"><input value={reqId} onChange={(event) => setReqId(event.target.value)} /></Field>
        <Field label="Ruling">
          <select value={ruling} onChange={(event) => setRuling(event.target.value)}>
            <option value="1">Delivered</option>
            <option value="2">Not delivered</option>
          </select>
        </Field>
        <TxButton
          onClick={() =>
            void send("rule", {
              address: contractAddress("panel"),
              abi: panelAbi,
              functionName: "rule",
              args: [BigInt(reqId), Number(ruling)],
            })
          }
        >
          {pending === "rule" ? "Ruling…" : "Rule"}
        </TxButton>
      </Panel>
    </div>
  );
}
