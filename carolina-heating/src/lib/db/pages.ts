import "server-only";
import { cache } from "react";
import { getSupabaseServerClient, getSiteSlug } from "../supabase/server";

export type PageRow = {
  path: string;
  page_type: "home" | "mirrored" | "blog_post" | "custom";
  title: string | null;
  description: string | null;
  og_image_path: string | null;
  inline_css: string | null;
  html: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  source_url: string | null;
  updated_at: string;
};

/** Resolves the current site's UUID from SITE_SLUG. Cached per-request. */
export const getSiteId = cache(async (): Promise<string> => {
  const supabase = getSupabaseServerClient();
  const slug = getSiteSlug();
  const { data, error } = await supabase.from("sites").select("id").eq("slug", slug).single();
  if (error || !data) throw new Error(`Site not found for SITE_SLUG="${slug}": ${error?.message}`);
  return data.id;
});

/** Fetch a single page by its route path (e.g. "/", "/about-us"). */
export const getPage = cache(async (routePath: string): Promise<PageRow | null> => {
  const supabase = getSupabaseServerClient();
  const siteId = await getSiteId();
  const { data, error } = await supabase
    .from("pages")
    .select("path, page_type, title, description, og_image_path, inline_css, html, data, source_url, updated_at")
    .eq("site_id", siteId)
    .eq("path", routePath)
    .maybeSingle();
  if (error) throw new Error(`Failed to load page "${routePath}": ${error.message}`);
  return data;
});

/** All page paths for this site except "/" (which is handled by app/page.tsx). */
export async function getAllPagePaths(): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  const siteId = await getSiteId();
  const { data, error } = await supabase.from("pages").select("path").eq("site_id", siteId).neq("path", "/");
  if (error) throw new Error(`Failed to list page paths: ${error.message}`);
  return (data ?? []).map((row) => row.path);
}

/** Every page (including "/") with its last-modified date, for sitemap.xml. */
export async function getSitemapEntries(): Promise<{ path: string; updatedAt: string }[]> {
  const supabase = getSupabaseServerClient();
  const siteId = await getSiteId();
  const { data, error } = await supabase.from("pages").select("path, updated_at").eq("site_id", siteId);
  if (error) throw new Error(`Failed to list sitemap entries: ${error.message}`);
  return (data ?? []).map((row) => ({ path: row.path, updatedAt: row.updated_at }));
}
