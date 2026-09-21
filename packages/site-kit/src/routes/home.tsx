import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingHome } from "../components/landing/LandingHome";
import { getSite } from "../lib/db/site";
import { getPage } from "../lib/db/pages";
import type { LandingPageData } from "../lib/db/homePageData";
import { buildPageSchema } from "../lib/schema";
import { prepareMirroredHtml, preloadHero, stripCssComments } from "../lib/mirroredHtml";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  return {
    title: page?.title ?? undefined,
    description: page?.description ?? undefined,
    alternates: { canonical: "/" },
  };
}

/**
 * The homepage row (`pages` where path='/') comes in two flavors:
 *
 *  - page_type='mirrored': the live WordPress homepage was extracted like every
 *    other page and we render its HTML verbatim. This is the DEFAULT for new
 *    brands — zero per-brand React, exact fidelity.
 *
 *  - page_type='home': the conversion-first landing homepage
 *    (components/landing/LandingHome.tsx) driven by the jsonb `data` column
 *    (shape: LandingPageData, authored in the brand's content/home.json). Any
 *    brand can opt in by adding a home.json and re-running the migration.
 */
export default async function Home() {
  const [site, page] = await Promise.all([getSite(), getPage("/")]);
  if (!page) notFound();
  const schema = buildPageSchema(site.business, { path: "/", title: page.title, description: page.description }, page.updated_at);
  const schemaTag = <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;

  if (page.page_type !== "home") {
    if (!page.html) notFound();
    const html = prepareMirroredHtml(page.html);
    preloadHero(html);
    return (
      <>
        {schemaTag}
        {page.inline_css && (
          <style id="page-layout-css" dangerouslySetInnerHTML={{ __html: stripCssComments(page.inline_css) }} />
        )}
        <main id="primary" className="site-main | container" dangerouslySetInnerHTML={{ __html: html }} />
      </>
    );
  }

  if (!page.data) notFound();
  return (
    <>
      {schemaTag}
      <LandingHome site={site} data={page.data as LandingPageData} />
    </>
  );
}
