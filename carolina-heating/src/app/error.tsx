"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Next.js error boundaries must be Client Components, so this can't call
 * getSite() — no business info available here. Kept intentionally simple and
 * theme-styled (reuses .container/.cta classes from theme.css) rather than
 * Next's default error overlay.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="primary" className="site-main | container">
      <div className="container py-5 text-center flow">
        <h1 className="wp-block-heading">Something Went Wrong</h1>
        <p className="wp-block-paragraph">
          Sorry about that — an unexpected error occurred while loading this page. Please try again.
        </p>
        <div className="d-flex justify-content-center flex-gap" style={{ flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            data-cta-gap="md"
            data-cta-type="solid"
            data-cta-content="mixed"
            data-cta-level="primary"
            data-cta-minwidth="true"
            className="cta"
          >
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            data-cta-gap="md"
            data-cta-type="outline"
            data-cta-content="mixed"
            data-cta-minwidth="true"
            className="cta"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
