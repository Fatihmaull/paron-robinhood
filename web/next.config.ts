import type { NextConfig } from "next";

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

if (process.env.VERCEL === "1" && dataSource === "mock") {
  throw new Error(
    "Refusing to build: NEXT_PUBLIC_DATA_SOURCE=mock is not allowed when VERCEL=1.",
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
