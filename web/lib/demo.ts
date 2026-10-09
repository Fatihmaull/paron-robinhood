export type DemoCheck = {
  id: string;
  label: string;
  href: string;
};

/** Stage series is CU-JKT-H100-2610 (series 4). Seed series 1–3 stay 2611/2612. Steps are links, not a completion state. */
export function demoChecks(): DemoCheck[] {
  return [
    {
      id: "series",
      label: "CU-JKT-H100-2610 is listed",
      href: "/markets/4",
    },
    {
      id: "primary",
      label: "Primary buy of 20 CU by the buyer",
      href: "/markets/4",
    },
    {
      id: "trade",
      label: "Secondary trade printed",
      href: "/trade/4",
    },
    {
      id: "finalized",
      label: "Redemption 1 finalized",
      href: "/redemptions/1",
    },
    {
      id: "defaulted",
      label: "Redemption 2 defaulted",
      href: "/redemptions/2",
    },
  ];
}
