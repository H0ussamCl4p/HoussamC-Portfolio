/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
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
