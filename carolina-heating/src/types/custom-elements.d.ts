import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /** The lite-youtube-embed web component used by the NearU theme. */
      "lite-youtube": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        videoid?: string;
        playlabel?: string;
      };
    }
  }
}
