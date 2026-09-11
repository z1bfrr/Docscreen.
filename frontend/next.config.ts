import type { NextConfig } from "next";

let targetBackend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
if (!targetBackend.startsWith("http://") && !targetBackend.startsWith("https://")) {
  targetBackend = targetBackend.includes(":") ? `http://${targetBackend}` : `http://${targetBackend}:8000`;
}
targetBackend = targetBackend.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${targetBackend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
