"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import type { NavTopItem, SiteData } from "@/lib/site";
import { shimmerDataUrl } from "@/lib/imagePlaceholder";

/**
 * Reproduces the NearU base theme's #masthead markup and the behavior of its
 * navigation.js: a mobile menu-toggle button that flips `.toggled` on the nav
 * and `data-header-nav-expanded` on <html>, plus per-item sub-menu toggle
 * buttons controlled via aria-expanded (the theme CSS shows/hides sub-menus
 * off those attributes).
 *
 * Client component: site data (fetched from Supabase) is passed in as a prop
 * by the server-component layout — see src/app/layout.tsx.
 */
export function Header({ site }: { site: SiteData }) {
  const { business, nav } = site;
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-header-nav-expanded",
      menuOpen ? "true" : "false"
    );
  }, [menuOpen]);

  // Close sub-menus when clicking outside the nav (mirrors navigation.js).
  useEffect(() => {
    if (!openSub) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenSub(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSub(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openSub]);

  const closeAll = useCallback(() => {
    setOpenSub(null);
    setMenuOpen(false);
  }, []);

  return (
    <header id="masthead" className="site-header | container">
      <div className="site-header-content">
        <div className="site-branding">
          <Link href="/" className="custom-logo-link" rel="home">
            <Image
              priority
              width={3468}
              height={2120}
              src={business.logo}
              className="custom-logo"
              alt={`${business.name} Logo`}
              placeholder="blur"
              blurDataURL={shimmerDataUrl(3468, 2120)}
            />
          </Link>
          <p className="site-title">
            <Link href="/" rel="home">
              {business.legalName}
            </Link>
          </p>
          <p className="site-description">
            Greenville&rsquo;s Trusted HVAC &amp; Plumbing Services Since {business.foundedYear}
          </p>
        </div>

        <div className="site-header-strip">
          <span className="site-header-strip__item">
            <Icon name="geopin" />
            <a href={business.mapUrl} target="_blank" rel="noreferrer">
              {business.locationLabel}
            </a>
          </span>
          <span className="site-header-strip__item">
            <Icon name="phone" />
            <a className="phone-link" href={business.phoneHref}>
              {business.phone}
            </a>
          </span>
        </div>

        <div className="header-mobile-cta">
          <a
            href={business.phoneHref}
            data-cta-gap="md"
            data-cta-type="solid"
            data-cta-content="mixed"
            data-cta-level="primary"
            data-cta-minwidth="false"
            className="cta"
          >
            <Icon name="phone" className="cta-icon" />
            <span>{business.phone}</span>
          </a>
          <Link
            href={business.scheduleUrl}
            data-cta-gap="md"
            data-cta-type="solid"
            data-cta-content="mixed"
            data-cta-level="primary"
            data-cta-minwidth="false"
            className="cta se-widget-button"
          >
            <Icon name="event" className="cta-icon" />
            <span>Schedule</span>
          </Link>
        </div>

        <nav
          id="site-navigation"
          ref={navRef}
          className={`main-navigation${menuOpen ? " toggled" : ""}`}
        >
          <button
            className="menu-toggle | reset-button | menu-toggle-button | cta"
            data-cta-type="solid"
            data-cta-level="primary"
            data-cta-minwidth="false"
            aria-controls="primary-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="visually-hidden">Primary Menu</span>
            <Icon name="menu" className="menu-toggle-button-icon menu-toggle-button-icon--off" />
            <Icon name="close" className="menu-toggle-button-icon menu-toggle-button-icon--on" />
          </button>

          <div className="header-nav-menu">
            <ul id="primary-menu" className="menu nav-menu menu-list">
              {nav.primary.map((item) => (
                <TopMenuItem
                  key={item.label}
                  item={item}
                  open={openSub === item.label}
                  onToggle={() => setOpenSub((cur) => (cur === item.label ? null : item.label))}
                  onNavigate={closeAll}
                />
              ))}
            </ul>
            <div className="header-nav-cta">
              <Link
                href={business.scheduleUrl}
                data-cta-gap="md"
                data-cta-type="solid"
                data-cta-content="mixed"
                data-cta-level="primary"
                data-cta-minwidth="true"
                className="cta se-widget-button"
                onClick={closeAll}
              >
                <Icon name="event" className="cta-icon" />
                <span>Schedule Now</span>
                <Icon name="chevronright" className="cta-icon" />
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function TopMenuItem({
  item,
  open,
  onToggle,
  onNavigate,
}: {
  item: NavTopItem;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const subId = `sub-menu-list-${slugify(item.label)}`;

  if (!item.groups) {
    const special = item.label === "Commercial" ? " menu-item-special" : "";
    return (
      <li
        className={`main-menu-item menu-item-depth-0 menu-item menu-item-type-post_type menu-item-object-page${special}`}
      >
        <Link
          className="menu-interactive menu-link main-menu-link"
          href={item.href ?? "#"}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="main-menu-item menu-item-depth-0 menu-interactive menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item--has-shell-link">
      <span
        className="menu-interactive menu-interactive--is-shell"
        onClick={onToggle}
        role="presentation"
      >
        {item.label}
      </span>
      <button
        className="button-reset | menu-toggle-button menu-toggle-sub"
        aria-controls={subId}
        aria-expanded={open}
        title={`Toggle ${item.label} sub menu`}
        onClick={onToggle}
      >
        <span className="menu-toggle-sub-stretch-el" aria-hidden="true"></span>
        <svg className="menu-toggle-button-icon--off" width="16" height="16" aria-hidden="true">
          <use href="#icon-chevrondown" />
        </svg>
        <svg className="menu-toggle-button-icon--on" width="16" height="16" aria-hidden="true">
          <use href="#icon-chevronup" />
        </svg>
        <span className="visually-hidden">Toggle Sub Menu</span>
      </button>
      <ul className="sub-menu menu-list menu-depth-1" id={subId}>
        {item.groups.map((group, gi) => {
          // Groups with a label render as depth-1 title items containing a depth-2 list
          if (group.label) {
            return (
              <li
                key={group.label}
                className="sub-menu-item menu-item-depth-1 menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item--has-shell-link"
              >
                <span className="menu-interactive menu-interactive--is-title">{group.label}</span>
                <ul className="sub-sub-menu menu-list menu-depth-2">
                  {group.items.map((link) => (
                    <li
                      key={link.href + link.label}
                      className="sub-menu-item sub-sub-menu-item menu-item-depth-2 menu-item menu-item-type-post_type menu-item-object-service"
                    >
                      <Link
                        className="menu-interactive menu-link sub-menu-link"
                        href={link.href}
                        onClick={onNavigate}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          }
          // Unlabeled groups render as flat depth-1 items (Electrical, About Us)
          return group.items.map((link) => (
            <li
              key={`${gi}-${link.href}-${link.label}`}
              className="sub-menu-item menu-item-depth-1 menu-item menu-item-type-post_type menu-item-object-service"
            >
              <Link
                className="menu-interactive menu-link sub-menu-link"
                href={link.href}
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            </li>
          ));
        })}
      </ul>
    </li>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
