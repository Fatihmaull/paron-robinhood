import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { loadManifestAddresses } from "./lib/manifest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const [key, value] of Object.entries(loadManifestAddresses(repoRoot, process.env))) {
  process.env[key] = value;
}

// Only an explicit mock request is refused on Vercel. Unset resolves to live (see lib/config.ts).
if (process.env.VERCEL === "1" && process.env.NEXT_PUBLIC_DATA_SOURCE === "mock") {
  throw new Error(
    "Refusing to build: NEXT_PUBLIC_DATA_SOURCE=mock is not allowed when VERCEL=1.",
  );
}

const emptyModule = "./lib/empty-module.ts";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_ON_VERCEL: process.env.VERCEL === "1" ? "1" : "" },
  async redirects() {
    return [{ source: "/index", destination: "/h100-index", permanent: false }];
  },
  reactStrictMode: true,
  agentRules: false,
  // RainbowKit → wagmi baseAccount pulls optional Coinbase x402 imports that are not installed.
  turbopack: {
    resolveAlias: {
      "@base-org/account": emptyModule,
      "@x402/core/client": emptyModule,
      "@x402/evm": emptyModule,
      "@x402/evm/exact/client": emptyModule,
      "@x402/evm/upto/client": emptyModule,
      "@x402/svm/exact/client": emptyModule,
    },
  },
};

export default nextConfig;
