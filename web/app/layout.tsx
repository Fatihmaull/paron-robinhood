import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif, Inter_Tight } from "next/font/google";
import { Shell } from "@/components/shell";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

const tight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter-tight",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const geist = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: { default: "Paron", template: "%s · Paron" },
  description: "Compute-hour markets on Robinhood Chain Testnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${tight.variable} ${serif.variable} ${geist.variable}`}>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
