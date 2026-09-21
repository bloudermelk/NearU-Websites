"use client";

import { useState } from "react";

/**
 * YouTube facade for the landing homepage: renders the poster image and only
 * loads the (third-party) iframe after the visitor clicks, so the entry visit
 * ships zero YouTube JS.
 */
export function LandingVideo({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button type="button" className="lp-video" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- third-party host, not in images.remotePatterns */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        width={480}
        height={360}
        alt={title}
        loading="lazy"
        decoding="async"
      />
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <span className="lp-play" aria-hidden="true">
          <span />
        </span>
      )}
    </button>
  );
}
