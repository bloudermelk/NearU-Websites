# NearU Websites — shared Supabase database

One Supabase project backs **every** NearU brand website. The data model is
two levels:

```
companies            NearU (1 row) — things identical across all brands live here once
  └── sites          one row per brand website (carolina-heating, 2nd-wind, …)
        ├── nav_items, service_categories, sub_services, locations
        ├── pages (mirrored HTML + optional structured jsonb), redirects
        ├── certifications, testimonials, media_assets
        └── Storage bucket `site-media`, folder `<site slug>/…`
```

Every content table carries `site_id`; every query in `packages/site-kit` is
scoped to the current site; every migration script only writes its own site's
rows. Adding brand #23 adds rows, never tables.

## Files

| File | Purpose |
|---|---|
| `schema.sql` | The **full** schema (all migrations concatenated). Paste into the SQL Editor of a brand-new Supabase project to set it up in one go. |
| `migrations/000N_*.sql` | Incremental history. On the existing project, run only the ones not yet applied. All four (0001–0004) are applied on `nwphvamrmmsxqohwlgbm`. |
| `README.md` | This file. |

## Access model

- Sites read/write with the **`service_role`** key, server-side only
  (`packages/site-kit/src/lib/supabase/server.ts`, marked `server-only`; the
  Edge middleware uses the same key over PostgREST).
- RLS is enabled on every table with **no permissive policies**: the
  `anon`/`publishable` key can read nothing. Add SELECT policies later if you
  ever want a public read API.
- Storage bucket `site-media` is public (images are public web assets),
  namespaced by site slug. Uploads set a 1-year `Cache-Control`.

## What's shared vs. per-brand

| Shared once in `companies` | Per-brand in `sites` (+ child tables) |
|---|---|
| Cookie-consent notice text | Name, legal name, domain, phone, address, hours |
| Footer legal links (Privacy, CA Notice, Terms, Sitemap) | Header tagline, footer license lines, social links |
| Careers ATS base URL | Logo (+ intrinsic size), theme body class, preload fonts |
| | Nav, service categories (+ icon), certifications, testimonials |
| | Pages, redirects, media, thin location/sub-service index |
| | Third-party IDs: ServiceTitan scheduler, GTM, Tealium (nullable, off by default) |

`brand_overview` is a view that shows, per site, how much content is loaded —
handy after a migration: `select * from brand_overview;`


## Seeding / re-syncing a brand

From inside that brand's folder:

```bash
cd carolina-heating
npm run db:migrate                # content/ -> Supabase (idempotent; this site's rows only)
npm run db:migrate:content-only   # same, skipping the image re-upload
```

Requires `.env.local` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The
site slug comes from `content/site.json` → `"slug"`.

## Onboarding a new brand (~10 minutes)

```bash
# From the repo root. Scaffolds <slug>/ from the shared template, composes
# content/site.json from the live site, mirrors pages + images (+ sister-brand
# assets), extracts nav/footer/banner, records live 301s, fetches the favicon,
# adds the workspace and installs.
node packages/site-kit/scripts/new-brand.mjs --slug <slug> --origin https://<live-site>

cd <slug>
# Review any TODO lines printed (e.g. a site that never states "since YYYY").
npm run db:migrate            # -> Supabase: sites row + all child rows for this brand
npm run build && npm start    # verify locally against the live site
# Commit + push, THEN create the Vercel project: Root Directory = <slug>,
# env vars SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REVALIDATE_SECRET.

# Re-sync later (content changed on the WordPress side):
npm run content:sync && npm run db:migrate
```

The individual steps the scaffolder runs are also available as
`npm run content:pages | content:theme-css | content:sync | content:nav`
inside the brand folder. Brands so far: carolina-heating, 2nd-wind, happy-home,
american-mechanical.

## Editing content after launch

Content lives in Supabase, not git. Either edit `content/*` and re-run
`npm run db:migrate`, or write to Supabase directly (Table Editor or a script
using the same pattern as `packages/site-kit/scripts/db/migrate-to-supabase.mjs`).
Then, for an instant refresh instead of the hourly ISR window:

```bash
curl -X POST "https://<site-domain>/api/revalidate?secret=$REVALIDATE_SECRET&path=/about-us"
```
