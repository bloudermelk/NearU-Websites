import type { Metadata } from "next";
import Image from "next/image";
import content from "../../../content/pages/generator-greenville-sc.json";
import homeContent from "../../../content/pages/home.json";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { PromiseSection } from "@/components/PromiseSection";
import { MaintenanceFinancingCtas } from "@/components/MaintenanceFinancingCtas";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function GeneratorLandingPage() {
  return (
    <>
      <Section className="pt-10 sm:pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
              {content.heading}
            </h1>
            <p className="mt-4 text-brand-gray-dark">{content.intro}</p>
            <div className="mt-6">
              <PhoneCtaRow />
            </div>
            <p className="mt-4 rounded-md bg-brand-gray-light p-4 text-xs text-brand-gray-medium">
              {content.note}
            </p>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={content.heroImage}
              alt={content.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light">
        <PromiseSection />
      </Section>

      <Section>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
              {homeContent.story.heading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{homeContent.story.body}</p>
            <Cta href="/about-us" variant="outline" className="mt-6 inline-flex">
              Learn More
            </Cta>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={homeContent.story.mapImage}
              alt="Carolina Heating Service area map"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light">
        <MaintenanceFinancingCtas />
      </Section>
    </>
  );
}
