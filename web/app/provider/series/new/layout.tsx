import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "List a series · Paron" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
