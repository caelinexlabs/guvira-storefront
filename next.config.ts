import type { NextConfig } from "next";

// Canonical links, the sitemap and structured data are built from this at build
// time. Without it a live build would point search engines at localhost.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL)
  throw new Error(
    "Set NEXT_PUBLIC_SITE_URL to the shop's public address before building for production.",
  );

// Product photos are served by the Caelinex API as absolute URLs.
const api = process.env.CAELINEX_API_URL
  ? new URL(process.env.CAELINEX_API_URL)
  : undefined;

// Headers every response carries. There is no Content-Security-Policy yet. The hosted
// Razorpay redirect and the inline JSON-LD need a tested policy first.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
