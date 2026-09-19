import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are served from Supabase Storage (site-media bucket) via plain
  // <img> tags, not next/image, so no remotePatterns needed.

  // Redirects are DB-driven (the `redirects` table) via middleware.ts, not
  // here — that lets a content editor add one in Supabase without a
  // redeploy. See middleware.ts for details.
};

export default nextConfig;
