import type { Metadata } from "next";
import Image from "next/image";
import content from "../../../content/pages/financing.json";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function FinancingPage() {
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
          {content.sectionHeading}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.options.map((opt) => (
            <div key={opt.title} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src={opt.image}
                  alt={opt.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-brand-secondary">{opt.title}</h3>
                <p className="mt-2 text-sm text-brand-gray-medium">{opt.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-brand-gray-dark">
          {content.closing}
        </p>
      </Section>

      <Section>
        <Testimonials />
      </Section>
    </>
  );
}
