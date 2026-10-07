import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pixelforge/shared", "@pixelforge/types"],
  eslint: {
    dirs: ["src"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  async rewrites() {
    const api = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!api) return [];
    return [{ source: "/gateway/:path*", destination: `${api.replace(/\/$/, "")}/api/:path*` }];
  },
};

export default nextConfig;
