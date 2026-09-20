"use client";

import { useRef } from "react";
import Image from "next/image";
import { shimmerDataUrl } from "../../lib/imagePlaceholder";

export type LogoItem = {
  name: string;
  image: string;
  width: number;
  height: number;
};

/**
 * The theme's "logocarousel" ACF block: a horizontally scrolling strip of
 * logos with prev/next arrows and cloned items to allow continuous scroll.
 * The original renders two full sets of clones after the real items.
 */
export function LogoCarousel({ logos }: { logos: LogoItem[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelector<HTMLElement>(".logocarousel-item");
    const step = item ? item.offsetWidth : 160;
    list.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const renderItems = (clone: boolean, pass: number) =>
    logos.map((logo, i) => (
      <li
        key={`${pass}-${i}`}
        className={`logocarousel-item${clone ? " logocarousel-item--clone" : ""}`}
        aria-hidden={clone ? "true" : undefined}
      >
        <div className="logocarousel-wrap">
          <Image
            width={logo.width}
            height={logo.height}
            src={logo.image}
            className="logocarousel-image"
            alt={logo.name}
            sizes="(max-width: 680px) 150px, (max-width: 820px) 128px, (max-width: 1024px) 100px, 128px"
            placeholder="blur"
            blurDataURL={shimmerDataUrl(logo.width, logo.height)}
          />
        </div>
      </li>
    ));

  return (
    <div
      className="logocarousel"
      style={{ ["--count" as string]: logos.length }}
      data-logo-count={logos.length}
    >
      <button
        type="button"
        className="button-reset | logocarousel-arrow logocarousel-arrow--start"
        aria-label="See previous"
        onClick={() => scrollBy(-1)}
      >
        <svg className="logocarousel-arrow-icon" width="16" height="16" aria-hidden="true">
          <use href="#icon-chevronleft" />
        </svg>
      </button>
      <div className="logocarousel--inner-container">
        <ul
          role="list"
          className="logocarousel-list"
          ref={listRef}
          style={{ ["--logo-count" as string]: logos.length }}
        >
          {renderItems(false, 0)}
          {renderItems(true, 1)}
          {renderItems(true, 2)}
        </ul>
      </div>
      <button
        type="button"
        className="button-reset | logocarousel-arrow logocarousel-arrow--end"
        aria-label="See next"
        onClick={() => scrollBy(1)}
      >
        <svg className="logocarousel-arrow-icon" width="16" height="16" aria-hidden="true">
          <use href="#icon-chevronright" />
        </svg>
      </button>
    </div>
  );
}
