"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { keccak256, parseUnits, stringToHex } from "viem";
import { useAccount, useChainId, usePublicClient, useSignTypedData } from "wagmi";
import { erc20Abi, orderBookAbi, primarySaleAbi, redemptionManagerAbi } from "@/lib/abi";
import { ZERO_ADDRESS, chainId, contractAddress } from "@/lib/config";
import { formatCoverage, formatCu, formatFactor, formatMaxCost, formatUsd, formatWib, isWholeCu, quotePrimary, shortId } from "@/lib/format";
import { FitAddress } from "./address";
import type { SeriesDetail } from "@/lib/types";
import { useBook, usePrints, useSeries } from "@/lib/hooks";
import { signErc2612 } from "@/lib/permit";
import { bidUsdcAllowance, uint256Of } from "@/lib/settlement";
import { TAPE_UNAVAILABLE } from "@/lib/onchain";
import { readFailureTone } from "@/lib/markets-state";
import { Panel, TxButton, Field } from "./ui";
import { TxStatus, useSend } from "./tx";
import { useData } from "./providers";

const PrintChart = dynamic(() => import("./charts").then((mod) => mod.PrintChart), { ssr: false });
const BondChart = dynamic(() => import("./charts").then((mod) => mod.BondChart), { ssr: false });

const CU = 10n ** 18n;

const INFO_TABS = ["Bond", "Terms", "Redemptions", "Reputation"] as const;
type InfoTab = (typeof INFO_TABS)[number];

