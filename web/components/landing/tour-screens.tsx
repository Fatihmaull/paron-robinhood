"use client";

import { memo } from "react";

/** Hardcoded dashboard mock. Poster state: redemption complete. Not the live app. */
export const TourScreens = memo(function TourScreens() {
  return (
    <div className="ui" data-tour="ui">
      <header className="m-head">
        <div className="m-brand">
          <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
            <path d="M2 3h19l5 4h-6l-3 4v3h4v3H8v-3h4v-3L8 7H2z" fill="#f1d3a6" />
          </svg>
          <span>PARON</span>
        </div>
        <nav className="m-nav" aria-hidden="true">
          <span data-nav="markets">Markets</span>
          <span data-nav="buy">Buy</span>
          <span data-nav="trade" data-tour="nav-trade">Trade</span>
          <span data-nav="portfolio" data-tour="nav-portfolio">Portfolio</span>
          <span>Provider</span>
          <span>Index</span>
          <span>Data</span>
          <span>Demo</span>
        </nav>
        <div className="m-chip"><i />Robinhood Chain Testnet</div>
        <div className="m-wallet">0x3F8f…6ae9</div>
      </header>
      <div className="m-index">
        <b>H100 index</b>
        <span className="ok">OK</span>
        <span className="amb">$3.20/CU</span>
        <span>2 entities · 2 CU/24h</span>
        <em>Demo data</em>
      </div>

      <section className="screen" data-screen="markets">
        <p className="screen-title">Markets</p>
        <p className="sub">Pick a series to open it.</p>
        <div className="panel tbl">
          <div className="tr th">
            <span className="c-s">Series</span><span className="c-p">Provider</span><span className="c-g">GPU</span>
            <span className="r">Primary</span><span className="r">Last</span><span className="r">24h vol</span>
            <span className="r">Bond / CU</span><span className="r">Sample</span>
          </div>
          <div className="tr" data-tour="row-4">
            <span className="c-s">CU-JKT-H100-2610 <u className="tag">Sale open</u></span>
            <span className="c-p"><s>✓</s> 0xA1FA…95DF</span>
            <span className="c-g">H100 <small>1.00×</small></span>
            <span className="r amb">$3.00</span><span className="r amb">$3.20</span><span className="r">2 CU</span>
            <span className="r amb">$4.50</span><span className="r">—</span>
          </div>
          <div className="tr">
            <span className="c-s">CU-JKT-H100-2611 <u className="tag">Sale open</u></span>
            <span className="c-p"><s>✓</s> 0xda14…1d0f</span>
            <span className="c-g">H100 <small>1.00×</small></span>
            <span className="r amb">$3.00</span><span className="r dim">—</span><span className="r">0 CU</span>
            <span className="r amb">$4.50</span><span className="r">—</span>
          </div>
          <div className="tr">
            <span className="c-s">CU-BTM-H200-2611 <u className="tag">Sale open</u></span>
            <span className="c-p"><s>✓</s> 0x8575…AC14</span>
            <span className="c-g">H200 <small>1.40×</small></span>
            <span className="r amb">$4.06</span><span className="r dim">—</span><span className="r">0 CU</span>
            <span className="r amb">$6.09</span><span className="r">—</span>
          </div>
          <div className="tr">
            <span className="c-s">CU-SGP-B200-2612 <u className="tag">Sale open</u></span>
            <span className="c-p"><s>✓</s> 0x5d10…e400</span>
            <span className="c-g">B200 <small>2.50×</small></span>
            <span className="r amb">$3.00</span><span className="r dim">—</span><span className="r">0 CU</span>
            <span className="r amb">$4.50</span><span className="r">—</span>
          </div>
        </div>
        <p className="foot">Illustrative sample. 4 series.</p>
      </section>

      <section className="screen" data-screen="series">
        <p className="lab">Series 4</p>
        <div className="h1row">
          <p className="screen-title">CU-JKT-H100-2610</p>
          <u className="tag">Sale open</u>
          <u className="tag ok">Verified by Paron demo verifier</u>
        </div>
        <div className="stats">
          <div><small>Last</small><b className="amb">$3.20/CU</b></div>
          <div><small>24h vol</small><b>2 CU</b></div>
          <div><small>Bond / CU</small><b className="amb">$4.50</b></div>
          <div><small>Primary</small><b className="amb">$3.00</b></div>
          <div><small>Sample</small><b>—</b></div>
        </div>
        <div className="m-tabs">
          <span className="act">Overview</span>
          <span data-tour="tab-buy">Buy</span>
          <span>Trade</span>
          <span>Leverage <u className="tag line">Coming soon</u></span>
        </div>
        <div className="two">
          <div className="panel" data-tour="bond-panel">
            <p className="lab">Bond and coverage</p>
            <div className="bigrow">
              <span className="serif ratio-num amb-grad">1.50×</span>
              <span className="cap">bond per CU against<br />the primary price</span>
            </div>
            <div className="meter">
              <div className="mt"><i className="mf" data-tour="meter-fill" /><i className="m1" /></div>
              <div className="ml"><span>Primary $3.00 (1.0×)</span><span className="amb">Bond $4.50 (1.5×)</span></div>
            </div>
            <div className="kv"><span>Minimum bond</span><b>1.5× primary</b></div>
            <div className="kv"><span>Bond posted for 20 CU</span><b className="amb">$90.00</b></div>
          </div>
          <div className="panel">
            <p className="lab">Prints</p>
            <svg viewBox="0 0 300 96" className="chart" aria-hidden="true">
              <g stroke="rgba(255,255,255,.09)">
                <path d="M0 20H300M0 50H300M0 80H300" />
              </g>
              <path d="M16 70L284 24" stroke="#d9a066" strokeWidth="2" fill="none" />
              <circle cx="16" cy="70" r="3" fill="#d9a066" />
              <circle cx="284" cy="24" r="3" fill="#d9a066" />
            </svg>
            <div className="kv"><span>Last print</span><b>2 CU @ $3.20</b></div>
            <div className="kv"><span>First print</span><b>20 CU @ $3.00</b></div>
          </div>
        </div>
      </section>

      <section className="screen" data-screen="buy">
        <p className="lab">Series 4 · Buy</p>
        <div className="h1row"><p className="screen-title">Buy CU-JKT-H100-2610</p></div>
        <div className="two buy">
          <div className="panel" data-tour="ticket">
            <p className="lab">Buy primary</p>
            <label>Quantity (whole CU)</label>
            <div className="field" data-tour="qty"><span className="val" /><i className="caret" /></div>
            <div className="kv big"><span>Cost</span><b className="serif" data-tour="cost">$0.00</b></div>
            <div className="kv"><span>Max cost (MockUSDC)</span><b data-tour="maxc">$0.00</b></div>
            <div className="btn amb-btn" data-tour="buy-btn">Buy</div>
          </div>
          <div className="panel">
            <p className="lab">Bond behind this order</p>
            <div className="kv"><span>Primary price</span><b>$3.00 / CU</b></div>
            <div className="kv"><span>Bond / CU</span><b className="amb">$4.50</b></div>
            <div className="kv"><span>Coverage</span><b className="amb">1.50×</b></div>
            <div className="kv"><span>Bond covering your CU</span><b className="amb" data-tour="bondfor">—</b></div>
            <p className="foot">If the provider does not deliver, you claim from this bond.</p>
          </div>
        </div>
        <div className="tray" data-tour="tray">
          <p className="lab">Transaction</p>
          <div className="trow"><i className="dot pend" data-tour="tdot" /><b data-tour="tstate">Pending</b></div>
          <p className="tsub" data-tour="tsub">Waiting for confirmation…</p>
          <span className="tlink" data-tour="tx-link">View on explorer</span>
        </div>
      </section>

      <section className="screen" data-screen="trade">
        <p className="lab">Series 4 · Secondary</p>
        <div className="h1row"><p className="screen-title">Trade CU-JKT-H100-2610</p></div>
        <div className="two buy">
          <div>
            <div className="panel" data-tour="book">
              <p className="lab">Book · Series 4</p>
              <p className="empty" data-tour="book-empty">No orders. Place the first bid.</p>
              <div className="brow" data-tour="book-row"><span className="tag line">Ask</span><b className="amb">$3.20</b><span>20 CU</span><em>You</em></div>
              <div className="spread">spread —</div>
            </div>
            <div className="panel oo-panel">
              <p className="lab">Open orders</p>
              <p className="foot" data-tour="oo-empty">None.</p>
              <div className="brow oo" data-tour="oo-row"><span>CU-JKT-H100-2610</span><span>Ask 20 CU @ $3.20</span><em>Open</em></div>
            </div>
          </div>
          <div className="panel" data-tour="ask-ticket">
            <div className="m-tabs sm"><span>Bid</span><span className="act">Ask</span></div>
            <label>Price (MockUSDC per CU)</label>
            <div className="field" data-tour="ask-price"><span className="val" /><i className="caret" /></div>
            <label>Quantity (CU)</label>
            <div className="field" data-tour="ask-qty"><span className="val" /><i className="caret" /></div>
            <div className="btn amb-btn" data-tour="place-ask">Place ask</div>
          </div>
        </div>
      </section>

      <section className="screen on" data-screen="redeem">
        <p className="lab">Redemption</p>
        <div className="h1row"><p className="screen-title">Redemption request</p></div>
        <div className="two redeem" data-tour="redeem-main">
          <div className="panel" data-tour="timeline">
            <p className="lab">Status · 20 CU</p>
            <ol className="tl">
              <li className="done" data-i="0"><i /><b>Requested</b><span>Buyer asks for delivery</span></li>
              <li className="done" data-i="1"><i /><b>Acknowledged</b><span>Provider confirms</span></li>
              <li className="done" data-i="2"><i /><b>Delivered</b><span>Provider posts evidence</span></li>
              <li className="done" data-i="3"><i /><b>Finalized</b><span>Bond released</span></li>
            </ol>
          </div>
          <div className="panel dash" data-tour="claim-note">
            <p className="lab">If the provider defaults</p>
            <b className="note">Default claim paid from bond</b>
            <div className="kv"><span>Per CU</span><b className="amb">$4.50</b></div>
            <div className="kv"><span>For 20 CU</span><b className="amb">$90.00</b></div>
          </div>
        </div>
      </section>

      <div className="cursor" data-tour="cursor" hidden>
        <svg className="arrow" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path d="M4 2.5l15 8.2-6.4 1.9 3.6 6.6-2.9 1.6-3.6-6.5L4.6 18.2z" fill="#f1d3a6" stroke="#000" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
});
