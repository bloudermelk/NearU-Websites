import { preload } from "react-dom";

/**
 * Render-time tweaks for mirrored WordPress HTML (the `pages.html` column).
 * These are things the browser needs that WordPress didn't emit and that are
 * cheaper to apply here than to re-migrate every brand for.
 */

/** Drops HTML comments (WordPress leaves commented-out blocks in page output — dead bytes). */
export function stripHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

// ---------------------------------------------------------------------------
// Image optimization for raw <img> tags
// ---------------------------------------------------------------------------

/**
 * Widths Next's image optimizer may be asked for. MUST match
 * `images.deviceSizes` in packages/site-kit/next-config.mjs. Includes the
 * sizes WordPress generates (300/768/1024/1536) so srcset candidates map 1:1.
 */
export const IMAGE_WIDTHS = [300, 640, 768, 1024, 1200, 1536, 1920, 2048, 2560, 3840];
const IMAGE_QUALITY = 75;
/** Fallback `src` width for browsers without srcset support (and the size the preload uses when no srcset). */
const FALLBACK_WIDTH = 1024;

function storageHost(): string | null {
  const u = process.env.SUPABASE_URL;
  return u ? new URL(u).hostname : null;
}

/** Is this an image URL in our Supabase Storage bucket that the optimizer can handle? */
function isOptimizable(url: string, host: string | null): boolean {
  if (!host || !url.includes(host) || !url.includes("/storage/v1/object/public/")) return false;
  return /\.(jpe?g|png|webp|avif)(\?|$)/i.test(url); // not svg/gif
}

/** Smallest allowed width >= w (the optimizer never upscales, so the returned image is min(w, source)). */
function allowedWidth(w: number): number {
  return IMAGE_WIDTHS.find((x) => x >= w) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
}

export function optimizedUrl(url: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${allowedWidth(width)}&q=${IMAGE_QUALITY}`;
}

/**
 * Rewrites one <img> tag's src/srcset to go through Next's image optimizer:
 * modern format (WebP), exact width, served from the site's own origin via
 * Vercel's edge cache — no second TLS connection to Supabase, ~40–60% fewer
 * bytes. Measured on the live WordPress site: its optimized hero was 31KB
 * where our original JPEG was 78KB. Returns the tag unchanged for images the
 * optimizer can't handle (SVG, GIF, foreign hosts).
 */
export function optimizeImgTag(tag: string): string {
  const host = storageHost();
  const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
  if (!src || !isOptimizable(src, host)) return tag;
  let out = tag;
  const srcset = (tag.match(/\ssrcset="([^"]+)"/) || [])[1];
  if (srcset) {
    const rewritten = srcset
      .split(",")
      .map((c) => {
        const [url, desc] = c.trim().split(/\s+/);
        const w = desc && /^\d+w$/.test(desc) ? Number(desc.slice(0, -1)) : FALLBACK_WIDTH;
        return isOptimizable(url, host) ? `${optimizedUrl(url, w)} ${desc ?? ""}`.trim() : c.trim();
      })
      .join(", ");
    out = out.replace(/\ssrcset="[^"]+"/, ` srcset="${rewritten}"`);
  }
  out = out.replace(/\ssrc="[^"]+"/, ` src="${optimizedUrl(src, FALLBACK_WIDTH)}"`);
  return out;
}

/** The first (hero) image's optimized src/srcset/sizes, for a <head> preload. */
export type HeroImage = { src: string; srcset?: string; sizes?: string };
export function heroImage(html: string): HeroImage | null {
  const tag = (html.match(/<img\b[^>]*>/i) || [])[0];
  if (!tag) return null;
  const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
  if (!src) return null;
  return {
    src,
    srcset: (tag.match(/\ssrcset="([^"]+)"/) || [])[1],
    sizes: (tag.match(/\ssizes="([^"]+)"/) || [])[1],
  };
}

/**
 * Declares the page's hero image as a high-priority preload in <head>, the
 * way the live WordPress sites do (<link rel="preload" as="image">). Measured:
 * without it the browser only discovered the hero when the parser reached the
 * <img> in the body — at ~0.9s, with 13 requests (scripts, fonts, other
 * images) already queued ahead of it; the live site requests its hero at
 * ~0.4s with nothing ahead of it. React 19's `preload()` hoists the link into
 * <head> during server rendering. Call it with the already-tuned HTML so the
 * preload matches the optimized src/srcset the <img> will actually use.
 */
export function preloadHero(tunedHtml: string): void {
  const hero = heroImage(tunedHtml);
  if (!hero) return;
  preload(hero.src, {
    as: "image",
    fetchPriority: "high",
    ...(hero.srcset ? { imageSrcSet: hero.srcset } : {}),
    ...(hero.sizes ? { imageSizes: hero.sizes } : {}),
  });
}

/** How many leading images stay eager when WordPress gave the page no lazy-loading hints. */
const EAGER_IMAGE_COUNT = 1;

/**
 * Image loading strategy, measured against the live WordPress sites on a
 * throttled connection (where the hero image is the LCP element):
 *  - The first <img> is the hero / LCP candidate: `fetchpriority="high"` so
 *    the browser fetches it ahead of everything else on the image origin
 *    (and the route preloads it from <head> — see heroImage()).
 *  - EVERY other image gets `fetchpriority="low"`. Native `loading="lazy"`
 *    alone is not enough: on slow connections Chrome pre-loads "lazy" images
 *    up to ~2500px below the fold, so 3–4 photos of 70–100KB each were
 *    downloading alongside the hero and delaying it by seconds. Low priority
 *    makes them queue behind the hero instead.
 *  - If WordPress annotated the page with `loading="lazy"` (most page
 *    templates — e.g. 20 of 25 images on the homepage), its choices are kept.
 *    If it didn't (the service-page template ships every image eager: 37–42
 *    images / ~2MB on arrival), everything after the first EAGER_IMAGE_COUNT
 *    images also becomes `loading="lazy" decoding="async"`.
 *  - All Storage-hosted raster images are routed through the optimizer.
 */
export function tuneImages(html: string): string {
  const pageHasLazyHints = /\sloading=/i.test(html);
  let index = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const i = index++;
    let out = optimizeImgTag(tag);
    const hasPriority = /fetchpriority=/i.test(out);
    if (i === 0) {
      if (!hasPriority && !/loading="lazy"/i.test(out)) out = out.replace(/^<img\b/i, '<img fetchpriority="high"');
    } else {
      if (!hasPriority) out = out.replace(/^<img\b/i, '<img fetchpriority="low"');
      if (!pageHasLazyHints && i >= EAGER_IMAGE_COUNT && !/\sloading=/i.test(out)) {
        out = out.replace(/^<img\b/i, '<img loading="lazy"');
      }
      if (!/\sdecoding=/i.test(out)) out = out.replace(/^<img\b/i, '<img decoding="async"');
    }
    return out;
  });
}

/** @deprecated use tuneImages — kept for callers/tests. */
export const prioritizeHeroImage = tuneImages;

/** Everything mirrored HTML gets before it's rendered. */
export function prepareMirroredHtml(html: string): string {
  return tuneImages(stripHtmlComments(html));
}
