export type DemoCheck = {
  id: string;
  label: string;
  href: string;
};

/** Live demo series is CU-JKT-H100-2611 (seed series 1). Steps are links, not a completion state. */
export function demoChecks(): DemoCheck[] {
  return [
    {
      id: "series",
      label: "CU-JKT-H100-2611 is listed",
      href: "/markets/1",
    },
    {
      id: "primary",
      label: "Primary buy of 20 CU by the buyer",
      href: "/markets/1",
    },
    {
      id: "trade",
      label: "Secondary trade printed",
      href: "/trade/1",
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
