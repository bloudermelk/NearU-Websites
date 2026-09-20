import Link from "next/link";
import { Icon } from "../Icon";
import { ICON_NAMES, type IconName } from "../../lib/iconSprite";
import { getSite } from "../../lib/db/site";

/** `service_categories.icon` is free text in the DB; only render ids the sprite actually has. */
function iconFor(icon: string | null): IconName {
  return icon && (ICON_NAMES as readonly string[]).includes(icon) ? (icon as IconName) : "hvac";
}

/**
 * The "Our Services" icon-card grid (#our-services on the homepage).
 * Mirrors the theme's services-list[data-layout=iconcards] block.
 */
export async function ServicesList({
  heading = "Our Services",
  id = "our-services",
}: {
  heading?: string;
  id?: string;
}) {
  const site = await getSite();
  return (
    <div
      id={id}
      className="services-list container py-5 has-background has-gray-light-background-color align-items-center"
      data-layout="iconcards"
      data-choose-services="toplevel"
    >
      <h2 className="mb-4 wp-block-heading">{heading}</h2>
      <div className="multi-component-container--stack-mobile multi-component-container multi-component-container--uniform-height multi-component-container--4-up">
        {site.serviceCategories.map((cat) => {
          const href = `/services/${cat.slug}`;
          return (
            <div key={cat.slug} className="card collapse-on-mobile has-white-background-color flow text-center p-3">
              <Link className="link stretch-link" href={href} aria-label={`Go to ${cat.title} page`} />
              <div className="acf-innerblocks-container">
                <div
                  className="iconblock has-background has-secondary-background-color has-text-color has-secondary-inverse-color"
                  data-size="lg"
                  data-padding="3"
                  data-display="block"
                >
                  <Icon name={iconFor(cat.icon)} />
                </div>
                <h2 className="wp-block-heading my-2">{cat.title}</h2>
                <Link
                  href={href}
                  aria-label={`Read More about ${cat.title}`}
                  data-cta-gap="md"
                  data-cta-type="outlined"
                  data-cta-content="mixed"
                  data-cta-minwidth="true"
                  className="cta"
                >
                  <span>Read More</span>
                  <Icon name="chevronright" className="cta-icon" />
                </Link>
              </div>
              <Icon name="chevronright" className="cta-icon" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
