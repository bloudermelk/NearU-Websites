import type { Metadata } from "next";
import Image from "next/image";
import content from "../../../content/pages/worry-free-service-program.json";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
};

export default function WorryFreePage() {
  return (
    <>
      <Section className="pt-10 sm:pt-14 text-center">
        <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
          {content.heading}
        </h1>
        <p className="mt-2 text-xl font-semibold text-brand-primary">{content.subheading}</p>
        <p className="mx-auto mt-4 max-w-2xl text-brand-gray-dark">{content.intro}</p>
        <div className="mt-6 flex justify-center">
          <PhoneCtaRow />
        </div>
        <div className="relative mx-auto mt-8 aspect-[16/7] w-full max-w-4xl overflow-hidden rounded-lg">
          <Image
            src={content.heroImage}
            alt={content.heading}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </Section>

      <Section className="bg-brand-gray-light">
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          {content.coverageHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-brand-gray-dark">
          {content.coverageBody}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.pillars.map((p) => (
            <div key={p.title} className="text-center">
              <h3 className="font-heading text-xl font-bold text-brand-primary">{p.title}</h3>
              <p className="mt-2 text-sm text-brand-gray-medium">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          {content.expect.heading}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <p className="font-semibold text-brand-secondary">{content.expect.advisorIntro}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-brand-gray-dark">
              {content.expect.advisorSteps.map((s) => (
                <li key={s}>
                  <strong>{s}</strong>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-semibold text-brand-secondary">{content.expect.installIntro}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-brand-gray-dark">
              {content.expect.installSteps.map((s) => (
                <li key={s}>
                  <strong>{s}</strong>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-brand-gray-dark">{content.expect.closing}</p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={content.expect.image}
              alt={content.expect.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light text-center">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          {content.included.heading}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {content.included.items.map((item) => (
            <p key={item} className="font-heading text-lg font-bold text-brand-secondary">
              {item}
            </p>
          ))}
        </div>
        <p className="mt-6 text-sm font-semibold text-brand-gray-medium">
          Plus: {content.included.plus}
        </p>
      </Section>

      <Section className="max-w-3xl text-center">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary">
          {content.fixedCost.heading}
        </h2>
        <p className="mt-4 text-brand-gray-dark">{content.fixedCost.body}</p>
      </Section>

      <Section className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse overflow-hidden rounded-lg text-sm">
          <thead>
            <tr className="bg-brand-secondary text-white">
              <th className="p-4 text-left"></th>
              <th className="p-4 text-left">Worry-Free Program</th>
              <th className="p-4 text-left">Industry Standard HVAC Package</th>
            </tr>
          </thead>
          <tbody>
            {content.comparisonTable.rows.map((row, i) => (
              <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-brand-gray-light"}>
                <td className="p-4 font-semibold text-brand-secondary">{row.feature}</td>
                <td className="p-4 text-brand-check font-bold">{row.worryFree}</td>
                <td className="p-4 text-brand-gray-medium">{row.industry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary">
              {content.transformHeading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{content.transformBody}</p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image
              src={content.transformImage}
              alt={content.transformHeading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light text-center">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          {content.closingHeading}
        </h2>
        <div className="mt-6 flex justify-center">
          <PhoneCtaRow />
        </div>
        <div className="relative mx-auto mt-8 aspect-[16/7] w-full max-w-4xl overflow-hidden rounded-lg">
          <Image
            src={content.closingImage}
            alt={content.closingHeading}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="mx-auto mt-6 max-w-2xl space-y-1 text-xs text-brand-gray-medium">
          {content.footnotes.map((f) => (
            <p key={f}>{f}</p>
          ))}
        </div>
      </Section>

      <Section>
        <Testimonials />
      </Section>
    </>
  );
}
