"use client";

import { useState } from "react";
import { keccak256, parseUnits, stringToHex } from "viem";
import { useAccount, usePublicClient, useSignTypedData } from "wagmi";
import { conversionTableAbi, erc20Abi, seriesFactoryAbi } from "@/lib/abi";
import { ZERO_ADDRESS, chainId, contractAddress, demoPresets } from "@/lib/config";
import { formatFactor, formatUsd } from "@/lib/format";
import { useGpus } from "@/lib/hooks";
import { signErc2612 } from "@/lib/permit";
import { factorBps, seriesBondRaw, uint256Of } from "@/lib/settlement";
import { useData } from "./providers";
import { useSend } from "./tx";
import { Field, Panel, TxButton } from "./ui";

const CU = 10n ** 18n;
const CONTINENTS = ["AF", "AN", "AS", "EU", "NA", "OC", "SA"];

type Draft = {
  gpu: string;
  hours: string;
  price: string;
  bond: string;
  windowStart: string;
  windowEnd: string;
  ack: string;
  delivery: string;
  dispute: string;
  min: string;
  country: string;
  continent: string;
  arbitrator: string;
  institutional: boolean;
  symbol: string;
};

const EMPTY: Draft = {
  gpu: "H100-SXM-80GB",
  hours: "",
  price: "",
  bond: "",
  windowStart: "",
  windowEnd: "",
  ack: "60",
  delivery: "60",
  dispute: "90",
  min: "1",
  country: "ID",
  continent: "AS",
  arbitrator: "0x8888888888888888888888888888888888888888",
  institutional: false,
  symbol: "",
};

const PRESET: Draft = {
  ...EMPTY,
  hours: "500",
  price: "3.00",
  bond: "4.50",
  windowStart: "1790812800",
  windowEnd: "1793491200",
  symbol: "CU-JKT-H100-2610",
};

