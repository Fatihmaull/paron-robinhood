import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import "./landing.css";

export const metadata: Metadata = {
  title: { absolute: "Paron — Where compute is forged into one standard" },
  description: "Paron is a bonded marketplace for tokenized GPU compute units. 1 CU = 1 H100-hour. Live on Robinhood Chain Testnet.",
};

export default function HomePage() {
  return <Landing />;
}
