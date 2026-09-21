#!/usr/bin/env node
/**
 * Onboards a new NearU brand website from its live WordPress site, end to end,
 * so every brand is built from the SAME template with no hand-deviation:
 *
 *   node packages/site-kit/scripts/new-brand.mjs --slug happy-home \
 *        --origin https://happyhomeheatingandcooling.com
 *
 * 1. Scaffolds <repo>/<slug>/ (package.json, next.config.ts, thin app/ routes,
 *    tsconfig, eslint, README, .env.example) — identical to the other brands.
 * 2. Writes content/site.json composed from the live site: business details
 *    (JSON-LD + header + footer), logo (+ intrinsic size), service categories
 *    (+ icons), testimonials, promo banner, nav, footer, license, socials,
 *    location-page slug suffix, WordPress multisite id.
 * 3. Runs the content pipeline in the new folder: content:pages ->
 *    content:theme-css -> content:sync -> content:nav, merges nav/footer/banner
 *    and any live-site 301s (redirects.json) into site.json, fetches the favicon.
 * 4. Adds the folder to the root package.json `workspaces` and runs npm install.
 *
 * Then, in the new folder: `npm run db:migrate` and `npm run build`.
 * Review the "TODO" fields it prints (things a site doesn't state explicitly).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const slug = arg("--slug");
const origin = arg("--origin")?.replace(/\/$/, "");
if (!slug || !origin) {
  console.error("Usage: new-brand.mjs --slug <brand-slug> --origin https://<live-site>");
  process.exit(1);
}
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DIR = join(REPO, slug);
const CONTENT = join(DIR, "content");
const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36" };
const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#8217;|&rsquo;/g, "\u2019").replace(/&#8211;/g, "\u2013").replace(/&#8212;/g, "\u2014").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const toLocal = (href = "") => (href.startsWith(origin) ? href.slice(origin.length).replace(/\/$/, "") || "/" : href);
const w = (rel, content) => { const p = join(DIR, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, content.replace(/^\n/, "")); };
const run = (cmd, args, cwd = DIR) => {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) { console.error(`  -> exited ${r.status}`); process.exit(r.status ?? 1); }
};

if (existsSync(DIR)) { console.error(`${DIR} already exists — refusing to overwrite.`); process.exit(1); }

// ---------------------------------------------------------------------------
// 1. Inspect the live homepage
// ---------------------------------------------------------------------------
console.log(`Inspecting ${origin} ...`);
const html = await (await fetch(origin + "/?nowprocket=1", { headers: UA })).text();
const bodyClass = (html.match(/<body[^>]*class="([^"]+)"/) || [])[1] || "";
if (!bodyClass.includes("wp-theme-nearu-base")) {
  console.error(`This site does not run the NearU base theme (body: "${bodyClass}"). The kit's components/CSS pipeline assume it.`);
  process.exit(1);
}
const wpSiteId = Number((html.match(/\/wp-content\/uploads\/sites\/(\d+)\//) || [])[1]) || undefined;
const domain = new URL(origin).hostname;

// JSON-LD graph (AIOSEO)
let org = {}, local = {}, website = {};
const reviews = [];
for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
  try {
    const j = JSON.parse(m[1]);
    const nodes = j["@graph"] ?? [j];
    for (const n of nodes) {
      if (n["@type"] === "Organization") org = n;
      if (n["@type"] === "LocalBusiness") local = n;
      if (n["@type"] === "WebSite") website = n;
      if (n["@type"] === "Review") reviews.push({ author: n.author?.name, rating: Number(n.reviewRating?.ratingValue ?? 5), body: n.reviewBody });
    }
  } catch {}
}
const header = html.slice(html.indexOf('<header id="masthead"'), html.indexOf("</header>"));
const footer = html.slice(html.indexOf('<footer id="colophon"'), html.indexOf("</footer>"));
const siteTitle = decode((header.match(/<p class="site-title">\s*<a[^>]*>([\s\S]*?)<\/a>/) || [])[1]);
const headerTagline = decode((header.match(/<p class="site-description">([\s\S]*?)<\/p>/) || [])[1]);
const phoneHref = (header.match(/href="(tel:[^"]+)"/) || [])[1] || (local.telephone ? `tel:${local.telephone}` : "");
const phoneText = decode((header.match(/href="tel:[^"]+"[^>]*>([\s\S]*?)<\/a>/) || [])[1]);
const locationLabel = decode((header.match(/#icon-geopin[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/) || [])[1]);
const mapUrl = (footer.match(/href="(https:\/\/www\.google\.com\/maps[^"]+)"/) || header.match(/href="(https:\/\/www\.google\.com\/maps[^"]+)"/) || [])[1] || "";
const decodeUrl = (u = "") => u.replace(/&amp;|&#038;/g, "&").replace(/&#039;/g, "'");
const social = { facebook: "", instagram: "", linkedin: "", youtube: "" };
for (const m of footer.matchAll(/<a href="([^"]+)"[^>]*title="([^"]+)"/g)) {
  const t = m[2].toLowerCase();
  const u = decodeUrl(m[1]);
  if (t.includes("facebook")) social.facebook = u;
  else if (t.includes("instagram")) social.instagram = u;
  else if (t.includes("linkedin")) social.linkedin = u;
  else if (t.includes("youtube") || t.includes("social")) social.youtube = u;
}
const licenseLines = ((footer.match(/<p class="site-footer-licence">([\s\S]*?)<\/p>/) || [])[1] || "").split(/<br\s*\/?>/i).map(decode).filter(Boolean);
const logoTag = header.match(/<img[^>]*class="custom-logo"[^>]*>/)?.[0] || "";
const logoSrc = (logoTag.match(/\ssrc="([^"]+)"/) || [])[1];
const logoW = Number((logoTag.match(/width="(\d+)"/) || [])[1]) || undefined;
const logoH = Number((logoTag.match(/height="(\d+)"/) || [])[1]) || undefined;
const addr = org.address ?? local.address ?? {};
const stateAbbrev = (s = "") => ({ "south carolina": "SC", "north carolina": "NC", virginia: "VA", georgia: "GA", tennessee: "TN", florida: "FL", alabama: "AL" })[s.toLowerCase()] ?? s;
const founded = Number((headerTagline + " " + html).match(/\b[Ss]ince (\d{4})\b/)?.[1]) || undefined;
const rating = Number((html.match(/rating__score">\s*([\d.]+)\s*\//) || [])[1]) || undefined;
const reviewCount = Number((html.match(/number-of-reviews">\s*<span>\s*(\d+)/) || [])[1]) || undefined;
const cards = [...html.matchAll(/<a class="link stretch-link"[^>]*href="([^"]+)"[^>]*aria-label="Go to ([^"]+) page"><\/a>[\s\S]*?#icon-([a-z-]+)/g)].map((m) => ({
  slug: toLocal(m[1]).replace(/^\/services\//, ""),
  title: decode(m[2]),
  shortTitle: decode(m[2]).replace(/\s+(Services?|Systems?|Company)?\s+in\s+.*$/i, "").trim(),
  summary: "",
  image: "",
  icon: m[3],
}));
// Does /bookings exist (ServiceTitan landing page most brands have)?
let hasBookings = false;
try { const r = await fetch(origin + "/bookings/", { headers: UA, redirect: "manual" }); hasBookings = r.status < 400; } catch {}
// Location-page slug suffix: the most specific suffix shared by >= 3 top-level pages.
const smIdx = await (await fetch(origin + "/sitemap.xml", { headers: UA })).text();
let pagePaths = [];
for (const m of [...smIdx.matchAll(/<loc>(?:<!\[CDATA\[)?([^<\]]+)/g)].map((x) => x[1])) {
  const x = await (await fetch(m, { headers: UA })).text();
  pagePaths.push(...[...x.matchAll(/<loc>(?:<!\[CDATA\[)?([^<\]]+)/g)].map((q) => new URL(q[1]).pathname.replace(/\/$/, "")));
}
const suffixCounts = {};
for (const p of pagePaths.filter((p) => p.split("/").length === 2 && p.length > 1)) {
  const parts = p.slice(1).split("-");
  for (let i = 1; i < parts.length; i++) { const s = "-" + parts.slice(i).join("-"); suffixCounts[s] = (suffixCounts[s] || 0) + 1; }
}
const locationSlugSuffix = Object.entries(suffixCounts)
  .filter(([s, n]) => n >= 3 && /hvac|plumb|generator|electric|heating|cooling|air/.test(s))
  .sort((a, b) => b[1] * b[0].length - a[1] * a[0].length)[0]?.[0];

// ---------------------------------------------------------------------------
// 2. Scaffold the site folder (identical to the other brands)
// ---------------------------------------------------------------------------
const name = org.name || siteTitle || slug;
console.log(`\nScaffolding ${DIR} for "${name}" (${domain}) ...`);
w("package.json", JSON.stringify({
  name: `@nearu/${slug}`, version: "1.0.0", private: true,
  description: `${name} — ${domain}. A NearU brand website built on @nearu/site-kit.`,
  scripts: {
    dev: "next dev", build: "next build", start: "next start", lint: "eslint", typecheck: "tsc --noEmit",
    "content:pages": "nearu-list-pages", "content:theme-css": "nearu-build-theme-css", "content:sync": "nearu-extract-pages",
    "content:nav": "nearu-extract-nav", "db:migrate": "nearu-migrate", "db:migrate:content-only": "nearu-migrate --skip-images",
  },
  dependencies: { "@nearu/site-kit": "*", next: "16.3.5", react: "19.2.8", "react-dom": "19.2.8" },
  devDependencies: { "@types/node": "^20", "@types/react": "^19", "@types/react-dom": "^19", eslint: "^9", "eslint-config-next": "16.3.5", typescript: "^5" },
}, null, 2) + "\n");
w("next.config.ts", `
import { createSiteConfig } from "@nearu/site-kit/next-config";

// Everything this site needs from Next.js is shared with every other NearU
// brand; the only thing that identifies this site is its slug (its row in the
// shared Supabase \`sites\` table). See packages/site-kit/next-config.mjs.
export default createSiteConfig({ siteSlug: "${slug}" });
`);
// Copy the config files that are identical for every brand from an existing one.
const TEMPLATE = join(REPO, "2nd-wind");
for (const f of ["tsconfig.json", "eslint.config.mjs", ".gitignore", "app/page.tsx", "app/[...slug]/page.tsx", "app/not-found.tsx", "app/error.tsx", "app/global-error.tsx", "app/sitemap.ts", "app/robots.ts", "app/api/revalidate/route.ts", "app/layout.tsx", "vercel.json"]) {
  mkdirSync(dirname(join(DIR, f)), { recursive: true });
  copyFileSync(join(TEMPLATE, f), join(DIR, f));
}
if (existsSync(join(TEMPLATE, ".env.local"))) copyFileSync(join(TEMPLATE, ".env.local"), join(DIR, ".env.local"));
w(".env.example", readFileSync(join(TEMPLATE, ".env.example"), "utf8").replaceAll("2nd-wind", slug));
w("README.md", readFileSync(join(TEMPLATE, "README.md"), "utf8").replace(/^# .*$/m, `# ${name}`).replaceAll("2ndwindhvac.com", domain).replaceAll("2nd-wind", slug));

// ---------------------------------------------------------------------------
// 3. site.json (composed) + content pipeline
// ---------------------------------------------------------------------------
const site = {
  slug, company: "nearu",
  source: { origin, imageHosts: [], urlRewrites: [], extraPages: hasBookings ? ["/bookings"] : [], locationSlugSuffix: locationSlugSuffix ?? "", wpSiteId },
  theme: { bodyClass: "", preloadFonts: [] },
  business: {
    domain, name, legalName: siteTitle || name,
    tagline: decode(website.description || org.description || headerTagline),
    headerTagline, licenseLines,
    phone: phoneText || local.telephone || org.telephone || "", phoneHref,
    email: org.email || local.email || "",
    address: { street: addr.streetAddress || "", city: addr.addressLocality || "", state: stateAbbrev(addr.addressRegion || ""), zip: addr.postalCode || "" },
    areaServed: local.areaServed || addr.addressLocality || "", locationLabel: locationLabel || `${addr.addressLocality}, ${stateAbbrev(addr.addressRegion || "")}`,
    mapUrl,
    logo: "", logoWidth: logoW, logoHeight: logoH,
    foundedYear: founded, yearsInBusiness: founded ? new Date().getFullYear() - founded : undefined,
    googleRating: rating, googleReviewCount: reviewCount,
    social, scheduleUrl: hasBookings ? "/bookings" : "/about-us", youtubeVideoId: "",
  },
  topBanner: { html: "" },
  nav: { primary: [] }, footer: { columns: [] },
  serviceCategories: cards, certifications: [], testimonials: reviews.filter((r) => r.author && r.body), redirects: [],
};
// Logo: mirror it into content/images the same way the extractor lays out uploads.
if (logoSrc) {
  const m = new URL(logoSrc).pathname.match(/\/wp-content\/uploads\/(?:sites\/\d+\/)?(.+)$/);
  if (m) {
    const rel = m[1]; const dest = join(CONTENT, "images", ...rel.split("/"));
    mkdirSync(dirname(dest), { recursive: true });
    const res = await fetch(logoSrc, { headers: UA });
    if (res.ok) { writeFileSync(dest, Buffer.from(await res.arrayBuffer())); site.business.logo = "/images/" + rel; }
  }
}
mkdirSync(CONTENT, { recursive: true });
writeFileSync(join(CONTENT, "site.json"), JSON.stringify(site, null, 2) + "\n");

// Favicon
const icon = (html.match(/<link rel="icon" href="([^"]+)" sizes="192x192"/) || html.match(/<link rel="icon" href="([^"]+)"/) || [])[1];
if (icon) {
  const res = await fetch(icon, { headers: UA });
  if (res.ok) { const isIco = /\.ico(\?|$)/i.test(icon); writeFileSync(join(DIR, "app", isIco ? "favicon.ico" : "icon.png"), Buffer.from(await res.arrayBuffer())); }
}

// Root workspaces + install so the nearu-* bins exist for the new folder.
const rootPkgPath = join(REPO, "package.json");
const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));
if (!rootPkg.workspaces.includes(slug)) { rootPkg.workspaces.push(slug); writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n"); }
run("npm", ["install", "--no-audit", "--no-fund"], REPO);

run("npm", ["run", "content:pages"]);
run("npm", ["run", "content:theme-css"]);
run("npm", ["run", "content:sync"]);
const navOut = join(CONTENT, "chrome.json");
run("npm", ["run", "content:nav", "--", "--out", navOut]);

// Merge nav/footer/banner + discovered redirects into site.json.
const final = JSON.parse(readFileSync(join(CONTENT, "site.json"), "utf8"));
const chrome = JSON.parse(readFileSync(navOut, "utf8"));
final.nav = chrome.nav; final.footer = chrome.footer; final.topBanner = chrome.topBanner;
const redirectsPath = join(CONTENT, "redirects.json");
if (existsSync(redirectsPath)) final.redirects = JSON.parse(readFileSync(redirectsPath, "utf8"));
writeFileSync(join(CONTENT, "site.json"), JSON.stringify(final, null, 2) + "\n");
try { const { unlinkSync } = await import("node:fs"); unlinkSync(navOut); if (existsSync(redirectsPath)) unlinkSync(redirectsPath); } catch {}

// Sister-brand assets: NearU brands borrow images from each other's uploads
// (e.g. a shared "10 Year Worry-Free" cover photo). Anything still hot-linked
// after the first sync is on a host we didn't know about — declare it in
// source.imageHosts and re-sync just the affected pages so it gets mirrored
// under /images/ext/<host>/.
{
  const { readdirSync } = await import("node:fs");
  const hosts = new Set(); const affected = new Set();
  for (const f of readdirSync(join(CONTENT, "html"))) {
    const p = JSON.parse(readFileSync(join(CONTENT, "html", f), "utf8"));
    const found = p.html.match(/https?:\/\/[a-z0-9.-]+\/wp-content\/uploads\/[^\s"')>]+/g) || [];
    if (found.length) { affected.add(p.sourceUrl); found.forEach((u) => hosts.add(new URL(u).hostname)); }
  }
  if (hosts.size) {
    const s = JSON.parse(readFileSync(join(CONTENT, "site.json"), "utf8"));
    s.source.imageHosts = [...new Set([...s.source.imageHosts, ...hosts])];
    writeFileSync(join(CONTENT, "site.json"), JSON.stringify(s, null, 2) + "\n");
    console.log(`\nSister-brand image hosts found: ${[...hosts].join(", ")} — re-syncing ${affected.size} page(s) to mirror them.`);
    run("npm", ["run", "content:sync", "--", ...affected]);
  }
}

// ---------------------------------------------------------------------------
// 4. Report
// ---------------------------------------------------------------------------
const todo = [];
if (!final.business.logo) todo.push("business.logo (header logo could not be mirrored)");
if (!final.business.foundedYear) todo.push("business.foundedYear / yearsInBusiness (no 'since YYYY' found)");
if (!final.business.googleRating) todo.push("business.googleRating / googleReviewCount (no reviews block found)");
if (!final.source.locationSlugSuffix) todo.push("source.locationSlugSuffix (could not infer a shared location-page suffix)");
if (!final.business.email) todo.push("business.email");
if (!final.topBanner.html) todo.push("topBanner.html (no Simple Banner found — fine if the site has none)");
console.log(`\n✓ ${slug} scaffolded at ${DIR}`);
console.log(`  ${final.nav.primary.length} nav items, ${final.footer.columns.length} footer columns, ${final.serviceCategories.length} service cards, ${final.testimonials.length} testimonials, ${final.redirects.length} redirects, banner: ${final.topBanner.html ? "yes" : "no"}`);
console.log(`  business: ${final.business.name} | ${final.business.legalName} | ${final.business.phone} | ${final.business.address.street}, ${final.business.address.city}, ${final.business.address.state} ${final.business.address.zip}`);
if (todo.length) { console.log(`\nTODO — review these in ${slug}/content/site.json:`); todo.forEach((t) => console.log("  - " + t)); }
console.log(`\nNext:\n  cd ${slug}\n  npm run db:migrate\n  npm run build && npm start\n  (Vercel: new project, Root Directory = ${slug}, shared env vars)`);