export function SeriesView({ seriesId, tab }: { seriesId: string; tab: "overview" | "buy" | "trade" }) {
  const [infoTab, setInfoTab] = useState<InfoTab>("Bond");
  const series = useSeries(seriesId);
  const book = useBook(seriesId);
  const prints = usePrints();
  const detail = series.data?.data;
  const tape = (prints.data?.data ?? []).filter((print) => print.series_id === seriesId || seriesId === "4");
  const onchainTape = prints.data?.origin === "onchain";
  const seriesTone = readFailureTone(series.error);

  return (
    <div>
      <p className="kicker">Series {seriesId}</p>
      <div className="series-title">
        {detail ? <h1 className="series-symbol">{detail.symbol}</h1> : series.isLoading ? <div className="skeleton title-sk" role="status" aria-label="Loading series" data-testid="series-skeleton" /> : <h1>Series not found</h1>}
        {detail ? <SeriesStatus detail={detail} /> : null}
        {detail?.provider.verified ? <span className="pill ok">Verified by Paron verifier (team-operated, testnet)</span> : null}
      </div>
      {series.isError ? (
        <p className={seriesTone} role={seriesTone === "muted" ? "status" : undefined}>
          {series.error instanceof Error && series.error.message !== "Not found." ? series.error.message : "Series not found."}
        </p>
      ) : null}
      {detail ? <StatsRibbon detail={detail} /> : null}
      {detail ? (
        <p className="lede">
          {detail.gpu_type} · factor {formatFactor(detail.factor)}
          {detail.country ? ` · country ${detail.country}` : ""}
          {seriesId ? ` · ID ${seriesId}` : ""}
          {` · window ${detail.delivery_window || "—"}`}
          {" · provider "}
          <FitAddress value={detail.provider.address} />
        </p>
      ) : null}
      <div className="tabs">
        <Link href={`/markets/${seriesId}`} data-active={tab === "overview"}>Overview</Link>
        <Link href={`/buy/${seriesId}`} data-active={tab === "buy"}>Buy</Link>
        <Link href={`/trade/${seriesId}`} data-active={tab === "trade"}>Trade</Link>
        <Link href="/trade/leverage" className="tab-with-pill">Leverage <span className="pill outline">Coming soon</span></Link>
      </div>
      <div className="terminal">
        <div className="t-chart">
          <Panel title="Prints">
            {onchainTape ? <p>{TAPE_UNAVAILABLE}</p> : null}
            {tape.length > 0 ? <PrintChart prints={tape} /> : <p className="muted">No prints yet.</p>}
            <div className="table-scroll">
            <table>
              <thead><tr><th>Time</th><th>Price</th><th>Qty</th><th>Notional</th></tr></thead>
              <tbody>
                {tape.map((print) => (
                  <tr key={print.id}>
                    <td title={print.ts_iso}>{formatWib(print.ts_ms)}</td>
                    <td>{formatUsd(print.cu_price)}/CU</td>
                    <td>{formatCu(print.qty_cu)}</td>
                    <td>{formatUsd(print.notional_usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Panel>
        </div>
        <div className="t-book">
          <OrderBookPanel seriesId={seriesId} asks={book.data?.data.asks ?? []} bids={book.data?.data.bids ?? []} />
        </div>
        <div className="t-ticket">
          {detail ? <Ticket seriesId={seriesId} detail={detail} initial={tab === "trade" ? "order" : "buy"} /> : null}
        </div>
        <div className="t-info">
          {detail ? (
            <Panel title="Market">
              <div className="row"><span>Primary</span><span>{formatUsd(detail.primary_price)}/CU</span></div>
              <div className="row"><span>Native</span><span>{formatUsd(detail.native_primary_price)}/{detail.gpu}-hour</span></div>
              <div className="row"><span>Last</span><span>{detail.last_price ? `${formatUsd(detail.last_price)}/CU` : "—"}</span></div>
              <div className="row"><span>Bond / CU</span><span>{formatUsd(detail.bond_per_cu)}</span></div>
              <div className="row"><span>Coverage</span><span>{formatCoverage(detail.coverage)}</span></div>
              <div className="row"><span>Sold / supply</span><span>{formatCu(detail.sold_supply)} / {formatCu(detail.max_supply)}</span></div>
              <div className="row"><span>Outstanding</span><span>{formatCu(detail.total_supply)}</span></div>
              <div className="row"><span>Sale</span><span>{detail.sale_open ? "Open" : "Closed"}{detail.paused ? " · paused" : ""}</span></div>
            </Panel>
          ) : null}
          <div className="tabs" role="tablist" aria-label="Series record">
            {INFO_TABS.map((label) => (
              <button key={label} type="button" role="tab" aria-selected={infoTab === label} data-active={infoTab === label} onClick={() => setInfoTab(label)}>
                {label}
              </button>
            ))}
          </div>
          {infoTab === "Bond" ? (
            detail?.bond ? (
              <Panel title="Bond">
                <BondBar deposited={detail.bond.deposited} balance={detail.bond.balance} released={detail.bond.released} slashed={detail.bond.slashed} />
                <BondChart balance={detail.bond.balance} released={detail.bond.released} slashed={detail.bond.slashed} />
                <div className="row"><span>Deposited</span><span>{formatUsd(detail.bond.deposited)}</span></div>
                <div className="row"><span>Balance</span><span>{formatUsd(detail.bond.balance)}</span></div>
                <div className="row"><span><i className="key released" aria-hidden="true" />Released to provider</span><span>{formatUsd(detail.bond.released)}</span></div>
                <div className="row"><span><i className="key slashed" aria-hidden="true" />Paid to holders</span><span>{formatUsd(detail.bond.slashed)}</span></div>
                <div className="row"><span>Health</span><span>{detail.bond.health}</span></div>
              </Panel>
            ) : (
              <Panel title="Bond">
                <p className="muted">{detail ? `Bond totals are not listed for this series. Bond per CU is ${formatUsd(detail.bond_per_cu)}.` : "—"}</p>
              </Panel>
            )
          ) : null}
          {infoTab === "Terms" ? (
            <Panel title="Terms">
              {detail?.terms ? (
                <>
                  <div className="row"><span>Ack / delivery / dispute</span><span>{detail.terms.ack_window_secs}s / {detail.terms.delivery_window_secs}s / {detail.terms.dispute_window_secs}s</span></div>
                  <div className="row"><span>Min redemption</span><span>{formatCu(detail.terms.min_redemption_cu)}</span></div>
                  <div className="row"><span>Arbitrator</span><span>{shortId(detail.terms.arbitrator)}</span></div>
                  <div className="row"><span>Spec hash</span><span>{shortId(detail.terms.spec_hash)}</span></div>
                </>
              ) : (
                <p className="muted">No terms listed for this series.</p>
              )}
            </Panel>
          ) : null}
          {infoTab === "Redemptions" ? (
            <Panel title="Redemptions">
              {detail?.redemption_stats ? (
                <>
                  <div className="row"><span>Delivered</span><span>{formatCu(detail.redemption_stats.delivered_cu)}</span></div>
                  <div className="row"><span>Defaulted</span><span>{formatCu(detail.redemption_stats.defaulted_cu)}</span></div>
                  <div className="row"><span>Open</span><span>{detail.redemption_stats.open_requests}</span></div>
                  <Link href={`/redemptions/new?series=${seriesId}`}>Redeem</Link>
                </>
              ) : (
                <p className="muted">No redemption record for this series.</p>
              )}
            </Panel>
          ) : null}
          {infoTab === "Reputation" ? (
            <Panel title="Reputation">
              <p>{detail ? `${detail.provider.delivered_cu} delivered · ${detail.provider.defaulted_cu} defaulted · ${detail.provider.voluntary_defaulted_cu} voluntary` : "—"}</p>
              <p className="help">Provider-wide record, so both Jakarta rows share it.</p>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SeriesStatus({ detail }: { detail: SeriesDetail }) {
  if (detail.finalized) return <span className="pill neutral">Finalized</span>;
  if (detail.paused) return <span className="pill warn">Paused</span>;
  if (detail.sale_open) return <span className="pill sale">Sale open</span>;
  return <span className="pill outline">Sale closed</span>;
}

function StatsRibbon({ detail }: { detail: SeriesDetail }) {
  const record = `${detail.provider.delivered_cu} / ${detail.provider.defaulted_cu} / ${detail.provider.voluntary_defaulted_cu}`;
  return (
    <dl className="stats-ribbon">
      <div><dt>Last</dt><dd>{detail.last_price ? `${formatUsd(detail.last_price)}/CU` : "—"}</dd></div>
      <div><dt>24h vol</dt><dd>{formatCu(detail.volume_24h_cu)}</dd></div>
      <div><dt>Bond/CU</dt><dd>{formatUsd(detail.bond_per_cu)}</dd></div>
      <div><dt>Coverage</dt><dd>{formatCoverage(detail.coverage)}</dd></div>
      <div><dt>Record</dt><dd>{record}</dd></div>
    </dl>
  );
}

function Ticket({ seriesId, detail, initial }: { seriesId: string; detail: NonNullable<ReturnType<typeof useSeries>["data"]>["data"]; initial: "buy" | "order" }) {
  const [mode, setMode] = useState<"buy" | "order">(initial);
  const { address } = useAccount();
  const walletChain = useChainId();
  const wrongNetwork = Boolean(address) && walletChain !== chainId();
  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Ticket">
        <button type="button" role="tab" aria-selected={mode === "buy"} data-active={mode === "buy"} onClick={() => setMode("buy")}>Buy</button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "order"}
          data-active={mode === "order"}
          disabled={wrongNetwork}
          title={wrongNetwork ? "Wrong network" : undefined}
          onClick={() => setMode("order")}
        >
          Place order
        </button>
      </div>
      {mode === "buy" ? (
        <BuyBox seriesId={seriesId} price={detail.primary_price} saleOpen={detail.sale_open} />
      ) : (
        <TradeBox seriesId={seriesId} token={detail.token} />
      )}
    </div>
  );
}

function OrderBookPanel({ seriesId, bids, asks }: { seriesId: string; bids: { price: string; qty_cu: string }[]; asks: { price: string; qty_cu: string }[] }) {
  const askRows = [...asks].sort((a, b) => Number(a.price) - Number(b.price));
  const bidRows = [...bids].sort((a, b) => Number(b.price) - Number(a.price));
  const max = Math.max(1, ...[...askRows, ...bidRows].map((level) => Number(level.qty_cu)));
  const bestAsk = askRows[0] ? Number(askRows[0].price) : null;
  const bestBid = bidRows[0] ? Number(bidRows[0].price) : null;
  const spread = bestAsk != null && bestBid != null ? bestAsk - bestBid : null;
  return (
    <Panel title={`Book · series ${seriesId}`}>
      {askRows.length === 0 && bidRows.length === 0 ? <p className="muted">No orders. Place the first bid.</p> : null}
      {askRows.map((level) => (
        <BookRow key={`a-${level.price}`} side="ask" price={level.price} qty={level.qty_cu} max={max} />
      ))}
      <div className="spread">spread {spread == null ? "—" : formatUsd(spread.toFixed(2))}</div>
      {bidRows.map((level) => (
        <BookRow key={`b-${level.price}`} side="bid" price={level.price} qty={level.qty_cu} max={max} />
      ))}
    </Panel>
  );
}

function BondBar({ deposited, balance, released, slashed }: { deposited: string; balance: string; released: string; slashed: string }) {
  const parts = [Number(balance), Number(released), Number(slashed)];
  const base = Number(deposited) || parts.reduce((sum, n) => sum + n, 0) || 1;
  const widths = parts.map((n) => `${Math.max(0, (n / base) * 100)}%`);
  return (
    <div className="bond-bar" aria-hidden="true">
      <span className="fill" style={{ width: widths[0] }} />
      <span className="released" style={{ width: widths[1] }} />
      <span className="slashed" style={{ width: widths[2] }} />
    </div>
  );
}

function BookRow({ side, price, qty, max }: { side: "bid" | "ask"; price: string; qty: string; max: number }) {
  const depth = `${Math.min(100, (Number(qty) / max) * 100)}%`;
  return (
    <div className={`book-row ${side}`} style={{ ["--depth" as string]: depth }}>
      <span className="num px">{formatUsd(price)}</span>
      <span className="num">{formatCu(qty)}</span>
    </div>
  );
}

function BuyBox({ seriesId, price, saleOpen }: { seriesId: string; price: string; saleOpen: boolean }) {
  const [qty, setQty] = useState("1");
  const [maxCost, setMaxCost] = useState("");
  const { send, pending, error, record } = useSend();
  const { source } = useData();
  const { address } = useAccount();
  const client = usePublicClient();
  const { signTypedDataAsync } = useSignTypedData();
  const whole = isWholeCu(qty);
  const quote = useMemo(() => (whole ? quotePrimary(qty, price) : null), [whole, qty, price]);
  const shownMax = maxCost || (quote ? formatMaxCost(quote.cost) : "");

  async function buy() {
    const sale = contractAddress("primarySale");
    const usdc = contractAddress("usdc");
    const qtyRaw = BigInt(qty) * CU;
    const max = parseUnits(shownMax, 6);
    let cost = max;
    if (source !== "mock" && client && sale !== ZERO_ADDRESS) {
      try {
        const quoted = (await client.readContract({
          address: sale,
          abi: primarySaleAbi,
          functionName: "quote",
          args: [BigInt(seriesId), qtyRaw],
        })) as readonly [bigint, bigint];
        cost = quoted[0];
      } catch {
        /* max cost still caps the trade */
      }
    }
    if (source !== "mock" && client && address && usdc !== ZERO_ADDRESS && sale !== ZERO_ADDRESS) {
      try {
        const permit = await signErc2612({
          client,
          sign: signTypedDataAsync,
          token: usdc,
          owner: address,
          spender: sale,
          value: cost,
          chainId: chainId(),
        });
        const bought = await send("buy", {
          address: sale,
          abi: primarySaleAbi,
          functionName: "buyWithPermit",
          args: [BigInt(seriesId), qtyRaw, max, permit.deadline, permit.v, permit.r, permit.s],
        });
        if (bought) return;
      } catch {
        /* approve, then buy */
      }
      const approved = await send("approve", {
        address: usdc,
        abi: erc20Abi,
        functionName: "approve",
        args: [sale, cost],
      });
      if (!approved) return;
    }
    await send("buy", {
      address: sale,
      abi: primarySaleAbi,
      functionName: "buy",
      args: [BigInt(seriesId), qtyRaw, max],
    });
  }

  return (
    <Panel title="Buy primary">
      <Field label="Quantity (whole CU)">
        <input value={qty} onChange={(event) => setQty(event.target.value)} />
      </Field>
      {!whole && qty !== "" ? <p className="bad">Quantity must be a whole number of CU.</p> : null}
      <div className="row"><span>Cost</span><span>{quote ? formatUsd(quote.cost) : "—"}</span></div>
      <div className="row"><span>Fee (1%)</span><span>{quote ? formatUsd(quote.fee) : "—"}</span></div>
      <Field label="Max cost (USDC, required)">
        <input value={shownMax} inputMode="decimal" onChange={(event) => setMaxCost(event.target.value)} />
      </Field>
      {!saleOpen ? <p className="warn">The primary sale is closed.</p> : null}
      <TxButton
        disabled={!whole || !shownMax || !saleOpen}
        reason={pending ?? undefined}
        onClick={() => void buy()}
      >
        {pending === "buy" ? "Buying…" : "Buy"}
      </TxButton>
      <TxStatus record={record} />
      {error && record?.phase !== "failed" ? <p className="bad">{error}</p> : null}
    </Panel>
  );
}

function TradeBox({ seriesId, token }: { seriesId: string; token: string }) {
  const [side, setSide] = useState<"0" | "1">("1");
  const [price, setPrice] = useState("3.20");
  const [qty, setQty] = useState("1");
  const [ioc, setIoc] = useState(false);
  const { send, pending, error, record } = useSend();
  const { source } = useData();
  const client = usePublicClient();
  const whole = isWholeCu(qty);
  const priceOk = /^\d+(\.\d{1,2})?$/.test(price);

  async function place() {
    const book = contractAddress("orderBook");
    const usdc = contractAddress("usdc");
    const qtyRaw = BigInt(qty) * CU;
    const priceRaw = parseUnits(price, 6);
    if (source !== "mock" && client && book !== ZERO_ADDRESS) {
      if (side === "0" && usdc !== ZERO_ADDRESS) {
        let feeBps = 15n;
        try {
          feeBps = uint256Of(
            await client.readContract({ address: book, abi: orderBookAbi, functionName: "takerFeeBps" }),
            15n,
          );
        } catch {
          /* demo taker fee */
        }
        const approved = await send("approve", {
          address: usdc,
          abi: erc20Abi,
          functionName: "approve",
          args: [book, bidUsdcAllowance(qtyRaw, priceRaw, feeBps)],
        });
        if (!approved) return;
      } else if (side === "1" && /^0x[0-9a-fA-F]{40}$/.test(token) && token.toLowerCase() !== ZERO_ADDRESS) {
        const approved = await send("approve", {
          address: token as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [book, qtyRaw],
        });
        if (!approved) return;
      }
    }
    await send("order", {
      address: book,
      abi: orderBookAbi,
      functionName: "placeOrder",
      args: [BigInt(seriesId), Number(side), priceRaw, qtyRaw, ioc],
    });
  }

  return (
    <Panel title="Place order">
      <Field label="Side">
        <select value={side} onChange={(event) => setSide(event.target.value as "0" | "1")}>
          <option value="0">Bid</option>
          <option value="1">Ask</option>
        </select>
      </Field>
      <Field label="Price (USDC per CU, 0.01 tick)">
        <input value={price} onChange={(event) => setPrice(event.target.value)} />
      </Field>
      <Field label="Size (whole CU)">
        <input value={qty} onChange={(event) => setQty(event.target.value)} />
      </Field>
      {!whole && qty !== "" ? <p className="bad">Order size must be a whole number of CU.</p> : null}
      <label>
        <input type="checkbox" checked={ioc} onChange={(event) => setIoc(event.target.checked)} style={{ width: "auto" }} /> Immediate or cancel
      </label>
      <TxButton
        disabled={!whole || !priceOk}
        onClick={() => void place()}
      >
        {pending === "order" ? "Placing…" : "Place order"}
      </TxButton>
      <TxStatus record={record} />
      {error && record?.phase !== "failed" ? <p className="bad">{error}</p> : null}
      <p className="help">Bids approve mUSDC for the escrow plus the taker fee. Asks approve the series CU token.</p>
      <RedeemLink seriesId={seriesId} />
    </Panel>
  );
}

function RedeemLink({ seriesId }: { seriesId: string }) {
  return (
    <p className="help">
      Holding CU? <Link className="touch-link" href={`/redemptions/new?series=${seriesId}`}>Request redemption</Link>. Delivery text is hashed on-chain.
      {" "}
      <span className="muted">{shortId(keccak256(stringToHex("demo")))}</span>
    </p>
  );
}

export function RedeemForm({ seriesId }: { seriesId: string }) {
  const [amount, setAmount] = useState("1");
  const [refText, setRefText] = useState("");
  const { send, pending, error, record } = useSend();
  const whole = isWholeCu(amount);
  const hash = refText ? keccak256(stringToHex(refText)) : null;
  return (
    <Panel title={`Redeem series ${seriesId}`}>
      <p className="help">Demo: access details are hashed, not delivered.</p>
      <Field label="Amount (whole CU)">
        <input value={amount} onChange={(event) => setAmount(event.target.value)} />
      </Field>
      {!whole && amount !== "" ? <p className="bad">Quantity must be a whole number of CU.</p> : null}
      <Field label="Access details (hashed before the transaction)">
        <textarea value={refText} onChange={(event) => setRefText(event.target.value)} />
      </Field>
      <p className="help">deliveryRef {hash ? shortId(hash) : "—"}</p>
      <TxButton
        disabled={!whole || !hash}
        onClick={() => {
          if (!hash) return;
          void send("redeem", {
            address: contractAddress("redemptionManager"),
            abi: redemptionManagerAbi,
            functionName: "requestRedemption",
            args: [BigInt(seriesId), BigInt(amount) * CU, hash],
          });
        }}
      >
        {pending === "redeem" ? "Requesting…" : "Request redemption"}
      </TxButton>
      <TxStatus record={record} />
      {error && record?.phase !== "failed" ? <p className="bad">{error}</p> : null}
    </Panel>
  );
}
