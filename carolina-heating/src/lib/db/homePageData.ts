import type { ImageStackItem } from "@/components/blocks/ImageStack";

/**
 * Shape of the `pages.data` jsonb column for the row where page_type = 'home'
 * (path '/'). Populated by the migration script from the site's original
 * content/pages/home.json.
 */
export type HomePageData = {
  hero: {
    title: string;
    body: string;
    image: string;
    secondaryImage: string;
    generatorCtaLabel: string;
    generatorCtaHref: string;
  };
  worryFree: {
    title: string;
    href: string;
  };
  promise: {
    heading: string;
    items: { label: string; description: string }[];
    images: ImageStackItem[];
  };
  whoWeAre: {
    heading: string;
    body: string;
    href: string;
  };
  ourCommunity: {
    mapImage: string;
  };
  maintenanceFinancing: {
    maintenanceImage: string;
    financingImage: string;
  };
};
