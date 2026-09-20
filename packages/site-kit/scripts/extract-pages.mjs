#!/usr/bin/env node
/**
 * Extracts page content from a brand's live WordPress site and writes it
 * into content/html/<page>.json for the Next.js catch-all route (and,
 * for brands whose homepage is mirrored rather than hand-built, "/" too).
 * Also downloads every referenced image — including every `srcset`
 * responsive variant WordPress generated — into content/images/.
 *
 * Usage:
 *   npm run content:sync              # all URLs in content/pages.txt
 *   npm run content:sync <url> [...]  # specific URLs
 *
 * Reads content/site.json:
 *   source.origin      https://<live-site>            (required)
 *   source.imageHosts  extra hosts whose /wp-content/uploads/ we mirror
 *                      (the origin host and its *.mojopsg.xyz staging alias
 *                      are always included; sister-brand hosts go here)
 *   business.scheduleUrl  where ServiceTitan "Schedule Now" buttons should
 *                      link when the widget isn't configured (default /bookings)
 *
 * Each output JSON contains:
 *   { path, sourceUrl, title, description, ogImage, extractedAt, inlineCss, html }
 * where `html` is the inner content of the original <main> element with
 * WordPress/WP-Rocket cruft removed and all URLs rewritten to local paths.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { brandDir, loadSiteJson, resolveSiteSlug } from "./lib/env.mjs";

const SLUG = resolveSiteSlug();
const SITE = loadSiteJson();
const ORIGIN = SITE.source?.origin?.replace(/\/$/, "");
if (!ORIGIN) {
  console.error(`content/site.json needs "source": { "origin": "https://..." }`);
  process.exit(1);
}
const ORIGIN_HOST = new URL(ORIGIN).hostname;
const BRAND_DIR = brandDir();
const OUT_DIR = join(BRAND_DIR, "html");
const IMAGES_DIR = join(BRAND_DIR, "images");
const SCHEDULE_FALLBACK = SITE.business?.scheduleUrl || "/bookings";

// Hosts whose /wp-content/uploads/... images we mirror. The brand's own host
// (and NearU's *.mojopsg.xyz staging alias for it, which WP sometimes leaks
// into src attributes) are "primary" and map to /images/...; any other host
// (shared sister-brand assets) maps to /images/ext/<host>/... to avoid clashes.
//
// NearU runs WordPress multisite, so a brand's uploads live under
// /wp-content/uploads/sites/<N>/ and can be served from ANY of the network's
// hostnames (e.g. 2nd Wind's site 30 assets showing up as
// carolinaheating.mojopsg.xyz/.../sites/30/...). `source.wpSiteId` in site.json
// lets us recognise those as our own regardless of host.
const PRIMARY_HOSTS = new Set([ORIGIN_HOST, `${ORIGIN_HOST.split(".")[0]}.mojopsg.xyz`]);
const WP_SITE_ID = SITE.source?.wpSiteId ? String(SITE.source.wpSiteId) : null;
const IMAGE_HOSTS = new Set([...PRIMARY_HOSTS, ...(SITE.source?.imageHosts ?? [])]);

/** Our own upload? (own host, or any NearU host serving our multisite id) */
function isPrimaryUpload(u) {
  if (PRIMARY_HOSTS.has(u.hostname)) return true;
  return !!WP_SITE_ID && /\.mojopsg\.xyz$/.test(u.hostname) && u.pathname.includes(`/wp-content/uploads/sites/${WP_SITE_ID}/`);
}
/** Anything we mirror at all: our uploads, or a declared sister-brand host. */
function isMirroredUpload(u) {
  return isPrimaryUpload(u) || IMAGE_HOSTS.has(u.hostname);
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const downloaded = new Map(); // remote url -> local path
const failedImages = [];

function slugFromUrl(url) {
  const u = new URL(url);
  const p = u.pathname.replace(/^\/+|\/+$/g, "");
  return p === "" ? "index" : p;
}

function pathFromUrl(url) {
  const u = new URL(url);
  const p = u.pathname.replace(/\/+$/g, "");
  return p === "" ? "/" : p;
}

/**
 * Map a remote upload URL to a local /images path. Preserves the year/month
 * folder so same-named files in different months don't collide. For the
 * non-primary hosts we prefix a folder with the host name.
 */
function localImagePath(remoteUrl) {
  const u = new URL(remoteUrl);
  const m = u.pathname.match(/\/wp-content\/uploads\/(?:sites\/\d+\/)?(.+)$/);
  if (!m) return null;
  const rel = m[1];
  return isPrimaryUpload(u) ? `/images/${rel}` : `/images/ext/${u.hostname}/${rel}`;
}

async function downloadImage(remoteUrl) {
  if (downloaded.has(remoteUrl)) return downloaded.get(remoteUrl);
  const local = localImagePath(remoteUrl);
  if (!local) return null;
  const dest = join(IMAGES_DIR, local.replace(/^\/images\//, "").split("/").join("/"));
  if (existsSync(dest)) {
    downloaded.set(remoteUrl, local);
    return local;
  }
  try {
    const res = await fetch(remoteUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    downloaded.set(remoteUrl, local);
    return local;
  } catch (err) {
    failedImages.push(`${remoteUrl} (${err.message})`);
    return null;
  }
}

/** Strip a "-300x200" style WP size suffix to get the original file URL. */
function stripSizeSuffix(url) {
  return url.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1");
}

function decodeEntities(s) {
  return s
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function cleanHtml(mainInner) {
  let html = mainInner;

  // 1. Remove WP Rocket lazy-load placeholders: promote data-lazy-src(set) ->
  //    src(set), drop <noscript> duplicates. We KEEP the real srcset/sizes so
  //    browsers pick the right-sized variant (these mirrored images can't go
  //    through next/image, so WordPress's own responsive variants are how they
  //    get right-sizing — see AGENTS.md).
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");
  html = html.replace(/\ssrc="data:image\/svg\+xml[^"]*"/gi, "");
  html = html.replace(/\ssrcset="[^"]*"(?=[^>]*data-lazy-srcset=)/gi, ""); // drop placeholder srcset when a lazy one exists
  html = html.replace(/\sdata-lazy-src="/gi, ' src="');
  html = html.replace(/\sdata-lazy-srcset="/gi, ' srcset="');
  html = html.replace(/\sdata-lazy-sizes="/gi, ' sizes="');
  // WP 6.7+ emits sizes="auto, ..." which older browsers choke on; plain list is equivalent.
  html = html.replace(/\ssizes="auto,\s*/gi, ' sizes="');

  // 2. Drop WordPress editor comments and title="" tooltips (WP media titles
  //    end in " - <Site Name>").
  html = html.replace(/<!--\s*\/?wp:[^>]*-->/g, "");
  html = html.replace(/\stitle="[^"]*? - [^"]*"/g, (m) => {
    // Only strip the WP-media-title pattern, not meaningful link titles.
    return /- [^"]*(Inc\.|HVAC|Heating|Air|Service)[^"]*"$/.test(m) ? "" : m;
  });

  // 3. Schedule buttons: the live site opens a ServiceTitan modal via
  //    _scheduler.show(...). Give them a real href so they work as plain links;
  //    ThemeBehaviors.tsx upgrades .se-widget-button clicks to the widget when
  //    it's configured for this site.
  html = html.replace(/<a\s+onclick="_scheduler\.show\([^"]*\)"/gi, `<a href="${SCHEDULE_FALLBACK}"`);
  html = html.replace(/\sonclick="_scheduler\.show\([^"]*\)"/gi, "");

  // 4. Remove inline JSON-LD from inside main (we emit schema from the layout),
  //    and any WP Rocket-deferred <script> tags (they can't run inside
  //    dangerouslySetInnerHTML anyway; the only one is Mailchimp validation,
  //    which is progressive enhancement over a plain HTML form POST).
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script[^>]*rocketlazyloadscript[^>]*>[\s\S]*?<\/script>/gi, "");

  // 5. Per-brand URL fixups declared in site.json (e.g. a sister-site asset
  //    that 404s on the live site but exists under this brand's uploads).
  for (const { from, to } of SITE.source?.urlRewrites ?? []) {
    html = html.split(from).join(to);
  }

  // 6. Download every referenced upload (src/href AND each srcset candidate)
  //    verbatim and rewrite its URL to the local path. We used to collapse
  //    to the original-size file only; now that srcset is preserved, each
  //    variant is mirrored as-is so the browser's choice actually exists.
  const urls = new Set();
  // Quoted and (a WordPress quirk) unquoted attribute values.
  for (const m of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+\/wp-content\/uploads\/[^"]+)"/gi)) urls.add(m[1]);
  for (const m of html.matchAll(/(?:src|href)=(https?:\/\/[^\s"'>]+\/wp-content\/uploads\/[^\s"'>]+)/gi)) urls.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/gi)) {
    for (const cand of m[1].split(",")) {
      const u = cand.trim().split(/\s+/)[0];
      if (/^https?:\/\/.+\/wp-content\/uploads\//.test(u)) urls.add(u);
    }
  }
  // Longest first so "foo-300x200.jpg" is replaced before "foo.jpg" could clobber it.
  for (const remote of [...urls].sort((a, b) => b.length - a.length)) {
    if (!isMirroredUpload(new URL(remote))) continue;
    let local = await downloadImage(remote);
    if (!local && remote !== stripSizeSuffix(remote)) local = await downloadImage(stripSizeSuffix(remote));
    if (local) html = html.split(remote).join(local);
  }

  // 7. Rewrite internal absolute links to root-relative, without trailing slash.
  const originRe = ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/^https:/, "https?:");
  html = html.replace(new RegExp(`href="${originRe}/?"`, "gi"), 'href="/"');
  html = html.replace(new RegExp(`href="${originRe}/([^"#?]*?)/?(#[^"]*)?(\\?[^"]*)?"`, "gi"), (_, p, hash = "", q = "") => {
    return `href="/${p}${q}${hash}"`;
  });
  // Also normalize root-relative links that still carry trailing slashes.
  html = html.replace(/href="(\/[^"#?]+?)\/(#[^"]*)?"/g, 'href="$1$2"');

  // 8. Collapse excess whitespace lines.
  html = html.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  return html.trim();
}

function extractMeta(fullHtml) {
  const title = (fullHtml.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const desc =
    (fullHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
  const og = (fullHtml.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i) || [])[1] || "";
  return { title: decodeEntities(title.trim()), description: decodeEntities(desc.trim()), ogImage: og };
}

function extractMainInner(fullHtml) {
  const start = fullHtml.search(/<main[^>]*>/i);
  if (start < 0) throw new Error("no <main>");
  const openEnd = fullHtml.indexOf(">", start) + 1;
  const end = fullHtml.lastIndexOf("</main>");
  return fullHtml.slice(openEnd, end);
}

/**
 * WordPress generates per-page layout CSS (.wp-container-core-*-is-layout-*,
 * .wp-elements-N) into <style id="core-block-supports-inline-css">. Those
 * class hashes are unique per page, so we ship this block with the page.
 */
function extractPerPageCss(fullHtml) {
  const m = fullHtml.match(/<style id="core-block-supports-inline-css"[^>]*>([\s\S]*?)<\/style>/i);
  return m ? m[1].trim() : "";
}

const redirects = []; // { source, destination } discovered while extracting

async function processUrl(url) {
  // ?nowprocket=1 bypasses WP Rocket (no lazy-load placeholders, no inlined
  // "used CSS", no deferred scripts) so we get the canonical WordPress output.
  const fetchUrl = url + (url.includes("?") ? "&" : "?") + "nowprocket=1";
  const res = await fetch(fetchUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Sitemaps routinely list URLs that 301 elsewhere (retired location pages
  // pointing at "/", /careers -> /about-us, ...). Mirroring the destination's
  // HTML under the old path would create duplicate pages; record a redirect
  // for the `redirects` table instead and skip the page.
  // (pathFromUrl ignores the query string, so a same-path redirect that only
  // adds a param — e.g. /bookings -> /bookings/?directRouter=true — is not
  // treated as a redirect; the page is extracted normally.)
  const finalPath = pathFromUrl(res.url);
  if (finalPath !== pathFromUrl(url)) {
    redirects.push({ source: pathFromUrl(url), destination: finalPath });
    return { path: pathFromUrl(url), redirectedTo: finalPath };
  }

  const fullHtml = await res.text();
  const meta = extractMeta(fullHtml);
  const mainInner = extractMainInner(fullHtml);
  const html = await cleanHtml(mainInner);
  const inlineCss = extractPerPageCss(fullHtml);

  const path = pathFromUrl(url);
  const slug = slugFromUrl(url);
  const outFile = join(OUT_DIR, `${slug.replace(/\//g, "__")}.json`);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    outFile,
    JSON.stringify(
      {
        path,
        sourceUrl: url,
        title: meta.title,
        description: meta.description,
        ogImage: meta.ogImage ? (await downloadImage(stripSizeSuffix(meta.ogImage))) || meta.ogImage : "",
        extractedAt: new Date().toISOString(),
        inlineCss,
        html,
      },
      null,
      2
    )
  );
  return { path, outFile, bytes: html.length };
}

async function main() {
  // Positional args (after stripping) are explicit URLs.
  const args = process.argv.slice(2);
  const urls = args.length
    ? args
    : readFileSync(join(BRAND_DIR, "pages.txt"), "utf8")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

  console.log(`Extracting ${urls.length} page(s) for "${SLUG}" from ${ORIGIN}...`);
  let ok = 0;
  for (const url of urls) {
    try {
      const r = await processUrl(url);
      if (r.redirectedTo) {
        console.log(`  301  ${r.path}  ->  ${r.redirectedTo}  (recorded as redirect, not mirrored)`);
        continue;
      }
      ok++;
      console.log(`  OK   ${r.path}  (${r.bytes} chars)`);
    } catch (err) {
      console.log(`  FAIL ${url}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${ok}/${urls.length} pages, ${downloaded.size} images mirrored.`);
  if (redirects.length) {
    console.log(`\n${redirects.length} URL(s) redirect on the live site. Add these to content/site.json "redirects" (and remove any stale html/*.json for them):`);
    for (const r of redirects) console.log(`  { "source": "${r.source}", "destination": "${r.destination}", "permanent": true },`);
  }
  if (failedImages.length) {
    console.log(`\n${failedImages.length} image(s) failed to download:`);
    for (const f of failedImages) console.log("  " + f);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
