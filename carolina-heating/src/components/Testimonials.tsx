import { site } from "@/lib/site";
import { Stars } from "./GoogleRatingBadge";

export function Testimonials() {
  const { business, testimonials } = site;
  return (
    <div>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-sm font-semibold text-brand-gray-medium">Google</span>
        <h2 className="text-2xl font-heading font-bold text-brand-secondary">
          Reviews <Stars rating={business.googleRating} />
        </h2>
        <p className="text-sm text-brand-gray-medium">
          {business.googleRating}/5 &middot; {business.googleReviewCount} Reviews
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote
            key={t.author}
            className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white p-6 shadow-sm"
          >
            <Stars rating={t.rating} />
            <p className="flex-1 text-sm text-brand-gray-dark">{t.body}</p>
            <cite className="text-sm font-bold not-italic text-brand-secondary">{t.author}</cite>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
