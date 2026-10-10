"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { encodeAbiParameters, encodeFunctionData, stringToHex } from "viem";
import { useAccount, useReadContract } from "wagmi";
import {
  conversionTableAbi,
  easAbi,
  easGateAbi,
  mockUsdcAbi,
  printIndexAbi,
  providerRegistryAbi,
  redemptionManagerAbi,
  seriesFactoryAbi,
  timelockAbi,
} from "@/lib/abi";
import { ArbiterDesk } from "@/components/arbiter";
import { contractAddress, ZERO_ADDRESS } from "@/lib/config";
import { asBytes32 } from "@/lib/settlement";
import { demoChecks } from "@/lib/demo";
import { errorCopy } from "@/lib/errors";
import { formatCountdown, formatFactor, formatWib, shortId } from "@/lib/format";
import { gpuModelId } from "@/lib/gpu-model";
import { isDoneOp, isReadyOp, opStatusKey, scheduledFactor } from "@/lib/timelock-ops";
import { useKeeperQueue, useKyb, useParticipants, useTimelock } from "@/lib/hooks";
import { TxStatus, useSend } from "./tx";
import { OperatorLink } from "./operator-link";
import { FitAddress } from "./address";
import { Field, Panel, TxButton } from "./ui";

const ZERO32 = `0x${"0".repeat(64)}` as `0x${string}`;

const faucetClockAbi = [
  {
    type: "function",
    name: "lastFaucetAt",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint64" }],
  },
] as const;

export function FaucetPage() {
  const { send, pending, error, record } = useSend();
  const { address } = useAccount();
  const [done, setDone] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const usdc = contractAddress("usdc");
  const clock = useReadContract({
    address: usdc,
    abi: faucetClockAbi,
    functionName: "lastFaucetAt",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && usdc !== ZERO_ADDRESS, refetchInterval: 15_000 },
  });
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const nextSec = typeof clock.data === "bigint" ? Number(clock.data) : 0;
  const nextMs = nextSec * 1000;
  const cooling = nextSec > 0 && now < nextMs;
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
        <TxStatus record={record} />
        {cooling ? (
          <p className="help" data-testid="faucet-cooldown">
            Faucet cooling down. Try again at {formatWib(nextMs)}. {formatCountdown(now, nextMs)} left.
          </p>
        ) : null}
        <p className="help">Low gas balance. Get testnet ETH from the chain faucet, then come back for mUSDC.</p>
      </Panel>
    </div>
  );
}

export function KybPage() {
  const { send, pending, error, record } = useSend();
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
        {record?.step === "link" ? <TxStatus record={record} /> : null}
        {error && record?.step === "link" && record.phase !== "failed" ? <p className="bad">{error}</p> : null}
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
        {record?.step === "register" ? <TxStatus record={record} /> : null}
      </Panel>
    </div>
  );
}

