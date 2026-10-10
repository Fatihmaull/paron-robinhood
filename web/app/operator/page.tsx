import Link from "next/link";
import { OperatorLink } from "@/components/operator-link";

const TOOLS = [
  ["/verifier", "Verifier"],
  ["/admin", "Admin"],
  ["/ops/keepers", "Keepers"],
  ["/arbiter", "Arbiter"],
  ["/disputes", "Disputes"],
] as const;

export default function OperatorToolsPage() {
  return (
    <div>
      <OperatorLink />
      <h1>Operator tools</h1>
      <p className="lede">Verifier, admin, keepers, arbiter, and disputes.</p>
      <nav className="operator-tools" aria-label="Operator tools">
        {TOOLS.map(([href, label]) => (
          <Link key={href} href={href}>{label}</Link>
        ))}
      </nav>
    </div>
  );
}
