"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

const COOKIE_NAME = "cookieConsent_acknowledged";
const COOKIE_DURATION_DAYS = 7;

/**
 * Faithful port of the NearU theme's `<cookie-consent>` custom element
 * (nearu-base/dist/js/cookie-consent.js). It's part of the theme itself, not
 * a third-party consent-management SaaS: a simple dismissible notice that
 * remembers acknowledgment in a cookie for 7 days. Renders the exact tag
 * name/classes from the original markup so theme.css styling (fixed bottom
 * bar, already captured in theme.css) applies unchanged.
 */
export function CookieConsent({ noticeHtml }: { noticeHtml: string }) {
  const [dismissed, setDismissed] = useState(true); // avoid flash before the mount check runs

  useEffect(() => {
    // Reads `document.cookie`, which only exists on the client — this must
    // run in an effect (not a lazy useState initializer) so the server-
    // rendered HTML and the client's first paint match (both start
    // `dismissed=true`), avoiding a hydration mismatch. The one-time re-
    // render this causes on mount is the intended trade-off.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=`)));
  }, []);

  if (dismissed || !noticeHtml) return null;

  const acknowledge = () => {
    const expires = new Date(Date.now() + COOKIE_DURATION_DAYS * 864e5).toUTCString();
    document.cookie = `${COOKIE_NAME}=true; expires=${expires}; path=/`;
    setDismissed(true);
  };

  return (
    <cookie-consent module-type="banner" className="container">
      <div className="container | cc-container">
        <div className="cc-container--inner">
          {/* Copy comes from the company row (identical across every brand). */}
          <p className="cookie-consent-message" dangerouslySetInnerHTML={{ __html: noticeHtml }} />
          <div className="cookie-consent-actions">
            <button
              type="button"
              aria-label="Close banner"
              data-cta-gap="md"
              data-cta-type="solid"
              data-cta-content="mixed"
              data-cta-level="secondary"
              data-cta-minwidth="false"
              data-cookie-consent-action="acknowledge"
              className="cta"
              onClick={acknowledge}
            >
              <Icon name="close" className="cta-icon" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </cookie-consent>
  );
}
