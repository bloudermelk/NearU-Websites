"use client";

import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/site";

/**
 * #google-reviews section: the Google Reviews header + a "nearu-carousel" of
 * review cards with prev/next buttons and dots. Ports the theme's carousel.js
 * (scroll-snap on mobile, scrollIntoView on button/dot click, active dot
 * tracked from scroll position).
 *
 * Client component: site data (fetched from Supabase) is passed in as props
 * by the server-component parent — see GoogleReviewsSection below.
 */
export function GoogleReviews({
  reviews,
  googleRating,
  googleReviewCount,
  className = "",
}: {
  reviews: Testimonial[];
  googleRating: number;
  googleReviewCount: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(1);
  const total = reviews.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const card = track.querySelector<HTMLElement>(".card");
      if (!card) return;
      const w = card.offsetWidth || 1;
      const aligned = track.scrollLeft % w === 0;
      clearTimeout(timeout);
      timeout = setTimeout(
        () => setSlide(Math.min(total, Math.max(1, Math.round(track.scrollLeft / w) + 1))),
        aligned ? 0 : 150
      );
    };
    track.addEventListener("scroll", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [total]);

  const goTo = (n: number) => {
    const track = trackRef.current;
    if (!track) return;
    const wrapped = n > total ? 1 : n < 1 ? total : n;
    const card = track.querySelectorAll<HTMLElement>(".card")[wrapped - 1];
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setSlide(wrapped);
  };

  return (
    <div
      id="google-reviews"
      className={`wp-block-group container has-gray-light-background-color has-background ${className}`}
    >
      <div className="google-reviews-featured container py-5">
        <div className="google-reviews-featured__head">
          <div className="google-reviews-featured__head__logo">
            <GoogleWordmark />
            <div className="google-reviews-featured__head__logo__text">
              Reviews <span className="google-reviews-featured__head__logo__text__stars">★★★★★</span>
            </div>
          </div>
          <div className="google-reviews-featured__head__rating">
            <div className="google-reviews-featured__head__rating__stars">
              <div className="google-reviews-featured__head__rating__stars__black">★★★★★</div>
              <div className="google-reviews-featured__head__rating__stars__white">☆☆☆☆☆</div>
            </div>
            <div className="google-reviews-featured__head__rating__score">{googleRating}/5</div>
            <div className="google-reviews-featured__head__rating__number-of-reviews">
              <span>{googleReviewCount} Reviews</span>
            </div>
          </div>
        </div>

        <div className="google-reviews-featured__body">
          <div
            ref={trackRef}
            className="nearu-carousel multi-component-container multi-component-container--uniform-height"
            data-nearu-carousel-slide={slide}
            data-nearu-carousel-total-slides={total}
          >
            {reviews.map((r) => (
              <div key={r.author} className="card card--google-review has-white-background-color has-black-color">
                <div className="card__content">
                  <p className="card__content__title card__title h3" title={r.author} aria-label={r.author}>
                    {r.author}
                  </p>
                  <div className="card__content__title__stars">{"★★★★★".slice(0, r.rating)}</div>
                  <div className="card__content__description card__description">
                    <p>{r.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="nearu-carousel-controls">
            <div className="nearu-carousel-button button-prev" onClick={() => goTo(slide - 1)} role="button" aria-label="Previous review">
              <div className="iconblock" data-size="lg" data-padding="2" data-display="block">
                <svg className="icon" width="16" height="16" aria-hidden="true">
                  <use href="#icon-chevronleft" />
                </svg>
              </div>
            </div>
            <div className="carousel-dots">
              {reviews.map((_, i) => (
                <div
                  key={i}
                  role="button"
                  aria-label={`Go to slide ${i + 1} of ${total}`}
                  data-nearu-carousel-dot-index={i + 1}
                  className={`carousel-dots__dot${slide === i + 1 ? " selected" : ""}`}
                  onClick={() => goTo(i + 1)}
                />
              ))}
            </div>
            <div className="nearu-carousel-button button-next" onClick={() => goTo(slide + 1)} role="button" aria-label="Next review">
              <div className="iconblock" data-size="lg" data-padding="2" data-display="block">
                <svg className="icon" width="16" height="16" aria-hidden="true">
                  <use href="#icon-chevronright" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleWordmark() {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 107.3 35.2"
      xmlSpace="preserve"
    >
      <title>Google</title>
      <path
        fill="#4885ED"
        d="M26.4,12.4H13.9v3.7h8.9c-0.4,5.2-4.8,7.4-8.9,7.4c-5.4,0-9.8-4.3-9.8-9.7c0-0.1,0-0.1,0-0.2 c0-5.6,4.4-10,9.8-10c4.2,0,6.7,2.7,6.7,2.7l2.6-2.7c0,0-3.3-3.7-9.4-3.7C6,0,0,6.5,0,13.6c0,6.9,5.6,13.7,14,13.7 c7.3,0,12.7-5,12.7-12.4C26.6,13.3,26.4,12.4,26.4,12.4L26.4,12.4z"
      />
      <path
        fill="#DB3236"
        d="M36.6,9.7c-5.1,0-8.8,4-8.8,8.7c0,4.8,3.6,8.8,8.9,8.8c4.8,0,8.7-3.7,8.7-8.7 C45.4,12.7,40.9,9.7,36.6,9.7L36.6,9.7z M36.7,13.2c2.5,0,4.9,2,4.9,5.3c0,3.2-2.4,5.3-4.9,5.3c-2.8,0-5-2.2-5-5.3 C31.7,15.4,33.9,13.2,36.7,13.2L36.7,13.2z"
      />
      <path
        fill="#F4C20D"
        d="M55.8,9.7c-5.1,0-8.8,4-8.8,8.7 c0,4.8,3.6,8.8,8.9,8.8c4.8,0,8.7-3.7,8.7-8.7C64.6,12.7,60,9.7,55.8,9.7L55.8,9.7z M55.9,13.2c2.5,0,4.9,2,4.9,5.3 c0,3.2-2.4,5.3-4.9,5.3c-2.8,0-5-2.2-5-5.3C50.9,15.4,53,13.2,55.9,13.2L55.9,13.2z"
      />
      <path
        fill="#4885ED"
        d="M74.6,9.7c-4.7,0-8.4,4.1-8.4,8.8c0,5.3,4.3,8.8,8.3,8.8c2.5,0,3.8-1,4.8-2.1v1.7c0,3-1.8,4.8-4.6,4.8 c-2.7,0-4-2-4.5-3.1L66.9,30c1.2,2.5,3.6,5.2,7.9,5.2c4.7,0,8.3-3,8.3-9.1V10.3h-3.7v1.5C78.2,10.5,76.7,9.7,74.6,9.7L74.6,9.7z M75,13.2c2.3,0,4.7,2,4.7,5.3c0,3.4-2.4,5.3-4.7,5.3c-2.5,0-4.9-2-4.9-5.3C70.1,15.2,72.5,13.2,75,13.2L75,13.2z"
      />
      <path
        fill="#DB3236"
        d="M99.4,9.7c-4.4,0-8.2,3.5-8.2,8.8c0,5.5,4.2,8.8,8.6,8.8c3.7,0,6-2,7.4-3.8l-3-2c-0.8,1.2-2.1,2.4-4.3,2.4 c-2.5,0-3.6-1.3-4.3-2.7l11.8-4.9l-0.6-1.4C105.6,12.1,102.9,9.7,99.4,9.7L99.4,9.7z M99.6,13.1c1.6,0,2.8,0.9,3.2,1.9l-7.9,3.3 C94.6,15.7,97,13.1,99.6,13.1L99.6,13.1z"
      />
      <path fill="#3CBA54" d="M85.6,26.8h3.9V0.9h-3.9V26.8z" />
    </svg>
  );
}
