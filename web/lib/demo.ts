import type { Snap } from "./types";

export type DemoCheck = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

/** Derived from the fixture timeline for the selected snapshot. No local checkboxes. */
export function demoChecks(snap: Snap): DemoCheck[] {
  const pastTrade = snap === "t1" || snap === "t2" || snap === "t3";
  const pastConfirm = snap === "t2" || snap === "t3";
  const pastDefault = snap === "t3";
  return [
    {
      id: "series-4",
      label: "Series 4 CU-JKT-H100-2610 is listed",
      done: true,
      href: "/markets/4",
    },
    {
      id: "primary",
      label: "Primary buy of 20 CU by the buyer",
      done: true,
      href: "/markets/4",
    },
    {
      id: "trade",
      label: "Secondary trade printed",
      done: pastTrade,
      href: "/trade/4",
    },
    {
      id: "finalized",
      label: "Redemption 1 finalized",
      done: pastConfirm,
      href: "/redemptions/1",
    },
    {
      id: "defaulted",
      label: "Redemption 2 defaulted",
      done: pastDefault,
      href: "/redemptions/2",
    },
  ];
}
