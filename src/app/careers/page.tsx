import type { Metadata } from "next";
import Image from "next/image";
import content from "../../../content/pages/careers.json";
import { Section } from "@/components/Section";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function CareersPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
            {content.heading}
          </h1>
          <p className="mt-4 text-brand-gray-dark">{content.intro}</p>
          <p className="mt-4 text-brand-gray-dark">{content.body}</p>
          <Cta href={content.openPositionsUrl} className="mt-6 inline-flex">
            View Open Positions
          </Cta>
        </div>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
          <Image
            src={content.image}
            alt={content.heading}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </Section>
  );
}