export function KeepersPage() {
  const queue = useKeeperQueue();
  const { send, pending, record } = useSend();
  const rows = queue.data?.data ?? [];
  const claims = rows.filter((row) => row.state === "DEFAULTABLE" || row.actions.includes("CLAIM_DEFAULT"));
  const finals = rows.filter((row) => row.state === "DELIVERED");
  const rulings = rows.filter((row) => row.state === "DISPUTED");
  const rm = contractAddress("redemptionManager");
  return (
    <div>
      <OperatorLink />
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
        <Queue title="finalizeSeries" empty="No series window has ended.">
          <p className="muted">Call finalizeSeries once windowEnd has passed.</p>
          <TxButton onClick={() => void send("fs", { address: contractAddress("seriesFactory"), abi: seriesFactoryAbi, functionName: "finalizeSeries", args: [4n] })}>Finalize series 4</TxButton>
        </Queue>
        <Queue title="poke" empty="">
          <TxButton onClick={() => void send("poke", { address: contractAddress("printIndex"), abi: printIndexAbi, functionName: "poke", args: [gpuModelId("H100-SXM-80GB")] })}>
            {pending === "poke" ? "Poking…" : "Poke H100"}
          </TxButton>
        </Queue>
      </div>
      <TxStatus record={record} />
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
  const issued = useParticipants();
  const { send, pending, error, record } = useSend();
  const [applicant, setApplicant] = useState("");
  const [entity, setEntity] = useState("");
  const [role, setRole] = useState("1");
  const [country, setCountry] = useState("ID");
  const [expiry, setExpiry] = useState("1822953600");
  const [uid, setUid] = useState("");
  const uidOk = /^0x[0-9a-fA-F]{64}$/.test(uid);
  const easReady = contractAddress("eas") !== ZERO_ADDRESS && asBytes32(contractAddress("easSchema")) !== ZERO32;
  const list = (apps.data?.data ?? []) as Array<{ uid: string; applicant: string; status: string; role?: { name: string } }>;
  const attestations = (issued.data?.data ?? []).filter((row) => row.attestation_uid);

  return (
    <div>
      <OperatorLink />
      <div className="page-head">
        <h1>Verifier</h1>
        <span className="pill outline">Paron demo verifier (team-operated)</span>
      </div>
      <p className="lede">Manual EAS attest. The signer is the verifier EOA. Revoke calls EAS.revoke for an attestation uid.</p>
      <div className="grid two">
      <Panel title="Applications">
        {record?.step === "attest" && record.phase === "success" ? <p className="ok">Attestation issued.</p> : null}
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
            <span><FitAddress value={item.applicant} /> · {item.role?.name ?? "Applicant"}</span>
            <KybPill status={item.status} />
          </div>
        ))}
      </Panel>
      <Panel title="Issued attestations">
        {issued.isError ? <p className="bad">Couldn&apos;t load issued attestations.</p> : null}
        {!issued.isLoading && attestations.length === 0 && !issued.isError ? <p className="muted">No issued attestations.</p> : null}
        {attestations.map((item) => (
          <div className="row" key={item.attestation_uid ?? item.address}>
            <span>
              <FitAddress value={item.address} /> · {item.role?.name ?? "Participant"}
              {item.revoked ? " · Revoked" : item.verified ? " · Verified" : ""}
            </span>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                if (item.attestation_uid) setUid(item.attestation_uid);
              }}
            >
              Use for revoke
            </button>
          </div>
        ))}
      </Panel>
      <Panel title="Issue attestation">
        <Field label="Applicant"><input value={applicant} onChange={(event) => setApplicant(event.target.value)} placeholder="0x6666…6666" /></Field>
        <Field label="Entity id (bytes32)"><input value={entity} onChange={(event) => setEntity(event.target.value)} placeholder="0xe6e6…e6e6" /></Field>
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
        <p className="help">Schema ParticipantVerified(bytes32 entityId, uint8 role, bytes2 country, uint64 expiry).</p>
        <Field label="Attestation uid">
          <input value={uid} onChange={(event) => setUid(event.target.value.trim())} />
        </Field>
        <TxButton
          tone="danger-outline"
          disabled={!uidOk || !easReady}
          reason={!easReady ? "EAS is not configured." : "Enter an attestation uid."}
          onClick={() =>
            void send("revoke", {
              address: contractAddress("eas"),
              abi: easAbi,
              functionName: "revoke",
              args: [
                {
                  schema: asBytes32(contractAddress("easSchema")),
                  data: { uid: uid as `0x${string}`, value: 0n },
                },
              ],
            })
          }
        >
          {pending === "revoke" ? "Revoking…" : "Revoke"}
        </TxButton>
        <TxStatus record={record} />
        {error && record?.phase !== "failed" ? <p className="bad">{error}</p> : null}
        <p className="help">Revoke is EAS.revoke on the ParticipantVerified schema. The verifier wallet must be the attester.</p>
      </Panel>
      </div>
    </div>
  );
}

