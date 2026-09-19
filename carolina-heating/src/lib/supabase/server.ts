import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, shared across all 23 NearU brand sites.
 *
 * Uses the SERVICE ROLE key, which bypasses Row Level Security — this is
 * intentional and safe *because* it is only ever imported from server
 * components, route handlers, and build-time scripts (the `server-only`
 * import above makes it a build error to accidentally import this from a
 * "use client" file or ship it in the browser bundle).
 *
 * Each brand's Vercel project sets SITE_SLUG to its own value; every query
 * in src/lib/db/* filters by that site's row, so one Supabase project can
 * safely back all 23 sites.
 */
let client: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** The current site's slug, e.g. "carolina-heating". Set per Vercel project. */
export function getSiteSlug(): string {
  const slug = process.env.SITE_SLUG;
  if (!slug) throw new Error("Missing SITE_SLUG environment variable.");
  return slug;
}

export const MEDIA_BUCKET = "site-media";

/** Public URL for a path inside the shared media bucket. */
export function mediaUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (/^https?:\/\//.test(storagePath)) return storagePath; // already absolute
  const supabase = getSupabaseServerClient();
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
