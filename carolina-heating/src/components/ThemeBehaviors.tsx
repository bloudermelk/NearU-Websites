"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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
 *
 * Runs on mount and re-runs on client-side navigation. Idempotent: each element
 * is tagged with data-behaviors-bound so listeners aren't attached twice.
 * Mounted once in the root layout, so it covers every route including "/".
 */
export function ThemeBehaviors() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: Array<() => void> = [];

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
  }, [pathname]);

  return null;
}
