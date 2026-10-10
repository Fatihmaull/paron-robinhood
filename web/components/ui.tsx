"use client";

import { useAccount, useChainId } from "wagmi";
import { chainId as expectedChainId } from "@/lib/config";
import { useData } from "./providers";

export function TxButton({
  children,
  onClick,
  disabled,
  reason,
  tone = "default",
  armed = false,
  testId,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  reason?: string;
  tone?: "default" | "danger" | "danger-outline" | "ghost";
  armed?: boolean;
  testId?: string;
  type?: "button" | "submit";
}) {
  const { source } = useData();
  const { address } = useAccount();
  const walletChain = useChainId();
  const mock = source === "mock";
  const wrong = Boolean(address) && walletChain !== expectedChainId();
  const gate = !address ? "Connect wallet" : wrong ? "Wrong network" : mock ? "Disabled in mock mode" : null;
  const blocked = Boolean(gate) || Boolean(disabled);
  const shown = gate ?? (blocked && reason && reason.includes(" ") ? reason : null);
  return (
    <span className="tx-action">
      <button
        type={type}
        className={`btn ${tone === "default" ? "" : tone} ${armed ? "armed" : ""}`}
        disabled={blocked}
        title={shown ?? undefined}
        data-testid={testId}
        data-eligible={armed ? "true" : "false"}
        onClick={onClick}
      >
        {children}
      </button>
      {shown ? <p className="help tx-reason">{shown}</p> : null}
    </span>
  );
}

export function Panel({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}
