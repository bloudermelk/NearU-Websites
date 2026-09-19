import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getMdxPage } from "@/lib/mdxPage";
import { MdxContent } from "@/components/MdxContent";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { GoogleRatingBadge } from "@/components/GoogleRatingBadge";
import { CertificationsMarquee } from "@/components/CertificationsMarquee";
import { Testimonials } from "@/components/Testimonials";

export function generateMetadata(): Metadata {
  const page = getMdxPage("about-us");
  if (!page) return {};
  return {
    title: page.frontmatter.metaTitle,
    description: page.frontmatter.metaDescription,
  };
}

export default function AboutUsPage() {
  const page = getMdxPage("about-us");
  if (!page) notFound();

  const { frontmatter, content } = page;

  return (
    <>
      <Section className="pt-10 sm:pt-14">
        <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
          {frontmatter.heading as string}
        </h1>
        <div className="mt-4">
          <GoogleRatingBadge />
        </div>
        <p className="mt-4 max-w-3xl text-brand-gray-dark">{frontmatter.intro as string}</p>
        <div className="mt-6">
          <PhoneCtaRow />
        </div>
        {frontmatter.heroImage && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg">
            <Image
              src={frontmatter.heroImage as string}
              alt={frontmatter.heading as string}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        )}
      </Section>

      <Section className="max-w-4xl">
        <MdxContent source={content} />
      </Section>

      <Section className="bg-brand-gray-light">
        <CertificationsMarquee />
      </Section>

      <Section>
        <Testimonials />
      </Section>
    </>
  );
}
