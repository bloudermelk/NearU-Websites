import Image from "next/image";
import Link from "next/link";
import { ServiceCategoryContent } from "@/lib/serviceCategories";
import { Section } from "./Section";
import { PhoneCtaRow } from "./PhoneCtaRow";
import { CertificationsMarquee } from "./CertificationsMarquee";
import { Testimonials } from "./Testimonials";
import { MaintenanceFinancingCtas } from "./MaintenanceFinancingCtas";

export function ServiceCategoryTemplate({ content }: { content: ServiceCategoryContent }) {
  return (
    <>
      {/* Hero */}
      <Section className="pt-10 sm:pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
              {content.title}
            </h1>
            {content.heroSubtitle && (
              <p className="mt-3 text-lg text-brand-gray-medium">{content.heroSubtitle}</p>
            )}
            <div className="mt-4 flow-root">
              {content.intro.map((paragraph, i) => (
                <p key={i} className="mt-4 text-brand-gray-dark">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-6">
              <PhoneCtaRow />
            </div>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={content.heroImage}
              alt={content.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </Section>

      {/* Sub-services grid */}
      <Section className="bg-brand-gray-light">
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          Our {content.title} Services
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.subServices.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading font-bold text-brand-secondary">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm text-brand-gray-medium">{service.description}</p>
                <span className="mt-4 text-sm font-bold uppercase text-brand-primary">
                  Learn More &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Involves / Installations / Maintenance prose */}
      <Section className="max-w-4xl">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary">
          {content.involves.heading}
        </h2>
        <p className="mt-4 text-brand-gray-dark">{content.involves.body}</p>
        {content.involves.bullets.length > 0 && (
          <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-gray-dark">
            {content.involves.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}

        <h2 className="mt-10 font-heading text-2xl font-bold text-brand-secondary">
          {content.signs.heading}
        </h2>
        <p className="mt-4 text-brand-gray-dark">{content.signs.body}</p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-brand-secondary">
          {content.whyChooseUs.heading}
        </h2>
        <p className="mt-4 text-brand-gray-dark">{content.whyChooseUs.intro}</p>
        {content.whyChooseUs.bullets.length > 0 && (
          <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-gray-dark">
            {content.whyChooseUs.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* Process */}
      <Section className="bg-brand-gray-light max-w-4xl">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary">
          {content.process.heading}
        </h2>
        <ol className="mt-6 space-y-6">
          {content.process.steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-primary font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-heading font-bold text-brand-secondary">{step.title}</h3>
                <p className="mt-1 text-sm text-brand-gray-dark">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <PhoneCtaRow />
        </div>
      </Section>

      {/* Qualified for all makes */}
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary">
              {content.qualified.heading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{content.qualified.body}</p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-gray-dark">
              {content.qualified.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={content.qualified.image}
              alt={content.qualified.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Closing */}
      <Section className="bg-brand-gray-light max-w-4xl text-center">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary">
          {content.closing.heading}
        </h2>
        <p className="mt-4 text-brand-gray-dark">{content.closing.body}</p>
      </Section>

      <Section>
        <MaintenanceFinancingCtas />
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
