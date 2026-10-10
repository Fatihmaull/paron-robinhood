import Link from "next/link";

export function OperatorLink() {
  return (
    <p className="operator-mark">
      <Link className="operator-link" href="/operator">Operator</Link>
    </p>
  );
}
