import type { IconName } from "../iconSprite";

/**
 * Shape of the `pages.data` jsonb column for the row where page_type = 'home'
 * (path '/'): a conversion-first landing homepage rendered by
 * `components/landing/LandingHome.tsx`. Populated by the migration script from
 * the brand's content/home.json.
 *
 * Copy strings may contain tokens that are filled from `sites` at render time
 * so brand facts never drift from the database:
 *   {name} {phone} {years} {founded} {areaServed} {rating} {reviewCount}
 *   {serviceCount} {city} {state}
 */
export type LandingImage = { src: string; alt: string; width: number; height: number };

export type LandingPageData = {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    image: LandingImage;
    /** Short trust statements shown under the CTAs (e.g. "43+ years in the Upstate"). */
    chips: string[];
  };
  form: {
    heading: string;
    sub: string;
    submitLabel: string;
    /** Text shown under the form pointing at the phone number. */
    phoneNote: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    body: string;
    /** The extra "not sure what's wrong? call" card at the end of the grid. */
    callCard: { heading: string; body: string };
  };
  offers: {
    eyebrow: string;
    heading: string;
    body: string;
    items: {
      icon: IconName;
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
      href: string;
      featured?: boolean;
    }[];
  };
  why: {
    eyebrow: string;
    heading: string;
    body: string;
    stats: { value: string; label: string }[];
    points: { label: string; description: string }[];
    photos: LandingImage[];
    ctaLabel: string;
    ctaHref: string;
    /** Falls back to sites.youtube_video_id when omitted. */
    videoId?: string;
  };
  steps: {
    eyebrow: string;
    heading: string;
    items: { title: string; body: string }[];
  };
  reviews: {
    eyebrow: string;
    heading: string;
  };
  area: {
    eyebrow: string;
    heading: string;
    body: string;
    map: LandingImage;
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    heading: string;
    body: string;
  };
};
