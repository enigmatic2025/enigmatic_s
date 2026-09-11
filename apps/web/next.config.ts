import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },
  poweredByHeader: false,
  reactCompiler: true,
  async headers() {
    return [
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Cache llms.txt
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        // Cache llms-full.txt
        source: "/llms-full.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
