/**
 * Materializes the active brand's build-time assets from content/<SITE_SLUG>/
 * into the places Next.js expects them, before `next build` / `next dev`:
 *
 *   content/<slug>/theme.css    -> src/app/theme.css   (imported by globals.css)
 *   content/<slug>/fonts/*      -> public/fonts/        (@font-face urls in theme.css)
 *   content/<slug>/favicon.ico  -> src/app/favicon.ico  (Next app-router favicon convention)
 *
 * The destinations are gitignored — they're derived, and which brand they
 * hold depends on SITE_SLUG, which is different in every Vercel project.
 * Everything else about a brand (nav, copy, pages, images) is runtime data
 * in Supabase; only these three are inherently build-time in Next.js (CSS
 * must be bundled, static files must exist in public/, favicon is a file
 * convention), so they're the one exception to "no per-brand build step".
 *
 * Wired into package.json as the `prebuild`/`predev` lifecycle hook, so
 * `npm run build` and `npm run dev` run it automatically.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal } from "./lib/env.mjs";

loadEnvLocal();

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.env.SITE_SLUG;
if (!slug) {
  console.error("prebuild: SITE_SLUG is not set (env or .env.local). Which brand should be built?");
  process.exit(1);
}

const brandDir = join(ROOT, "content", slug);
if (!existsSync(brandDir)) {
  console.error(`prebuild: no content directory for SITE_SLUG="${slug}" at ${brandDir}`);
  process.exit(1);
}

function copy(from, to, { required = true } = {}) {
  const src = join(brandDir, from);
  const dest = join(ROOT, to);
  if (!existsSync(src)) {
    if (required) {
      console.error(`prebuild: missing ${src}`);
      process.exit(1);
    }
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true, force: true });
  console.log(`prebuild: ${from} -> ${to}`);
}

// Clear stale per-brand files from a previous build first so nothing leaks between brands.
const fontsDest = join(ROOT, "public", "fonts");
if (existsSync(fontsDest)) rmSync(fontsDest, { recursive: true, force: true });
for (const f of ["favicon.ico", "icon.png"]) rmSync(join(ROOT, "src", "app", f), { force: true });

copy("theme.css", "src/app/theme.css");
copy("fonts", "public/fonts");
// Next's app-router file conventions: either favicon.ico or icon.png works.
copy("favicon.ico", "src/app/favicon.ico", { required: false });
copy("icon.png", "src/app/icon.png", { required: false });

const fontCount = existsSync(fontsDest) ? readdirSync(fontsDest).length : 0;
console.log(`prebuild: brand "${slug}" ready (${fontCount} fonts).`);
