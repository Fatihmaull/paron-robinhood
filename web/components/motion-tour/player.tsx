"use client";

import { flushSync } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MOTION_DURATION_MS, MOTION_SCENES, MOTION_STEPS, STAGE_W, project, sceneStarts, type MotionFrame } from "@/lib/motion-scenes";
import { MotionStage } from "./stage";

type Clock = {
  frame: MotionFrame;
  paused: boolean;
  setPaused: (next: boolean | ((current: boolean) => boolean)) => void;
  manual: boolean;
  jump: (index: number) => void;
  stepBy: (dir: number) => void;
};

function useManual(frozen: boolean) {
  const [manual, setManual] = useState(false);
  useEffect(() => {
    if (frozen) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setManual(reduce.matches || window.innerWidth <= 700);
    apply();
    reduce.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      reduce.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, [frozen]);
  return frozen ? false : manual;
}

export function useFilm(variant: "embed" | "film", initialMs = 0, frozen = false): Clock {
  const [ms, setMs] = useState(initialMs);
  const [paused, setPaused] = useState(frozen);
  const pausedRef = useRef(paused);
  const manual = useManual(frozen);
  const starts = sceneStarts();
  pausedRef.current = paused || manual;

  useEffect(() => {
    if (frozen || manual) return;
    let last = performance.now();
    let handle = 0;
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      if (!pausedRef.current) {
        setMs((current) => {
          const next = current + delta;
          if (next < MOTION_DURATION_MS) return next;
          return variant === "embed" ? 0 : MOTION_DURATION_MS - 1;
        });
      }
      handle = window.requestAnimationFrame(tick);
    };
    handle = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(handle);
  }, [frozen, manual, variant]);

  useEffect(() => {
    const seek = (next: number) => {
      flushSync(() => setMs(Math.min(Math.max(next, 0), MOTION_DURATION_MS - 1)));
    };
    window.__paronTour = { seek, duration: MOTION_DURATION_MS };
    return () => {
      delete window.__paronTour;
    };
  }, []);

  const shown = manual ? (MOTION_STEPS[project(ms).stepIndex]?.end ?? ms) - 1 : ms;
  const frame = project(shown);

  function jump(index: number) {
    const start = starts[index] ?? 0;
    const step = MOTION_STEPS.find((item) => item.start === start) ?? MOTION_STEPS[0];
    setMs(manual ? step.end - 1 : step.start);
  }

  function stepBy(dir: number) {
    const next = Math.min(Math.max(frame.stepIndex + dir, 0), MOTION_STEPS.length - 1);
    const step = MOTION_STEPS[next];
    setMs(manual ? step.end - 1 : step.start);
  }

  return { frame, paused, setPaused, manual, jump, stepBy };
}

export function MotionStageFrame({ frame, honesty }: { frame: MotionFrame; honesty?: boolean }) {
  const win = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = win.current;
    if (!node) return;
    const apply = () => setScale(node.clientWidth / STAGE_W);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="motion-win" ref={win} style={{ "--motion-scale": String(scale) } as CSSProperties}>
      <span className="motion-badge">Sample</span>
      <MotionStage frame={frame} />
      {honesty ? <p className="motion-honesty">Illustrative sample. All numbers are a sample.</p> : null}
    </div>
  );
}

export function MotionSimple({ frame, stepBy }: { frame: MotionFrame; stepBy: (dir: number) => void }) {
  return (
    <div className="motion-simple">
      <p className="motion-kicker" style={{ position: "static", transform: "none" }}>{frame.label}</p>
      <h3>{frame.sceneTitle}</h3>
      <p>Illustrative sample. All numbers are a sample.</p>
      <div className="motion-controls">
        <button type="button" onClick={() => stepBy(-1)} aria-label="Previous step">Prev</button>
        <button type="button" onClick={() => stepBy(1)} aria-label="Next step">Next</button>
      </div>
    </div>
  );
}

export function MotionBar({ frame, paused, onToggle }: { frame: MotionFrame; paused: boolean; onToggle: () => void }) {
  return (
    <div className="tour-bar">
      <span className="tour-step" aria-hidden="true">{frame.label}</span>
      <span className="tour-ticks" aria-hidden="true">
        {MOTION_SCENES.map((scene, index) => <i key={scene.id} className={index <= frame.sceneIndex ? "on" : undefined} />)}
      </span>
      <button className="tour-pause" type="button" aria-pressed={paused} aria-label={paused ? "Play tour" : "Pause tour"} onClick={onToggle}>
        <svg className="i-pause" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" /><rect x="8.5" y="1" width="3.5" height="12" /></svg>
        <svg className="i-play" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1l10 6-10 6z" /></svg>
      </button>
    </div>
  );
}

export function MotionFilm({ initialMs = 0, frozen = false }: { initialMs?: number; frozen?: boolean }) {
  const film = useFilm("film", initialMs, frozen);
  return (
    <div className="motion-film">
      <MotionStageFrame frame={film.frame} honesty />
      <MotionSimple frame={film.frame} stepBy={film.stepBy} />
      <p className="motion-live" aria-live="polite">{film.frame.label}</p>
    </div>
  );
}

declare global {
  interface Window {
    __paronTour?: { seek: (ms: number) => void; duration: number };
  }
}
