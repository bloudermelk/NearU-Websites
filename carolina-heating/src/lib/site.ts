import siteData from "../../content/site.json";

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

export type SiteData = {
  business: {
    name: string;
    legalName: string;
    tagline: string;
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
  };
  topBanner: {
    text: string;
    href: string;
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

export const site = siteData as SiteData;

export function getServiceCategorySummary(slug: string): ServiceCategorySummary | undefined {
  return site.serviceCategories.find((category) => category.slug === slug);
}
