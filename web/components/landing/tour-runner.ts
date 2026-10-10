import { TOUR_BEATS, TOUR_POSTER_STEP, TOUR_STEPS, tourPresentation, type TourBeat } from "@/lib/tour-beats";

const EASE_CAM = "cubic-bezier(.5,0,.12,1)";
const EASE_CUR = "cubic-bezier(.4,0,.14,1)";
const TIME_SCALE = 0.81;
const CANCEL = Symbol("cancel");
const NAV: Record<string, string> = { markets: "markets", series: "markets", buy: "buy", trade: "trade", redeem: "portfolio" };

type Flags = { userPaused: boolean };
type Hooks = {
  flags: Flags;
  onStep: (index: number, text: string) => void;
  onPoster: (poster: boolean) => void;
};

export function startTour(root: HTMLElement, hooks: Hooks): () => void {
  const uiQuery = root.querySelector<HTMLElement>("[data-tour='ui']");
  const winQuery = root.querySelector<HTMLElement>(".tour-win");
  const scalerQuery = root.querySelector<HTMLElement>(".scaler");
  const camQuery = root.querySelector<HTMLElement>(".cam");
  const cursorQuery = root.querySelector<HTMLElement>("[data-tour='cursor']");
  const arrowQuery = cursorQuery?.querySelector<HTMLElement>(".arrow");
  if (!uiQuery || !winQuery || !scalerQuery || !camQuery || !cursorQuery || !arrowQuery) return () => {};
  const ui: HTMLElement = uiQuery;
  const win: HTMLElement = winQuery;
  const scaler: HTMLElement = scalerQuery;
  const cam: HTMLElement = camQuery;
  const cursor: HTMLElement = cursorQuery;
  const arrow: HTMLElement = arrowQuery;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let token = 0;
  let running = false;
  let alive = true;
  let inView = false;
  let hidden = document.hidden;
  let S = 1;
  const VW = 1220;
  const VH = 707;

  const q = (sel: string) => ui.querySelector<HTMLElement>(sel);
  const money = (value: number) =>
    "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function mode() {
    return tourPresentation(window.innerWidth, reduce.matches);
  }

  function layout() {
    const width = win.clientWidth || win.getBoundingClientRect().width;
    S = width > 0 ? width / VW : 1;
    scaler.style.transform = `scale(${S})`;
  }

  function rect(el: HTMLElement) {
    let x = 0;
    let y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== ui) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }

  function sleep(ms: number) {
    const my = token;
    return new Promise<void>((resolve, reject) => {
      let left = ms * TIME_SCALE;
      let last = performance.now();
      const id = window.setInterval(() => {
        const now = performance.now();
        if (my !== token || !alive) {
          window.clearInterval(id);
          reject(CANCEL);
          return;
        }
        const paused = hooks.flags.userPaused || hidden || !inView;
        if (!paused) left -= now - last;
        last = now;
        if (left <= 0) {
          window.clearInterval(id);
          resolve();
        }
      }, 30);
    });
  }

  function setCam(tx: number, ty: number, z: number, ms: number) {
    cam.style.transition = ms ? `transform ${ms * TIME_SCALE}ms ${EASE_CAM}` : "none";
    cam.style.transform = `translate(${tx}px,${ty}px) scale(${z})`;
    const cursorScale = Math.min(1.4, (1.15 / z / Math.max(S, 0.5)) * 0.75);
    arrow.style.transition = ms ? `transform ${ms * TIME_SCALE}ms ${EASE_CAM}` : "none";
    arrow.style.transform = `scale(${cursorScale})`;
  }

  function fit(r: { x: number; y: number; w: number; h: number }, zmax: number) {
    const pad = 56;
    let z = Math.min(zmax, VW / (r.w + pad), VH / (r.h + pad));
    z = Math.max(z, 1);
    let tx = VW / 2 - (r.x + r.w / 2) * z;
    let ty = VH / 2 - (r.y + r.h / 2) * z;
    tx = Math.min(0, Math.max(VW - 1220 * z, tx));
    ty = Math.min(0, Math.max(VH - 707 * z, ty));
    return { tx, ty, z };
  }

  function camFor(spec: TourBeat["cam"]) {
    if (spec === "wide") return { tx: 0, ty: 0, z: 1 };
    const target = q(spec.t);
    if (!target) return { tx: 0, ty: 0, z: 1 };
    return fit(rect(target), spec.z);
  }

  function setCursor(x: number, y: number, ms: number) {
    cursor.style.transition = ms ? `transform ${ms * TIME_SCALE}ms ${EASE_CUR}` : "none";
    cursor.style.transform = `translate(${x - 4}px,${y - 3}px)`;
    cursor.dataset.x = String(x);
    cursor.dataset.y = String(y);
  }

  function ripple(x: number, y: number) {
    const mark = document.createElement("i");
    mark.className = "ripple";
    mark.style.left = x + "px";
    mark.style.top = y + "px";
    cam.appendChild(mark);
    mark.classList.add("go");
    window.setTimeout(() => mark.remove(), 600);
  }

  function clearHover() {
    ui.querySelectorAll(".is-hover").forEach((node) => node.classList.remove("is-hover"));
  }

  function show(name: string) {
    ui.querySelectorAll<HTMLElement>(".screen").forEach((screen) => {
      screen.classList.toggle("on", screen.dataset.screen === name);
      if (name !== "buy") screen.classList.remove("tx-focus");
    });
    ui.querySelectorAll<HTMLElement>("[data-nav]").forEach((item) => {
      item.classList.toggle("act", item.dataset.nav === NAV[name]);
    });
    if (name !== "buy") q("[data-tour='tray']")?.classList.remove("on");
  }

  function calc() {
    const n = Number(q("[data-tour='qty'] .val")?.textContent || 0);
    const cost = n * 3;
    const costEl = q("[data-tour='cost']");
    const maxEl = q("[data-tour='maxc']");
    const bondEl = q("[data-tour='bondfor']");
    if (costEl) costEl.textContent = money(cost);
    if (maxEl) maxEl.textContent = money(cost);
    if (bondEl) bondEl.textContent = n ? money(n * 4.5) : "—";
  }

  function resetState() {
    clearHover();
    show("markets");
    ui.querySelectorAll(".val").forEach((node) => {
      node.textContent = "";
    });
    ui.querySelectorAll(".field").forEach((node) => node.classList.remove("focus"));
    const meter = q("[data-tour='meter-fill']");
    if (meter) meter.style.width = "0";
    calc();
    const tray = q("[data-tour='tray']");
    tray?.classList.remove("on", "done");
    const bookEmpty = q("[data-tour='book-empty']");
    const ooEmpty = q("[data-tour='oo-empty']");
    if (bookEmpty) bookEmpty.style.display = "";
    if (ooEmpty) ooEmpty.style.display = "";
    ui.querySelectorAll(".brow").forEach((node) => node.classList.remove("in"));
    ui.querySelectorAll(".tl li").forEach((node) => node.classList.remove("done"));
  }

  function poster() {
    token += 1;
    running = false;
    if (!alive) return;
    hooks.onPoster(true);
    root.dataset.motion = "paused";
    win.classList.remove("is-fade");
    resetState();
    show("redeem");
    ui.querySelectorAll(".tl li").forEach((node) => node.classList.add("done"));
    cursor.hidden = true;
    setCam(0, 0, 1, 0);
    hooks.onStep(TOUR_STEPS.length, TOUR_POSTER_STEP);
  }

  const fx: Record<string, () => void | Promise<void>> = {
    "screen:series": () => { clearHover(); show("series"); },
    "screen:buy": () => { clearHover(); show("buy"); },
    "screen:trade": () => { clearHover(); show("trade"); },
    "screen:redeem": () => { clearHover(); show("redeem"); },
    meter: () => {
      const meter = q("[data-tour='meter-fill']");
      if (meter) meter.style.width = "100%";
    },
    calc: () => calc(),
    "tx-pending": () => {
      q("[data-screen='buy']")?.classList.add("tx-focus");
      const tray = q("[data-tour='tray']");
      tray?.classList.remove("done");
      tray?.classList.add("on");
      const dot = q("[data-tour='tdot']");
      const state = q("[data-tour='tstate']");
      const sub = q("[data-tour='tsub']");
      if (dot) dot.className = "dot pend";
      if (state) state.textContent = "Pending";
      if (sub) sub.textContent = "Waiting for confirmation…";
    },
    "tx-success": () => {
      const tray = q("[data-tour='tray']");
      tray?.classList.add("done");
      const dot = q("[data-tour='tdot']");
      const state = q("[data-tour='tstate']");
      const sub = q("[data-tour='tsub']");
      if (dot) dot.className = "dot ok";
      if (state) state.textContent = "Success";
      if (sub) sub.textContent = "Bought 20 CU of CU-JKT-H100-2610.";
    },
    "order-in": () => {
      const bookEmpty = q("[data-tour='book-empty']");
      const ooEmpty = q("[data-tour='oo-empty']");
      if (bookEmpty) bookEmpty.style.display = "none";
      if (ooEmpty) ooEmpty.style.display = "none";
      q("[data-tour='book-row']")?.classList.add("in");
      q("[data-tour='oo-row']")?.classList.add("in");
    },
    timeline: async () => {
      for (const item of ui.querySelectorAll(".tl li")) {
        item.classList.add("done");
        await sleep(620);
      }
    },
  };

  async function typeInto(el: HTMLElement, text: string) {
    const field = el.closest(".field") ?? el;
    const value = field.querySelector(".val");
    if (!value) return;
    for (const ch of text) {
      value.textContent += ch;
      if (field.matches("[data-tour='qty']")) calc();
      await sleep(120);
    }
  }

  function hover(el: HTMLElement | null) {
    clearHover();
    if (!el) return;
    const hit = el.classList.contains("tr") || el.matches("[data-nav], [data-tour='tab-buy'], [data-tour='tx-link']");
    if (hit) el.classList.add("is-hover");
  }

  async function runBeat(beat: TourBeat) {
    const at = q(beat.at);
    if (!at) return;
    hooks.onStep(beat.step, `${beat.step}/${TOUR_STEPS.length} ${TOUR_STEPS[beat.step - 1].label}`);
    const anchor = beat.a ?? [0.5, 0.5];
    const box = rect(at);
    const camera = camFor(beat.cam);
    setCam(camera.tx, camera.ty, camera.z, beat.ms + 150);
    const x = box.x + box.w * anchor[0];
    const y = box.y + box.h * anchor[1];
    setCursor(x, y, beat.ms);
    await sleep(beat.ms);
    if (beat.act !== "observe") hover(at);
    if (beat.act === "click") {
      const field = at.closest(".field");
      if (field) {
        ui.querySelectorAll(".field").forEach((node) => node.classList.remove("focus"));
        field.classList.add("focus");
      }
      ripple(x, y);
      at.classList.add("is-press");
      window.setTimeout(() => at.classList.remove("is-press"), 110);
      await sleep(130);
    }
    if (beat.act === "type" && beat.text) {
      (at.closest(".field") ?? at).classList.add("focus");
      await typeInto(at, beat.text);
    }
    if (beat.fx && fx[beat.fx]) await fx[beat.fx]();
    await sleep(beat.hold);
  }

  async function run() {
    if (running || mode() === "poster") return;
    running = true;
    const my = ++token;
    hooks.onPoster(false);
    delete root.dataset.motion;
    try {
      for (;;) {
        if (mode() === "poster") return poster();
        resetState();
        win.classList.remove("is-fade");
        setCam(0, 0, 1, 0);
        setCursor(1080, 640, 0);
        cursor.hidden = false;
        await sleep(500);
        for (const beat of TOUR_BEATS) await runBeat(beat);
        win.classList.add("is-fade");
        await sleep(350);
      }
    } catch (error) {
      if (error !== CANCEL) throw error;
    } finally {
      if (my === token) running = false;
    }
  }

  function sync() {
    if (mode() === "poster") return poster();
    const paused = hooks.flags.userPaused || hidden || !inView;
    root.dataset.motion = paused ? "paused" : "play";
    if (inView && !running) void run();
  }

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  }, { threshold: 0.4 });
  observer.observe(root);

  const onVis = () => {
    hidden = document.hidden;
    sync();
  };
  const onResize = () => {
    layout();
    if (mode() === "poster") poster();
    else if (!running) sync();
  };
  const onReduce = () => {
    if (reduce.matches) poster();
    else sync();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("resize", onResize);
  reduce.addEventListener("change", onReduce);
  layout();
  if (mode() === "poster") poster();
  else sync();

  return () => {
    alive = false;
    token += 1;
    running = false;
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("resize", onResize);
    reduce.removeEventListener("change", onReduce);
  };
}
