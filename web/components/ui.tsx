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
  tone?: "default" | "danger" | "ghost";
  armed?: boolean;
  testId?: string;
  type?: "button" | "submit";
}) {
  const { source } = useData();
  const { address } = useAccount();
  const walletChain = useChainId();
  const mock = source === "mock";
  const wrong = Boolean(address) && walletChain !== expectedChainId();
  const blocked = mock || wrong || Boolean(disabled);
  const title = mock
    ? "Disabled in mock mode"
    : wrong
      ? "Switch network"
      : !address
        ? "Connect wallet"
        : reason;
  return (
    <button
      type={type}
      className={`btn ${tone} ${armed ? "armed" : ""}`}
      disabled={blocked}
      title={title}
      data-testid={testId}
      data-eligible={armed ? "true" : "false"}
      onClick={onClick}
    >
      {children}
    </button>
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
