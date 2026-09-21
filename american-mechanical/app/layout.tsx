import type { ReactNode } from "react";
import KitLayout, { generateMetadata } from "@nearu/site-kit/routes/layout";
import { themeCss } from "./theme-css"; // generated from ./theme.css by `npm run content:theme-css`

export { generateMetadata };

// This brand's theme CSS is inlined into <head> by the kit layout (see the
// comment there for the measured reason), so nothing imports theme.css as a
// stylesheet.
export default function RootLayout({ children }: { children: ReactNode }) {
  return <KitLayout themeCss={themeCss}>{children}</KitLayout>;
}
