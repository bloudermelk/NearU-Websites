import { getSite } from "../lib/db/site";

/** The small "Google Rating 5 ★★★★★" badge from the hero sections. */
export async function GoogleRatingBadge({ className = "mt-3" }: { className?: string }) {
  const { googleRating } = (await getSite()).business;
  return (
    <div className={`badge ${className}`} style={{ minHeight: "unset" }}>
      <div className="badge__content">
        <GoogleG />
        <div className="badge__content__rating-container">
          <p className="h6 badge__content__rating-container__title">Google Rating</p>
          <div className="badge__content__rating-container__stars">
            <div className="badge__content__rating-container__stars__number">{googleRating}</div>
            <div className="badge__content__rating-container__stars__container">
              <div className="badge__content__rating-container__stars__container__black">★★★★★</div>
              <div aria-hidden="true" className="badge__content__rating-container__stars__container__white">
                ☆☆☆☆☆
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path
        d="M42.0046 22.9145C42.0046 21.4661 41.8746 20.0733 41.6332 18.7363H22.395V26.647H33.3882C32.9054 29.191 31.457 31.3451 29.2844 32.7935V37.9373H35.9137C39.7762 34.372 42.0046 29.1353 42.0046 22.9145Z"
        fill="#4285F4"
      />
      <path
        d="M22.396 42.8766C27.9112 42.8766 32.535 41.0568 35.9147 37.9371L29.2854 32.7933C27.4655 34.0189 25.1443 34.7617 22.396 34.7617C17.0851 34.7617 12.5727 31.1777 10.9571 26.3496H4.16064V31.6234C7.52175 38.2899 14.4111 42.8766 22.396 42.8766Z"
        fill="#34A853"
      />
      <path
        d="M10.9608 26.3308C10.5523 25.1052 10.3109 23.8053 10.3109 22.4498C10.3109 21.0942 10.5523 19.7943 10.9608 18.5687V13.2949H4.16436C2.77164 16.0432 1.97314 19.1444 1.97314 22.4498C1.97314 25.7551 2.77164 28.8563 4.16436 31.6046L9.45671 27.4821L10.9608 26.3308Z"
        fill="#FBBC05"
      />
      <path
        d="M22.396 10.155C25.4043 10.155 28.0783 11.1949 30.2138 13.2004L36.0633 7.35097C32.5165 4.04557 27.9112 2.02148 22.396 2.02148C14.4111 2.02148 7.52175 6.60818 4.16064 13.2933L10.9571 18.567C12.5727 13.7389 17.0851 10.155 22.396 10.155Z"
        fill="#EA4335"
      />
    </svg>
  );
}
