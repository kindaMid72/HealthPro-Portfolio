import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["open.kiyen.dev", "*.kiyen.dev", "localhost"],
  async headers() {
    return [
      {
        source: "/",
        headers: [
          // Petunjuk bagi agen/LLM: ringkasan markdown tersedia di /llms.txt
          { key: "Link", value: '</llms.txt>; rel="alternate"; type="text/markdown"' },
        ],
      },
      {
        source: "/en",
        headers: [
          // Petunjuk bagi agen/LLM: ringkasan markdown EN tersedia di /en/llms.txt
          { key: "Link", value: '</en/llms.txt>; rel="alternate"; type="text/markdown"' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/admin/artikel", destination: "/admin/articles" },
      { source: "/admin/artikel/:path*", destination: "/admin/articles/:path*" },
      { source: "/admin/profil", destination: "/admin/profile" },
      { source: "/admin/lokasi", destination: "/admin/locations" },
      { source: "/admin/layanan", destination: "/admin/services" },
      { source: "/admin/layanan/:path*", destination: "/admin/services/:path*" },
      { source: "/admin/akun", destination: "/admin/account" },
    ];
  },
};

export default nextConfig;
