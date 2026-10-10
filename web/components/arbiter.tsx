"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAddress, type Address, type Hex } from "viem";
import { useAccount, useSignTypedData } from "wagmi";
import { panelAbi } from "@/lib/abi";
import { loadOpenDisputes } from "@/lib/api";
import { chainId, contractAddress, ZERO_ADDRESS } from "@/lib/config";
import { formatUsd, shortAddress } from "@/lib/format";
import {
  encodeRulingFragment,
  packageUrl,
  parseRulingPackage,
  reviewRulingPackage,
  RULING_TYPES,
  rulingDomain,
  type RulingOutcome,
  type RulingPackage,
  type SignatureReview,
} from "@/lib/ruling-package";
import { useData } from "./providers";
import { useSend } from "./tx";
import { Field, Panel, TxButton } from "./ui";

const PACKAGE_KEY = "paron.rulingPackage";

type DisputeView = {
  rulingDeadline: bigint;
  open: boolean;
  ruled: boolean;
};

function asDispute(value: unknown): DisputeView | null {
  if (Array.isArray(value) && value.length >= 3) {
    return { rulingDeadline: BigInt(value[0] as bigint | number), open: Boolean(value[1]), ruled: Boolean(value[2]) };
  }
  if (value && typeof value === "object" && "rulingDeadline" in value) {
    const row = value as DisputeView;
    return { rulingDeadline: BigInt(row.rulingDeadline), open: Boolean(row.open), ruled: Boolean(row.ruled) };
  }
  return null;
}

function asAddresses(value: unknown): Address[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Address => typeof item === "string" && item.startsWith("0x")).map((item) => getAddress(item));
}

function readStored(): RulingPackage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PACKAGE_KEY);
    return raw ? parseRulingPackage(raw) : null;
  } catch {
    return null;
  }
}

