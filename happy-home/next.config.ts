import { createSiteConfig } from "@nearu/site-kit/next-config";

// Everything this site needs from Next.js is shared with every other NearU
// brand; the only thing that identifies this site is its slug (its row in the
// shared Supabase `sites` table). See packages/site-kit/next-config.mjs.
export default createSiteConfig({ siteSlug: "happy-home" });
