/**
 * Render-time tweaks for mirrored WordPress HTML (the `pages.html` column).
 * These are things the browser needs that WordPress didn't emit and that are
 * cheaper to apply here than to re-migrate every brand for.
 */

/** Drops HTML comments (WordPress leaves commented-out blocks in page output — dead bytes). */
export function stripHtmlComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Marks the first non-lazy <img> as the high-priority (LCP) image so the
 * browser fetches it before render-blocking CSS/JS finish, and makes sure it
 * isn't lazy-loaded. WordPress only sets fetchpriority on the site logo, so
 * mirrored hero images otherwise start downloading late.
 */
export function prioritizeHeroImage(html: string): string {
  const imgRe = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html))) {
    const tag = m[0];
    if (/loading="lazy"/i.test(tag) || /fetchpriority=/i.test(tag)) continue;
    return html.slice(0, m.index) + tag.replace(/^<img\b/i, '<img fetchpriority="high"') + html.slice(m.index + tag.length);
  }
  return html;
}

/** Everything mirrored HTML gets before it's rendered. */
export function prepareMirroredHtml(html: string): string {
  return prioritizeHeroImage(stripHtmlComments(html));
}
