/** Sample film for the landing tour and /tour. Figures are illustrative, not live data. */

export const SCENE_FADE_MS = 400;
export const STAGE_W = 1220;
export const STAGE_H = 707;

export type MotionFlag = { key: string; value: string };

export type MotionStep = {
  id: string;
  label: string;
  duration: number;
  screen: string;
  cursor: [number, number];
  hot?: string;
  click?: boolean;
  typeKey?: string;
  typeText?: string;
  flag?: MotionFlag;
};

export type MotionScene = {
  id: string;
  title: string;
  duration: number;
  steps: MotionStep[];
};

function scene(id: string, title: string, steps: MotionStep[]): MotionScene {
  return { id, title, duration: steps.reduce((sum, step) => sum + step.duration, 0), steps };
}

export const MOTION_SCENES: MotionScene[] = [
  scene("connect", "Connect and faucet", [
    { id: "connect", label: "Connect wallet", duration: 2200, screen: "faucet", cursor: [1100, 28], hot: "wallet", click: true, flag: { key: "connected", value: "1" } },
    { id: "faucet-nav", label: "Open faucet", duration: 1800, screen: "faucet", cursor: [470, 28], hot: "nav-faucet" },
    { id: "faucet-send", label: "Get test USDC", duration: 3000, screen: "faucet", cursor: [168, 248], hot: "faucet", click: true, flag: { key: "sending", value: "1" } },
    { id: "faucet-done", label: "Funds added", duration: 3000, screen: "faucet", cursor: [220, 310], flag: { key: "faucet", value: "1" } },
  ]),
  scene("markets", "Markets and the bond", [
    { id: "markets", label: "Open markets", duration: 2500, screen: "markets", cursor: [188, 28], hot: "nav-markets" },
    { id: "series", label: "Open series", duration: 2500, screen: "markets", cursor: [280, 248], hot: "row-4", click: true, flag: { key: "series", value: "1" } },
    { id: "bond", label: "Read the bond", duration: 4000, screen: "series", cursor: [280, 430], hot: "bond", flag: { key: "meter", value: "1" } },
    { id: "buy-tab", label: "Open buy", duration: 3000, screen: "series", cursor: [168, 318], hot: "tab-buy", click: true, flag: { key: "buy", value: "1" } },
  ]),
  scene("buy", "Buy primary", [
    { id: "qty", label: "Enter quantity", duration: 1800, screen: "buy", cursor: [280, 400], hot: "qty" },
    { id: "qty-type", label: "Type 20", duration: 3200, screen: "buy", cursor: [280, 400], hot: "qty", typeKey: "qty", typeText: "20" },
    { id: "cost", label: "Read the cost", duration: 2000, screen: "buy", cursor: [480, 448], hot: "cost" },
    { id: "buy-click", label: "Press buy", duration: 2000, screen: "buy", cursor: [280, 520], hot: "buy", click: true },
    { id: "pending", label: "Pending", duration: 2500, screen: "buy", cursor: [760, 400], flag: { key: "tx", value: "pending" } },
    { id: "success", label: "Success", duration: 2500, screen: "buy", cursor: [720, 430], hot: "explorer", flag: { key: "tx", value: "success" } },
  ]),
  scene("trade", "Trade", [
    { id: "trade-nav", label: "Open trade", duration: 2000, screen: "trade", cursor: [268, 28], hot: "nav-trade", click: true },
    { id: "ask-price", label: "Enter price", duration: 2800, screen: "trade", cursor: [980, 250], hot: "ask-price", typeKey: "price", typeText: "3.20" },
    { id: "ask-qty", label: "Enter size", duration: 2400, screen: "trade", cursor: [980, 330], hot: "ask-qty", typeKey: "askQty", typeText: "20" },
    { id: "place", label: "Place ask", duration: 2200, screen: "trade", cursor: [980, 430], hot: "place", click: true, flag: { key: "book", value: "1" } },
    { id: "book", label: "Book updates", duration: 2600, screen: "trade", cursor: [220, 270], hot: "book-row" },
  ]),
  scene("portfolio", "Portfolio", [
    { id: "port-nav", label: "Open portfolio", duration: 2000, screen: "portfolio", cursor: [360, 28], hot: "nav-portfolio", click: true },
    { id: "holdings", label: "Holdings", duration: 3000, screen: "portfolio", cursor: [320, 250], hot: "holding" },
    { id: "claims", label: "Claims", duration: 3000, screen: "portfolio", cursor: [320, 420], hot: "claim-row" },
  ]),
  scene("redeem", "Redemption", [
    { id: "redeem-open", label: "Open redemption", duration: 2000, screen: "redeem", cursor: [600, 28], hot: "nav-redemptions" },
    { id: "req", label: "Requested", duration: 2200, screen: "redeem", cursor: [180, 280], flag: { key: "timeline", value: "1" } },
    { id: "ack", label: "Acknowledged", duration: 2200, screen: "redeem", cursor: [180, 350], flag: { key: "timeline", value: "2" } },
    { id: "del", label: "Delivered", duration: 2600, screen: "redeem", cursor: [180, 420], flag: { key: "timeline", value: "3" } },
    { id: "fin", label: "Finalized", duration: 3000, screen: "redeem", cursor: [720, 280], flag: { key: "timeline", value: "4" } },
  ]),
  scene("default", "Default", [
    { id: "deadline", label: "Deadline passed", duration: 2500, screen: "claim", cursor: [360, 220] },
    { id: "claim", label: "Claim default", duration: 2500, screen: "claim", cursor: [220, 360], hot: "claim-default", click: true },
    { id: "paid", label: "Bond pays", duration: 3000, screen: "claim", cursor: [420, 430], flag: { key: "paid", value: "1" } },
  ]),
  scene("provider", "List capacity", [
    { id: "gpu", label: "GPU and size", duration: 4000, screen: "provider", cursor: [280, 280], flag: { key: "wizard", value: "0" } },
    { id: "terms", label: "Terms", duration: 4000, screen: "provider", cursor: [430, 200], hot: "wizard-terms", click: true, flag: { key: "wizard", value: "1" } },
    { id: "review", label: "Review", duration: 4000, screen: "provider", cursor: [560, 200], hot: "wizard-review", click: true, flag: { key: "wizard", value: "2" } },
  ]),
  scene("verifier", "Verifier", [
    { id: "pending", label: "Pending review", duration: 2500, screen: "verifier", cursor: [320, 280], hot: "kyb-row" },
    { id: "attest", label: "Attest", duration: 2500, screen: "verifier", cursor: [220, 420], hot: "attest", click: true },
    { id: "approved", label: "Approved", duration: 3000, screen: "verifier", cursor: [360, 280], flag: { key: "attested", value: "1" } },
  ]),
  scene("admin", "Admin timelock", [
    { id: "factor", label: "Set factor", duration: 2800, screen: "admin", cursor: [860, 250], hot: "factor", typeKey: "factor", typeText: "0.4500" },
    { id: "schedule", label: "Schedule", duration: 2400, screen: "admin", cursor: [860, 340], hot: "schedule", click: true, flag: { key: "admin", value: "wait" } },
    { id: "waiting", label: "Waiting", duration: 2200, screen: "admin", cursor: [360, 460] },
    { id: "executed", label: "Executed", duration: 2600, screen: "admin", cursor: [980, 460], hot: "execute", click: true, flag: { key: "admin", value: "done" } },
  ]),
  scene("index", "Index and data", [
    { id: "index", label: "H100 index", duration: 4000, screen: "index", cursor: [730, 28], hot: "nav-index" },
    { id: "prints", label: "Prints", duration: 4000, screen: "data", cursor: [810, 28], hot: "nav-data", click: true },
  ]),
  scene("end", "End card", [
    { id: "strike", label: "Strike once", duration: 3000, screen: "end", cursor: [610, 300] },
    { id: "anywhere", label: "Trade anywhere", duration: 3000, screen: "end", cursor: [610, 380] },
  ]),
];

