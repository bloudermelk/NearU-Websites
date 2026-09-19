import { getAllServiceCategorySlugs, getServiceCategoryContent, SubService } from "./serviceCategories";

export type ResolvedSubService = SubService & {
  categorySlug: string;
  subServiceSlug: string;
  categoryTitle: string;
};

function parseHref(href: string): { categorySlug: string; subServiceSlug: string } | null {
  // Expected shape: /services/<category-slug>/<subservice-slug>
  const match = href.match(/^\/services\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;
  return { categorySlug: match[1], subServiceSlug: match[2] };
}

let cache: Map<string, ResolvedSubService> | null = null;

function buildIndex(): Map<string, ResolvedSubService> {
  if (cache) return cache;
  const index = new Map<string, ResolvedSubService>();

  for (const categorySlug of getAllServiceCategorySlugs()) {
    const category = getServiceCategoryContent(categorySlug);
    if (!category) continue;

    for (const sub of category.subServices) {
      const parsed = parseHref(sub.href);
      if (!parsed) continue;
      // Only index sub-services whose canonical category matches the folder
      // they actually live under (skips duplicate cross-links, e.g. cooling
      // page linking to heating's smart-thermostats).
      if (parsed.categorySlug !== categorySlug) continue;

      const key = `${parsed.categorySlug}/${parsed.subServiceSlug}`;
      if (!index.has(key)) {
        index.set(key, {
          ...sub,
          categorySlug: parsed.categorySlug,
          subServiceSlug: parsed.subServiceSlug,
          categoryTitle: category.title,
        });
      }
    }
  }

  cache = index;
  return index;
}

export function getAllSubServiceParams(): { category: string; subservice: string }[] {
  const index = buildIndex();
  return Array.from(index.values()).map((entry) => ({
    category: entry.categorySlug,
    subservice: entry.subServiceSlug,
  }));
}

export function getSubServiceContent(
  categorySlug: string,
  subServiceSlug: string
): ResolvedSubService | null {
  const index = buildIndex();
  return index.get(`${categorySlug}/${subServiceSlug}`) ?? null;
}
