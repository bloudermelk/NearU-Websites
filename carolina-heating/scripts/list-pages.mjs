/**
 * Builds content/<slug>/pages.txt — the list of live-site URLs that
 * extract-pages.mjs and build-theme-css.mjs operate on — from the site's
 * AIOSEO sitemap index, plus any `source.extraPages` paths from site.json
 * (pages that exist but aren't in the sitemap, e.g. /bookings).
 *
 * Usage: node scripts/list-pages.mjs --site <slug>
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { brandDir, loadSiteJson, resolveSiteSlug } from "./lib/env.mjs";

const SLUG = resolveSiteSlug();
const SITE = loadSiteJson(SLUG);
const ORIGIN = SITE.source?.origin?.replace(/\/$/, "");
if (!ORIGIN) {
  console.error(`content/${SLUG}/site.json needs "source": { "origin": "https://..." }`);
  process.exit(1);
}
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

const locs = (xml) => [...xml.matchAll(/<loc>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\/loc>/g)].map((m) => m[1].trim());

const index = await fetchText(`${ORIGIN}/sitemap.xml`);
const sitemaps = locs(index);
const urls = new Set();
for (const sm of sitemaps) {
  const xml = await fetchText(sm);
  const found = locs(xml);
  console.log(`  ${sm.replace(ORIGIN, "")}: ${found.length}`);
  found.forEach((u) => urls.add(u));
}
for (const p of SITE.source?.extraPages ?? []) urls.add(`${ORIGIN}${p.startsWith("/") ? "" : "/"}${p}${p.endsWith("/") ? "" : "/"}`);

const out = join(brandDir(SLUG), "pages.txt");
writeFileSync(out, [...urls].sort().join("\n") + "\n");
console.log(`\nWrote ${urls.size} URLs to ${out}`);
