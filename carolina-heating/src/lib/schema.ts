import type { SiteData } from "@/lib/site";

/**
 * Per-page JSON-LD: WebPage + a simple two-level BreadcrumbList (Home > this
 * page). Organization/LocalBusiness/WebSite schema is site-wide and lives in
 * `src/app/layout.tsx`; this covers the page-specific pieces the live site's
 * AIOSEO-generated `@graph` also includes.
 */
export function buildPageSchema(
  business: SiteData["business"],
  page: { path: string; title?: string | null; description?: string | null },
  dateModified?: string | null
) {
  const base = `https://${business.domain}`;
  const url = page.path === "/" ? `${base}/` : `${base}${page.path}`;
  const label = page.title ?? business.name;

  const breadcrumbItems = [{ "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }];
  if (page.path !== "/") {
    breadcrumbItems.push({ "@type": "ListItem", position: 2, name: label, item: url });
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumblist`,
        itemListElement: breadcrumbItems,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: label,
        description: page.description ?? undefined,
        inLanguage: "en-US",
        isPartOf: { "@id": `${base}/#website` },
        breadcrumb: { "@id": `${url}#breadcrumblist` },
        ...(dateModified ? { dateModified } : {}),
      },
    ],
  };
}
