/**
 * Shared types for a brand site's global data (business info, nav, footer,
 * service category summaries, certifications, testimonials).
 *
 * Data is fetched from Supabase per-request via `getSite()` in
 * `src/lib/db/site.ts` (server-only). This file holds only the shape.
 */

export type NavLink = {
  label: string;
  href: string;
};

export type NavDropdownGroup = {
  label?: string;
  items: NavLink[];
};

export type NavTopItem = {
  label: string;
  href?: string;
  groups?: NavDropdownGroup[];
};

export type ServiceCategorySummary = {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  image: string;
  /** Theme icon-sprite id (see src/lib/iconSprite.ts), e.g. "heating". */
  icon: string | null;
};

export type Certification = {
  name: string;
  image: string;
  width: number;
  height: number;
};

export type Testimonial = {
  author: string;
  rating: number;
  body: string;
};

/**
 * The company that owns this brand (NearU). Anything identical across every
 * brand site lives here once — in the `companies` table — instead of being
 * repeated per site or hardcoded in components.
 */
export type CompanyData = {
  slug: string;
  name: string;
  careersBaseUrl: string;
  /** Cookie-consent banner copy (may contain a link to the privacy policy). */
  cookieNoticeHtml: string;
  /** Footer legal links: Privacy Policy, CA Notice, Terms, Sitemap… */
  legalLinks: NavLink[];
};

export type SiteData = {
  company: CompanyData;
  business: {
    domain: string;
    name: string;
    legalName: string;
    tagline: string;
    /** Header strapline under the logo; empty string hides it. */
    headerTagline: string;
    /** Footer license line(s), e.g. ["License #M-116444"]. */
    licenseLines: string[];
    phone: string;
    phoneHref: string;
    email: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    areaServed: string;
    locationLabel: string;
    mapUrl: string;
    logo: string;
    /** Intrinsic pixel size of `logo` (for next/image aspect ratio). */
    logoWidth: number;
    logoHeight: number;
    foundedYear: number;
    yearsInBusiness: number;
    googleRating: number;
    googleReviewCount: number;
    social: {
      facebook: string;
      instagram: string;
      linkedin: string;
      youtube: string;
    };
    scheduleUrl: string;
    youtubeVideoId: string;
    /**
     * Third-party integration IDs. All optional/undefined by default — each
     * is only rendered if present, so a brand with no values set here (e.g.
     * a prototype/staging site) fires no external scripts at all. Fill in
     * via the `sites` table when actually going live for a given brand.
     */
    schedulerId?: string;
    schedulerApiKey?: string;
    gtmId?: string;
    tealiumSrc?: string;
  };
  /** Sticky promo bar. `html` is the banner's inner HTML (may contain an <a>); empty = no banner. */
  topBanner: {
    html: string;
  };
  /**
   * Build/markup hints from `sites.theme` (jsonb). The theme CSS itself is
   * bundled at build time from content/<slug>/theme.css (see
   * scripts/prebuild.mjs); this is just what the layout needs at runtime.
   */
  theme: {
    /** WordPress child-theme body class, e.g. "wp-child-theme-chs". */
    bodyClass: string;
    /** Above-the-fold font files (in /fonts/) to <link rel="preload">. */
    preloadFonts: string[];
  };
  nav: {
    primary: NavTopItem[];
  };
  footer: {
    columns: NavLink[][];
  };
  serviceCategories: ServiceCategorySummary[];
  certifications: Certification[];
  testimonials: Testimonial[];
};
