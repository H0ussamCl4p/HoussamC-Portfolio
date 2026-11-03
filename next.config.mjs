import { existsSync } from "node:fs";

// The hero shows "Download CV" only if the PDF is present at build time.
const cvAvailable = existsSync(new URL("./public/cv/Houssam_Choubik_CV.pdf", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
