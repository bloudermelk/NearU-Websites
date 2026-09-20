import { getSite } from "../lib/db/site";

/**
 * The sticky promo bar across the top of every page (e.g. "Order Your Home
 * Generator!" / "Check Out All Our Special Coupon Offers and Promotions SAVE
 * NOW"). On the live sites this is the Simple Banner WordPress plugin, which
 * injects the bar with JavaScript from a per-site config; its CSS
 * (.simple-banner / .simple-banner-text, including each brand's colours) is
 * already in the brand's theme.css.
 *
 * The banner is stored as HTML (`sites.top_banner_text`) because brands
 * differ in shape — some are a single link, some are text with a partial
 * link. Internal <a> links inside it get client-side navigation from
 * ThemeBehaviors like any other mirrored link. Brands with no banner
 * (`top_banner_text` null/empty) render nothing, exactly like the plugin.
 */
export async function SimpleBanner() {
  const { topBanner } = await getSite();
  if (!topBanner.html) return null;
  return (
    <div className="simple-banner" id="simple-banner">
      <div className="simple-banner-text" dangerouslySetInnerHTML={{ __html: topBanner.html }} />
    </div>
  );
}
