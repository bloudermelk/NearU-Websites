// Real custom elements (`customElements.define(...)`) rendered directly as
// JSX tags to keep the exact markup the NearU theme's CSS/JS target:
//   - <cookie-consent>  nearu-base/dist/js/cookie-consent.js (CookieConsent.tsx)
//   - <lite-youtube>    vendor/lite-youtube-embed (YouTubeEmbed.tsx, ported
//     manually in that component rather than using the vendor JS)
// React 19 exports `JSX` as a named export of the "react" module itself
// (see node_modules/@types/react/jsx-runtime.d.ts: `export { JSX } from "./"`),
// not the classic global namespace — so IntrinsicElements must be augmented
// via `declare module "react"`, not `declare global`.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "cookie-consent": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "module-type"?: string;
      };
      "lite-youtube": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        videoid?: string;
      };
    }
  }
}
