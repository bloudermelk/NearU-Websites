import fs from "node:fs";
import path from "node:path";

/**
 * Loader for pages mirrored from the original WordPress site into
 * content/html/*.json by scripts/extract-pages.mjs.
 *
 * Each file: { path, sourceUrl, title, description, ogImage, extractedAt, html }
 * `html` is the inner HTML of the original <main> and is rendered verbatim
 * inside <main id="primary" class="site-main | container"> by the catch-all
 * route, so the ported theme CSS applies exactly as on the live site.
 */
export type HtmlPage = {
  path: string;
  sourceUrl: string;
  title: string;
  description: string;
  ogImage: string;
  extractedAt: string;
  /** WordPress' per-page generated layout CSS (core-block-supports-inline-css). */
  inlineCss: string;
  html: string;
};

const HTML_DIR = path.join(process.cwd(), "content", "html");

function fileForPath(routePath: string): string {
  const slug = routePath.replace(/^\/+|\/+$/g, "");
  return path.join(HTML_DIR, `${slug.replace(/\//g, "__")}.json`);
}

export function getAllHtmlPagePaths(): string[] {
  if (!fs.existsSync(HTML_DIR)) return [];
  return fs
    .readdirSync(HTML_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(HTML_DIR, f), "utf-8")) as HtmlPage;
      return raw.path;
    })
    .filter((p) => p !== "/");
}

export function getHtmlPage(routePath: string): HtmlPage | null {
  const file = fileForPath(routePath);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as HtmlPage;
}
