import { site } from "@/lib/site";

export function GoogleRatingBadge() {
  const { googleRating, googleReviewCount } = site.business;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-brand-gray-medium">Google</span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-brand-gray-medium">Google Rating</span>
        <div className="flex items-center gap-1">
          <span className="text-lg font-extrabold text-brand-secondary">{googleRating}</span>
          <Stars rating={googleRating} />
        </div>
      </div>
      <span className="text-xs text-brand-gray-medium">{googleReviewCount} Reviews</span>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-brand-star" aria-label={`${rating} out of 5 stars`}>
      {"★★★★★".slice(0, rating)}
      {"☆☆☆☆☆".slice(0, 5 - rating)}
    </span>
  );
}
