import type { MetadataRoute } from "next";
import { getSite } from "../lib/db/site";
import { getSitemapEntries } from "../lib/db/pages";

/**
 * Replaces the live WordPress site's AIOSEO-generated sitemap index (which
 * split pages/posts/services into 3 files). One flat sitemap is well within
 * the 50k-URL limit for a single-brand marketing site.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ business }, entries] = await Promise.all([getSite(), getSitemapEntries()]);
  const base = `https://${business.domain}`;

  return entries.map(({ path, updatedAt }) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified: updatedAt,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").filter(Boolean).length === 1 ? 0.8 : 0.6,
  }));
}
