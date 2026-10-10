"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { landingLinks } from "@/lib/landing-copy";
import { TOUR_POSTER_STEP, TOUR_STEPS } from "@/lib/tour-beats";
import { startTour } from "./tour-runner";
import { TourScreens } from "./tour-screens";

export function DemoTour() {
  const rootRef = useRef<HTMLElement>(null);
  const flags = useRef({ userPaused: false });
  const [poster, setPoster] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState<number>(TOUR_STEPS.length);
  const [stepText, setStepText] = useState(TOUR_POSTER_STEP);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return startTour(root, {
      flags: flags.current,
      onStep: (index, text) => {
        setStepIndex(index);
        setStepText(text);
      },
      onPoster: setPoster,
    });
  }, []);

  return (
    <section className={poster ? "demo-tour is-static" : "demo-tour"} ref={rootRef} aria-labelledby="tour-h">
      <div className="wrap tour-grid">
        <div className="tour-copy">
          <p className="mono">Demo path</p>
          <h2 id="tour-h">See the full path in 30 seconds.</h2>
          <p className="lede">Pick a series, check the bond, buy, trade, redeem. The same screens you get in the app.</p>
          <ol aria-label="Steps shown in the demo tour">
            {TOUR_STEPS.map((step) => (
              <li key={step.n} aria-current={step.n === stepIndex ? "step" : undefined}>
                <b>{String(step.n).padStart(2, "0")}</b>
                <span><strong>{step.title}</strong> {step.body}</span>
              </li>
            ))}
          </ol>
          <Link className="pill pill-solid" href={landingLinks.launch}>Launch app</Link>
          <p className="tour-small">Testnet only. Tokens have no monetary value. The tour is a sample, not live data.</p>
        </div>
        <div className="tour-stage">
          <div className="tour-frame">
            <span className="demo-badge">Demo data</span>
            <div className="tour-win" aria-hidden="true" inert>
              <div className="scaler">
                <div className="cam">
                  <TourScreens />
                </div>
              </div>
            </div>
          </div>
          <div className="tour-bar">
            <span className="tour-step" aria-hidden="true">{stepText}</span>
            <span className="tour-ticks" aria-hidden="true">
              {TOUR_STEPS.map((step) => <i key={step.n} className={step.n <= stepIndex ? "on" : undefined} />)}
            </span>
            <button
              className="tour-pause"
              type="button"
              aria-pressed={paused}
              aria-label={paused ? "Play demo tour" : "Pause demo tour"}
              onClick={() => {
                const next = !flags.current.userPaused;
                flags.current.userPaused = next;
                setPaused(next);
              }}
            >
              <svg className="i-pause" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" /><rect x="8.5" y="1" width="3.5" height="12" /></svg>
              <svg className="i-play" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1l10 6-10 6z" /></svg>
            </button>
          </div>
          <p className="tour-note">Illustrative sample. All numbers are demo data.</p>
        </div>
      </div>
    </section>
  );
}
