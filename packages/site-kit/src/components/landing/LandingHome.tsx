import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "../Icon";
import { ICON_NAMES, type IconName } from "../../lib/iconSprite";
import type { SiteData } from "../../lib/site";
import type { LandingPageData } from "../../lib/db/homePageData";
import { shimmerDataUrl } from "../../lib/imagePlaceholder";
import { LandingVideo } from "./LandingVideo";
import { LANDING_CSS } from "./landingCss";

/**
 * Conversion-first landing homepage (page_type='home'). One job: turn a visitor
 * into a booked call. Every string comes from `pages.data` (LandingPageData)
 * or `sites`, so the same component serves any brand that opts in.
 *
 * Sits inside the normal site chrome (theme header with nav + footer); this
 * renders only <main>. Styles are scoped under `.lp` — see landingCss.ts.
 */
export function LandingHome({ site, data }: { site: SiteData; data: LandingPageData }) {
  const { business, serviceCategories, certifications, testimonials } = site;
  const rating = Number.isInteger(business.googleRating) ? `${business.googleRating}.0` : String(business.googleRating);

  /** Fill `{token}`s in copy from the sites row so brand facts never drift from the DB. */
  const fill = (s: string) =>
    s
      .replaceAll("{name}", business.name)
      .replaceAll("{phone}", business.phone)
      .replaceAll("{years}", String(business.yearsInBusiness))
      .replaceAll("{founded}", String(business.foundedYear))
      .replaceAll("{areaServed}", business.areaServed)
      .replaceAll("{rating}", rating)
      .replaceAll("{reviewCount}", String(business.googleReviewCount))
      .replaceAll("{serviceCount}", String(serviceCategories.length))
      .replaceAll("{city}", business.address.city)
      .replaceAll("{state}", business.address.state);

  const iconFor = (name: string | null | undefined, fallback: IconName = "hvac"): IconName =>
    name && (ICON_NAMES as readonly string[]).includes(name) ? (name as IconName) : fallback;

  const videoId = data.why.videoId || business.youtubeVideoId;
  const videoTitle = `Meet ${business.name}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.items.map((f) => ({
      "@type": "Question",
      name: fill(f.q),
      acceptedAnswer: { "@type": "Answer", text: fill(f.a) },
    })),
  };

  return (
    <main id="primary" className="site-main lp">
      <style id="landing-css" dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ---------------- Hero + lead form ---------------- */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-bg" aria-hidden="true">
          <Image
            priority
            fetchPriority="high"
            src={data.hero.image.src}
            width={data.hero.image.width}
            height={data.hero.image.height}
            sizes="100vw"
            alt=""
            placeholder="blur"
            blurDataURL={shimmerDataUrl(data.hero.image.width, data.hero.image.height)}
          />
        </div>
        <div className="lp-wrap">
          <div>
            <span className="lp-eyebrow">{fill(data.hero.eyebrow)}</span>
            <h1>{fill(data.hero.title)}</h1>
            <p className="lp-lead">{fill(data.hero.body)}</p>
            <div className="lp-actions">
              <CallButton business={business} className="btn-red btn-lg" />
              <BookButton business={business} className="btn-ghost btn-lg" />
            </div>
            <div className="lp-chips">
              <span className="lp-chip">
                <Stars /> {rating} on Google ({business.googleReviewCount} reviews)
              </span>
              {data.hero.chips.map((c) => (
                <span className="lp-chip" key={c}>
                  <Icon name="check" className="i" /> {fill(c)}
                </span>
              ))}
            </div>
          </div>

          <aside className="lp-card-form" aria-labelledby="lp-form-title">
            <h2 id="lp-form-title">{fill(data.form.heading)}</h2>
            <p className="lp-sub">{fill(data.form.sub)}</p>
            {/* Plain GET form: works with zero JS. Pre-fills the booking page with the visitor's answers. */}
            <form className="lp-form" action={business.scheduleUrl} method="get">
              <div className="lp-form-row">
                <label>
                  Name
                  <input name="name" autoComplete="name" placeholder="Jane Smith" required />
                </label>
                <label>
                  Phone
                  <input name="phone" type="tel" autoComplete="tel" placeholder="(864) 555-0100" required />
                </label>
              </div>
              <label>
                What do you need help with?
                <select name="service" required defaultValue="">
                  <option value="" disabled>
                    Choose a service
                  </option>
                  {serviceCategories.map((c) => (
                    <option value={c.slug} key={c.slug}>
                      {c.shortTitle}
                    </option>
                  ))}
                  <option value="other">Something else / not sure</option>
                </select>
              </label>
              <label>
                ZIP code
                <input name="zip" inputMode="numeric" autoComplete="postal-code" placeholder={business.address.zip} pattern="[0-9]{5}" />
              </label>
              <button className="btn btn-red btn-lg btn-block" type="submit">
                <Icon name="event" className="i" />
                <span>{fill(data.form.submitLabel)}</span>
              </button>
              <div className="lp-or">or</div>
              <p className="lp-form-note">
                {fill(data.form.phoneNote)} <a href={business.phoneHref}>{business.phone}</a>
              </p>
            </form>
          </aside>
        </div>
      </section>

      {/* ---------------- Trust bar ---------------- */}
      {certifications.length > 0 && (
        <div className="lp-trust">
          <div className="lp-wrap">
            <div className="lp-trust-rating">
              <GoogleG />
              <div>
                {rating} <Stars />
                <small>{business.googleReviewCount} Google reviews</small>
              </div>
            </div>
            {certifications.map((c) => (
              <Image key={c.image} src={c.image} width={c.width} height={c.height} alt={c.name} sizes="150px" />
            ))}
          </div>
        </div>
      )}

      {/* ---------------- Services ---------------- */}
      <section className="lp-section" id="services">
        <div className="lp-wrap">
          <div className="lp-head lp-center">
            <span className="lp-eyebrow">{fill(data.services.eyebrow)}</span>
            <h2>{fill(data.services.heading)}</h2>
            <p className="lp-lead">{fill(data.services.body)}</p>
          </div>
          <div className="lp-grid lp-grid-4">
            {serviceCategories.map((c) => (
              <Link className="lp-svc" href={`/services/${c.slug}`} key={c.slug} aria-label={c.title}>
                <div className="lp-svc-icon">
                  <Icon name={iconFor(c.icon)} className="i" />
                </div>
                <h3>{c.shortTitle}</h3>
                <p>{c.summary}</p>
                <span className="lp-svc-more">
                  Book {c.shortTitle.toLowerCase()} service <Icon name="chevronright" className="i" />
                </span>
              </Link>
            ))}
            <a className="lp-svc lp-svc-call" href={business.phoneHref}>
              <div className="lp-svc-icon">
                <Icon name="phone" className="i" />
              </div>
              <h3>{fill(data.services.callCard.heading)}</h3>
              <p>{fill(data.services.callCard.body)}</p>
              <span className="lp-svc-more">
                {business.phone} <Icon name="chevronright" className="i" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- Offers ---------------- */}
      <section className="lp-section lp-offers" id="offers">
        <div className="lp-wrap">
          <div className="lp-head">
            <span className="lp-eyebrow">{fill(data.offers.eyebrow)}</span>
            <h2>{fill(data.offers.heading)}</h2>
            <p className="lp-lead">{fill(data.offers.body)}</p>
          </div>
          <div className="lp-grid lp-grid-3">
            {data.offers.items.map((o) => (
              <article className={`lp-offer${o.featured ? " featured" : ""}`} key={o.title}>
                <div className="lp-svc-icon">
                  <Icon name={iconFor(o.icon, "money")} className="i" />
                </div>
                <span className="lp-eyebrow">{fill(o.eyebrow)}</span>
                <h3>{fill(o.title)}</h3>
                <p>{fill(o.body)}</p>
                <SmartLink href={o.href} className={`btn ${o.featured ? "" : "btn-ghost"}`}>
                  <span>{fill(o.cta)}</span>
                  <Icon name="chevronright" className="i" />
                </SmartLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Why us ---------------- */}
      <section className="lp-section lp-why" id="why">
        <div className="lp-wrap">
          <div>
            {videoId && <LandingVideo videoId={videoId} title={videoTitle} />}
            {data.why.photos.length > 0 && (
              <div className="lp-photos">
                {data.why.photos.map((p) => (
                  <Image
                    key={p.src}
                    src={p.src}
                    width={p.width}
                    height={p.height}
                    alt={p.alt}
                    sizes="(min-width: 960px) 300px, 50vw"
                    placeholder="blur"
                    blurDataURL={shimmerDataUrl(p.width, p.height)}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <span className="lp-eyebrow">{fill(data.why.eyebrow)}</span>
            <h2>{fill(data.why.heading)}</h2>
            <p className="lp-lead">{fill(data.why.body)}</p>
            <div className="lp-stats">
              {data.why.stats.map((s) => (
                <div className="lp-stat" key={s.label}>
                  <b>{fill(s.value)}</b>
                  <span>{fill(s.label)}</span>
                </div>
              ))}
            </div>
            <ul className="lp-checks">
              {data.why.points.map((p) => (
                <li key={p.label}>
                  <Icon name="check" className="i" />
                  <div>
                    <b>{fill(p.label)}</b>
                    <p>{fill(p.description)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="lp-actions">
              <SmartLink href={data.why.ctaHref} className="btn btn-outline">
                <span>{fill(data.why.ctaLabel)}</span>
                <Icon name="chevronright" className="i" />
              </SmartLink>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="lp-section lp-steps" id="how">
        <div className="lp-wrap">
          <div className="lp-head lp-center">
            <span className="lp-eyebrow">{fill(data.steps.eyebrow)}</span>
            <h2>{fill(data.steps.heading)}</h2>
          </div>
          <div className="lp-grid lp-grid-3">
            {data.steps.items.map((s, i) => (
              <article className="lp-step" key={s.title}>
                <b className="n">{i + 1}</b>
                <h3>{fill(s.title)}</h3>
                <p>{fill(s.body)}</p>
              </article>
            ))}
          </div>
          <div className="lp-actions">
            <CallButton business={business} className="btn-red btn-lg" />
            <BookButton business={business} className="btn-outline btn-lg" />
          </div>
        </div>
      </section>

      {/* ---------------- Reviews ---------------- */}
      {testimonials.length > 0 && (
        <section className="lp-section" id="reviews">
          <div className="lp-wrap">
            <div className="lp-reviews-head">
              <div className="lp-head">
                <span className="lp-eyebrow">{fill(data.reviews.eyebrow)}</span>
                <h2>{fill(data.reviews.heading)}</h2>
              </div>
              <a className="lp-gscore" href={business.mapUrl} target="_blank" rel="noopener noreferrer">
                <GoogleG />
                <div>
                  <b>{rating}</b>
                  <small>
                    <Stars /> · {business.googleReviewCount} reviews on Google
                  </small>
                </div>
              </a>
            </div>
            <div className="lp-grid lp-grid-3">
              {testimonials.map((r) => (
                <article className="lp-review" key={r.author}>
                  <Stars n={r.rating} />
                  <blockquote>“{r.body}”</blockquote>
                  <footer>
                    <div className="lp-avatar" aria-hidden="true">
                      {initials(r.author)}
                    </div>
                    <div>
                      <b>{r.author}</b>
                      <small>Google review · {business.locationLabel}</small>
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Service area ---------------- */}
      <section className="lp-section lp-area" id="area">
        <div className="lp-wrap">
          <Image
            className="lp-map"
            src={data.area.map.src}
            width={data.area.map.width}
            height={data.area.map.height}
            alt={fill(data.area.map.alt)}
            sizes="(min-width: 960px) 580px, 100vw"
            placeholder="blur"
            blurDataURL={shimmerDataUrl(data.area.map.width, data.area.map.height)}
          />
          <div>
            <span className="lp-eyebrow">{fill(data.area.eyebrow)}</span>
            <h2>{fill(data.area.heading)}</h2>
            <p className="lp-lead">{fill(data.area.body)}</p>
            <div className="lp-addr">
              <div>
                <Icon name="geopin" className="i" />
                <span>
                  {business.address.street}, {business.address.city}, {business.address.state} {business.address.zip}
                </span>
              </div>
              <div>
                <Icon name="phone" className="i" />
                <a href={business.phoneHref}>{business.phone}</a>
              </div>
              {business.email && (
                <div>
                  <Icon name="mail" className="i" />
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </div>
              )}
              <div>
                <Icon name="clock" className="i" />
                <span>Same-day appointments available by phone</span>
              </div>
            </div>
            <div className="lp-actions">
              <CallButton business={business} className="btn-red" />
              {business.mapUrl && (
                <a className="btn btn-outline" href={business.mapUrl} target="_blank" rel="noopener noreferrer">
                  <span>Find us on Google Maps</span>
                  <Icon name="chevronright" className="i" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="lp-section" id="faq">
        <div className="lp-wrap">
          <div className="lp-head lp-center">
            <span className="lp-eyebrow">{fill(data.faq.eyebrow)}</span>
            <h2>{fill(data.faq.heading)}</h2>
          </div>
          <div className="lp-faq">
            {data.faq.items.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  {fill(f.q)}
                  <Icon name="chevrondown" className="i" />
                </summary>
                <p>{fill(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="lp-section lp-final" id="book">
        <div className="lp-wrap">
          <h2>{fill(data.finalCta.heading)}</h2>
          <p className="lp-lead">{fill(data.finalCta.body)}</p>
          <div className="lp-actions">
            <CallButton business={business} className="btn-red btn-lg" />
            <BookButton business={business} className="btn-ghost btn-lg" />
          </div>
        </div>
      </section>

      {/* Mobile-only sticky Call / Book bar */}
      <div className="lp-mbar">
        <CallButton business={business} className="btn-red" label="Call now" />
        <BookButton business={business} className="btn-dark" />
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ bits */

function CallButton({ business, className, label }: { business: SiteData["business"]; className: string; label?: string }) {
  return (
    <a className={`btn ${className}`} href={business.phoneHref}>
      <Icon name="phone" className="i" />
      <span>{label ?? `Call ${business.phone}`}</span>
    </a>
  );
}

/** `se-widget-button` matches the theme's schedule CTAs so the ServiceTitan widget can hook it when enabled. */
function BookButton({ business, className, label = "Book online" }: { business: SiteData["business"]; className: string; label?: string }) {
  return (
    <Link className={`btn ${className} se-widget-button`} href={business.scheduleUrl}>
      <Icon name="event" className="i" />
      <span>{label}</span>
    </Link>
  );
}

function SmartLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const external = /^(https?:|tel:|mailto:)/.test(href);
  return external ? (
    <a className={className} href={href} rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="lp-stars" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(Math.max(0, Math.min(5, n)))}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function GoogleG() {
  return (
    <svg className="g" viewBox="0 0 45 45" fill="none" aria-hidden="true">
      <path d="M42.0046 22.9145C42.0046 21.4661 41.8746 20.0733 41.6332 18.7363H22.395V26.647H33.3882C32.9054 29.191 31.457 31.3451 29.2844 32.7935V37.9373H35.9137C39.7762 34.372 42.0046 29.1353 42.0046 22.9145Z" fill="#4285F4" />
      <path d="M22.396 42.8766C27.9112 42.8766 32.535 41.0568 35.9147 37.9371L29.2854 32.7933C27.4655 34.0189 25.1443 34.7617 22.396 34.7617C17.0851 34.7617 12.5727 31.1777 10.9571 26.3496H4.16064V31.6234C7.52175 38.2899 14.4111 42.8766 22.396 42.8766Z" fill="#34A853" />
      <path d="M10.9608 26.3308C10.5523 25.1052 10.3109 23.8053 10.3109 22.4498C10.3109 21.0942 10.5523 19.7943 10.9608 18.5687V13.2949H4.16436C2.77164 16.0432 1.97314 19.1444 1.97314 22.4498C1.97314 25.7551 2.77164 28.8563 4.16436 31.6046L9.45671 27.4821L10.9608 26.3308Z" fill="#FBBC05" />
      <path d="M22.396 10.155C25.4043 10.155 28.0783 11.1949 30.2138 13.2004L36.0633 7.35097C32.5165 4.04557 27.9112 2.02148 22.396 2.02148C14.4111 2.02148 7.52175 6.60818 4.16064 13.2933L10.9571 18.567C12.5727 13.7389 17.0851 10.155 22.396 10.155Z" fill="#EA4335" />
    </svg>
  );
}
