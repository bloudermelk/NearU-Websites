import type { MetadataRoute } from "next";
import { getSite } from "@/lib/db/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { business } = await getSite();
  const base = `https://${business.domain}`;

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
