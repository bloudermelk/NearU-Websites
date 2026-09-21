# Russell's American Mechanical

**americanmechanicalva.com** — a NearU brand website. This folder is a complete, independently
deployable Next.js app; it is one Vercel project (Root Directory: `american-mechanical`).

Everything that is not specific to this brand lives in
[`packages/site-kit`](../packages/site-kit) and is shared with every other NearU
site. What *is* in this folder:

| Path | What |
|---|---|
| `app/` | Thin route files re-exporting the kit's implementations, plus this brand's `theme.css` and favicon |
| `public/fonts/` | This brand's theme fonts (referenced by `theme.css`) |
| `content/site.json` | Brand config: business info, nav, categories, testimonials, redirects, source (live-site) settings |
| `content/html/`, `content/images/` | Pages + images mirrored from the live WordPress site → pushed to Supabase |
| `content/pages.txt` | URL list from the live site's sitemaps |
| `next.config.ts` | One line: `createSiteConfig({ siteSlug: "american-mechanical" })` |

## Commands (run in this folder)

```bash
npm run dev                       # local dev against the shared Supabase project (.env.local)
npm run build && npm start        # production build
npm run content:pages             # rebuild content/pages.txt from the live sitemaps
npm run content:theme-css         # rebuild app/theme.css + public/fonts from the live site
npm run content:sync              # re-mirror all pages + images (or: npm run content:sync -- <url>)
npm run content:nav -- --out x.json  # extract header/footer nav to merge into site.json
npm run db:migrate                # push content/ into Supabase (idempotent, this brand's rows only)
```

Env vars (`.env.local` locally, project settings on Vercel): `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET`. The brand identity
(`SITE_SLUG=american-mechanical`) is baked in by `next.config.ts`.
