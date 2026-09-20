import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SimpleBanner } from "../components/SimpleBanner";
import { ScrollbarWidth } from "../components/ScrollbarWidth";
import { ThemeBehaviors } from "../components/ThemeBehaviors";
import { CookieConsent } from "../components/CookieConsent";
import { ICON_SPRITE } from "../lib/iconSprite";
import { getSite } from "../lib/db/site";

export async function generateMetadata(): Promise<Metadata> {
  const { business } = await getSite();
  const base = `https://${business.domain}`;
  return {
    metadataBase: new URL(base),
    title: {
      default: `${business.name} | ${business.tagline}`,
      template: `%s`,
    },
    description: `${business.legalName} — ${business.tagline}`,
    openGraph: {
      siteName: business.name,
      images: [business.logo],
    },
  };
}

/**
 * Small global rules shared by every brand, inlined together with the brand's
 * theme CSS. (Loading placeholder for photos inside mirrored WordPress HTML:
 * those <img> tags are raw markup, so they can't use next/image's blur
 * placeholder, but they carry width/height, so a neutral background fills the
 * correctly-sized box until the bytes arrive. Scoped to JPEGs — always opaque —
 * so transparent PNG logos don't pick up a gray backdrop.)
 */
const GLOBAL_CSS = `.site-main img[src$=".jpg"],.site-main img[src$=".jpeg"]{background-color:#eee}`;

export default async function RootLayout({ children, themeCss }: { children: ReactNode; themeCss: string }) {
  const site = await getSite();
  const { business } = site;
  const base = `https://${business.domain}`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: business.name,
        description: `${business.areaServed} — ${business.tagline}`,
        url: `${base}/`,
        email: business.email,
        telephone: business.phoneHref.replace("tel:", ""),
        logo: {
          "@type": "ImageObject",
          url: business.logo,
          caption: `${business.name} Logo`,
        },
        sameAs: [business.social.facebook, business.social.instagram],
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address.street,
          addressLocality: business.address.city,
          addressRegion: business.address.state,
          postalCode: business.address.zip,
          addressCountry: "US",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${base}/#localbusiness`,
        name: business.name,
        url: `${base}/`,
        telephone: business.phoneHref.replace("tel:", ""),
        email: business.email,
        image: business.logo,
        areaServed: business.address.city,
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address.street,
          addressLocality: business.address.city,
          addressRegion: business.address.state,
          postalCode: business.address.zip,
          addressCountry: "US",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "https://schema.org/Monday",
            "https://schema.org/Tuesday",
            "https://schema.org/Wednesday",
            "https://schema.org/Thursday",
            "https://schema.org/Friday",
            "https://schema.org/Saturday",
            "https://schema.org/Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: business.name,
        description: `${business.areaServed} — ${business.tagline}`,
        inLanguage: "en-US",
        publisher: { "@id": `${base}/#organization` },
      },
    ],
  };

  const { schedulerId, schedulerApiKey, gtmId, tealiumSrc } = business;
  // WordPress's boilerplate body classes (wp-singular, wp-theme-*, wp-child-theme-*,
  // no-sidebar, …) were verified unused by every rule in both brands' theme CSS,
  // so they're not emitted: they were inert bytes and a "this is WordPress"
  // fingerprint for tech-stack detectors. `sites.theme.bodyClass` remains for a
  // brand whose CSS genuinely needs a body hook.
  const bodyClass = site.theme.bodyClass || undefined;

  return (
    <html className="js" dir="ltr" lang="en-US" prefix="og: https://ogp.me/ns#">
      <head>
        {/* The brand's entire theme stylesheet, INLINE. Measured against the live
            WordPress sites (which inline their critical CSS via WP Rocket): with the
            CSS as a separate <link>, first paint waited on a second request that
            competed on a slow link with the hero image and async JS — 1.5–2.5s
            later to the H1. Inline here it arrives with the HTML, so the page paints
            as soon as the document lands. The layout is only sent on the entry
            visit; client-side navigations fetch page payloads without it (unlike
            Next's experimental.inlineCss, which repeated the CSS in every payload).
            Compressed cost is unchanged (~38KB brotli); the raw duplicate in the RSC
            flight data compresses to almost nothing. */}
        <style id="theme-css" dangerouslySetInnerHTML={{ __html: themeCss + "\n" + GLOBAL_CSS }} />
        {/* Theme fonts are self-hosted in the brand's /public/fonts and declared via
            @font-face in its theme.css with `font-display: fallback`, so text paints
            in a fallback font immediately and swaps when the font arrives.
            `sites.theme.preloadFonts` can force high-priority preloads, but LEAVE IT
            EMPTY by default: the theme's Roboto files are ~64KB each, and preloading
            three of them (192KB at "high" priority) was measured to starve the 38KB
            stylesheet the first paint depends on — several seconds slower to the H1
            on slow connections, on every first visit. */}
        {site.theme.preloadFonts.map((f) => (
          <link key={f} rel="preload" href={`/fonts/${f}`} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        {/* Most page content (the 106 mirrored WordPress pages) embeds raw
            <img src="https://<project>.supabase.co/..."> tags that the browser
            fetches directly (they're not next/image-optimized — see AGENTS.md).
            Opening the connection to Supabase Storage early shaves off the
            DNS+TLS handshake latency that would otherwise happen at the first
            image request. */}
        {process.env.SUPABASE_URL && <link rel="preconnect" href={process.env.SUPABASE_URL} crossOrigin="anonymous" />}
        {/* Google Tag Manager — only fires if this site's `sites.gtm_id` is set.
            Using the raw snippet (matching the live site's own implementation)
            rather than @next/third-parties/google, which currently only
            publishes versions tracking Next's 16.4 canary line — not worth
            pulling a canary dependency into a production app for this. */}
        {gtmId && (
          // eslint-disable-next-line @next/next/next-script-for-ga
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
        )}
      </head>
      <body className={bodyClass} data-scheduler-id={schedulerId || undefined}>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {/* ServiceTitan scheduler widget — only loaded if configured for this site. */}
        {schedulerId && schedulerApiKey && (
          <script
            data-api-key={schedulerApiKey}
            data-schedulerid={schedulerId}
            defer
            id="se-widget-embed"
            src="https://embed.scheduler.servicetitan.com/scheduler-v1.js"
          />
        )}
        {/* Tealium tag management — only loaded if configured for this site. */}
        {tealiumSrc && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(a,b,c,d){a='${tealiumSrc}';b=document;c='script';d=b.createElement(c);d.src=a;d.type='text/javascript';d.async=true;a=b.getElementsByTagName(c)[0];a.parentNode.insertBefore(d,a);})();`,
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Inline SVG icon sprite, exactly as the original theme prints it right after <body>. */}
        <div dangerouslySetInnerHTML={{ __html: ICON_SPRITE }} />
        <ScrollbarWidth />
        <SimpleBanner />
        <div id="page" className="site">
          <a className="skip-link screen-reader-text" href="#primary">
            Skip to content
          </a>
          <Header site={site} />
          {children}
          <Footer />
        </div>
        <CookieConsent noticeHtml={site.company.cookieNoticeHtml} />
        <ThemeBehaviors />
      </body>
    </html>
  );
}