export function ArbiterDesk({ initialReqId = "2" }: { initialReqId?: string }) {
  const { source, client } = useData();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { send, pending, error } = useSend();
  const panel = contractAddress("panel");
  const [reqId, setReqId] = useState(initialReqId);
  const [outcome, setOutcome] = useState<RulingOutcome>(1);
  const [pkg, setPkg] = useState<RulingPackage | null>(null);
  const [shared, setShared] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [review, setReview] = useState<SignatureReview | null>(null);
  const cases = useQuery({
    queryKey: ["open-disputes", source],
    queryFn: () => loadOpenDisputes(source),
  });

  const chain = useQuery({
    queryKey: ["panel-case", panel, reqId],
    enabled: panel !== ZERO_ADDRESS && /^\d+$/.test(reqId) && Boolean(client),
    queryFn: async () => {
      if (!client) return null;
      const [dispute, members, threshold] = await Promise.all([
        client.readContract({ address: panel, abi: panelAbi, functionName: "getDispute", args: [BigInt(reqId)] }),
        client.readContract({ address: panel, abi: panelAbi, functionName: "members" }),
        client.readContract({ address: panel, abi: panelAbi, functionName: "threshold" }),
      ]);
      return {
        dispute: asDispute(dispute),
        members: asAddresses(members),
        threshold: Number(threshold),
      };
    },
  });

  const dispute = chain.data?.dispute ?? null;
  const members = chain.data?.members ?? [];
  const threshold = chain.data?.threshold ?? 0;
  const deadline = dispute && (dispute.open || dispute.ruled) ? dispute.rulingDeadline.toString() : "";

  useEffect(() => {
    setReqId(initialReqId);
  }, [initialReqId]);

  useEffect(() => {
    const fromHash = typeof window === "undefined" ? null : parseRulingPackage(window.location.hash);
    const stored = readStored();
    const next = [fromHash, stored].find(
      (item) => item && item.reqId === reqId && item.arbitrator.toLowerCase() === panel.toLowerCase(),
    );
    setPkg(next ?? null);
  }, [panel, reqId]);

  useEffect(() => {
    if (!pkg || members.length === 0 || threshold < 1) {
      setReview(null);
      return;
    }
    let dead = false;
    void reviewRulingPackage(pkg, members, threshold).then((next) => {
      if (!dead) setReview(next);
    });
    return () => {
      dead = true;
    };
  }, [pkg, members, threshold]);

  function remember(next: RulingPackage) {
    setPkg(next);
    const fragment = encodeRulingFragment(next);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${fragment}`);
    try {
      window.localStorage.setItem(PACKAGE_KEY, JSON.stringify(next));
    } catch {
      // The link fragment is the share path. The cache is only a reload aid.
    }
  }

  function freshPackage(signatures: Hex[] = []): RulingPackage | null {
    if (!deadline || panel === ZERO_ADDRESS) return null;
    return {
      chainId: chainId(),
      arbitrator: panel,
      reqId,
      outcome,
      rulingDeadline: deadline,
      signatures,
    };
  }

  const caseReason = useMemo(() => {
    if (panel === ZERO_ADDRESS) return "Panel address is not configured.";
    if (!client) return "Panel case is not loaded.";
    if (chain.isLoading) return null;
    if (chain.isError || !dispute) return "Panel case is not loaded.";
    if (!dispute.open && !dispute.ruled) return "No open case for this request.";
    if (dispute.ruled) return "This request is already ruled.";
    if (dispute.rulingDeadline > 0n && BigInt(Math.floor(Date.now() / 1000)) > dispute.rulingDeadline) {
      return "Ruling deadline passed.";
    }
    return null;
  }, [chain.isError, chain.isLoading, client, dispute, panel]);

  const sameTerms =
    pkg != null &&
    pkg.reqId === reqId &&
    pkg.outcome === outcome &&
    pkg.rulingDeadline === deadline &&
    pkg.arbitrator.toLowerCase() === panel.toLowerCase() &&
    pkg.chainId === chainId();
  const active = sameTerms ? pkg : freshPackage(sameTerms ? pkg.signatures : []);
  const mismatch = pkg && deadline && !sameTerms ? "This package does not match the onchain ruling deadline." : null;
  const submitReason = caseReason ?? mismatch ?? (review && sameTerms ? review.reason : "Signatures in this package: 0/2.");
  const ruleReason = caseReason ?? (threshold === 1 ? null : "rule() is for a one-member panel.");

  async function sign() {
    const next = freshPackage();
    if (!next || !address) {
      setNote(address ? "Ruling deadline is not loaded." : "Connect wallet");
      return;
    }
    const signature = await signTypedDataAsync({
      domain: rulingDomain(next.chainId, next.arbitrator),
      types: RULING_TYPES,
      primaryType: "Ruling",
      message: {
        reqId: BigInt(next.reqId),
        outcome: next.outcome,
        rulingDeadline: BigInt(next.rulingDeadline),
      },
    });
    const prior = sameTerms && pkg ? pkg.signatures : [];
    remember({ ...next, signatures: [...prior, signature] });
    setNote(null);
  }

  const rows = cases.data?.data ?? [];

  return (
    <div>
      <h1>Panel</h1>
      <p className="lede">
        Sign a ruling in this browser. The package stays in the page link. Submit ruling sends ruleWithSignatures once enough panel signatures are in the package. rule() is only for a one-member panel.
      </p>
      <Panel title="Open cases">
        {cases.isError ? <p className="bad">Couldn&apos;t load cases.</p> : null}
        {!cases.isLoading && rows.length === 0 && !cases.isError ? <p>No open cases.</p> : null}
        {rows.map((row) => (
          <div className="row" key={row.req_id}>
            <span>Req {row.req_id}{row.series_id ? ` · series ${row.series_id}` : ""} · {formatUsd(row.dispute_bond)}</span>
            <Link href={`/arbiter/cases/${row.req_id}`}>Open</Link>
          </div>
        ))}
      </Panel>
      <div style={{ height: 12 }} />
      <Panel title="Case">
        <Field label="Request">
          <input value={reqId} onChange={(event) => setReqId(event.target.value)} />
        </Field>
        <Field label="Ruling">
          <select value={String(outcome)} onChange={(event) => setOutcome(Number(event.target.value) as RulingOutcome)}>
            <option value="1">Delivered</option>
            <option value="2">Not delivered</option>
          </select>
        </Field>
        <p className="help">
          {deadline ? `Ruling deadline ${deadline}.` : "Ruling deadline is not loaded."}
          {threshold > 0 ? ` Threshold ${threshold}.` : ""}
          {members.length > 0 ? ` Members ${members.map((member) => shortAddress(member)).join(", ")}.` : ""}
        </p>
        {caseReason ? <p className="help">{caseReason}</p> : null}
        <p className="help" data-testid="signature-count">{review && sameTerms ? review.reason ?? `Signatures in this package: ${review.signers.length}/${threshold}.` : "Signatures in this package: 0."}</p>
        <div className="actions">
          <button type="button" className="btn ghost" disabled={Boolean(caseReason) || !deadline} onClick={() => void sign()}>
            {outcome === 1 ? "Sign: Delivered" : "Sign: Not delivered"}
          </button>
          <button
            type="button"
            className="btn ghost"
            disabled={!active || active.signatures.length === 0}
            onClick={() => {
              if (!active) return;
              const url = packageUrl(window.location.origin, window.location.pathname, active);
              void navigator.clipboard.writeText(url);
              setNote("Package copied.");
            }}
          >
            Copy package
          </button>
        </div>
        <Field label="Shared package">
          <input value={shared} onChange={(event) => setShared(event.target.value)} />
        </Field>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            const parsed = parseRulingPackage(shared);
            if (!parsed) {
              setNote("That package could not be read.");
              return;
            }
            setReqId(parsed.reqId);
            setOutcome(parsed.outcome);
            remember(parsed);
            setNote(null);
          }}
        >
          Open shared package
        </button>
        {note ? <p className="help">{note}</p> : null}
        <TxButton
          disabled={Boolean(submitReason) || !review?.ready || !sameTerms}
          reason={submitReason ?? undefined}
          onClick={() => {
            if (!active) return;
            void send("submit-ruling", {
              address: panel,
              abi: panelAbi,
              functionName: "ruleWithSignatures",
              args: [BigInt(active.reqId), active.outcome, active.signatures],
            });
          }}
        >
          {pending === "submit-ruling" ? "Submitting…" : "Submit ruling"}
        </TxButton>
        <TxButton
          tone="ghost"
          disabled={Boolean(ruleReason)}
          reason={ruleReason ?? undefined}
          onClick={() =>
            void send("rule", {
              address: panel,
              abi: panelAbi,
              functionName: "rule",
              args: [BigInt(reqId), outcome],
            })
          }
        >
          {pending === "rule" ? "Ruling…" : "Rule"}
        </TxButton>
        {error ? <p className="bad">{error}</p> : null}
      </Panel>
    </div>
  );
}
