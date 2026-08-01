import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fixitnow-qemf.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
    ],
  },
};

export default nextConfig;
