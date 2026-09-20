import { Cta } from "./Cta";
import { Icon } from "./Icon";
import { getSite } from "../lib/db/site";

/**
 * The "Schedule Now / (864) 362-6329 / SAME DAY APPOINTMENTS" CTA block that
 * appears in every hero and community section on the original site.
 * Reproduces the original WP block group markup 1:1.
 */
export async function ScheduleAndCallCta({ className = "mb-3" }: { className?: string }) {
  const { business } = await getSite();
  return (
    <div
      className={`wp-block-group ${className} full-width-mobile schedule-and-call-cta is-content-justification-left is-nowrap is-layout-flex wp-container-core-group-is-layout-a1b15d37 wp-block-group-is-layout-flex`}
    >
      <div className="wp-block-group schedule-cta-container is-vertical is-content-justification-stretch is-layout-flex wp-container-core-group-is-layout-41171c72 wp-block-group-is-layout-flex">
        <Cta schedule icon="event">
          Schedule Now
        </Cta>

        <div aria-hidden="true" style={{ marginBottom: "-4px" }}></div>

        <a
          href={business.phoneHref}
          aria-label={`Call now: ${business.phoneHref.replace("tel:", "")}`}
          data-cta-gap="md"
          data-cta-type="solid"
          data-cta-content="mixed"
          data-cta-level="primary"
          data-cta-minwidth="true"
          className="cta phone-link"
        >
          <Icon name="phone" className="cta-icon" />
          <span data-show-on="desktop">{business.phone}</span>
          <span data-show-on="mobile">Call Now</span>
        </a>

        <p
          className="has-primary-color has-text-color has-link-color has-secondary-font-family has-small-font-size text-center wp-elements-2 wp-block-paragraph"
          style={{ textTransform: "uppercase" }}
        >
          <strong>Same Day Appointments Available by Phone</strong>
        </p>
      </div>
    </div>
  );
}
