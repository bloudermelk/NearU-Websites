import Image from "next/image";
import Link from "next/link";
import { LocationContent } from "@/lib/locations";
import { Section } from "./Section";
import { PhoneCtaRow } from "./PhoneCtaRow";
import { GoogleRatingBadge } from "./GoogleRatingBadge";
import { Testimonials } from "./Testimonials";

export function LocationTemplate({ content }: { content: LocationContent }) {
  return (
    <>
      <Section className="pt-10 sm:pt-14">
        <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
          {content.heading}
        </h1>
        <div className="mt-4">
          <GoogleRatingBadge />
        </div>
        <div className="mt-4 max-w-3xl space-y-4 text-brand-gray-dark">
          {content.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-6">
          <PhoneCtaRow />
        </div>
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg">
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

      {content.serviceGroups.map((group, gi) => (
        <Section key={gi} className={gi % 2 === 0 ? "bg-brand-gray-light" : ""}>
          <p className="mx-auto max-w-3xl text-brand-gray-dark">{group.groupIntro}</p>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-black/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-heading font-bold text-brand-secondary">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-gray-medium">{item.body}</p>
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-3xl rounded-lg bg-white p-6 shadow-sm">
            <h3 className="font-heading text-lg font-bold text-brand-primary">
              {group.partnerHeading}
            </h3>
            <p className="mt-2 text-sm text-brand-gray-dark">{group.partnerBody}</p>
          </div>
        </Section>
      ))}

      <Section>
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary sm:text-3xl">
          {content.sinceHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-brand-gray-dark">
          {content.sinceIntro}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.sinceCategories.map((cat) => (
            <div key={cat.label}>
              <h3 className="font-heading font-bold uppercase tracking-wide text-brand-primary">
                {cat.label}
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-brand-gray-dark">
                {cat.bullets.map((b) => (
                  <li key={b.title}>
                    <strong className="text-brand-secondary">{b.title}:</strong> {b.body}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-brand-gray-light max-w-3xl space-y-4">
        {content.closing.map((p, i) => (
          <p key={i} className="text-brand-gray-dark">
            {p}
          </p>
        ))}
        <div className="pt-2">
          <PhoneCtaRow />
        </div>
      </Section>

      <Section className="max-w-3xl">
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {content.faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-black/10 bg-white p-4">
              <summary className="cursor-pointer font-heading font-bold text-brand-secondary">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-brand-gray-dark">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section className="bg-brand-gray-light">
        <Testimonials />
      </Section>
    </>
  );
}
