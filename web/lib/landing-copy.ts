/** Landing copy. Every figure here is already shown in the app or the docs. */

export const landingNav = [
  { href: "/markets", label: "Markets" },
  { href: "/buy", label: "Buy" },
  { href: "/trade", label: "Trade" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/provider", label: "Provider" },
  { href: "/data", label: "Data" },
  { href: "/demo", label: "Demo" },
] as const;

export const landingFooter = [
  { href: "/markets", label: "Markets" },
  { href: "/data", label: "Data" },
  { href: "/demo", label: "Demo" },
] as const;

export const landingLinks = {
  launch: "/markets",
  how: "#how",
  buy: "/buy",
  provider: "/provider",
  demo: "/demo",
  data: "/data",
  announce: "#demo",
} as const;

export const landingAnnounce = "Live on Robinhood Chain Testnet";

export const landingFacts = [
  { title: "1 CU", detail: "= 1 H100-hour" },
  { title: "Bond ≥ 1.5×", detail: "of primary price" },
  { title: "MockUSDC", detail: "settlement" },
  { title: "Chain 46630", detail: "Robinhood Testnet" },
  { title: "Testnet only", detail: "no real funds" },
  { title: "KYB providers", detail: "GPU supply" },
] as const;

export const landingHow = [
  {
    n: "01",
    kicker: "Primary",
    title: "Buy",
    body: "Buy CU directly from a verified provider at the primary price, settled in MockUSDC.",
  },
  {
    n: "02",
    kicker: "Secondary",
    title: "Trade",
    body: "Hold, or trade CU with other buyers on the secondary market before you redeem.",
  },
  {
    n: "03",
    kicker: "or Default claim",
    title: "Redeem",
    body: "Redeem CU for compute. If a provider defaults, file a claim against the bond.",
  },
] as const;

/** Documented primary $3.00 and minimum bond $4.50 (1.5×). Not a sample trade. */
export const landingLedger = [
  { label: "Primary price", value: "$3.00 / CU", total: false },
  { label: "Bond per CU", value: "$4.50 / CU", total: false },
  { label: "Minimum multiple", value: "1.5×", total: true },
] as const;

export const landingBuyer = [
  { strong: "One standard unit.", text: "1 CU is 1 hour of H100-equivalent compute." },
  { strong: "Covered by a bond.", text: "Default claims draw on the provider's collateral." },
  { strong: "Open index.", text: "Read the H100 reference series in the Data view." },
] as const;

export const landingProvider = [
  { strong: "KYB onboarding.", text: "Providers are verified before they can list." },
  { strong: "Post a bond.", text: "At least 1.5× the primary price of what you list." },
  { strong: "Get paid in MockUSDC", text: "on testnet settlement." },
] as const;

/** Real S0 loop: buy, ask, redeem, default, and claim. */
export const landingSteps = [
  { title: "Buy", detail: "Primary buy of CU, settled in MockUSDC" },
  { title: "Ask", detail: "Place an ask on the secondary book" },
  { title: "Redeem", detail: "Request delivery of the compute" },
  { title: "Default", detail: "The posted bond answers if delivery fails" },
  { title: "Claim", detail: "Anyone can claim the default for the holder" },
] as const;

export const landingIndexNote = "Reference price (demo data)";
