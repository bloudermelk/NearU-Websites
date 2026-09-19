import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMdxPage } from "@/lib/mdxPage";
import { MdxContent } from "@/components/MdxContent";
import { Section } from "@/components/Section";

export function generateMetadata(): Metadata {
  const page = getMdxPage("terms-and-conditions");
  if (!page) return {};
  return {
    title: page.frontmatter.metaTitle,
    description: page.frontmatter.metaDescription,
  };
}

export default function TermsPage() {
  const page = getMdxPage("terms-and-conditions");
  if (!page) notFound();

  return (
    <Section className="max-w-4xl pt-10 sm:pt-14">
      <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
        {page.frontmatter.title}
      </h1>
      <div className="mt-8">
        <MdxContent source={page.content} />
      </div>
    </Section>
  );
}
