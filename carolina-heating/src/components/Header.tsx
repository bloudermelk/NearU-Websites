"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Container } from "./Container";
import { site } from "@/lib/site";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenItem, setMobileOpenItem] = useState<string | null>(null);
  const { business, nav, topBanner } = site;

  return (
    <>
      {/* Top promo banner */}
      <div className="sticky top-0 z-50 bg-[#ffcc07] py-2 text-center text-sm font-bold">
        <Link href={topBanner.href} className="text-[#ed1b2d] underline underline-offset-2">
          {topBanner.text}
        </Link>
      </div>

      {/* Location / phone strip */}
      <div className="bg-brand-secondary py-1.5 text-xs text-white">
        <Container className="flex items-center justify-end gap-6">
          <a
            href={business.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-brand-primary"
          >
            {business.locationLabel}
          </a>
          <a href={business.phoneHref} className="flex items-center gap-1 hover:text-brand-primary">
            {business.phone}
          </a>
        </Container>
      </div>

      <header className="sticky top-[calc(2.25rem)] z-40 bg-white shadow-sm">
        <Container className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="relative h-14 w-40 flex-shrink-0">
            <Image
              src={business.logo}
              alt={`${business.name} Logo`}
              fill
              sizes="160px"
              className="object-contain object-left"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-5 xl:flex">
            {nav.primary.map((item) => (
              <div
                key={item.label}
                className="group relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-brand-secondary hover:text-brand-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="cursor-default text-sm font-semibold text-brand-secondary">
                    {item.label}
                  </span>
                )}

                {item.groups && openDropdown === item.label && (
                  <div className="absolute left-0 top-full flex gap-8 rounded-md border border-black/10 bg-white p-6 shadow-lg">
                    {item.groups.map((group, gi) => (
                      <div key={group.label ?? gi} className="min-w-[200px]">
                        {group.label && (
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-primary">
                            {group.label}
                          </p>
                        )}
                        <ul className="flex flex-col gap-1.5">
                          {group.items.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className="whitespace-nowrap text-sm text-brand-secondary hover:text-brand-primary"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-4 xl:flex">
            <a
              href={business.phoneHref}
              className="text-sm font-bold text-brand-secondary hover:text-brand-primary"
            >
              {business.phone}
            </a>
            <Link
              href={business.scheduleUrl}
              className="rounded-md bg-brand-primary px-5 py-2.5 text-sm font-bold uppercase text-white transition-colors hover:bg-brand-primary-active"
            >
              Schedule Now
            </Link>
          </div>

          <button
            type="button"
            className="flex items-center justify-center rounded-md p-2 text-brand-secondary xl:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="sr-only">Menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </Container>

        {mobileOpen && (
          <div className="max-h-[75vh] overflow-y-auto border-t border-black/10 bg-white xl:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {nav.primary.map((item) => (
                <div key={item.label} className="border-b border-black/5 py-1">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="block py-2 text-sm font-semibold text-brand-secondary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold text-brand-secondary"
                      onClick={() =>
                        setMobileOpenItem((cur) => (cur === item.label ? null : item.label))
                      }
                    >
                      {item.label}
                      <span>{mobileOpenItem === item.label ? "\u2212" : "+"}</span>
                    </button>
                  )}

                  {item.groups && mobileOpenItem === item.label && (
                    <div className="ml-3 flex flex-col gap-3 border-l border-black/10 py-2 pl-3">
                      {item.groups.map((group, gi) => (
                        <div key={group.label ?? gi}>
                          {group.label && (
                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-primary">
                              {group.label}
                            </p>
                          )}
                          <ul className="flex flex-col gap-1">
                            {group.items.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="block py-1 text-sm text-brand-gray-medium"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-3 flex flex-col gap-3 pt-3">
                <a href={business.phoneHref} className="text-sm font-bold text-brand-secondary">
                  {business.phone}
                </a>
                <Link
                  href={business.scheduleUrl}
                  className="rounded-md bg-brand-primary px-5 py-2.5 text-center text-sm font-bold uppercase text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Schedule Now
                </Link>
              </div>
            </Container>
          </div>
        )}
      </header>
    </>
  );
}
