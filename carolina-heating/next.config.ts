import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All images are self-hosted from /public/images (mirrored from the original
  // WordPress site by scripts/extract-pages.mjs). No remotePatterns needed.

  async redirects() {
    return [
      // Mirror the live site's redirects.
      { source: "/contact-us", destination: "/about-us", permanent: true },
      { source: "/services/indoor-air-quality", destination: "/services/greenville-sc-indoor-air-quality", permanent: true },
    ];
  },
};

export default nextConfig;
