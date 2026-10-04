import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone server for lean Docker images
  output: "standalone",
};

export default nextConfig;
