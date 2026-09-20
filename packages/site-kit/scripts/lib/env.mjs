import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Scripts always run from INSIDE a brand site folder (they're wired as that
 * site's npm scripts, e.g. `cd carolina-heating && npm run content:sync`), so
 * the current working directory IS the site:
 *
 *   <site>/content/site.json   brand config (+ "slug")
 *   <site>/content/html/       mirrored pages
 *   <site>/content/images/     mirrored images (uploaded to Storage)
 *   <site>/content/pages.txt   live-site URL list
 *   <site>/app/theme.css       theme CSS (bundled by that site's build)
 *   <site>/public/fonts/       theme fonts
 *   <site>/.env.local          SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */
export const SITE_DIR = resolve(process.env.NEARU_SITE_DIR || process.cwd());
export const CONTENT_DIR = join(SITE_DIR, "content");

/**
 * Loads <site>/.env.local into process.env (without overriding vars already
 * set), so scripts behave the same locally and on Vercel (where the vars come
 * from project settings and there's no .env.local).
 */
export function loadEnvLocal() {
  const file = join(SITE_DIR, ".env.local");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf-8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

/** Reads <site>/content/site.json. */
export function loadSiteJson() {
  const file = join(CONTENT_DIR, "site.json");
  if (!existsSync(file)) {
    throw new Error(
      `No content/site.json in ${SITE_DIR}. Run this from inside a brand site folder (e.g. carolina-heating/).`
    );
  }
  return JSON.parse(readFileSync(file, "utf-8"));
}

/**
 * The brand slug = the `sites.slug` row this site owns in Supabase and its
 * Storage folder prefix. Comes from content/site.json "slug" (falls back to
 * the SITE_SLUG env var).
 */
export function resolveSiteSlug() {
  loadEnvLocal();
  const fromJson = existsSync(join(CONTENT_DIR, "site.json")) ? loadSiteJson().slug : undefined;
  const slug = fromJson || process.env.SITE_SLUG;
  if (!slug) {
    console.error(`Cannot determine the brand slug: add "slug" to ${join(CONTENT_DIR, "site.json")} or set SITE_SLUG.`);
    process.exit(1);
  }
  return slug;
}

/** Kept for call-site compatibility: the brand's content dir is always <site>/content. */
export function brandDir() {
  return CONTENT_DIR;
}
