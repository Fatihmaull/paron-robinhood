"use client";

import Link from "next/link";
import "@/app/motion-tour.css";
import { landingLinks } from "@/lib/landing-copy";
import { MOTION_SCENES } from "@/lib/motion-scenes";
import { MotionBar, MotionSimple, MotionStageFrame, useFilm } from "@/components/motion-tour/player";

export function DemoTour() {
  const film = useFilm("embed");
  return (
    <section
      id="tour"
      className="demo-tour"
      aria-labelledby="tour-h"
      tabIndex={0}
      onFocus={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) film.setPaused(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") film.stepBy(1);
        if (event.key === "ArrowLeft") film.stepBy(-1);
        if (event.key === " " && event.target === event.currentTarget) {
          event.preventDefault();
          film.setPaused((current) => !current);
        }
      }}
    >
      <div className="wrap tour-grid">
        <div className="tour-copy">
          <p className="mono">Full path</p>
          <h2 id="tour-h">See the full path.</h2>
          <p className="lede">Twelve scenes, from the faucet to the timelock. The same screens you get in the app.</p>
          <ol className="motion-scenes" aria-label="Scenes shown in the tour">
            {MOTION_SCENES.map((scene, index) => (
              <li key={scene.id}>
                <button type="button" aria-current={index === film.frame.sceneIndex ? "step" : undefined} onClick={() => film.jump(index)}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <span>{scene.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <Link className="pill pill-solid" href={landingLinks.launch}>Launch app</Link>
          <p className="tour-small">Testnet only. Tokens have no monetary value. The tour is a sample, not live data.</p>
        </div>
        <div className="tour-stage">
          <div className="motion-embed">
            <MotionStageFrame frame={film.frame} />
            <MotionSimple frame={film.frame} stepBy={film.stepBy} />
            <MotionBar frame={film.frame} paused={film.paused} onToggle={() => film.setPaused((current) => !current)} />
            <p className="tour-note">Illustrative sample. All numbers are a sample.</p>
            <p className="motion-live" aria-live="polite">{film.frame.label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
