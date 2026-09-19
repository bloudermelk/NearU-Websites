// Generates the templated body copy used across Carolina Heating Service's
// individual sub-service pages (mirrors the pattern observed on the live
// site, where each leaf service page repeats the same "Inspection & Repair /
// Installations / Maintenance" structure with the service name swapped in).
//
// These are intentionally generic starter blocks. Replace any of them with
// page-specific copy in the future by editing the sub-service entry inside
// content/services/<category>.json — see AGENTS.md.

export function inspectionRepairCopy(title: string): string {
  return `At Carolina Heating Service, our certified technicians specialize in comprehensive inspection and repair services for ${title.toLowerCase()}. Whether you require routine check-ups or emergency repairs, we ensure your system operates at peak efficiency, keeping your home comfortable and energy-efficient throughout the year. Serving Greenville, SC, and the surrounding areas, our team is dedicated to delivering prompt, reliable service that guarantees comfort and peace of mind.`;
}

export function installationsCopy(title: string): string {
  return `Upgrade your home's comfort and efficiency with Carolina Heating Service's expert installation services for ${title.toLowerCase()}. Our experienced team ensures a seamless process with minimal disruption, whether you're replacing outdated equipment or installing something new. Serving Greenville, SC, and surrounding areas, we're committed to providing top-quality installation services that deliver long-term comfort and savings.`;
}

export function maintenanceCopy(title: string): string {
  return `Regular maintenance is key to maximizing efficiency, extending the lifespan of your equipment, and avoiding costly repairs. Our expert technicians tailor maintenance plans for ${title.toLowerCase()} to your specific needs, offering peace of mind and unmatched comfort for your home. Serving Greenville, SC, and surrounding areas, trust Carolina Heating Service to keep things running smoothly all year long.`;
}

export function genericFaqs(title: string): { question: string; answer: string }[] {
  const lower = title.toLowerCase();
  return [
    {
      question: `How do I know if I need ${lower} in Greenville, SC?`,
      answer: `Common signs include unusual noises, inconsistent performance, rising utility bills without a clear cause, or equipment nearing the end of its expected lifespan. A certified Carolina Heating Service technician can inspect your system and give you a clear, honest recommendation before any work begins.`,
    },
    {
      question: `How often should ${lower} be serviced?`,
      answer: `Most equipment benefits from at least one professional inspection per year, with some systems needing more frequent attention depending on usage and manufacturer recommendations. Joining the Carolina Comfort Club maintenance plan bundles two tune-ups annually so small issues get caught early.`,
    },
    {
      question: `Why should I hire a licensed professional for ${lower} instead of a DIY fix?`,
      answer: `Licensed technicians carry the training, tools, and manufacturer knowledge to diagnose the actual problem safely and correctly the first time. DIY attempts on HVAC, plumbing, electrical, or generator equipment can void warranties, create safety hazards, or turn a small repair into a much larger one.`,
    },
  ];
}
