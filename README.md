# NearU Websites

The websites of the **NearU Services** family of home-service brands. Every
brand is its own independently deployable Next.js site; all of them share one
codebase and one database.

```
NearU-Websites/
├── carolina-heating/     carolinaheating.com   — brand site (own Vercel project)
├── 2nd-wind/             2ndwindhvac.com       — brand site (own Vercel project)
├── …                     one folder per brand (23 planned)
├── packages/site-kit/    @nearu/site-kit — everything shared: theme components,
│                         Supabase data layer, route implementations, content scripts
└── supabase/             the one shared database: schema.sql, migrations/, README
```

## How a brand site works

A brand folder is a **complete Next.js app** — it has its own `package.json`,
`next.config.ts`, `app/` routes, theme CSS, fonts, favicon, and `content/`
(everything mirrored from that brand's live WordPress site). It runs, builds
and deploys on its own. But its `app/` routes are one-liners that re-export
`@nearu/site-kit`, so a fix to the header, the data layer or the SEO plumbing
lands in every brand at once.

At runtime a site reads its content from Supabase, scoped to its own row in
the `sites` table (its slug is baked in by `next.config.ts`). What every brand
has in common — cookie notice, legal links, careers ATS — lives once in the
`companies` table under NearU. See [`supabase/README.md`](supabase/README.md).

|                       | Where |
|-----------------------|-------|
| Header/footer/blocks, data layer, routes, middleware | `packages/site-kit/src/` |
| Content-migration scripts (`content:sync`, `db:migrate`, …) | `packages/site-kit/scripts/` |
| A brand's theme CSS / fonts / favicon | `<brand>/app/theme.css`, `<brand>/public/fonts/`, `<brand>/app/icon.png` |
| A brand's business info, nav, categories, redirects | `<brand>/content/site.json` → Supabase |
| A brand's pages and images (mirrored from WordPress) | `<brand>/content/html/`, `<brand>/content/images/` → Supabase + Storage |
| Database schema | `supabase/schema.sql` (full), `supabase/migrations/` (incremental) |

## Working locally

```bash
npm install                      # once, at the repo root (npm workspaces)
cd carolina-heating              # any brand folder
cp .env.example .env.local       # add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Each brand's `README.md` lists its content commands (`npm run content:sync`,
`npm run db:migrate`, …). Repo-wide: `npm run lint`, `npm run typecheck`.

## Deploying

One Vercel project per brand, all on this repo and the `main` branch:

| Setting | Value |
|---|---|
| Root Directory | the brand folder, e.g. `carolina-heating` |
| Framework | Next.js (auto-detected) |
| Env vars | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET` — identical for every brand, so set them once as **team-level shared environment variables** |

No per-brand env vars are needed: the site's identity comes from its
`next.config.ts`. Pull-request preview deployments work for every brand
automatically.

**Order matters when creating a project:** push the brand folder to `main`
*first*, then create the Vercel project and set its Root Directory. If the
folder doesn't exist yet when the project is created, Vercel can't detect
Next.js and defaults the Framework Preset to "Other" — the build then
"succeeds" but every URL returns a platform 404. If that happens, set
Settings → Build and Deployment → Framework Preset to **Next.js** and redeploy.
The tell in a healthy build log is the line `Detected Next.js version: …`.

Redirects (the `redirects` table) are compiled in at build time. After adding
one in Supabase, trigger a rebuild with the project's **Deploy Hook**
(Settings → Git → Deploy Hooks) — no code change needed.

## Adding a brand

See [`supabase/README.md` → Onboarding a new brand](supabase/README.md#onboarding-a-new-brand-30-minutes).
Short version: copy a brand folder, point `content/site.json` at the live
site, run the four `content:*` scripts, fill in the business details, run
`npm run db:migrate`, add the folder to the root `workspaces`, create the
Vercel project.

## Conventions

- **Zero brand-specific code in `packages/site-kit`.** If a brand needs
  something others don't, it becomes a nullable column / `site.json` field,
  never an `if (slug === …)`.
- **Company-wide data goes in `companies`, not in every site.**
- Theme CSS is generated (`npm run content:theme-css`), never hand-edited.
- Content lives in Supabase; `content/` is the versioned staging copy.
