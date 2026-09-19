import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPagePaths, getPage } from "@/lib/db/pages";
import { mediaUrl } from "@/lib/supabase/server";
import { getSite } from "@/lib/db/site";
import { buildPageSchema } from "@/lib/schema";

/**
 * Catch-all route that serves every page stored in Supabase for this site's
 * SITE_SLUG (the `pages` table). The homepage ("/") is handled separately by
 * app/page.tsx.
 *
 * `dynamicParams = true` + `revalidate` means: pages known at build time are
 * pre-rendered for speed, but new pages added in Supabase after deploy (or
 * edits to existing ones) become visible without a full redeploy — Next.js
 * regenerates a page in the background at most once per `revalidate` window.
 * For instant updates after a content edit, call POST /api/revalidate.
 */
export const dynamicParams = true;
export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  const paths = await getAllPagePaths();
  return paths.map((p) => ({ slug: p.replace(/^\//, "").split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const routePath = "/" + slug.join("/");
  const page = await getPage(routePath);
  if (!page) return {};
  const ogImage = page.og_image_path ? mediaUrl(page.og_image_path) : undefined;
  return {
    title: page.title ?? undefined,
    description: page.description ?? undefined,
    alternates: { canonical: routePath },
    openGraph: {
      title: page.title ?? undefined,
      description: page.description ?? undefined,
      url: routePath,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function MirroredPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const routePath = "/" + slug.join("/");
  const [{ business }, page] = await Promise.all([getSite(), getPage(routePath)]);
  if (!page || !page.html) notFound();

  const schema = buildPageSchema(business, page, page.updated_at);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {page.inline_css && (
        <style id="core-block-supports-inline-css" dangerouslySetInnerHTML={{ __html: page.inline_css }} />
      )}
      <main id="primary" className="site-main | container" dangerouslySetInnerHTML={{ __html: page.html }} />
    </>
  );
}
