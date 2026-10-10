import assert from "node:assert/strict";
import test from "node:test";
import { MOTION_DURATION_MS, MOTION_SCENES, MOTION_STEPS, SCENE_FADE_MS, project, sceneStarts } from "./motion-scenes.ts";

test("every motion scene has a title, a duration, and at least one step", () => {
  assert.ok(MOTION_SCENES.length >= 12);
  for (const scene of MOTION_SCENES) {
    assert.ok(scene.title.length > 0);
    assert.ok(scene.duration > 0);
    assert.ok(scene.steps.length >= 1);
    const sum = scene.steps.reduce((total, step) => total + step.duration, 0);
    assert.equal(sum, scene.duration);
  }
});

test("the film stays inside the recording window", () => {
  assert.equal(SCENE_FADE_MS, 400);
  assert.ok(MOTION_DURATION_MS >= 90_000);
  assert.ok(MOTION_DURATION_MS <= 150_000);
  assert.equal(MOTION_STEPS.length, MOTION_SCENES.reduce((total, scene) => total + scene.steps.length, 0));
  assert.equal(sceneStarts().length, MOTION_SCENES.length);
  assert.equal(sceneStarts()[0], 0);
});

test("seek lands on the buy step and the end card", () => {
  const buy = MOTION_STEPS.find((step) => step.id === "buy-click");
  assert.ok(buy);
  const frame = project(buy.start + 600);
  assert.equal(frame.screen, "buy");
  assert.match(frame.label, /Press buy/);
  const end = project(MOTION_DURATION_MS - 10);
  assert.equal(end.screen, "end");
  assert.equal(end.stepIndex, MOTION_STEPS.length - 1);
});

test("typing reveals characters and a click shows a ripple", () => {
  const typing = MOTION_STEPS.find((step) => step.id === "qty-type");
  assert.ok(typing);
  const early = project(typing.start + 480);
  const later = project(typing.start + 480 + 55);
  assert.equal(early.state.typed.qty, "");
  assert.equal(later.state.typed.qty, "2");
  const click = MOTION_STEPS.find((step) => step.id === "buy-click");
  assert.ok(click);
  assert.ok(project(click.start + 600).ripple);
  assert.equal(project(click.start + 100).ripple, null);
});
