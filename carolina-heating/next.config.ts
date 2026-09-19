import type { NextConfig } from "next";

// Images live in Supabase Storage (site-media bucket). Allow next/image to
// optimize/cache them — computed from SUPABASE_URL so this works for every
// brand's Supabase project without hardcoding a hostname.
const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },

  // Redirects are DB-driven (the `redirects` table) via middleware.ts, not
  // here — that lets a content editor add one in Supabase without a
  // redeploy. See middleware.ts for details.
};

export default nextConfig;
