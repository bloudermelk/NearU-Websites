"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Ports the NearU theme's vanilla-JS behaviors so they work on the mirrored
 * WordPress HTML rendered by the catch-all route:
 *
 *  - carousel.js   -> .nearu-carousel prev/next/dots + scroll tracking
 *  - logocarousel  -> arrow buttons scroll the .logocarousel-list
 *  - lite-youtube  -> upgrades <lite-youtube videoid> into a click-to-play iframe
 *  - .se-widget-button -> opens the ServiceTitan scheduler modal (falls back
 *    to the button's normal href, e.g. /bookings, if the widget script or a
 *    scheduler id isn't configured for this site)
 *  - internal <a href="/..."> links inside mirrored HTML -> client-side
 *    navigation + viewport/hover prefetch, i.e. the same behaviour as a Next
 *    <Link>. Without this every click inside mirrored content is a full page
 *    reload (re-download + re-parse the HTML, the theme CSS and the JS bundle,
 *    then re-hydrate) — measured at several seconds to first paint on slow
 *    connections, versus near-instant for prefetched client navigations.
 *
 * Runs on mount and re-runs on client-side navigation. Idempotent: each element
 * is tagged with data-behaviors-bound so listeners aren't attached twice.
 * Mounted once in the root layout, so it covers every route including "/".
 */

/** Is this anchor a same-origin page link we should route client-side? */
function isClientNavigable(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute("href");
  if (!href || !href.startsWith("/") || href.startsWith("//")) return null; // external, tel:, mailto:, #hash
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download")) return null;
  if (/\.[a-z0-9]{2,5}(\?|#|$)/i.test(href.split("#")[0])) return null; // files (.pdf, .jpg, …)
  return href;
}

export function ThemeBehaviors() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ---------- Client-side navigation for links inside mirrored HTML ----------
    // Next <Link> elements handle their own clicks (and call preventDefault
    // before this document-level listener runs), so this only affects plain
    // anchors — i.e. the mirrored WordPress content.
    const onLinkClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!a) return;
      // "Schedule Now" buttons belong to the ServiceTitan handler below when a
      // scheduler is configured for this site; leave them alone here.
      if (a.closest(".se-widget-button") && document.body.dataset.schedulerId) return;
      const href = isClientNavigable(a);
      if (!href) return;
      e.preventDefault();
      router.push(href);
    };
    document.addEventListener("click", onLinkClick);
    cleanups.push(() => document.removeEventListener("click", onLinkClick));

    // Prefetch like <Link>: when a link scrolls into view, and on hover/focus.
    const prefetched = new Set<string>();
    const prefetch = (a: HTMLAnchorElement) => {
      const href = isClientNavigable(a);
      if (!href) return;
      const path = href.split("#")[0];
      if (path === pathname || prefetched.has(path)) return;
      prefetched.add(path);
      router.prefetch(path);
    };
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".simple-banner a[href^='/'], main a[href^='/'], footer a[href^='/']")
    );
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            prefetch(entry.target as HTMLAnchorElement);
            io.unobserve(entry.target);
          }
        },
        { rootMargin: "200px" }
      );
      anchors.forEach((a) => io.observe(a));
      cleanups.push(() => io.disconnect());
    }
    const onHover = (e: Event) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (a) prefetch(a);
    };
    document.addEventListener("mouseover", onHover, { passive: true });
    document.addEventListener("focusin", onHover, { passive: true });
    document.addEventListener("touchstart", onHover, { passive: true });
    cleanups.push(() => {
      document.removeEventListener("mouseover", onHover);
      document.removeEventListener("focusin", onHover);
      document.removeEventListener("touchstart", onHover);
    });

    // ---------- Review carousels (.nearu-carousel) ----------
    document.querySelectorAll<HTMLElement>(".nearu-carousel").forEach((track) => {
      if (track.dataset.behaviorsBound) return;
      track.dataset.behaviorsBound = "1";

      const container = track.closest<HTMLElement>(".container") ?? track.parentElement!;
      const dots = Array.from(container.querySelectorAll<HTMLElement>(".carousel-dots__dot"));
      const total = dots.length || track.children.length;
      const itemSel = track.firstElementChild?.classList.contains("card") ? ".card" : ".brick";

      track.setAttribute("data-nearu-carousel-slide", "1");
      track.setAttribute("data-nearu-carousel-total-slides", String(total));

      const setSlide = (n: number) => {
        dots.forEach((d) => d.classList.remove("selected"));
        dots[n - 1]?.classList.add("selected");
        track.setAttribute("data-nearu-carousel-slide", String(n));
      };

      const goTo = (n: number) => {
        const wrapped = n > total ? 1 : n < 1 ? total : n;
        const item = track.querySelectorAll<HTMLElement>(itemSel)[wrapped - 1];
        item?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        setSlide(wrapped);
      };

      let timeout: ReturnType<typeof setTimeout> | undefined;
      const onScroll = () => {
        const item = track.querySelector<HTMLElement>(itemSel);
        if (!item) return;
        const w = item.offsetWidth || 1;
        const aligned = track.scrollLeft % w === 0;
        clearTimeout(timeout);
        timeout = setTimeout(() => setSlide(Math.min(total, Math.max(1, Math.round(track.scrollLeft / w) + 1))), aligned ? 0 : 150);
      };
      track.addEventListener("scroll", onScroll);
      cleanups.push(() => track.removeEventListener("scroll", onScroll));

      const next = container.querySelector<HTMLElement>(".button-next");
      const prev = container.querySelector<HTMLElement>(".button-prev");
      const onNext = () => goTo(Number(track.getAttribute("data-nearu-carousel-slide")) + 1);
      const onPrev = () => goTo(Number(track.getAttribute("data-nearu-carousel-slide")) - 1);
      next?.addEventListener("click", onNext);
      prev?.addEventListener("click", onPrev);
      cleanups.push(() => {
        next?.removeEventListener("click", onNext);
        prev?.removeEventListener("click", onPrev);
      });

      dots.forEach((dot) => {
        const onDot = () => goTo(Number(dot.getAttribute("data-nearu-carousel-dot-index")));
        dot.addEventListener("click", onDot);
        cleanups.push(() => dot.removeEventListener("click", onDot));
      });
    });

    // ---------- Logo carousels (.logocarousel) ----------
    document.querySelectorAll<HTMLElement>(".logocarousel").forEach((carousel) => {
      if (carousel.dataset.behaviorsBound) return;
      carousel.dataset.behaviorsBound = "1";
      const list = carousel.querySelector<HTMLElement>(".logocarousel-list");
      if (!list) return;
      const step = () => list.querySelector<HTMLElement>(".logocarousel-item")?.offsetWidth ?? 160;
      const start = carousel.querySelector<HTMLElement>(".logocarousel-arrow--start");
      const end = carousel.querySelector<HTMLElement>(".logocarousel-arrow--end");
      const onStart = () => list.scrollBy({ left: -step(), behavior: "smooth" });
      const onEnd = () => list.scrollBy({ left: step(), behavior: "smooth" });
      start?.addEventListener("click", onStart);
      end?.addEventListener("click", onEnd);
      cleanups.push(() => {
        start?.removeEventListener("click", onStart);
        end?.removeEventListener("click", onEnd);
      });
    });

    // ---------- lite-youtube facades ----------
    document.querySelectorAll<HTMLElement>("lite-youtube").forEach((el) => {
      if (el.dataset.behaviorsBound) return;
      el.dataset.behaviorsBound = "1";
      const id = el.getAttribute("videoid");
      if (!id) return;
      el.style.backgroundImage = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`;
      if (!el.querySelector(".lty-playbtn")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lty-playbtn";
        btn.setAttribute("aria-label", "Play video");
        el.appendChild(btn);
      }
      const onPlay = () => {
        if (el.classList.contains("lyt-activated")) return;
        el.classList.add("lyt-activated");
        const iframe = document.createElement("iframe");
        iframe.width = "560";
        iframe.height = "315";
        iframe.title = "YouTube video";
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        el.appendChild(iframe);
        iframe.focus();
      };
      el.addEventListener("click", onPlay);
      cleanups.push(() => el.removeEventListener("click", onPlay));
    });

    // ---------- ServiceTitan scheduler (.se-widget-button) ----------
    // The real theme prints onclick="_scheduler.show({schedulerId:'...'})"
    // directly on each button (server-side, per-brand). We can't do that from
    // a shared client component, so we delegate: read the id once from
    // <body data-scheduler-id>, and only intercept the click if the
    // ServiceTitan widget script has actually loaded (window._scheduler).
    // Otherwise the link's normal href (the /bookings fallback page) applies.
    const onSchedulerClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>(".se-widget-button");
      if (!button) return;
      const schedulerId = document.body.dataset.schedulerId;
      const scheduler = (window as unknown as { _scheduler?: { show: (opts: { schedulerId: string }) => void } })
        ._scheduler;
      if (!schedulerId || !scheduler) return; // fall back to normal navigation
      e.preventDefault();
      scheduler.show({ schedulerId });
    };
    document.addEventListener("click", onSchedulerClick);
    cleanups.push(() => document.removeEventListener("click", onSchedulerClick));

    return () => cleanups.forEach((fn) => fn());
  }, [pathname, router]);

  return null;
}
