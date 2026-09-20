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

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Images live in Supabase Storage. Allow next/image to optimize them —
  // hostname derived from SUPABASE_URL so the same config works for every
  // brand and every Supabase project.
  const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

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
      // Every raster <img> in mirrored WordPress HTML is rewritten at render
      // time to /_next/image?url=…&w=… (see site-kit/src/lib/mirroredHtml.ts),
      // so the widths WordPress generates (300/768/1024/1536) must be allowed
      // here. MUST match IMAGE_WIDTHS in that file.
      deviceSizes: [300, 640, 768, 1024, 1200, 1536, 1920, 2048, 2560, 3840],
      imageSizes: [64, 128, 200, 256],
      formats: ["image/webp"],
      // Source images in Storage are immutable (1-year Cache-Control); keep
      // optimized variants at least as long.
      minimumCacheTTL: 60 * 60 * 24 * 365,
    },

    // NOTE: do NOT enable `experimental.inlineCss`. It was measured to embed
    // the ~220KB theme stylesheet 3x in every HTML document and 2x in every
    // RSC payload, quadrupling the cost of client-side navigations (568KB vs
    // ~130KB). As an immutable, hashed <link> the stylesheet costs one round
    // trip on the entry visit and nothing on any navigation after it.

    // Redirects are resolved from the shared database at BUILD time and
    // compiled into the deployment, so the CDN answers them directly — no
    // per-request edge function, no database round trip on cold isolates.
    // Trade-off: a redirect added in Supabase takes effect on the next deploy
    // (trigger one with the project's Vercel Deploy Hook).
    async redirects() {
      if (!supabaseUrl || !serviceKey) return []; // e.g. CI typecheck without credentials
      const url =
        `${supabaseUrl}/rest/v1/redirects?select=source,destination,permanent,sites!inner(slug)` +
        `&sites.slug=eq.${encodeURIComponent(siteSlug)}`;
      const res = await fetch(url, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
      if (!res.ok) {
        console.warn(`[site-kit] could not load redirects for ${siteSlug}: HTTP ${res.status}`);
        return [];
      }
      const rows = await res.json();
      console.log(`[site-kit] ${rows.length} redirect(s) compiled for ${siteSlug}`);
      return rows.map((r) => ({ source: r.source, destination: r.destination, permanent: r.permanent !== false }));
    },
  };
  return config;
}
