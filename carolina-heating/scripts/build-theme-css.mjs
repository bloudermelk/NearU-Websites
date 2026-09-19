/**
 * Assembles src/app/theme.css from the ORIGINAL (un-optimized) stylesheets of
 * the live WordPress site, in the exact order WordPress enqueues them.
 *
 * We fetch every page with `?nowprocket=1`, which bypasses WP Rocket's
 * "Remove Unused CSS" so we see the real <link>/<style> tags in <head>:
 *
 *   - <style id="wp-block-*-inline-css">  WordPress core block styles. Which
 *     blocks appear varies per page, so we union them across all pages (each
 *     id's content is identical wherever it appears).
 *   - <style id="global-styles-inline-css"> theme.json presets (--wp--preset-*)
 *   - <link> simple-banner.css, nearu-base/dist/css/style.css, chs/style.css,
 *     lite-yt-embed.min.css, formidable (forms plugin)
 *   - unnamed <style> blocks: Simple Banner settings, @font-face, site-title
 *   - <style id="wp-custom-css">  Customizer "Additional CSS"
 *   - <style id="core-block-supports-inline-css">  PER-PAGE generated layout
 *     rules (.wp-container-*, .wp-elements-*). These are NOT merged here; the
 *     page extractor stores each page's block in its JSON and the route emits
 *     it as a per-page <style>, exactly like WordPress does.
 *
 * Usage: node scripts/build-theme-css.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src", "app", "theme.css");
const ORIGIN = "https://carolinaheating.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const PER_PAGE_IDS = new Set(["core-block-supports-inline-css"]);
const SKIP_IDS = new Set(["wp-emoji-styles-inline-css", "simple-banner-site-custom-css-dummy"]);

function rewriteUrls(css) {
  return css
    .replace(/https:\/\/carolinaheating\.com\/wp-content\/themes\/chs\/fonts\//g, "/fonts/")
    .replace(/https:\/\/carolinaheating\.com\/wp-content\/themes\/nearu-base\/fonts\//g, "/fonts/")
    // theme css references fonts relatively (../fonts/...) from dist/css/
    .replace(/url\((['"]?)\.\.\/fonts\//g, "url($1/fonts/")
    .replace(/url\((['"]?)\.\.\/\.\.\/fonts\//g, "url($1/fonts/");
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

/** Parse <head> for stylesheet resources in document order. */
function parseHead(html) {
  const head = html.slice(0, html.indexOf("</head>"));
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*>|<style([^>]*)>([\s\S]*?)<\/style>/gi;
  const items = [];
  let m;
  while ((m = re.exec(head))) {
    if (m[0].startsWith("<link")) {
      const href = (m[0].match(/href=["']([^"']+)["']/) || [])[1];
      if (href) items.push({ kind: "link", href: href.split("?")[0], key: "link:" + href.split("?")[0] });
    } else {
      const id = (m[1].match(/id="([^"]+)"/) || [])[1] || "";
      const body = m[2].trim();
      if (!body) continue;
      const key = id ? "style:" + id : "style:anon:" + body.replace(/\s+/g, " ").slice(0, 120);
      items.push({ kind: "style", id, body, key });
    }
  }
  return items;
}

async function main() {
  const urls = [
    ORIGIN + "/",
    ...readFileSync(join(__dirname, "pages.txt"), "utf8")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean),
  ];

  // Ordered list of unique resources, first-seen order across pages. The
  // homepage goes first so its ordering forms the backbone; other pages only
  // append block styles the homepage didn't use, inserted right after the last
  // wp-block-* style we already have (to keep block css before theme css).
  const ordered = [];
  const seen = new Map(); // key -> index in ordered
  const linkCache = new Map();

  for (const url of urls) {
    let html;
    try {
      html = await fetchText(url + (url.includes("?") ? "&" : "?") + "nowprocket=1");
    } catch (e) {
      console.log(`  FAIL ${url}: ${e.message}`);
      continue;
    }
    const items = parseHead(html);
    let added = 0;
    for (const item of items) {
      if (item.kind === "style" && (PER_PAGE_IDS.has(item.id) || SKIP_IDS.has(item.id))) continue;
      if (seen.has(item.key)) continue;
      // Insert block styles after the last existing wp-block-* entry so they
      // still precede global-styles + theme css.
      if (item.kind === "style" && /^wp-block-/.test(item.id) && ordered.length) {
        let insertAt = ordered.length;
        for (let i = ordered.length - 1; i >= 0; i--) {
          if (ordered[i].kind === "style" && /^wp-block-/.test(ordered[i].id)) {
            insertAt = i + 1;
            break;
          }
        }
        ordered.splice(insertAt, 0, item);
        // re-index
        seen.clear();
        ordered.forEach((o, i) => seen.set(o.key, i));
      } else {
        seen.set(item.key, ordered.length);
        ordered.push(item);
      }
      added++;
    }
    console.log(`  ${url.replace(ORIGIN, "") || "/"}  +${added}`);
  }

  // Fetch linked stylesheets.
  const parts = [];
  for (const item of ordered) {
    if (item.kind === "link") {
      let css = linkCache.get(item.href);
      if (css === undefined) {
        try {
          css = await fetchText(item.href);
        } catch (e) {
          console.log(`  FAIL ${item.href}: ${e.message}`);
          css = "";
        }
        linkCache.set(item.href, css);
      }
      parts.push(`/* ===== ${item.href.replace(ORIGIN, "")} ===== */\n${rewriteUrls(css)}`);
    } else {
      parts.push(`/* ===== <style id="${item.id || "(inline)"}"> ===== */\n${rewriteUrls(item.body)}`);
    }
  }

  const header = `/*\n * Carolina Heating Service theme CSS.\n * Assembled by scripts/build-theme-css.mjs from the ORIGINAL stylesheets of the\n * live WordPress site (fetched with ?nowprocket=1 to bypass WP Rocket), in\n * WordPress enqueue order: core block styles -> theme.json presets -> plugins\n * -> NearU base theme -> CHS child theme -> customizer CSS.\n * Per-page generated rules (core-block-supports) are stored with each page in\n * content/html/*.json and emitted per page, not here.\n * Font URLs rewritten to /fonts/. Do not hand-edit; re-run the script to sync.\n */\n`;
  const out = header + parts.join("\n\n");
  writeFileSync(OUT, out, "utf8");
  console.log(`\nWrote ${OUT}: ${ordered.length} resources, ${out.length} chars.`);
  console.log("Order:");
  ordered.forEach((o) => console.log("  " + (o.kind === "link" ? o.href.replace(ORIGIN, "") : `<style id="${o.id || "(inline)"}">`)));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
