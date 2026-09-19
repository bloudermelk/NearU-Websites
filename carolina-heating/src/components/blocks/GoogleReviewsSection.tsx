import { getSite } from "@/lib/db/site";
import { GoogleReviews } from "./GoogleReviews";
import type { Testimonial } from "@/lib/site";

/**
 * Server-component wrapper: fetches site data from Supabase and passes it
 * into the interactive (client) GoogleReviews carousel.
 */
export async function GoogleReviewsSection({
  reviews,
  className,
}: {
  reviews?: Testimonial[];
  className?: string;
}) {
  const site = await getSite();
  return (
    <GoogleReviews
      reviews={reviews ?? site.testimonials}
      googleRating={site.business.googleRating}
      googleReviewCount={site.business.googleReviewCount}
      className={className}
    />
  );
}
