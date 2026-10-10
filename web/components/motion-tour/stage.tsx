"use client";

import type { MotionFrame, MotionState } from "@/lib/motion-scenes";

const NAV = [
  ["markets", "Markets", 188],
  ["trade", "Trade", 268],
  ["portfolio", "Portfolio", 370],
  ["faucet", "Faucet", 470],
  ["redemptions", "Redemptions", 600],
  ["index", "Index", 730],
  ["data", "Data", 810],
] as const;

function navFor(screen: string) {
  if (screen === "series" || screen === "buy") return "markets";
  if (screen === "trade") return "trade";
  if (screen === "portfolio" || screen === "redeem" || screen === "claim") return screen === "portfolio" ? "portfolio" : "redemptions";
  if (screen === "index") return "index";
  if (screen === "data") return "data";
  if (screen === "faucet") return "faucet";
  return "";
}

function Head({ screen, connected }: { screen: string; connected: boolean }) {
  const active = navFor(screen);
  return (
    <header className="motion-head">
      <div className="motion-brand"><i className="motion-mark" /> PARON</div>
      <nav className="motion-nav" aria-hidden="true">
        {NAV.map(([id, label, x]) => (
          <span key={id} className={active === id ? "on" : undefined} style={{ left: x }} data-hot={`nav-${id === "redemptions" ? "redemptions" : id}`}>
            {label}
          </span>
        ))}
      </nav>
      <span className="motion-chip"><i />Testnet</span>
      <span className="motion-wallet" data-hot="wallet">{connected ? "0x3F8f…6ae9" : "Connect wallet"}</span>
    </header>
  );
}

function Btn({ id, x, y, children, press, danger }: { id: string; x: number; y: number; children: string; press: string | null; danger?: boolean }) {
  return <span className={press === id ? `motion-btn is-press${danger ? " danger" : ""}` : `motion-btn${danger ? " danger" : ""}`} style={{ left: x, top: y }} data-hot={id}>{children}</span>;
}

function Field({ id, x, y, value, on }: { id: string; x: number; y: number; value: string; on: boolean }) {
  return (
    <span className={on ? "motion-field on" : "motion-field"} style={{ left: x, top: y }} data-hot={id}>
      {value}
      {on ? <i className="caret" /> : null}
    </span>
  );
}

