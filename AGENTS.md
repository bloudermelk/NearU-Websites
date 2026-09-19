<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Content Management ("Claude CMS")

This site's content is **not** stored in a third-party CMS. All editable copy, images references, and page data live as plain files in `content/`. Edit these files directly — no database, no admin login. After editing, run `npm run dev` (or `npm run build`) to see changes; Vercel redeploys automatically on push.

## Content structure

- `content/site.json` — Global business info (name, phone, address, hours), primary/footer nav, the 7 service category summaries used on the homepage grid, certifications list, and homepage testimonials. Almost every page pulls from this file via `src/lib/site.ts`.
- `content/services/<slug>.json` — One file per top-level service category page (`greenville-sc-heating`, `greenville-sc-cooling`, `greenville-sc-indoor-air-quality`, `greenville-sc-plumbing`, `greenville-sc-drains`, `greenville-sc-electrical`, `greenville-sc-generators`). Rendered by the single reusable template at `src/components/ServiceCategoryTemplate.tsx` via the dynamic route `src/app/services/[category]/page.tsx`. To add a new service category: drop a new JSON file here (same shape as the others), add a matching entry to `serviceCategories` in `content/site.json`, and it will automatically get a page at `/services/<slug>` plus a nav dropdown link.
- `content/pages/<slug>.json` — Structured content for templated pages that mix prose with layout sections (home, maintenance, financing, worry-free-service-program, commercial, generator-greenville-sc, careers). Each has a matching `src/app/<slug>/page.tsx` that imports the JSON directly.
- `content/pages/<slug>.mdx` — Long-form prose pages (about-us, privacy-policy, terms-and-conditions). Frontmatter holds `title`/`metaTitle`/`metaDescription` (and a few extra fields for about-us); the Markdown body is rendered through `src/components/MdxContent.tsx`. You can use Markdown links, bold, lists, and headings freely here.
- `content/services/<category>.json` `subServices[]` entries also power the individual sub-service pages at `/services/<category>/<subservice>` (e.g. `/services/greenville-sc-heating/furnaces`) via `src/lib/subServices.ts` and `src/components/SubServiceTemplate.tsx`. The templated "Inspection & Repair / Installations / Maintenance" body copy and FAQs on those pages are generated from the sub-service title in `src/lib/subServiceCopy.ts` — edit that file's templates for site-wide wording changes, or hardcode fully custom copy per sub-service by extending the template/data if a specific page needs to stand out.
- `content/locations/<slug>.json` — One file per city landing page (e.g. `greer-hvac-plumbing-electrical-generators`), rendered by `src/components/LocationTemplate.tsx` via `src/app/[location]/page.tsx`. Each has real, city-specific copy (intro, 3 service groups of 4 items each, a "since 1981" breakdown by trade, and 5 FAQs) scraped from the original site. To add a new city, copy the JSON shape from an existing file and it's automatically routed and linked from nearby cities' FAQs.

## Design tokens

Brand colors/fonts are defined once in `src/app/globals.css` under `@theme inline` (`--color-brand-primary`, `--color-brand-secondary`, etc.) and used as Tailwind utility classes (`text-brand-primary`, `bg-brand-secondary`, etc.). Fonts (Roboto / Roboto Condensed) are loaded via `next/font/google` in `src/app/layout.tsx`.

## Images

Images currently reference the original WordPress media library on `carolinaheating.com` (allowed via `remotePatterns` in `next.config.ts`) so the site is visually complete without re-uploading every asset. Before final launch, migrate real production images into `public/images/` and update the `image`/`heroImage` fields in `content/` to local paths (e.g. `/images/heating-hero.jpg`), then remove the remote patterns.

## Known gaps / next phase

- No contact/lead forms are wired up yet (`/bookings` and `/generator-greenville-sc` are placeholders pointing to phone/CTA only). Add a form + CRM/ServiceTitan integration when ready.
- Sub-service pages (`/services/<category>/<subservice>`) use templated, generic body copy and FAQs (see `src/lib/subServiceCopy.ts`) rather than fully unique per-page prose — the real site's own sub-service pages are similarly templated, so this is a faithful starting point, but it's the best candidate for a future content pass if you want more unique copy per page.
- `content/services/*.json`, `content/pages/*.json`, and `content/locations/*.json` are hand-authored JSON — keep them valid JSON (no comments, no trailing commas) since they're `JSON.parse`'d or statically imported at build time.
- Images still hotlink to the original WordPress site (see "Images" above) — migrate to `public/images/` before final launch.
