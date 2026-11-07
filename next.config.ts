import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["open.kiyen.dev"],
  async headers() {
    return [
      {
        // Exclude /media: Next applies these after the route handler, which would override media's sandbox CSP.
        source: "/:path((?!media/).*)*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
        ],
      },
      {
        source: "/",
        headers: [
          // Hint for agents/LLMs: markdown summary available at /llms.txt
          { key: "Link", value: '</llms.txt>; rel="alternate"; type="text/markdown"' },
        ],
      },
      {
        source: "/en",
        headers: [
          // Hint for agents/LLMs: EN markdown summary available at /en/llms.txt
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
