import type { Metadata } from "next";
import Image from "next/image";
import content from "../../../content/pages/maintenance.json";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function MaintenancePage() {
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
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          {content.planName}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-brand-gray-dark">
          {content.planIntro}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {content.benefits.map((b) => (
            <div key={b.title} className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading font-bold text-brand-secondary">{b.title}</h3>
              <p className="mt-2 text-sm text-brand-gray-dark">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold uppercase text-brand-gray-medium">
            {content.priceLabel}
          </p>
          <p className="font-heading text-4xl font-bold text-brand-primary">{content.price}</p>
          <div className="mt-4">
            <PhoneCtaRow />
          </div>
        </div>
      </Section>

      <Section>
        <Testimonials />
      </Section>
    </>
  );
}
