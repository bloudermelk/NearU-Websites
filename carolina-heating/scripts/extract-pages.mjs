/**
 * Extracts page content from the live carolinaheating.com WordPress site and
 * writes it into content/html/<slug>.json for the Next.js catch-all route to
 * render. Also downloads every referenced image into public/images/.
 *
 * Usage:
 *   node scripts/extract-pages.mjs              # all URLs in scripts/pages.txt
 *   node scripts/extract-pages.mjs <url> [...]  # specific URLs
 *
 * Each output JSON contains:
 *   { path, title, description, ogImage, html, extractedAt }
 * where `html` is the inner content of the original <main> element with
 * WordPress/WP-Rocket cruft removed and all URLs rewritten to local paths.
 *
 * The homepage is NOT extracted here; it is hand-built in src/app/page.tsx.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "content", "html");

// Hosts whose /wp-content/uploads/... images we mirror locally.
const IMAGE_HOSTS = [
  "carolinaheating.com",
  "carolinaheating.mojopsg.xyz",
  "energysaversair.com",
  "happyhomeheatingandcooling.com",
  "premiumacservice.mojopsg.xyz",
];

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
  const m = u.pathname.match(/\/wp-content\/uploads\/sites\/\d+\/(.+)$/);
  if (!m) return null;
  const rel = m[1];
  const primary = u.hostname === "carolinaheating.com" || u.hostname === "carolinaheating.mojopsg.xyz";
  return primary ? `/images/${rel}` : `/images/ext/${u.hostname}/${rel}`;
}

async function downloadImage(remoteUrl) {
  if (downloaded.has(remoteUrl)) return downloaded.get(remoteUrl);
  const local = localImagePath(remoteUrl);
  if (!local) return null;
  const dest = join(ROOT, "public", local.replace(/^\//, "").split("/").join("/"));
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

  // 1. Remove WP Rocket lazy-load placeholders: promote data-lazy-src -> src,
  //    drop data-lazy-srcset/sizes, drop <noscript> duplicates.
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, "");
  html = html.replace(/\ssrc="data:image\/svg\+xml[^"]*"/gi, "");
  html = html.replace(/\sdata-lazy-src="/gi, ' src="');
  html = html.replace(/\s(data-lazy-srcset|data-lazy-sizes|srcset|sizes)="[^"]*"/gi, "");

  // 2. Drop WordPress editor comments and title="" tooltips (WP media titles).
  html = html.replace(/<!--\s*\/?wp:[^>]*-->/g, "");
  html = html.replace(/\stitle="[^"]*- Carolina Heating Service Inc\."/g, "");

  // 3. Schedule buttons: the live site opens a ServiceTitan modal via
  //    _scheduler.show(...). Route to /bookings instead.
  html = html.replace(/<a\s+onclick="_scheduler\.show\([^"]*\)"/gi, '<a href="/bookings"');
  html = html.replace(/\sonclick="_scheduler\.show\([^"]*\)"/gi, "");

  // 4. Remove inline JSON-LD from inside main (we emit schema from the layout),
  //    and any WP Rocket-deferred <script> tags (they can't run inside
  //    dangerouslySetInnerHTML anyway; the only one is Mailchimp validation,
  //    which is progressive enhancement over a plain HTML form POST).
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<script[^>]*rocketlazyloadscript[^>]*>[\s\S]*?<\/script>/gi, "");

  // 5. Remove lite-youtube's fallback wrapper noise but keep the element.
  //    (lite-yt-embed.js is loaded globally in the layout.)

  // 5b. Known-broken sister-site asset: the financing pages reference an
  //     Upgrade-logo.png on energysaversair.com that 404s on the live site.
  //     The identical file exists on carolinaheating.com.
  html = html.replace(
    /https:\/\/energysaversair\.com\/wp-content\/uploads\/sites\/27\/2024\/03\/Upgrade-logo\.png/g,
    "https://carolinaheating.com/wp-content/uploads/sites/7/2024/03/Upgrade-logo.png"
  );

  // 6. Download images and rewrite their URLs to local paths.
  const imgRe = /(src|href)="(https?:\/\/[^"]+\/wp-content\/uploads\/[^"]+)"/gi;
  const seen = new Set();
  const matches = [...html.matchAll(imgRe)];
  for (const m of matches) {
    const remote = m[2];
    if (seen.has(remote)) continue;
    seen.add(remote);
    const u = new URL(remote);
    if (!IMAGE_HOSTS.includes(u.hostname)) continue;
    // Prefer the original-size file; WP serves "-WxH" derivatives.
    let local = await downloadImage(stripSizeSuffix(remote));
    if (!local) local = await downloadImage(remote); // fall back to sized variant
    if (local) {
      html = html.split(remote).join(local);
    }
  }

  // 7. Rewrite internal absolute links to root-relative, without trailing slash.
  html = html.replace(/href="https?:\/\/carolinaheating\.com\/?"/gi, 'href="/"');
  html = html.replace(/href="https?:\/\/carolinaheating\.com\/([^"#?]*?)\/?(#[^"]*)?(\?[^"]*)?"/gi, (_, p, hash = "", q = "") => {
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

async function processUrl(url) {
  // ?nowprocket=1 bypasses WP Rocket (no lazy-load placeholders, no inlined
  // "used CSS", no deferred scripts) so we get the canonical WordPress output.
  const fetchUrl = url + (url.includes("?") ? "&" : "?") + "nowprocket=1";
  const res = await fetch(fetchUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  const args = process.argv.slice(2);
  const urls = args.length
    ? args
    : readFileSync(join(__dirname, "pages.txt"), "utf8")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);

  console.log(`Extracting ${urls.length} page(s)...`);
  let ok = 0;
  for (const url of urls) {
    try {
      const r = await processUrl(url);
      ok++;
      console.log(`  OK   ${r.path}  (${r.bytes} chars)`);
    } catch (err) {
      console.log(`  FAIL ${url}: ${err.message}`);
    }
  }
  console.log(`\nDone: ${ok}/${urls.length} pages, ${downloaded.size} images mirrored.`);
  if (failedImages.length) {
    console.log(`\n${failedImages.length} image(s) failed to download:`);
    for (const f of failedImages) console.log("  " + f);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
