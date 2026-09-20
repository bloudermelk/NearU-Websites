# Supabase setup — NearU family-of-brands content platform

One Supabase project backs all 23 brand sites. Each site's Vercel project
only needs three env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SITE_SLUG`) to read/write its own rows.

## 1. Create the schema (once, for the whole project)

Paste `migrations/0001_init.sql` into the Supabase dashboard's **SQL Editor**
and run it. (Or, if you have the Supabase CLI linked to this project:
`supabase db push`.)

This creates: `sites`, `nav_items`, `service_categories`, `sub_services`,
`locations`, `pages`, `certifications`, `testimonials`, `redirects`,
`media_assets` — see the SQL file for full column docs. RLS is enabled on
every table with **no permissive policies**; the app and scripts use the
`service_role` key server-side only, which bypasses RLS by design.

## 2. Create the Storage bucket

Handled automatically by the migration script (`npm run db:migrate` creates
a public bucket named `site-media` if it doesn't exist). Images for every
site live in one bucket, namespaced by folder: `<site_slug>/images/...`.

If you'd rather create it manually: Storage → New bucket → name
`site-media` → **Public bucket** ✅.

## 3. Get your credentials

Project Settings → API:
- **Project URL** → `SUPABASE_URL`
- **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (never `anon`, and
  never expose this in client-side code — see `src/lib/supabase/server.ts`)

## 4. Seed a site's content

From that brand's repo (e.g. `carolina-heating/`), with a `.env.local`
containing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SITE_SLUG`:

```bash
npm run db:migrate -- --site <slug>
```

This is **idempotent** — re-run it anytime after editing that brand's local
content (`content/<slug>/site.json`, `html/*.json`, optional `home.json`) or
after re-syncing from its live WordPress source (`npm run content:sync -- --site <slug>`).
It uploads every image in `content/<slug>/images/`, upserts the `sites` row,
and replaces that site's `nav_items` / `service_categories` / `certifications` /
`testimonials` / `redirects` / `media_assets` / `pages` / `locations` /
`sub_services` rows. No other brand's rows are touched.

Run all migrations in `supabase/migrations/` in order (0001, 0002, 0003) on a
fresh project.

## 5. Onboarding a new brand (same codebase, ~30 minutes)

There is ONE Next.js app for all brands. A brand is: a `content/<slug>/`
folder (build-time inputs + staging for Supabase), a `sites` row (+ child
rows), and a Vercel project whose only distinguishing config is env vars.

```bash
# 1. Skeleton: content/<slug>/site.json with at least
#    { "source": { "origin": "https://<live-site>", "extraPages": ["/bookings"],
#                  "locationSlugSuffix": "-<city-suffix>" } }
# 2. Page list from the live sitemaps
npm run content:pages -- --site <slug>
# 3. Theme CSS + fonts (child theme colors/fonts differ per brand)
npm run content:theme-css -- --site <slug>
# 4. Mirror every page + every image (incl. srcset variants).
#    Prints any live-site 301s -> add them to site.json "redirects".
npm run content:sync -- --site <slug>
# 5. Header/footer nav -> merge into site.json (nav.primary, footer.columns)
node scripts/extract-nav.mjs --site <slug> --out /tmp/nav.json
# 6. Fill in the rest of site.json by hand from the live homepage
#    (business, theme.bodyClass, serviceCategories w/ icon, testimonials,
#    licenseLines, headerTagline, logo + logoWidth/Height). See
#    content/2nd-wind/site.json for a complete example. Drop the brand's
#    favicon at content/<slug>/icon.png (or favicon.ico).
# 7. Push to Supabase
npm run db:migrate -- --site <slug>
# 8. Verify locally, then create the Vercel project (same repo, same root
#    directory) with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
#    SITE_SLUG=<slug>, SITE_DOMAIN, REVALIDATE_SECRET.
SITE_SLUG=<slug> npm run build && npm start
```

No `home.json` is needed: new brands' homepages are mirrored like any other
page (`page_type='mirrored'`). Only Carolina Heating has a hand-built React
homepage.

## Editing content after go-live

Content lives in Supabase, not git. A future Claude/AI session can:

- Edit the local `content/*.json` files and re-run `npm run db:migrate`, **or**
- Write directly to Supabase via `@supabase/supabase-js` in a small one-off
  script (same pattern as `scripts/db/migrate-to-supabase.mjs`), **or**
- Use the Supabase Table Editor for quick manual fixes.

After any change, call the revalidation endpoint for instant updates instead
of waiting for the hourly ISR window:

```bash
curl -X POST "https://<site-domain>/api/revalidate?secret=$REVALIDATE_SECRET&path=/about-us"
```

Pages that don't exist in Supabase are still 404s until a matching `pages`
row exists — `dynamicParams = true` means new paths added after deploy work
without a redeploy (Next.js renders them on-demand and caches the result).
