import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "Redemption · Paron" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