export type FlatStep = MotionStep & {
  sceneId: string;
  sceneTitle: string;
  sceneIndex: number;
  index: number;
  start: number;
  end: number;
};

export type MotionState = {
  flags: Record<string, string>;
  typed: Record<string, string>;
};

export type MotionFrame = {
  ms: number;
  sceneIndex: number;
  sceneId: string;
  sceneTitle: string;
  stepIndex: number;
  stepCount: number;
  label: string;
  screen: string;
  fade: number;
  nextScreen: string | null;
  cursor: { x: number; y: number };
  ripple: { x: number; y: number; p: number } | null;
  press: string | null;
  state: MotionState;
  nextState: MotionState;
};

const flat: FlatStep[] = [];
{
  let cursor = 0;
  let index = 0;
  MOTION_SCENES.forEach((item, sceneIndex) => {
    for (const step of item.steps) {
      flat.push({ ...step, sceneId: item.id, sceneTitle: item.title, sceneIndex, index, start: cursor, end: cursor + step.duration });
      cursor += step.duration;
      index += 1;
    }
  });
}

export const MOTION_STEPS = flat;
export const MOTION_DURATION_MS = flat.length ? flat[flat.length - 1].end : 0;

export function sceneStarts(scenes: MotionScene[] = MOTION_SCENES): number[] {
  const starts: number[] = [];
  let cursor = 0;
  for (const item of scenes) {
    starts.push(cursor);
    cursor += item.duration;
  }
  return starts;
}

