import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "Series · Paron" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
