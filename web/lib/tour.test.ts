import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { TOUR_BEATS, TOUR_STEPS, tourPresentation } from "./tour-beats.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("tour is a poster on a phone and when motion is reduced", () => {
  assert.equal(tourPresentation(390, false), "poster");
  assert.equal(tourPresentation(700, false), "poster");
  assert.equal(tourPresentation(701, false), "play");
  assert.equal(tourPresentation(1024, false), "play");
  assert.equal(tourPresentation(1280, false), "play");
  assert.equal(tourPresentation(1280, true), "poster");
  assert.equal(tourPresentation(390, true), "poster");
});

test("tour copy drops the fee line and the defaulted record", () => {
  const screens = read("../components/landing/tour-screens.tsx");
  const beats = read("./tour-beats.ts");
  const joined = screens + beats;
  assert.equal(screens.includes("Fee (1%)"), false);
  assert.equal(screens.includes("8 / 10 / 0"), false);
  assert.equal(screens.includes("8/10/0"), false);
  assert.equal(joined.includes("10 defaulted"), false);
  assert.equal(joined.includes("Reference price (demo data)"), false);
  assert.equal(/<a[\s>]/.test(screens), false);
  assert.equal(screens.includes("href"), false);
  assert.match(screens, /data-tour="tx-link"/);
  assert.match(screens, /View on explorer/);
  assert.match(screens, />Sample</);
  assert.equal(screens.toLowerCase().includes("demo"), false);
  assert.equal(/partner|feeds/i.test(joined), false);
  assert.equal(TOUR_STEPS.length, 6);
  assert.equal(TOUR_BEATS[0]?.step, 1);
  assert.equal(TOUR_BEATS[TOUR_BEATS.length - 1]?.step, 6);
});

test("the tour sits after how it works and the poster does not zoom", () => {
  const landing = read("../components/landing.tsx");
  const runner = read("../components/landing/tour-runner.ts");
  const css = read("../app/landing.css");
  const how = landing.indexOf('id="how"');
  const tour = landing.indexOf("<DemoTour");
  const bond = landing.indexOf('className="bond"');
  const closing = landing.indexOf('className="closing"');
  assert.ok(how >= 0 && tour > how && tour < bond && bond < closing);
  assert.match(runner, /setCam\(0, 0, 1, 0\)/);
  assert.match(runner, /tourPresentation/);
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*demo-tour/);
  assert.match(css, /\.demo-badge \{[^}]*display:\s*inline-flex/);
  assert.equal(/\.demo-badge[^{]*\{[^}]*display:\s*none/.test(css), false);
  assert.match(css, /max-width:\s*700px[\s\S]*\.demo-badge \{[^}]*display:\s*inline-flex/);
});
