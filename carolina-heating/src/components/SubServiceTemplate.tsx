import Image from "next/image";
import { ResolvedSubService } from "@/lib/subServices";
import { ServiceCategoryContent } from "@/lib/serviceCategories";
import {
  inspectionRepairCopy,
  installationsCopy,
  maintenanceCopy,
  genericFaqs,
} from "@/lib/subServiceCopy";
import { Section } from "./Section";
import { PhoneCtaRow } from "./PhoneCtaRow";
import { CertificationsMarquee } from "./CertificationsMarquee";
import { Testimonials } from "./Testimonials";
import { MaintenanceFinancingCtas } from "./MaintenanceFinancingCtas";

export function SubServiceTemplate({
  subService,
  category,
}: {
  subService: ResolvedSubService;
  category: ServiceCategoryContent;
}) {
  const faqs = genericFaqs(subService.title);

  return (
    <>
      <Section className="pt-10 sm:pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
              {subService.title}
            </h1>
            <p className="mt-4 text-brand-gray-dark">{subService.description}</p>
            <div className="mt-6">
              <PhoneCtaRow />
            </div>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={subService.image}
              alt={subService.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light max-w-4xl">
        <h2 className="font-heading text-2xl font-bold text-brand-secondary">
          {subService.title} Inspection &amp; Repair
        </h2>
        <p className="mt-4 text-brand-gray-dark">{inspectionRepairCopy(subService.title)}</p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-brand-secondary">
          {subService.title} Installations
        </h2>
        <p className="mt-4 text-brand-gray-dark">{installationsCopy(subService.title)}</p>

        <h2 className="mt-10 font-heading text-2xl font-bold text-brand-secondary">
          {subService.title} Maintenance
        </h2>
        <p className="mt-4 text-brand-gray-dark">{maintenanceCopy(subService.title)}</p>

        <div className="mt-8">
          <PhoneCtaRow />
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-brand-secondary">
              {category.qualified.heading}
            </h2>
            <p className="mt-4 text-brand-gray-dark">{category.qualified.body}</p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-gray-dark">
              {category.qualified.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={category.qualified.image}
              alt={category.qualified.heading}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-brand-gray-light max-w-3xl">
        <h2 className="text-center font-heading text-2xl font-bold text-brand-secondary">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-black/10 bg-white p-4">
              <summary className="cursor-pointer font-heading font-bold text-brand-secondary">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm text-brand-gray-dark">{faq.answer}</p>
            </details>
          ))}
        </div>
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
