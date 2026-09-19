import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.business.name} | ${site.business.tagline}`,
    template: `%s | ${site.business.name}`,
  },
  description:
    "Carolina Heating Service, serving the Upstate for over 40 years making homes comfortable with professional HVAC, indoor air quality, plumbing, and generators!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.business.name,
    description: `Greenville's Trusted HVAC & Plumbing Services Since ${site.business.foundedYear}`,
    url: "https://carolinaheating.com/",
    email: site.business.email,
    telephone: site.business.phoneHref.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.business.address.street,
      addressLocality: site.business.address.city,
      addressRegion: site.business.address.state,
      postalCode: site.business.address.zip,
      addressCountry: "US",
    },
    sameAs: [site.business.social.facebook, site.business.social.instagram],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.business.name,
    telephone: site.business.phoneHref.replace("tel:", ""),
    email: site.business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.business.address.street,
      addressLocality: site.business.address.city,
      addressRegion: site.business.address.state,
      postalCode: site.business.address.zip,
      addressCountry: "US",
    },
    areaServed: site.business.address.city,
  };

  return (
    <html
      lang="en"
      className={`${roboto.variable} ${robotoCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
