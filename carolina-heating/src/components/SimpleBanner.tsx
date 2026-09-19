import Link from "next/link";
import { getSite } from "@/lib/db/site";

/**
 * The sticky yellow "Order Your Home Generator!" bar. On the live site this is
 * injected by the Simple Banner WordPress plugin and prepended to <body>; its
 * CSS (.simple-banner / .simple-banner-text) is already present in theme.css.
 */
export async function SimpleBanner() {
  const { topBanner } = await getSite();
  return (
    <div className="simple-banner" id="simple-banner">
      <div className="simple-banner-text">
        <Link href={topBanner.href}>{topBanner.text}</Link>
      </div>
    </div>
  );
}
