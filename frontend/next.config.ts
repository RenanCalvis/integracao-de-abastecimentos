import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "179.198.99.46",
    "179.198.99.46:3100",
    "localhost",
    "localhost:3100",
  ],
};

export default nextConfig;