function clamp01(value: number) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function ease(value: number) {
  const t = clamp01(value);
  return 1 - (1 - t) ** 3;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function stepAt(ms: number): FlatStep {
  const found = flat.find((step) => ms >= step.start && ms < step.end);
  return found ?? flat[flat.length - 1];
}

function sceneSteps(sceneId: string) {
  return flat.filter((step) => step.sceneId === sceneId);
}

export function stateAt(sceneId: string, ms: number): MotionState {
  const flags: Record<string, string> = {};
  const typed: Record<string, string> = {};
  for (const step of sceneSteps(sceneId)) {
    if (ms < step.start) break;
    const elapsed = ms - (step.start + 480);
    if (step.flag && elapsed >= 0) flags[step.flag.key] = step.flag.value;
    if (step.typeKey && step.typeText && ms >= step.start) {
      const count = elapsed <= 0 ? 0 : Math.floor(elapsed / 55);
      typed[step.typeKey] = step.typeText.slice(0, Math.min(step.typeText.length, count));
    }
  }
  return { flags, typed };
}

export function project(ms: number): MotionFrame {
  const total = MOTION_DURATION_MS;
  const time = Math.min(Math.max(ms, 0), Math.max(total - 1, 0));
  const step = stepAt(time);
  const local = time - step.start;
  const previous = step.index > 0 ? flat[step.index - 1] : step;
  const travel = ease(local / 520);
  const from = step.index === 0 ? step.cursor : previous.cursor;
  const cursor = { x: lerp(from[0], step.cursor[0], travel), y: lerp(from[1], step.cursor[1], travel) };
  const sceneEnd = sceneSteps(step.sceneId).at(-1)?.end ?? step.end;
  const next = flat[step.index + 1];
  const fading = Boolean(next && next.sceneId !== step.sceneId && sceneEnd - time < SCENE_FADE_MS);
  const fade = fading ? (SCENE_FADE_MS - (sceneEnd - time)) / SCENE_FADE_MS : 0;
  const clickOn = Boolean(step.click && local >= 480 && local <= 980);
  return {
    ms: time,
    sceneIndex: step.sceneIndex,
    sceneId: step.sceneId,
    sceneTitle: step.sceneTitle,
    stepIndex: step.index,
    stepCount: flat.length,
    label: `${step.index + 1}/${flat.length} ${step.label}`,
    screen: step.screen,
    fade,
    nextScreen: fading && next ? next.screen : null,
    cursor,
    ripple: clickOn ? { x: step.cursor[0], y: step.cursor[1], p: (local - 480) / 500 } : null,
    press: clickOn && step.hot ? step.hot : null,
    state: stateAt(step.sceneId, time),
    nextState: fading && next ? stateAt(next.sceneId, next.start) : { flags: {}, typed: {} },
  };
}
