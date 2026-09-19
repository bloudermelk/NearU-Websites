import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimpleBanner } from "@/components/SimpleBanner";
import { ScrollbarWidth } from "@/components/ScrollbarWidth";
import { ICON_SPRITE } from "@/lib/iconSprite";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://carolinaheating.com"),
  title: {
    default: `${site.business.name} | ${site.business.tagline}`,
    template: `%s`,
  },
  description:
    "Carolina Heating Service, serving the Upstate for over 40 years making homes comfortable with professional HVAC, indoor air quality, plumbing, and generators!",
  openGraph: {
    siteName: site.business.name,
    images: [site.business.logo],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://carolinaheating.com/#organization",
        name: site.business.name,
        description: `Greenville's Trusted HVAC & Plumbing Services Since ${site.business.foundedYear}`,
        url: "https://carolinaheating.com/",
        email: site.business.email,
        telephone: site.business.phoneHref.replace("tel:", ""),
        logo: {
          "@type": "ImageObject",
          url: `https://carolinaheating.com${site.business.logo}`,
          width: 3468,
          height: 2120,
          caption: `${site.business.name} Logo`,
        },
        sameAs: [site.business.social.facebook, site.business.social.instagram],
        address: {
          "@type": "PostalAddress",
          streetAddress: site.business.address.street,
          addressLocality: site.business.address.city,
          addressRegion: "South Carolina",
          postalCode: site.business.address.zip,
          addressCountry: "US",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://carolinaheating.com/#localbusiness",
        name: site.business.name,
        url: "https://carolinaheating.com/",
        telephone: site.business.phoneHref.replace("tel:", ""),
        email: site.business.email,
        image: `https://carolinaheating.com${site.business.logo}`,
        areaServed: site.business.address.city,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.business.address.street,
          addressLocality: site.business.address.city,
          addressRegion: "South Carolina",
          postalCode: site.business.address.zip,
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
        "@id": "https://carolinaheating.com/#website",
        url: "https://carolinaheating.com/",
        name: site.business.name,
        description: `Greenville's Trusted HVAC & Plumbing Services Since ${site.business.foundedYear}`,
        inLanguage: "en-US",
        publisher: { "@id": "https://carolinaheating.com/#organization" },
      },
    ],
  };

  return (
    <html className="js" dir="ltr" lang="en-US" prefix="og: https://ogp.me/ns#">
      <head>
        {/* Self-hosted theme fonts (declared via @font-face in theme.css). Preload the two used above the fold. */}
        <link rel="preload" href="/fonts/Roboto-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Roboto-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/RobotoCondensed-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="wp-singular page-template-default page wp-custom-logo wp-theme-nearu-base wp-child-theme-chs no-sidebar">
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
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
