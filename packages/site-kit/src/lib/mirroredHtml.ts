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
const EAGER_IMAGE_COUNT = 2;

/**
 * Image loading strategy:
 *  - The first <img> is the hero / LCP candidate: `fetchpriority="high"` so
 *    the browser fetches it before render-blocking resources finish.
 *  - If WordPress annotated the page with `loading="lazy"` (it does on most
 *    page templates — e.g. 20 of 25 images on the homepage), its choices are
 *    respected.
 *  - If it didn't (the service-page template ships every image eager —
 *    measured at 37–42 images / ~2MB downloading on arrival, competing with
 *    the render), everything after the first EAGER_IMAGE_COUNT images becomes
 *    `loading="lazy" decoding="async"`.
 */
export function tuneImages(html: string): string {
  const pageHasLazyHints = /\sloading=/i.test(html);
  let index = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const i = index++;
    let out = tag;
    if (i === 0 && !/fetchpriority=/i.test(out) && !/loading="lazy"/i.test(out)) {
      out = out.replace(/^<img\b/i, '<img fetchpriority="high"');
    }
    if (!pageHasLazyHints && i >= EAGER_IMAGE_COUNT && !/\sloading=/i.test(out)) {
      out = out.replace(/^<img\b/i, '<img loading="lazy"');
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
