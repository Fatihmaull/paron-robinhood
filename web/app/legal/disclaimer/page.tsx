import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div>
      <h1>Disclaimer</h1>
      <p>This deployment is a testnet demo. Tokens have no monetary value. Nothing here is financial, legal, or investment advice.</p>
      <p>A bond pays the holder only when the contract records a default. Deadlines follow server time. The transaction itself decides.</p>
      <p>The spot reference is demo data. It is not an input to a payout.</p>
      <p><Link href="/legal/risk">Risk</Link></p>
    </div>
  );
}
