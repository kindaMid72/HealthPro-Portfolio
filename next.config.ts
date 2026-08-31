import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Remote patterns untuk next/image — photo_url dokter bisa berasal dari
     * Google Drive / Google Photos (data dari Google Sheet).
     * Tambah domain lain di sini kalau suatu saat photo_url berubah sumber.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
