import fs from "node:fs";
import path from "node:path";

export type LocationServiceItem = {
  title: string;
  body: string;
  href: string;
};

export type LocationServiceGroup = {
  groupIntro: string;
  items: LocationServiceItem[];
  partnerHeading: string;
  partnerBody: string;
};

export type LocationSinceCategory = {
  label: string;
  bullets: { title: string; body: string }[];
};

export type LocationFaq = {
  question: string;
  answer: string;
};

export type LocationContent = {
  slug: string;
  cityName: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string[];
  heroImage: string;
  serviceGroups: LocationServiceGroup[];
  sinceHeading: string;
  sinceIntro: string;
  sinceCategories: LocationSinceCategory[];
  closing: string[];
  faqs: LocationFaq[];
};

const LOCATIONS_DIR = path.join(process.cwd(), "content", "locations");

export function getAllLocationSlugs(): string[] {
  if (!fs.existsSync(LOCATIONS_DIR)) return [];
  return fs
    .readdirSync(LOCATIONS_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""));
}

export function getLocationContent(slug: string): LocationContent | null {
  const filePath = path.join(LOCATIONS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as LocationContent;
}

export function getAllLocations(): { slug: string; cityName: string }[] {
  return getAllLocationSlugs()
    .map((slug) => {
      const content = getLocationContent(slug);
      return content ? { slug, cityName: content.cityName } : null;
    })
    .filter((x): x is { slug: string; cityName: string } => x !== null);
}
