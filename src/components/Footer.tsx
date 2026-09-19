import Link from "next/link";
import { Container } from "./Container";
import { site } from "@/lib/site";

export function Footer() {
  const { business, nav } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <h2 className="font-heading text-xl font-bold">{business.name}</h2>
          <p className="mt-2 text-sm text-white/70">{business.tagline}</p>
          <p className="mt-4 text-sm text-white/70">
            {business.address.street}
            <br />
            {business.address.city}, {business.address.state} {business.address.zip}
          </p>
          <p className="mt-4 text-sm">
            <a href={business.phoneHref} className="font-bold hover:text-brand-primary">
              {business.phone}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a href={`mailto:${business.email}`} className="text-white/70 hover:text-brand-primary">
              {business.email}
            </a>
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/60">Company</h3>
          <ul className="mt-4 flex flex-col gap-2">
            {nav.footer.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/80 hover:text-brand-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/60">Services</h3>
          <ul className="mt-4 flex flex-col gap-2">
            {site.serviceCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/services/${cat.slug}`}
                  className="text-sm text-white/80 hover:text-brand-primary"
                >
                  {cat.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-4 text-xs text-white/60 sm:flex-row">
          <p>
            &copy; {year} {business.legalName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href={business.social.facebook} className="hover:text-white" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href={business.social.instagram} className="hover:text-white" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
