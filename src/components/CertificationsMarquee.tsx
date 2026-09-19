import Image from "next/image";
import { site } from "@/lib/site";

export function CertificationsMarquee() {
  return (
    <div>
      <h2 className="text-center text-2xl font-heading font-bold text-brand-secondary">
        Our Certifications &amp; Awards
      </h2>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
        {site.certifications.map((cert) => (
          <div key={cert.name} className="relative h-16 w-32 grayscale transition hover:grayscale-0">
            <Image
              src={cert.image}
              alt={cert.name}
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