function Layer({ screen, state, press }: { screen: string; state: MotionState; press: string | null }) {
  const flag = state.flags;
  const typed = state.typed;
  if (screen === "end") {
    return (
      <div className="motion-end">
        <p className="motion-kicker" style={{ position: "static" }}>Paron</p>
        <h2>Strike once.</h2>
        <h2>Trade <em>anywhere.</em></h2>
        <p>paron.vercel.app</p>
        <p className="motion-dim">Testnet only. Tokens have no monetary value.</p>
      </div>
    );
  }
  const qty = typed.qty ?? "";
  const cost = qty ? (Number(qty) * 3).toFixed(2) : "0.00";
  const timeline = Number(flag.timeline ?? "0");
  const wizard = flag.wizard ?? "0";
  return (
    <>
      <Head screen={screen} connected={flag.connected === "1" || screen !== "faucet"} />
      {screen === "faucet" ? (
        <>
          <h3 className="motion-title">Get test USDC</h3>
          <p className="motion-lede">Sends 5,000 test USDC. Once per hour.</p>
          <Btn id="faucet" x={168} y={248} press={press}>{flag.sending === "1" && flag.faucet !== "1" ? "Sending…" : "Get test USDC"}</Btn>
          {flag.faucet === "1" ? <p className="motion-note motion-pale" style={{ left: 220, top: 310 }}>5,000 test USDC added.</p> : null}
        </>
      ) : null}
      {screen === "markets" ? (
        <>
          <h3 className="motion-title">Markets</h3>
          <p className="motion-lede">Primary sales, a secondary book, and bonded redemptions.</p>
          <div className="motion-row head" style={{ left: 40, top: 190 }}>
            <span>Series</span><span>Primary</span><span>Last</span><span>Bond / CU</span>
          </div>
          <div className="motion-row on" style={{ left: 40, top: 248 }} data-hot="row-4">
            <span>CU-JKT-H100-2610 <i className="motion-pill">Sale open</i></span>
            <span className="motion-amber">$3.00</span><span className="motion-amber">$3.20</span><span className="motion-amber">$4.50</span>
          </div>
          <div className="motion-row" style={{ left: 40, top: 296 }}>
            <span>CU-JKT-H100-2611</span><span>$3.00</span><span className="motion-dim">—</span><span>$4.50</span>
          </div>
        </>
      ) : null}
      {screen === "series" || screen === "buy" ? (
        <>
          <p className="motion-kicker" style={{ left: 40, top: 72 }}>Series 4</p>
          <h3 className="motion-title" style={{ top: 96 }}>CU-JKT-H100-2610</h3>
          <div className="motion-tabs">
            <span>Overview</span>
            <span className={screen === "buy" || flag.buy === "1" ? "on" : undefined} data-hot="tab-buy">Buy</span>
            <span>Trade</span>
            <span>Leverage <i className="motion-pill line">Coming soon</i></span>
          </div>
          {screen === "series" ? (
            <div className="motion-card" style={{ left: 40, top: 340 }} data-hot="bond">
              <p className="motion-kicker" style={{ position: "static" }}>Bond and coverage</p>
              <div className="motion-ratio">1.50×</div>
              <div className={flag.meter === "1" ? "motion-meter go" : "motion-meter"}><i /></div>
              <p>Primary $3.00 · Bond $4.50 per CU</p>
            </div>
          ) : (
            <>
              <Field id="qty" x={280} y={400} value={qty || "Quantity"} on={Boolean(qty) || press === "qty"} />
              <p className="motion-note" style={{ left: 480, top: 400 }}>Cost ${cost}</p>
              <p className="motion-note motion-dim" style={{ left: 480, top: 448 }} data-hot="cost">Max cost ${cost}</p>
              <Btn id="buy" x={280} y={520} press={press}>Buy</Btn>
              {flag.tx ? (
                <div className="motion-toast" data-hot="explorer">
                  <b>{flag.tx === "success" ? "Success" : "Pending"}</b>
                  <span>{flag.tx === "success" ? "Bought 20 CU of CU-JKT-H100-2610." : "Waiting for confirmation…"}</span>
                  {flag.tx === "success" ? <a>View on explorer</a> : null}
                </div>
              ) : null}
            </>
          )}
        </>
      ) : null}
      {screen === "trade" ? (
        <>
          <h3 className="motion-title">Trade</h3>
          <p className="motion-lede">CU-JKT-H100-2610 · ask 20 CU</p>
          <div className="motion-card" style={{ left: 40, top: 200, width: 520 }} data-hot="book-row">
            <p className="motion-kicker" style={{ position: "static" }}>Book</p>
            {flag.book === "1" ? <p className="motion-pale">Ask · 20 CU · $3.20</p> : <p className="motion-dim">No orders. Place the first ask.</p>}
            {flag.book === "1" ? <p>Print · 20 CU · $3.20</p> : null}
          </div>
          <Field id="ask-price" x={980} y={250} value={typed.price ? `$${typed.price}` : "Price"} on={Boolean(typed.price)} />
          <Field id="ask-qty" x={980} y={330} value={typed.askQty || "Size"} on={Boolean(typed.askQty)} />
          <Btn id="place" x={980} y={430} press={press}>Place ask</Btn>
        </>
      ) : null}
      {screen === "portfolio" ? (
        <>
          <h3 className="motion-title">Portfolio</h3>
          <div className="motion-row on" style={{ left: 40, top: 250 }} data-hot="holding">
            <span>CU-JKT-H100-2610</span><span>20 CU</span><span className="motion-amber">$3.20</span><span>$64.00</span>
          </div>
          <div className="motion-row" style={{ left: 40, top: 420 }} data-hot="claim-row">
            <span>Claim</span><span>Redemption 2</span><span>Deadline passed</span><span className="motion-pale">Open</span>
          </div>
        </>
      ) : null}
      {screen === "redeem" ? (
        <>
          <h3 className="motion-title">Redemption 1</h3>
          <ol className="motion-tl">
            {["Requested", "Acknowledged", "Delivered", "Finalized"].map((label, index) => (
              <li key={label} className={timeline > index ? "on" : undefined}><i /><b>{label}</b></li>
            ))}
          </ol>
          {timeline >= 4 ? <p className="motion-note motion-pale" style={{ left: 720, top: 280 }}>Bond released.</p> : null}
        </>
      ) : null}
      {screen === "claim" ? (
        <>
          <h3 className="motion-title">Redemption 2</h3>
          <p className="motion-lede" style={{ top: 200 }}>Deadline passed. The buyer can claim from the bond.</p>
          <Btn id="claim-default" x={220} y={360} press={press} danger>Claim default</Btn>
          {flag.paid === "1" ? <p className="motion-note motion-pale" style={{ left: 420, top: 430 }}>Paid from the bond.</p> : null}
        </>
      ) : null}
      {screen === "provider" ? (
        <>
          <h3 className="motion-title">List capacity</h3>
          <p className="motion-lede">Three steps. The bond is approved, then the series is created.</p>
          <span className={wizard === "0" ? "motion-kicker motion-pale" : "motion-kicker"} style={{ left: 200, top: 200 }}>GPU and size</span>
          <span className={wizard === "1" ? "motion-kicker motion-pale" : "motion-kicker"} data-hot="wizard-terms" style={{ left: 430, top: 200 }}>Terms</span>
          <span className={wizard === "2" ? "motion-kicker motion-pale" : "motion-kicker"} data-hot="wizard-review" style={{ left: 560, top: 200 }}>Review</span>
          <div className="motion-card" style={{ left: 40, top: 250 }}>
            {wizard === "1" ? <p>Window 2026-10 · Ack, delivery, and dispute windows set.</p> : null}
            {wizard === "2" ? <p>CU-JKT-H100-2610 · 500 CU · $3.00 primary · $4.50 bond.</p> : null}
            {wizard !== "1" && wizard !== "2" ? <p>H100-SXM-80GB · 500 GPU-hours · $3.00 · bond $4.50.</p> : null}
          </div>
        </>
      ) : null}
      {screen === "verifier" ? (
        <>
          <h3 className="motion-title">Verifier</h3>
          <p className="motion-lede">Manual attest. Revoke stays on the same screen.</p>
          <div className="motion-row on" style={{ left: 40, top: 280 }} data-hot="kyb-row">
            <span>0x3F8f…6ae9</span><span>Provider</span><span>ID</span>
            <span className={flag.attested === "1" ? "motion-pale" : "motion-amber"}>{flag.attested === "1" ? "Approved" : "Pending"}</span>
          </div>
          <Btn id="attest" x={220} y={420} press={press}>Attest</Btn>
          {flag.attested === "1" ? <p className="motion-note motion-pale" style={{ left: 460, top: 420 }}>Attestation issued.</p> : null}
        </>
      ) : null}
      {screen === "admin" ? (
        <>
          <h3 className="motion-title">Admin</h3>
          <p className="motion-lede">Schedule setFactor. Execute is open after the delay.</p>
          <Field id="factor" x={860} y={250} value={typed.factor || "Factor"} on={Boolean(typed.factor)} />
          <Btn id="schedule" x={860} y={340} press={press}>Schedule</Btn>
          {flag.admin ? (
            <div className="motion-row on" style={{ left: 40, top: 460 }}>
              <span>setFactor</span><span>0.4500</span>
              <span>{flag.admin === "done" ? "Done" : "Waiting"}</span>
              <span data-hot="execute">{flag.admin === "done" ? "Executed" : "Execute"}</span>
            </div>
          ) : null}
        </>
      ) : null}
      {screen === "index" ? (
        <>
          <h3 className="motion-title">H100 index</h3>
          <p className="motion-ratio" style={{ position: "absolute", left: 40, top: 220 }}>$3.20</p>
          <p className="motion-lede" style={{ top: 320 }}>per CU · status OK · sample prints only.</p>
        </>
      ) : null}
      {screen === "data" ? (
        <>
          <h3 className="motion-title">Data</h3>
          <div className="motion-row on" style={{ left: 40, top: 250 }}>
            <span>CU-JKT-H100-2610</span><span>20 CU</span><span className="motion-amber">$3.20</span><span>Print</span>
          </div>
          <p className="motion-lede" style={{ top: 320 }}>Tape of sample prints.</p>
        </>
      ) : null}
    </>
  );
}

export function MotionStage({ frame }: { frame: MotionFrame }) {
  return (
    <div className="motion-fit" aria-hidden="true">
      <div className="motion-layer" style={{ opacity: 1 - frame.fade }}>
        <Layer screen={frame.screen} state={frame.state} press={frame.press} />
      </div>
      {frame.nextScreen ? (
        <div className="motion-layer" style={{ opacity: frame.fade }}>
          <Layer screen={frame.nextScreen} state={frame.nextState} press={null} />
        </div>
      ) : null}
      <svg className="motion-cursor" viewBox="0 0 18 18" style={{ left: frame.cursor.x, top: frame.cursor.y }} aria-hidden="true">
        <path d="M1 1l6 16 2.2-6.2L16 8z" fill="#f1d3a6" />
      </svg>
      {frame.ripple ? (
        <i className="motion-ripple" style={{ left: frame.ripple.x, top: frame.ripple.y, opacity: 1 - frame.ripple.p, transform: `scale(${0.2 + frame.ripple.p})` }} />
      ) : null}
    </div>
  );
}
