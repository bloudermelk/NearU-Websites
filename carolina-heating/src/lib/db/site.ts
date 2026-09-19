import "server-only";
import { cache } from "react";
import { getSupabaseServerClient, getSiteSlug, mediaUrl } from "../supabase/server";
import type {
  SiteData,
  NavTopItem,
  NavDropdownGroup,
  NavLink,
  ServiceCategorySummary,
  Certification,
  Testimonial,
} from "../site";

type NavItemRow = {
  id: string;
  parent_id: string | null;
  menu: "primary" | "footer";
  kind: "top" | "group" | "link";
  label: string | null;
  href: string | null;
  sort_order: number;
};

function buildPrimaryNav(rows: NavItemRow[]): NavTopItem[] {
  const byParent = new Map<string | null, NavItemRow[]>();
  for (const row of rows) {
    const key = row.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }
  const sortRows = (list: NavItemRow[]) => [...list].sort((a, b) => a.sort_order - b.sort_order);

  const tops = sortRows(byParent.get(null) ?? []).filter((r) => r.kind === "top");

  return tops.map((top): NavTopItem => {
    const children = sortRows(byParent.get(top.id) ?? []);
    if (children.length === 0) {
      return { label: top.label ?? "", href: top.href ?? undefined };
    }
    const groups: NavDropdownGroup[] = children.map((group) => {
      const links = sortRows(byParent.get(group.id) ?? []);
      const items: NavLink[] = links.map((l) => ({ label: l.label ?? "", href: l.href ?? "" }));
      return group.label ? { label: group.label, items } : { items };
    });
    return { label: top.label ?? "", href: top.href ?? undefined, groups };
  });
}

function buildFooterNav(rows: NavItemRow[]): NavLink[][] {
  const byParent = new Map<string | null, NavItemRow[]>();
  for (const row of rows) {
    const key = row.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }
  const sortRows = (list: NavItemRow[]) => [...list].sort((a, b) => a.sort_order - b.sort_order);

  const columns = sortRows(byParent.get(null) ?? []).filter((r) => r.kind === "group");
  return columns.map((col) =>
    sortRows(byParent.get(col.id) ?? []).map((l) => ({ label: l.label ?? "", href: l.href ?? "" }))
  );
}

/**
 * Loads everything the header/footer/homepage need for the current site
 * (SITE_SLUG). Wrapped in React's `cache()` so multiple server components
 * rendering in the same request share one set of queries.
 */
export const getSite = cache(async (): Promise<SiteData> => {
  const supabase = getSupabaseServerClient();
  const slug = getSiteSlug();

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("slug", slug)
    .single();
  if (siteError || !site) {
    throw new Error(`Site not found for SITE_SLUG="${slug}": ${siteError?.message ?? "no row"}`);
  }

  const [{ data: navRows }, { data: catRows }, { data: certRows }, { data: testiRows }] =
    await Promise.all([
      supabase
        .from("nav_items")
        .select("id, parent_id, menu, kind, label, href, sort_order")
        .eq("site_id", site.id),
      supabase
        .from("service_categories")
        .select("*")
        .eq("site_id", site.id)
        .order("sort_order"),
      supabase.from("certifications").select("*").eq("site_id", site.id).order("sort_order"),
      supabase.from("testimonials").select("*").eq("site_id", site.id).order("sort_order"),
    ]);

  const primaryRows = (navRows ?? []).filter((r) => r.menu === "primary") as NavItemRow[];
  const footerRows = (navRows ?? []).filter((r) => r.menu === "footer") as NavItemRow[];

  const serviceCategories: ServiceCategorySummary[] = (catRows ?? []).map((c) => ({
    slug: c.slug,
    title: c.title,
    shortTitle: c.short_title,
    summary: c.summary,
    image: mediaUrl(c.image_path),
  }));

  const certifications: Certification[] = (certRows ?? []).map((c) => ({
    name: c.name,
    image: mediaUrl(c.image_path),
    width: c.width,
    height: c.height,
  }));

  const testimonials: Testimonial[] = (testiRows ?? []).map((t) => ({
    author: t.author,
    rating: t.rating,
    body: t.body,
  }));

  return {
    business: {
      domain: site.domain ?? "",
      name: site.name,
      legalName: site.legal_name,
      tagline: site.tagline ?? "",
      phone: site.phone ?? "",
      phoneHref: site.phone_href ?? "",
      email: site.email ?? "",
      address: site.address ?? { street: "", city: "", state: "", zip: "" },
      areaServed: site.area_served ?? "",
      locationLabel: site.location_label ?? "",
      mapUrl: site.map_url ?? "",
      logo: mediaUrl(site.logo_path),
      foundedYear: site.founded_year,
      yearsInBusiness: site.years_in_business,
      googleRating: Number(site.google_rating),
      googleReviewCount: site.google_review_count,
      social: site.social ?? { facebook: "", instagram: "", linkedin: "", youtube: "" },
      scheduleUrl: site.schedule_url ?? "/bookings",
      youtubeVideoId: site.youtube_video_id ?? "",
      schedulerId: site.scheduler_id ?? undefined,
      schedulerApiKey: site.scheduler_api_key ?? undefined,
      gtmId: site.gtm_id ?? undefined,
      tealiumSrc: site.tealium_src ?? undefined,
    },
    topBanner: { text: site.top_banner_text ?? "", href: site.top_banner_href ?? "" },
    nav: { primary: buildPrimaryNav(primaryRows) },
    footer: { columns: buildFooterNav(footerRows) },
    serviceCategories,
    certifications,
    testimonials,
  };
});

export async function getServiceCategorySummary(
  slug: string
): Promise<ServiceCategorySummary | undefined> {
  const site = await getSite();
  return site.serviceCategories.find((c) => c.slug === slug);
}
