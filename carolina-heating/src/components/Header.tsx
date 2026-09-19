"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "./Container";
import { site } from "@/lib/site";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { business, nav } = site;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-brand-secondary">
          <span>{business.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.primary.map((item) => (
            <div
              key={item.href}
              className="group relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="text-sm font-semibold text-brand-secondary hover:text-brand-primary"
              >
                {item.label}
              </Link>
              {item.children && openDropdown === item.label && (
                <div className="absolute left-0 top-full w-64 rounded-md border border-black/10 bg-white py-2 shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-brand-secondary hover:bg-brand-gray-light hover:text-brand-primary"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
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
          className="flex items-center justify-center rounded-md p-2 text-brand-secondary lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="sr-only">Menu</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </Container>

      {mobileOpen && (
        <div className="border-t border-black/10 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {nav.primary.map((item) => (
              <div key={item.href} className="py-1">
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-semibold text-brand-secondary"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-3 flex flex-col border-l border-black/10 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="py-1.5 text-sm text-brand-gray-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-3 flex flex-col gap-3 border-t border-black/10 pt-3">
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
  );
}