export function AdminPage() {
  const ops = useTimelock();
  const { send, pending, error, record } = useSend();
  const [factor, setFactor] = useState("0.4500");
  const [factorError, setFactorError] = useState<string | null>(null);
  const rows = ops.data?.data ?? [];
  const ready = rows.filter((op) => isReadyOp(op.status)).length;
  const waiting = rows.filter((op) => {
    const key = opStatusKey(op.status);
    return key === "PENDING" || key === "WAITING";
  }).length;
  const listed = rows.filter((op) => isReadyOp(op.status) || isDoneOp(op.status));
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
      <OperatorLink />
      <h1>Admin</h1>
      <p className="lede">Schedule setFactor from the admin wallet. Execute is open to any wallet. There is no Safe protocol-kit in this app.</p>
      <div className="stat-grid three">
        <Panel title="Ready to execute"><b className="stat-value">{ready}</b></Panel>
        <Panel title="Waiting for delay"><b className="stat-value">{waiting}</b></Panel>
        <Panel title="Timelock delay"><b className="stat-value">{Math.floor(delay / 60)}:{String(delay % 60).padStart(2, "0")}</b></Panel>
      </div>
      <Panel title="Ready operations">
        {ready === 0 ? <p className="muted">No operations ready to execute. Schedule a factor change below.</p> : null}
        {listed.map((op) => {
          const done = isDoneOp(op.status);
          const next = scheduledFactor(op.decoded.args);
          return (
            <div key={op.operation_id}>
              <div className="row"><span>{op.target_name}.{op.decoded.function}</span><OpPill status={op.status} /></div>
              <div className="row">
                <span>A100 factor</span>
                <span>{next ? formatFactor(next) : <span className="muted">Not set</span>}</span>
              </div>
              <div className="row"><span>Ready at</span><span>{formatWib(op.ready_at_ms)}</span></div>
              <p className="help">Fixture calldata is a placeholder. Execute encodes setFactor locally. Salt {shortId(op.salt)}.</p>
              {done ? null : (
                <TxButton
                  onClick={() => {
                    if (!next) {
                      setFactorError("Factor is not set.");
                      return;
                    }
                    setFactorError(null);
                    void send("execute", {
                      address: timelock,
                      abi: timelockAbi,
                      functionName: "execute",
                      args: [op.target as `0x${string}`, 0n, payload(next), op.predecessor as `0x${string}`, op.salt as `0x${string}`],
                    });
                  }}
                >
                  {pending === "execute" ? "Executing…" : "Execute"}
                </TxButton>
              )}
            </div>
          );
        })}
        {factorError ? <p className="bad">{factorError}</p> : null}
        {record?.step === "execute" ? <TxStatus record={record} /> : null}
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
        {record?.step === "schedule" ? <TxStatus record={record} /> : null}
        {error && record?.phase !== "failed" ? <p className="bad">{error}</p> : null}
        <p className="help">Demo delay is 5 minutes. Treasury reads stay on the series bond panel.</p>
      </Panel>
    </div>
  );
}

const KYB_PILLS = {
  PENDING: { label: "Pending", tone: "warn" },
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
  DONE: { label: "Done", tone: "ok" },
  EXECUTED: { label: "Done", tone: "ok" },
  CANCELLED: { label: "Cancelled", tone: "outline" },
} as const;

function OpPill({ status }: { status: string }) {
  const known = OP_PILLS[opStatusKey(status) as keyof typeof OP_PILLS];
  if (!known) return <span className="pill neutral">{status}</span>;
  return <span className={`pill ${known.tone}`}>{known.label}</span>;
}

export function DemoPage() {
  const checks = demoChecks();
  return (
    <div>
      <h1>Demo</h1>
      <p className="lede">Walk through the live demo series.</p>
      <Panel>
        {checks.map((item) => (
          <div className="row" key={item.id}>
            <span>{item.label}</span>
            <Link className="touch-link" href={item.href}>Open</Link>
          </div>
        ))}
      </Panel>
    </div>
  );
}

export function ArbiterPage({ reqId }: { reqId?: string }) {
  return (
    <div>
      <OperatorLink />
      <ArbiterDesk initialReqId={reqId} />
    </div>
  );
}
