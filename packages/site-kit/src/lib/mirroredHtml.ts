/**
 * Render-time tweaks for mirrored WordPress HTML (the `pages.html` column).
 * These are things the browser needs that WordPress didn't emit and that are
 * cheaper to apply here than to re-migrate every brand for.
 */

/** Drops HTML comments (WordPress leaves commented-out blocks in page output — dead bytes). */
export function stripHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

/** How many leading images stay eager when WordPress gave the page no lazy-loading hints. */
const EAGER_IMAGE_COUNT = 1;

/**
 * Image loading strategy, measured against the live WordPress sites on a
 * throttled connection (where the hero image is the LCP element):
 *  - The first <img> is the hero / LCP candidate: `fetchpriority="high"` so
 *    the browser fetches it ahead of everything else on the image origin.
 *  - EVERY other image gets `fetchpriority="low"`. Native `loading="lazy"`
 *    alone is not enough: on slow connections Chrome pre-loads "lazy" images
 *    up to ~2500px below the fold, so 3–4 photos of 70–100KB each were
 *    downloading alongside the hero and delaying it by seconds. Low priority
 *    makes them queue behind the hero on the same connection instead.
 *  - If WordPress annotated the page with `loading="lazy"` (most page
 *    templates — e.g. 20 of 25 images on the homepage), its choices are kept.
 *    If it didn't (the service-page template ships every image eager: 37–42
 *    images / ~2MB on arrival), everything after the first EAGER_IMAGE_COUNT
 *    images also becomes `loading="lazy" decoding="async"`.
 */
export function tuneImages(html: string): string {
  const pageHasLazyHints = /\sloading=/i.test(html);
  let index = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const i = index++;
    let out = tag;
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
