import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { PhoneCtaRow } from "@/components/PhoneCtaRow";

export const metadata: Metadata = {
  title: "Schedule Service",
  description: "Schedule HVAC, plumbing, electrical, or generator service with Carolina Heating Service.",
};

export default function BookingsPage() {
  return (
    <Section className="pt-10 sm:pt-14 text-center">
      <h1 className="font-heading text-3xl font-bold text-brand-secondary sm:text-4xl">
        Schedule Service
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-brand-gray-dark">
        Online self-scheduling is coming soon. In the meantime, give us a call and one of our
        team members will get you on the schedule right away.
      </p>
      <div className="mt-6 flex justify-center">
        <PhoneCtaRow />
      </div>
    </Section>
  );
}
