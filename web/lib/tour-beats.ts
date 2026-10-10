/** Scripted landing tour. Figures are illustrative samples, not live prints. */

export type TourCam = "wide" | { t: string; z: number };

export type TourBeat = {
  id: string;
  step: number;
  cam: TourCam;
  at: string;
  a?: [number, number];
  act: "move" | "click" | "type" | "observe";
  text?: string;
  fx?: string;
  ms: number;
  hold: number;
};

export const TOUR_STEPS = [
  {
    n: 1,
    label: "Pick a series",
    title: "Pick a series.",
    body: "Open the Markets table and choose series CU-JKT-H100-2610, which is on sale.",
  },
  {
    n: 2,
    label: "Check the bond",
    title: "Check the bond.",
    body: "The series page shows the provider bond is 1.5× the primary price: $4.50 per CU against $3.00.",
  },
  {
    n: 3,
    label: "Buy primary",
    title: "Buy primary.",
    body: "Enter 20 CU. The ticket shows a $60.00 cost. Press Buy.",
  },
  {
    n: 4,
    label: "Confirm on-chain",
    title: "Confirm on-chain.",
    body: "The transaction shows Pending, then Success with a View on explorer label.",
  },
  {
    n: 5,
    label: "Post an ask",
    title: "Post an ask.",
    body: "On Trade, place an ask for 20 CU at $3.20. It appears in the book.",
  },
  {
    n: 6,
    label: "Redeem or claim",
    title: "Redeem or claim.",
    body: "A redemption moves through Requested, Acknowledged, Delivered and Finalized. If the provider defaults, the buyer claims from the bond.",
  },
] as const;

const row = "[data-tour='row-4']";

export const TOUR_BEATS: TourBeat[] = [
  { id: "m-move", step: 1, cam: "wide", at: row, a: [0.18, 0.5], act: "move", ms: 1100, hold: 250 },
  { id: "m-click", step: 1, cam: "wide", at: row, a: [0.18, 0.5], act: "click", fx: "screen:series", ms: 200, hold: 500 },
  { id: "s-bond", step: 2, cam: { t: "[data-tour='bond-panel']", z: 2.3 }, at: "[data-tour='bond-panel']", a: [0.82, 0.3], act: "move", fx: "meter", ms: 1000, hold: 2300 },
  { id: "s-tab", step: 2, cam: "wide", at: "[data-tour='tab-buy']", act: "move", ms: 850, hold: 150 },
  { id: "s-tab-c", step: 2, cam: "wide", at: "[data-tour='tab-buy']", act: "click", fx: "screen:buy", ms: 200, hold: 450 },
  { id: "b-qty", step: 3, cam: { t: "[data-tour='ticket']", z: 2.2 }, at: "[data-tour='qty']", a: [0.25, 0.5], act: "move", ms: 900, hold: 150 },
  { id: "b-type", step: 3, cam: { t: "[data-tour='ticket']", z: 2.2 }, at: "[data-tour='qty']", a: [0.25, 0.5], act: "type", text: "20", fx: "calc", ms: 200, hold: 1100 },
  { id: "b-buy", step: 3, cam: { t: "[data-tour='ticket']", z: 2.2 }, at: "[data-tour='buy-btn']", act: "move", ms: 700, hold: 100 },
  { id: "b-click", step: 3, cam: { t: "[data-tour='ticket']", z: 2.2 }, at: "[data-tour='buy-btn']", act: "click", fx: "tx-pending", ms: 200, hold: 300 },
  { id: "t-pend", step: 4, cam: { t: "[data-tour='tray']", z: 1.9 }, at: "[data-tour='tray']", a: [0.8, 0.8], act: "move", ms: 850, hold: 1300 },
  { id: "t-ok", step: 4, cam: { t: "[data-tour='tray']", z: 1.9 }, at: "[data-tour='tx-link']", act: "move", fx: "tx-success", ms: 800, hold: 1800 },
  { id: "x-nav", step: 5, cam: "wide", at: "[data-tour='nav-trade']", act: "move", ms: 900, hold: 100 },
  { id: "x-nav-c", step: 5, cam: "wide", at: "[data-tour='nav-trade']", act: "click", fx: "screen:trade", ms: 200, hold: 450 },
  { id: "x-price", step: 5, cam: { t: "[data-tour='ask-ticket']", z: 2.1 }, at: "[data-tour='ask-price']", a: [0.25, 0.5], act: "move", ms: 900, hold: 100 },
  { id: "x-ptype", step: 5, cam: { t: "[data-tour='ask-ticket']", z: 2.1 }, at: "[data-tour='ask-price']", a: [0.25, 0.5], act: "type", text: "3.20", ms: 200, hold: 250 },
  { id: "x-qty", step: 5, cam: { t: "[data-tour='ask-ticket']", z: 2.1 }, at: "[data-tour='ask-qty']", a: [0.25, 0.5], act: "click", ms: 500, hold: 50 },
  { id: "x-qtype", step: 5, cam: { t: "[data-tour='ask-ticket']", z: 2.1 }, at: "[data-tour='ask-qty']", a: [0.25, 0.5], act: "type", text: "20", ms: 100, hold: 300 },
  { id: "x-place", step: 5, cam: { t: "[data-tour='ask-ticket']", z: 2.1 }, at: "[data-tour='place-ask']", act: "click", fx: "order-in", ms: 600, hold: 250 },
  { id: "x-book", step: 5, cam: { t: "[data-tour='book']", z: 2.0 }, at: "[data-tour='book-row']", a: [0.6, 0.5], act: "move", ms: 850, hold: 1500 },
  { id: "r-nav", step: 6, cam: "wide", at: "[data-tour='nav-portfolio']", act: "move", ms: 900, hold: 100 },
  { id: "r-nav-c", step: 6, cam: "wide", at: "[data-tour='nav-portfolio']", act: "click", fx: "screen:redeem", ms: 200, hold: 400 },
  { id: "r-tl", step: 6, cam: { t: "[data-tour='timeline']", z: 1.9 }, at: "[data-tour='timeline']", a: [0.5, 0.5], act: "move", fx: "timeline", ms: 950, hold: 900 },
  { id: "r-note", step: 6, cam: { t: "[data-tour='claim-note']", z: 2.0 }, at: "[data-tour='claim-note']", a: [0.5, 0.5], act: "move", ms: 900, hold: 1700 },
  { id: "r-wide", step: 6, cam: "wide", at: "[data-tour='claim-note']", a: [0.9, 0.9], act: "move", ms: 850, hold: 1300 },
];

/** Phone widths and reduced motion stay on the final frame. No camera zoom. */
export function tourPresentation(width: number, reduceMotion: boolean): "poster" | "play" {
  if (reduceMotion || width <= 700) return "poster";
  return "play";
}

export const TOUR_POSTER_STEP = "Full path · 6 steps";
