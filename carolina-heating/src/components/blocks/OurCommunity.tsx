import Link from "next/link";
import Image from "next/image";
import { ScheduleAndCallCta } from "../ScheduleAndCallCta";
import { getSite } from "@/lib/db/site";
import { shimmerDataUrl } from "@/lib/imagePlaceholder";

/**
 * #our-community splitter: logo + "Serving the communities in Greenville..."
 * copy + schedule CTA on the left, service-area map on the right.
 */
export async function OurCommunity({
  heading = "Serving the communities in Greenville, South Carolina, for over 40 Years.",
  body = "Carolina Heating Service is known for reputable home comfort services throughout the Greenville, SC area. With a history dating back to 1981, our expertise initially focused on heating and air conditioning. Over time, we expanded to include plumbing, electrical, drains, generators, and indoor air quality systems. Our continued commitment to exceptional service and highly trained technicians reflects our dedication to customer satisfaction throughout the Upstate.",
  mapImage,
}: {
  heading?: string;
  body?: string;
  /** Required — always passed by page.tsx from the homepage's Supabase-stored data. */
  mapImage: string;
}) {
  const { business } = await getSite();
  return (
    <div
      id="our-community"
      className="container splitter mobile-flip-splitter has-background has-white-background-color"
      style={{ ["--CTX-container-split-size" as string]: 0.5 }}
    >
      <div className="splitter-column splitter-column--left splitter-column--center splitter-column--padded-edge">
        <div className="splitter-column-inner splitter-column-inner--contained splitter-column-inner--padded">
          <div className="wp-block-group flow has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
            <div className="wp-block-site-logo">
              <Link href="/" className="custom-logo-link" rel="home">
                <Image
                  width={200}
                  height={122}
                  src={business.logo}
                  className="custom-logo"
                  alt={`${business.name} Logo`}
                  placeholder="blur"
                  blurDataURL={shimmerDataUrl(200, 122)}
                />
              </Link>
            </div>
            <h2
              className="wp-block-heading h-decorator h-decorator--primary has-secondary-color has-text-color has-link-color wp-elements-4"
              style={{ fontStyle: "normal", fontWeight: 600 }}
            >
              {heading}
            </h2>
            <p className="wp-block-paragraph">{body}</p>
            <ScheduleAndCallCta />
          </div>
        </div>
      </div>

      <div className="splitter-column splitter-column--right splitter-column--stretch">
        <div className="splitter-column-inner">
          <figure className="wp-block-image size-full">
            <Image
              width={2560}
              height={1818}
              src={mapImage}
              alt="CHS Service Area Map Highlighted"
              className="wp-image-4911"
              placeholder="blur"
              blurDataURL={shimmerDataUrl(2560, 1818)}
            />
          </figure>
        </div>
      </div>
    </div>
  );
}
