import fs from "node:fs";
import path from "node:path";

export type SubService = {
  title: string;
  description: string;
  image: string;
  href: string;
};

export type ProcessStep = {
  title: string;
  body: string;
};

export type ServiceCategoryContent = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  heroSubtitle: string;
  intro: string[];
  subServices: SubService[];
  involves: {
    heading: string;
    body: string;
    bullets: string[];
  };
  signs: {
    heading: string;
    body: string;
  };
  whyChooseUs: {
    heading: string;
    intro: string;
    bullets: string[];
  };
  process: {
    heading: string;
    steps: ProcessStep[];
  };
  qualified: {
    heading: string;
    body: string;
    bullets: string[];
    image: string;
  };
  closing: {
    heading: string;
    body: string;
  };
};

const SERVICES_DIR = path.join(process.cwd(), "content", "services");

export function getAllServiceCategorySlugs(): string[] {
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""));
}

export function getServiceCategoryContent(slug: string): ServiceCategoryContent | null {
  const filePath = path.join(SERVICES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ServiceCategoryContent;
}
