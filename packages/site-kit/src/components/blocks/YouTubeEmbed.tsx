"use client";

import { useState } from "react";

/**
 * Renders the theme's <lite-youtube> markup (styled by lite-yt-embed.min.css,
 * which is part of theme.css) and swaps in the real iframe on click — the same
 * behavior lite-yt-embed.js provides on the live site.
 */
export function YouTubeEmbed({ videoId, title = "YouTube video" }: { videoId: string; title?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio has-black-background-color has-white-color text-center">
      <div className="wp-block-embed__wrapper">
        <lite-youtube
          videoid={videoId}
          className={playing ? "lyt-activated" : undefined}
          style={{ backgroundImage: `url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")` }}
          onClick={() => setPlaying(true)}
        >
          <button type="button" className="lty-playbtn" aria-label={`Play video: ${title}`} />
          {playing && (
            <iframe
              width={560}
              height={315}
              title={title}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </lite-youtube>
      </div>
    </figure>
  );
}
