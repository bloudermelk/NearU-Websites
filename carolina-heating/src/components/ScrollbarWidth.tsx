"use client";

import { useEffect } from "react";

/**
 * Port of the theme's site.js: measures the document scrollbar width and
 * exposes it as --DOC-SCROLLBAR-WIDTH on <html>. The theme CSS uses it to
 * compute --_100vw for full-bleed sections without horizontal overflow.
 */
export function ScrollbarWidth() {
  useEffect(() => {
    const doc = document;
    const measure = () => {
      const w =
        Math.min(20, Math.ceil(window.innerWidth - doc.documentElement.clientWidth)) || 0.01;
      doc.documentElement.style.setProperty("--DOC-SCROLLBAR-WIDTH", `${w}px`);
      return w;
    };
    measure();
    const ro = new ResizeObserver((entries) => {
      if (!entries[0].target.clientHeight) return;
      if (measure() >= 10) ro.disconnect();
    });
    const raf = requestAnimationFrame(() => ro.observe(doc.body));
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return null;
}
