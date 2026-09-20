import Link from "next/link";
import { getSite } from "../lib/db/site";

/**
 * The sticky promo bar (e.g. "Order Your Home Generator!"). On the live site
 * this is injected by the Simple Banner WordPress plugin and prepended to
 * <body>; its CSS (.simple-banner / .simple-banner-text) is in theme.css.
 * Brands with no banner text (`sites.top_banner_text` null) render nothing —
 * the plugin itself emits an empty `display:none` div in that case.
 */
export async function SimpleBanner() {
  const { topBanner } = await getSite();
  if (!topBanner.text) return null;
  return (
    <div className="simple-banner" id="simple-banner">
      <div className="simple-banner-text">
        <Link href={topBanner.href}>{topBanner.text}</Link>
      </div>
    </div>
  );
}
