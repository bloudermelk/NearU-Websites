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
npm run db:migrate
```

This is **idempotent** — re-run it anytime after editing local content
(`content/site.json`, `content/pages/home.json`, `content/html/*.json`) or
after re-syncing from a live WordPress source (`npm run content:sync`). It
uploads every image in `public/images/`, upserts the `sites` row, and
replaces this site's `nav_items` / `service_categories` / `certifications` /
`testimonials` / `pages` rows.

## 5. Onboarding brand #2 (and beyond)

1. Copy the `carolina-heating` app folder as a starting point (or, if the new
   brand's WordPress site follows the same NearU theme, run
   `npx create-next-app` + copy `src/` wholesale — the components are theme
   code, not Carolina-Heating-specific).
2. Build that brand's `content/site.json` + `content/html/*.json` (reuse
   `scripts/extract-pages.mjs` against the new brand's live WordPress site).
3. Set `SITE_SLUG` to the new brand's slug, run `npm run db:migrate`.
4. Deploy as its own Vercel project with `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SITE_SLUG`, and `REVALIDATE_SECRET` set.

No other brand's data is touched — every query in `src/lib/db/*` filters by
this site's row, and every migration script only writes rows for `SITE_SLUG`.

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
