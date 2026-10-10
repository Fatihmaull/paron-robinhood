"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { loadParticipant } from "@/lib/api";
import {
  landingAnnounce,
  landingBuyer,
  landingFacts,
  landingFooter,
  landingHow,
  landingLedger,
  landingLinks,
  landingNav,
  landingProvider,
  landingSteps,
  providerEntryPath,
} from "@/lib/landing-copy";
import { DemoTour } from "./landing/demo-tour";
import { heroSkyline } from "./landing/skyline";
import { useData } from "./providers";

export function Landing() {
  const { address, isConnected } = useAccount();
  const { source } = useData();
  const participant = useQuery({
    queryKey: ["participant-entry", source, address ?? null],
    enabled: Boolean(isConnected && address),
    retry: false,
    queryFn: () => loadParticipant(address as string, source),
  });
  const verified = !isConnected ? null : participant.isError ? false : participant.data ? participant.data.data.verified : null;
  const providerHref = providerEntryPath(isConnected, verified);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const root = document.querySelector(".landing");
    if (!root) return;
    const nodes = root.querySelectorAll(".rv");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reduce) {
      nodes.forEach((node) => node.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      <a className="skip" href="#main">Skip to content</a>
      <div className="announce">
        <span className="dot" aria-hidden="true" />
        <span>{landingAnnounce}</span>
        <a href={landingLinks.announce}>See the demo path</a>
      </div>
      <header className="nav">
        <div className="wrap">
          <Link className="brand" href="/" aria-label="Paron home">Paron</Link>
          <nav id="landing-nav" aria-label="Primary" className={navOpen ? "open" : undefined}>
            <ul>
              {landingNav.map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="nav-cta">
            <button
              className="pill pill-ghost menu-toggle"
              type="button"
              aria-expanded={navOpen}
              aria-controls="landing-nav"
              onClick={() => setNavOpen((open) => !open)}
            >
              Menu
            </button>
            <Link className="pill pill-solid" href={landingLinks.launch}>Launch app</Link>
          </div>
        </div>
      </header>
      <main id="main">
        <div className="hero">
          <div className="hero-visual">
            <pre className="sky" aria-hidden="true">{heroSkyline}</pre>
            <div className="hero-copy">
              <h1>Where compute is forged into <em>one standard.</em></h1>
              <p className="lede">A bonded marketplace for tokenized GPU compute. One unit is one H100-hour, backed by a posted bond. Testnet only.</p>
              <div className="cta">
                <Link className="pill pill-solid" href={landingLinks.provider}>Become a provider</Link>
                <Link className="pill pill-ghost" href={landingLinks.launch}>Browse markets</Link>
              </div>
            </div>
            <div className="hero-stage-wrap">
              <div className="stage">
                <div className="win">
                  <div className="win-bar">
                    <div className="dots" aria-hidden="true"><i /><i /><i /></div>
                    <div className="win-title">Paron</div>
                    <span />
                  </div>
                  <img
                    className="win-shot"
                    src="/hero/markets.webp"
                    width={2880}
                    height={1880}
                    alt="Paron markets for series CU-JKT-H100-2610 on Robinhood Chain Testnet, with the prints chart, order book, buy ticket, and market table."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="wrap facts">
            <span className="mono">Built for</span>
            <ul>
              {landingFacts.map((fact) => (
                <li key={fact.title}>{fact.title}<small>{fact.detail}</small></li>
              ))}
            </ul>
          </div>
        </div>

        <section className="statement">
          <div className="wrap grid">
            <h2 className="rv">Compute is traded in hours. It deserves one <em>standard unit</em>, one price, one bond.</h2>
          </div>
        </section>

        <section className="how" id="how">
          <div className="wrap grid">
            <div className="side rv">
              <p className="mono">How it works</p>
              <h2 className="sec">Buy primary. Trade secondary. Redeem or claim.</h2>
              <p>Every compute unit (CU) is minted against a provider&apos;s posted bond, so the buyer is covered if delivery fails.</p>
            </div>
            <ol className="rv">
              {landingHow.map((item) => (
                <li key={item.n}>
                  <span className="mono">{item.n}</span>
                  <div>
                    <h3>{item.title} <span>{item.kicker}</span></h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <DemoTour />

        <section className="bond">
          <div className="wrap grid">
            <div className="big rv">
              <p className="mono">Bonded by design</p>
              <span className="serif" aria-label="1.5 times">1.5×</span>
            </div>
            <div className="body rv">
              <h2 className="sec">Providers put up more than they sell.</h2>
              <p>Minimum bond is 1.5× the primary price of the units a provider lists. That collateral is what a default claim draws on.</p>
              <table className="ledger">
                <caption className="mono">Documented minimum · MockUSDC</caption>
                <tbody>
                  {landingLedger.map((row) => (
                    <tr key={row.label} className={row.total ? "tot" : undefined}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="roles">
          <div className="wrap grid">
            <div className="head rv"><p className="mono">Two sides of the market</p></div>
            <div className="role rv">
              <p className="mono">Compute buyers</p>
              <h3>Price, buy, and hold compute in one unit.</h3>
              <ul>
                {landingBuyer.map((item) => (
                  <li key={item.strong}>
                    <b>{item.strong}</b>{" "}
                    {item.strong === "Open index." ? (
                      <Link href={landingLinks.data}>{item.text}</Link>
                    ) : item.text}
                  </li>
                ))}
              </ul>
              <Link className="pill pill-solid" href={landingLinks.buy}>Start buying</Link>
            </div>
            <div className="role rv">
              <p className="mono">GPU providers</p>
              <h3>List capacity and sell it forward, with KYB.</h3>
              <ul>
                {landingProvider.map((item) => (
                  <li key={item.strong}><b>{item.strong}</b> {item.text}</li>
                ))}
              </ul>
              <Link className="pill pill-ghost" href={providerHref}>Become a provider</Link>
            </div>
          </div>
        </section>

        <section className="demo" id="demo">
          <div className="wrap grid">
            <div className="head rv">
              <div>
                <p className="mono">S0 path</p>
                <h2 className="sec">Walk the documented path.</h2>
              </div>
            </div>
            <ol className="steps rv">
              {landingSteps.map((step) => (
                <li key={step.title}><b>{step.title}</b><span>{step.detail}</span></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="closing">
          <div className="wrap grid">
            <h2 className="rv">See the market on Robinhood Chain Testnet.</h2>
            <div className="cta rv">
              <Link className="pill pill-solid" href={landingLinks.launch}>Launch app</Link>
              <Link className="pill pill-ghost" href={landingLinks.data}>View data</Link>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <span className="mono net">Robinhood Chain Testnet · 46630</span>
          <nav aria-label="Footer">
            {landingFooter.map((item) => (
              <Link key={item.href} className="mono" href={item.href}>{item.label}</Link>
            ))}
          </nav>
          <span className="mono">© 2026 Paron · Testnet only</span>
        </div>
      </footer>
    </div>
  );
}
