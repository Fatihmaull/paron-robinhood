import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <h1>Page not found</h1>
      <p className="lede">This page is not on the testnet app.</p>
      <Link className="btn" href="/markets">Markets</Link>
    </section>
  );
}
