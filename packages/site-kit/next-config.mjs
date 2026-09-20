/**
 * Shared Next.js config for every NearU brand site. Each site's next.config.ts
 * is one line:
 *
 *   export default createSiteConfig({ siteSlug: "carolina-heating" });
 *
 * Plain JS (not TS) on purpose: next.config is loaded by Next's own loader
 * before the TypeScript pipeline exists for node_modules packages.
 */
export function createSiteConfig({ siteSlug }) {
  if (!siteSlug) throw new Error("createSiteConfig: siteSlug is required");

  // Images live in Supabase Storage. Allow next/image to optimize them —
  // hostname derived from SUPABASE_URL so the same config works for every
  // brand and every Supabase project.
  const supabaseHostname = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : undefined;

  /** @type {import("next").NextConfig} */
  const config = {
    // The site-kit is shipped as TypeScript source; Next compiles it with the app.
    transpilePackages: ["@nearu/site-kit"],

    // Bake this site's identity into the bundle so a Vercel project needs no
    // per-brand env vars — only the shared Supabase credentials. The folder's
    // own slug is AUTHORITATIVE: an inherited SITE_SLUG env var must never be
    // able to make this site build another brand's content.
    env: { SITE_SLUG: siteSlug },

    images: {
      remotePatterns: supabaseHostname
        ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
        : [],
    },

    // Redirects are DB-driven (the `redirects` table) via middleware, not here.
  };
  return config;
}
