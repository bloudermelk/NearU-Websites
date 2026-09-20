/**
 * Shimmer placeholder for `next/image`'s `placeholder="blur"` on images whose
 * `src` is a dynamic Supabase Storage URL (not a statically-imported local
 * file), so Next.js can't auto-generate a real blurred preview.
 *
 * Without this, there's a visible blank gap between a client-side navigation
 * completing and the destination page's image actually finishing its
 * (optimize + fetch) round trip — Next.js prefetches the route's data, not
 * the image bytes. A shimmer placeholder fills that gap with something
 * instead of empty space, which is what actually matters for perceived
 * performance (the real fix — a warm image cache — only helps repeat
 * requests for the same size, not a brand new visitor/size combo).
 */
function shimmerSvg(w: number, h: number) {
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#eee" offset="20%" />
      <stop stop-color="#ddd" offset="50%" />
      <stop stop-color="#eee" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#eee" />
  <rect width="${w}" height="${h}" fill="url(#g)" />
</svg>`;
}

function toBase64(str: string) {
  return typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
}

export function shimmerDataUrl(width: number, height: number): string {
  return `data:image/svg+xml;base64,${toBase64(shimmerSvg(width, height))}`;
}
