import { NextResponse, type NextRequest } from "next/server";

/**
 * DB-driven redirects (the `redirects` table), so content editors can add a
 * redirect in Supabase and have it take effect without a redeploy — unlike
 * `next.config.ts`'s `redirects()`, which is baked in at build time.
 *
 * Runs as the Next.js proxy (formerly "middleware") on the Edge runtime, so this uses a raw PostgREST fetch (no
 * @supabase/supabase-js/node dependency) with an in-memory TTL cache to avoid
 * hitting the database on every request.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_SLUG = process.env.SITE_SLUG;

const CACHE_TTL_MS = 5 * 60 * 1000;

type RedirectRow = { source: string; destination: string; permanent: boolean };

let cache: { rows: RedirectRow[]; fetchedAt: number } | null = null;

async function getRedirects(): Promise<RedirectRow[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SITE_SLUG) return [];
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.rows;

  try {
    const url =
      `${SUPABASE_URL}/rest/v1/redirects` +
      `?select=source,destination,permanent,sites!inner(slug)` +
      `&sites.slug=eq.${encodeURIComponent(SITE_SLUG)}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    if (!res.ok) return cache?.rows ?? [];
    const rows = (await res.json()) as RedirectRow[];
    cache = { rows, fetchedAt: Date.now() };
    return rows;
  } catch {
    // Supabase unreachable — fall back to stale cache (or no redirects) rather
    // than failing every request.
    return cache?.rows ?? [];
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const redirects = await getRedirects();
  const match = redirects.find((r) => r.source === pathname);

  if (match) {
    const url = request.nextUrl.clone();
    url.pathname = match.destination;
    return NextResponse.redirect(url, match.permanent ? 308 : 307);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, the API routes, and anything that looks like a
  // static file (has a dot in the last path segment) to avoid a DB round
  // trip on every asset/font/image request.
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
