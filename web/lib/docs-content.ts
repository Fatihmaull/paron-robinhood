/** Production-app tutorial. One screenshot per step, served from web/public/docs/. */

export type DocsStep = {
  title: string;
  text: string;
  image: string;
  alt: string;
  width: number;
  height: number;
};

export const DOCS_INTRO =
  "Paron is a marketplace for tokenized GPU compute: one compute unit (CU) is one hour of H100-equivalent compute, backed by a bond the provider posts. Paron runs on Robinhood Chain Testnet only, and every token in it has no monetary value.";

export const DOCS_NOTES = [
  "Paron is testnet only. Tokens have no monetary value and no real funds are involved.",
  "Some figures are labeled Demo data or sample; treat them as illustrations, not market prices.",
  "A provider's bond is 1.5× the primary price. It is the collateral a default claim is paid from, so a default is a real loss for the provider on testnet.",
] as const;

export const DOCS_STEPS: readonly DocsStep[] = [
  {
    title: "Open Paron",
    text: "Go to the Paron landing page. It explains the idea in one screen: one standard unit, one price, one bond.",
    image: "/docs/01-open-paron.png",
    alt: "Paron landing page",
    width: 1280,
    height: 750,
  },
  {
    title: "Launch app",
    text: "Press Launch app to open the Markets page. You can browse series and the H100 index without a wallet.",
    image: "/docs/02-launch-app.png",
    alt: "Markets page after Launch app",
    width: 1280,
    height: 800,
  },
  {
    title: "Connect your wallet and Switch network",
    text: "Press Connect wallet and pick your wallet. If it is on another network, a banner appears: press Switch to move to Robinhood Chain Testnet (chain 46630).",
    image: "/docs/03-connect-wallet-switch-network.png",
    alt: "Wrong network banner with the Switch button",
    width: 1280,
    height: 242,
  },
  {
    title: "Get test USDC",
    text: "Open Faucet and press Get test USDC to receive 5,000 test USDC (MockUSDC), once per hour. You also need a little testnet ETH for gas; the page links you to get it.",
    image: "/docs/04-faucet.png",
    alt: "Faucet showing the success state",
    width: 1280,
    height: 400,
  },
  {
    title: "Pick a series and check the bond",
    text: "Open Markets and choose a series, for example CU-JKT-H100-2610. The series page shows Bond/CU of $4.50 against a $3.00 primary price, which is the 1.5× bond that covers buyers if delivery fails. The \"Demo data\" label in the top bar and the \"Verified by Paron demo verifier\" badge are testnet labels: this is a testnet deployment, and the verifier is a demo attestation, not a real audit.",
    image: "/docs/05-markets-check-bond.png",
    alt: "Series page with the bond per CU",
    width: 1280,
    height: 800,
  },
  {
    title: "Buy primary",
    text: "In the Buy ticket enter a whole number of CU and press Buy. Confirm in your wallet; the status shows Pending, then Success.",
    image: "/docs/06-buy-primary.png",
    alt: "Buy ticket showing Pending and Success",
    width: 1280,
    height: 340,
  },
  {
    title: "Trade: bid and ask",
    text: "Open Trade and use Place order. Choose the Side (Bid or Ask), set the price in USDC per CU and the size, then press Place order; your order appears in the book.",
    image: "/docs/07-trade-bid-ask.png",
    alt: "Place order ticket on the Trade tab",
    width: 1280,
    height: 800,
  },
  {
    title: "Check your Portfolio",
    text: "Portfolio lists your holdings with Balance, Locked and Value. Press Redeem next to a series to start a redemption; the Redemptions, Claims and Statement tabs sit beside Holdings.",
    image: "/docs/08-portfolio.png",
    alt: "Portfolio holdings",
    width: 1280,
    height: 480,
  },
  {
    title: "Request a redemption",
    text: "On the Redeem page enter the amount in whole CU and your access details (hashed before the transaction), then press Request redemption. A redemption moves through Requested, Acknowledged, Delivered and Finalized.",
    image: "/docs/09-request-redemption.png",
    alt: "Redeem form",
    width: 1280,
    height: 520,
  },
  {
    title: "Claim default from the bond",
    text: 'If the provider does not deliver, open the redemption request; claiming a default is public and any wallet can do it. The bond pays the holder, and the page shows "Defaulted · paid" with the timeline.',
    image: "/docs/10-claim-default.png",
    alt: "Redemption #3 showing Defaulted · paid",
    width: 1280,
    height: 640,
  },
  {
    title: "Read the Index",
    text: "Index shows the H100 reference price with its status, value, number of entities and eligible volume.",
    image: "/docs/11-index.png",
    alt: "H100 index",
    width: 1280,
    height: 480,
  },
  {
    title: "Browse Data",
    text: "Data lists eligible H100 prints and a curl example for the API. The CSV export matches the data contract columns.",
    image: "/docs/12-data.png",
    alt: "Data prints",
    width: 1280,
    height: 520,
  },
  {
    title: "For providers: Become a provider",
    text: "On the landing page press Become a provider to open the Provider page. Providers complete KYB first (Start KYB) before they can list capacity.",
    image: "/docs/13-become-a-provider.png",
    alt: "Become a provider on the landing page",
    width: 1280,
    height: 800,
  },
  {
    title: "For providers: List capacity",
    text: "Once verified, press List capacity and follow the three steps: GPU and size, Terms, Review. The bond is approved to BondVault, then the series is created.",
    image: "/docs/14-provider-list-capacity.png",
    alt: "List capacity form",
    width: 1280,
    height: 800,
  },
  {
    title: "For operators: Operator tab",
    text: "Operators enter through the OPERATOR tab in the footer of the landing page. It leads to the operator tools in the next two steps.",
    image: "/docs/15-operator-tab.png",
    alt: "Operator tab in the landing footer",
    width: 1280,
    height: 540,
  },
  {
    title: "For operators: Verifier",
    text: "On Verifier the operator reviews applications and uses Issue attestation to approve a provider's KYB.",
    image: "/docs/16-verifier.png",
    alt: "Verifier page",
    width: 1280,
    height: 800,
  },
  {
    title: "For operators: Admin and Timelock",
    text: "On Admin the admin wallet schedules a factor change; after the Timelock delay anyone can execute it once it shows under Ready operations.",
    image: "/docs/17-admin-timelock.png",
    alt: "Admin timelock",
    width: 1280,
    height: 800,
  },
];
