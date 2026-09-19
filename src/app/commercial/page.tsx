import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import content from "../../../content/pages/commercial.json";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { CertificationsMarquee } from "@/components/CertificationsMarquee";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function CommercialPage() {
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {content.capabilities.map((c) => (
            <div key={c.title} className="rounded-lg bg-white p-6 text-center shadow-sm">
              <h3 className="font-heading text-lg font-bold text-brand-secondary">{c.title}</h3>
              <p className="mt-2 text-sm text-brand-gray-medium">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          Our Services
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.services.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex flex-col rounded-lg border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="font-heading font-bold text-brand-secondary">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-brand-gray-medium">{s.body}</p>
              <span className="mt-4 text-sm font-bold uppercase text-brand-primary">
                Learn More &rarr;
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="bg-brand-gray-light">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary">
              {content.closingHeading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{content.closingBody}</p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={content.closingImage}
              alt={content.closingHeading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section>
        <CertificationsMarquee />
      </Section>

      <Section className="bg-brand-gray-light">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={content.maintenanceImage}
              alt="Commercial maintenance"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary">
              Commercial Maintenance Plans
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-brand-gray-dark">
              {content.maintenancePlans.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <div className="mt-6">
              <PhoneCtaRow />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary">
              No matter the industry or scale we have you covered!
            </h2>
            <ul className="mt-4 space-y-3 text-brand-gray-dark">
              {content.industries.map((ind) => (
                <li key={ind.title}>
                  <strong className="text-brand-secondary">{ind.title}:</strong> {ind.body}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={content.industriesImage}
              alt="Commercial building exterior"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light">
        <Testimonials />
      </Section>
    </>
  );
}