export function ListingWizard() {
  const gpus = useGpus();
  const panel = contractAddress("panel");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    ...EMPTY,
    arbitrator: panel !== ZERO_ADDRESS ? panel : EMPTY.arbitrator,
  });
  const { address } = useAccount();
  const client = usePublicClient();
  const { signTypedDataAsync } = useSignTypedData();
  const { send, pending, error, note } = useSend();
  const { source } = useData();
  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };
  const factor = (gpus.data?.data ?? []).find((gpu) => gpu.gpu_type === draft.gpu)?.factor;

  async function listedFactor(): Promise<bigint> {
    const table = contractAddress("conversionTable");
    if (client && table !== ZERO_ADDRESS) {
      try {
        const onchain = await client.readContract({
          address: table,
          abi: conversionTableAbi,
          functionName: "factorOf",
          args: [stringToHex(draft.gpu, { size: 32 })],
        });
        const raw = uint256Of(onchain, 0n);
        if (raw > 0n) return raw;
      } catch {
        /* use the displayed factor */
      }
    }
    return factorBps(factor);
  }

  async function create() {
    const params = buildParams(draft);
    const usdc = contractAddress("usdc");
    const vault = contractAddress("bondVault");
    const factory = contractAddress("seriesFactory");
    const bondRaw = seriesBondRaw(parseUnits(draft.bond || "0", 6), BigInt(draft.hours || "0"), await listedFactor());
    if (address && client && source !== "mock" && usdc !== ZERO_ADDRESS && vault !== ZERO_ADDRESS) {
      try {
        const permit = await signErc2612({
          client,
          sign: signTypedDataAsync,
          token: usdc,
          owner: address,
          spender: vault,
          value: bondRaw,
          chainId: chainId(),
        });
        const created = await send("create", {
          address: factory,
          abi: seriesFactoryAbi,
          functionName: "createSeriesWithPermit",
          args: [params, permit.deadline, permit.v, permit.r, permit.s],
        });
        if (created) return;
      } catch {
        /* approve, then createSeries */
      }
      const approved = await send("approve", {
        address: usdc,
        abi: erc20Abi,
        functionName: "approve",
        args: [vault, bondRaw],
      });
      if (!approved) return;
    }
    await send("create", {
      address: factory,
      abi: seriesFactoryAbi,
      functionName: "createSeries",
      args: [params],
    });
  }

  return (
    <div>
      <p className="kicker">Provider</p>
      <h1>List capacity</h1>
      <p className="lede">Three steps. The bond is approved to BondVault, then the series is created.</p>
      <div className="tabs">
        {["GPU and size", "Terms", "Review"].map((label, index) => (
          <button key={label} type="button" data-active={step === index} onClick={() => setStep(index)}>
            {label}
          </button>
        ))}
      </div>
      {demoPresets() ? (
        <button className="btn ghost" type="button" onClick={() => setDraft((prev) => ({ ...PRESET, arbitrator: prev.arbitrator }))}>
          Demo preset · 2610 · 500h · $3.00 · bond $4.50 · 60/60/90
        </button>
      ) : null}
      <div style={{ height: 12 }} />
      <div className="wizard-grid">
      <Panel>
        {step === 0 ? (
          <>
            <Field label="GPU">
              <select value={draft.gpu} onChange={(event) => patch("gpu", event.target.value)}>
                {(gpus.data?.data ?? [{ gpu: "H100", gpu_type: "H100-SXM-80GB", factor: "1.0000" }]).map((gpu) => (
                  <option key={gpu.gpu_type} value={gpu.gpu_type}>
                    {gpu.gpu_type} · {formatFactor(gpu.factor)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="GPU-hours">
              <input value={draft.hours} onChange={(event) => patch("hours", event.target.value)} />
            </Field>
            <Field label="Primary price (USDC per CU)">
              <input value={draft.price} onChange={(event) => patch("price", event.target.value)} />
            </Field>
            <Field label="Bond per CU (USDC)">
              <input value={draft.bond} onChange={(event) => patch("bond", event.target.value)} />
            </Field>
            <p className="help">Factor {factor ? formatFactor(factor) : "—"}. Price and bond use 6-decimal USDC integer math when the transaction is built.</p>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <Field label="Window start (unix seconds)">
              <input value={draft.windowStart} onChange={(event) => patch("windowStart", event.target.value)} />
            </Field>
            <Field label="Window end (unix seconds)">
              <input value={draft.windowEnd} onChange={(event) => patch("windowEnd", event.target.value)} />
            </Field>
            <Field label="Ack window (seconds)">
              <input value={draft.ack} onChange={(event) => patch("ack", event.target.value)} />
            </Field>
            <Field label="Delivery window (seconds)">
              <input value={draft.delivery} onChange={(event) => patch("delivery", event.target.value)} />
            </Field>
            <Field label="Dispute window (seconds)">
              <input value={draft.dispute} onChange={(event) => patch("dispute", event.target.value)} />
            </Field>
            <Field label="Min redemption (CU)">
              <input value={draft.min} onChange={(event) => patch("min", event.target.value)} />
            </Field>
            <Field label="Country">
              <input value={draft.country} onChange={(event) => patch("country", event.target.value)} />
            </Field>
            <Field label="Continent">
              <select value={draft.continent} onChange={(event) => patch("continent", event.target.value)}>
                {CONTINENTS.map((code) => (
                  <option key={code}>{code}</option>
                ))}
              </select>
            </Field>
            <Field label="Arbitrator">
              <input value={draft.arbitrator} onChange={(event) => patch("arbitrator", event.target.value)} />
            </Field>
            <Field label="Symbol">
              <input value={draft.symbol} onChange={(event) => patch("symbol", event.target.value)} />
            </Field>
            <label>
              <input
                type="checkbox"
                checked={draft.institutional}
                onChange={(event) => patch("institutional", event.target.checked)}
                style={{ width: "auto" }}
              />{" "}
              Institutional
            </label>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <div className="row"><span>GPU</span><span>{draft.gpu}</span></div>
            <div className="row"><span>Hours</span><span>{draft.hours || "—"}</span></div>
            <div className="row"><span>Price</span><span>{draft.price ? formatUsd(Number.isNaN(Number(draft.price)) ? null : `${draft.price}`) : "—"}</span></div>
            <div className="row"><span>Bond / CU</span><span>{draft.bond ? formatUsd(draft.bond.includes(".") ? draft.bond : `${draft.bond}.00`) : "—"}</span></div>
            <div className="row"><span>Windows</span><span>{draft.ack}/{draft.delivery}/{draft.dispute}s</span></div>
            <div className="row"><span>Symbol</span><span>{draft.symbol || "—"}</span></div>
            <TxButton onClick={() => void create()} reason={pending ?? undefined}>
              {pending ? "Submitting…" : "Create series"}
            </TxButton>
            {note ? <p className="warn">{note}</p> : null}
            {error ? <p className="bad">{error}</p> : null}
            <p className="help">
              registerProvider is on the verification page. Listing requires role 1. A buyer attestation shows: This attestation is for a buyer. Providers need a provider verification (role 1).
            </p>
          </>
        ) : null}
        <div className="actions">
          {step > 0 ? (
            <button className="btn ghost" type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : null}
          {step < 2 ? (
            <button className="btn" type="button" onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : null}
        </div>
      </Panel>
      <Panel>
        <p className="preview-sym">{draft.symbol || "CU-——"}</p>
        <p className="help">
          {draft.hours || "—"} hours · {draft.gpu} · factor {factor ? formatFactor(factor) : "—"}
        </p>
        <p className="ok">✓ Verified by Paron demo verifier</p>
        <div className="bond-bar" aria-hidden="true">
          <span className="fill" style={{ width: "100%" }} />
        </div>
        <div className="row"><span>Bond</span><span>{draft.bond ? formatUsd(draft.bond.includes(".") ? draft.bond : `${draft.bond}.00`) : "—"} / CU</span></div>
        <div className="row"><span>Primary</span><span>{draft.price ? formatUsd(draft.price) : "—"} / CU</span></div>
        <p className="help">The provider pays the 1% primary fee.</p>
      </Panel>
      </div>
    </div>
  );
}

function buildParams(draft: Draft) {
  return {
    gpuModel: stringToHex(draft.gpu, { size: 32 }),
    gpuHours: BigInt(draft.hours || "0"),
    primaryPrice: parseUnits(draft.price || "0", 6),
    bondPerCU: parseUnits(draft.bond || "0", 6),
    windowStart: BigInt(draft.windowStart || "0"),
    windowEnd: BigInt(draft.windowEnd || "0"),
    ackWindow: BigInt(draft.ack || "0"),
    deliveryWindow: BigInt(draft.delivery || "0"),
    disputeWindow: BigInt(draft.dispute || "0"),
    minRedemption: BigInt(draft.min || "0") * CU,
    arbitrator: draft.arbitrator as `0x${string}`,
    specHash: keccak256(stringToHex(draft.symbol || "spec")),
    termsHash: `0x${"0".repeat(64)}` as `0x${string}`,
    country: stringToHex(draft.country.slice(0, 2), { size: 2 }),
    continent: CONTINENTS.indexOf(draft.continent),
    institutional: draft.institutional,
    symbol: draft.symbol,
  };
}
