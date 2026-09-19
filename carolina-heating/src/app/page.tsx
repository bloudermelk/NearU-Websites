import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import homeContent from "../../content/pages/home.json";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { GoogleRatingBadge } from "@/components/GoogleRatingBadge";
import { ServiceGrid } from "@/components/ServiceGrid";
import { PromiseSection } from "@/components/PromiseSection";
import { CertificationsMarquee } from "@/components/CertificationsMarquee";
import { Testimonials } from "@/components/Testimonials";
import { MaintenanceFinancingCtas } from "@/components/MaintenanceFinancingCtas";
import { Cta } from "@/components/Cta";

export const metadata: Metadata = {
  title: homeContent.metaTitle,
  description: homeContent.metaDescription,
};

export default function Home() {
  const { hero, worryFree, story, whoWeAre } = homeContent;

  return (
    <>
      {/* Hero */}
      <Section className="pt-10 sm:pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl lg:text-5xl">
              {hero.title}
            </h1>
            <div className="mt-4">
              <GoogleRatingBadge />
            </div>
            <p className="mt-4 text-brand-gray-dark">{hero.body}</p>
            <div className="mt-6">
              <PhoneCtaRow />
            </div>
            <Cta href={hero.generatorCtaHref} variant="outline" className="mt-4 inline-flex">
              {hero.generatorCtaLabel}
            </Cta>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2 aspect-[3/2] overflow-hidden rounded-lg sm:col-span-1">
              <Image
                src={hero.image}
                alt="Carolina Heating Service technicians"
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="relative col-span-2 aspect-[3/2] overflow-hidden rounded-lg sm:col-span-1">
              <Image
                src={hero.secondaryImage}
                alt="Exterior of building with AC units"
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Worry-free coverage banner */}
      <Section className="bg-brand-secondary py-8 text-center">
        <Link href={worryFree.href} className="group inline-flex flex-col items-center gap-3">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            {worryFree.title}
          </h2>
          <span className="text-sm font-bold uppercase text-brand-primary group-hover:underline">
            Learn More
          </span>
        </Link>
      </Section>

      {/* Services */}
      <Section>
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          Our Services
        </h2>
        <div className="mt-10">
          <ServiceGrid />
        </div>
      </Section>

      {/* Promise */}
      <Section className="bg-brand-gray-light">
        <PromiseSection />
      </Section>

      {/* Our story */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
              {story.heading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{story.body}</p>
            <div className="mt-6">
              <PhoneCtaRow />
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={story.mapImage}
              alt="Carolina Heating Service area map"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Who we are */}
      <Section className="bg-brand-gray-light">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg lg:order-2">
            <Image
              src={whoWeAre.image}
              alt="Carolina Heating Service technician"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="lg:order-1">
            <h2 className="font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
              {whoWeAre.heading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{whoWeAre.body}</p>
            <Cta href={whoWeAre.href} variant="outline" className="mt-6 inline-flex">
              Learn More
            </Cta>
          </div>
        </div>
      </Section>

      {/* Maintenance + Financing */}
      <Section>
        <MaintenanceFinancingCtas />
      </Section>

      {/* Certifications */}
      <Section className="bg-brand-gray-light">
        <CertificationsMarquee />
      </Section>

      {/* Testimonials */}
      <Section>
        <Testimonials />
      </Section>
    </>
  );
}
