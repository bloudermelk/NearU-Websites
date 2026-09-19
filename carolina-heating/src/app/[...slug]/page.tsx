import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllHtmlPagePaths, getHtmlPage } from "@/lib/htmlPages";
import { ThemeBehaviors } from "@/components/ThemeBehaviors";

/**
 * Catch-all route that serves every page mirrored from the original site
 * (content/html/*.json). The homepage is the only page hand-built in React.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllHtmlPagePaths().map((p) => ({
    slug: p.replace(/^\//, "").split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const routePath = "/" + slug.join("/");
  const page = getHtmlPage(routePath);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: routePath },
    openGraph: {
      title: page.title,
      description: page.description,
      url: routePath,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
  };
}

export default async function MirroredPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const routePath = "/" + slug.join("/");
  const page = getHtmlPage(routePath);
  if (!page) notFound();

  return (
    <>
      {page.inlineCss && (
        <style id="core-block-supports-inline-css" dangerouslySetInnerHTML={{ __html: page.inlineCss }} />
      )}
      <main id="primary" className="site-main | container" dangerouslySetInnerHTML={{ __html: page.html }} />
      <ThemeBehaviors />
    </>
  );
}
