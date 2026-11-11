import type { NextConfig } from "next";

// Product photos are served by the Caelinex API as absolute URLs.
const api = process.env.CAELINEX_API_URL
  ? new URL(process.env.CAELINEX_API_URL)
  : undefined;

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: api
      ? [
          {
            protocol: api.protocol.replace(":", "") as "http" | "https",
            hostname: api.hostname,
            port: api.port,
          },
        ]
      : [],
    // The API is on localhost in development; Next blocks private addresses
    // for the image optimiser unless told otherwise.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
