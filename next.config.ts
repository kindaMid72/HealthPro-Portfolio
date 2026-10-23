import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/admin/artikel', destination: '/admin/articles' },
      { source: '/admin/artikel/:path*', destination: '/admin/articles/:path*' },
      { source: '/admin/profil', destination: '/admin/profile' },
      { source: '/admin/lokasi', destination: '/admin/locations' },
      { source: '/admin/layanan', destination: '/admin/services' },
    ];
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          // Petunjuk bagi agen/LLM: ringkasan markdown tersedia di /llms.txt
          { key: "Link", value: '</llms.txt>; rel="alternate"; type="text/markdown"' },
        ],
      },
    ];
  },
};

export default nextConfig;
