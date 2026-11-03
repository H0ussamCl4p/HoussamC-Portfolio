import { existsSync } from "node:fs";

// The hero shows "Download CV" only if the PDF is present at build time.
const cvAvailable = existsSync(new URL("./public/cv/Houssam_Choubik_CV.pdf", import.meta.url));

// Applied to every response. The page Content-Security-Policy is per-request
// (nonce-based) and set in src/middleware.ts.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "publickey-credentials-get=()",
      "serial=()",
      "usb=()",
      "xr-spatial-tracking=()",
      "browsing-topics=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Render <meta>/OG tags in <head> for every user agent instead of streaming
  // them for non-bots, so link previews and SEO tools always see them.
  htmlLimitedBots: /.*/,
  env: {
    CV_AVAILABLE: cvAvailable ? "1" : "",
  },
  eslint: {
    // Keep `next build` fast on Vercel; run lint separately via `npm run lint`.
    ignoreDuringBuilds: true,
  },
  // Design thumbnails are rendered unoptimized, so the image optimizer only
  // needs local files. No remotePatterns means /_next/image can't proxy
  // arbitrary third-party URLs.
  images: {
    remotePatterns: [],
  },
  // The OG image route reads the avatar from disk instead of fetching it.
  outputFileTracingIncludes: {
    "/api/og/generate": ["./public/images/avatar.jpg"],
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // API responses never render HTML.
        source: "/api/:path*",
        headers: [{ key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" }],
      },
    ];
  },
};

export default nextConfig;
