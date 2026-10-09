import type { Metadata } from "next";

export const metadata: Metadata = { title: "H100 index" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
