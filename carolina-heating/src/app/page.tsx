import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Cta } from "@/components/Cta";
import { ScheduleAndCallCta } from "@/components/ScheduleAndCallCta";
import { GoogleRatingBadge } from "@/components/GoogleRatingBadge";
import { Elevated } from "@/components/blocks/Elevated";
import { ServicesList } from "@/components/blocks/ServicesList";
import { IconList } from "@/components/blocks/IconList";
import { ImageStack } from "@/components/blocks/ImageStack";
import { OurCommunity } from "@/components/blocks/OurCommunity";
import { MaintenanceFinancing } from "@/components/blocks/MaintenanceFinancing";
import { Certifications } from "@/components/blocks/Certifications";
import { GoogleReviewsSection } from "@/components/blocks/GoogleReviewsSection";
import { YouTubeEmbed } from "@/components/blocks/YouTubeEmbed";
import { getSite } from "@/lib/db/site";
import { getPage } from "@/lib/db/pages";
import type { HomePageData } from "@/lib/db/homePageData";
import { buildPageSchema } from "@/lib/schema";
import { shimmerDataUrl } from "@/lib/imagePlaceholder";

export const revalidate = 3600; // see src/app/[...slug]/page.tsx for rationale

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("/");
  return {
    title: page?.title ?? undefined,
    description: page?.description ?? undefined,
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const [site, page] = await Promise.all([getSite(), getPage("/")]);
  if (!page || !page.data) notFound();
  const { hero, worryFree, promise, whoWeAre, ourCommunity, maintenanceFinancing } =
    page.data as HomePageData;
  const schema = buildPageSchema(site.business, { path: "/", title: page.title, description: page.description }, page.updated_at);

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    {page.inline_css && (
      <style id="core-block-supports-inline-css" dangerouslySetInnerHTML={{ __html: page.inline_css }} />
    )}
    <main id="primary" className="site-main | container">
      <article className="container page type-page status-publish hentry">
        <div className="entry-content | container">
          {/* ---------- Hero ---------- */}
          <section id="home" className="container section--services-hero pt-5 services-hero homepage-hero mb-4">
            <div className="section--services-hero__main">
              <div className="section--services-hero__main__row">
                <div className="section--services-hero__main__row__left">
                  <div className="acf-innerblocks-container">
                    <div className="wp-block-group is-vertical is-layout-flex wp-container-core-group-is-layout-2c90304e wp-block-group-is-layout-flex">
                      <div className="wp-block-group flow center-content-mobile has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
                        <h1 className="wp-block-heading mb-4 mt-0 has-secondary-color has-text-color has-link-color has-x-large-font-size wp-elements-1">
                          {hero.title}
                        </h1>

                        {/* Mobile-only hero image slot (empty on the original too) */}
                        <div className="elevated content-fullbleed-mobile box-shadow-lg-img d-lg-none mt-0 box-shadow-lg border-radius-lg">
                          <div className="acf-innerblocks-container"></div>
                        </div>

                        <ScheduleAndCallCta />
                        <GoogleRatingBadge />
                      </div>

                      <div className="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
                        <p className="wp-block-paragraph">{hero.body}</p>
                        <Cta href={hero.generatorCtaHref} icon="generator" ariaLabel={hero.generatorCtaLabel}>
                          {hero.generatorCtaLabel}
                        </Cta>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="section--services-hero__main__row__right">
                  <Elevated>
                    <figure className="wp-block-post-featured-image">
                      <Image
                        priority
                        width={2560}
                        height={1710}
                        src={hero.image}
                        className="attachment-full size-full"
                        alt="Two technicians standing in front of truck"
                        placeholder="blur"
                        blurDataURL={shimmerDataUrl(2560, 1710)}
                      />
                    </figure>
                  </Elevated>
                </div>
              </div>
            </div>
            <div className="section--services-hero__main section--services-hero__main--empty has-background has-none-background-color"></div>
          </section>

          {/* ---------- 10 Year Worry-Free cover ---------- */}
          <div className="wp-block-cover content-fullbleed mobile-gradient-full-cover" id="10-year-worry-free-system-coverage">
            <Image
              width={2284}
              height={1280}
              className="wp-block-cover__image-background wp-image-5034"
              alt="An exterior of a building with multiple AC units and flowers"
              src={hero.secondaryImage}
              style={{ objectPosition: "52% 10%" }}
              data-object-fit="cover"
              data-object-position="52% 10%"
              placeholder="blur"
              blurDataURL={shimmerDataUrl(2284, 1280)}
            />
            <span
              aria-hidden="true"
              className="wp-block-cover__background has-background-dim-40 has-background-dim wp-block-cover__gradient-background has-background-gradient"
              style={{ background: "linear-gradient(135deg,rgb(0,0,0) 0%,rgba(0,0,0,0) 100%)" }}
            ></span>
            <div className="wp-block-cover__inner-container has-global-padding is-layout-constrained wp-block-cover-is-layout-constrained">
              <div className="wp-block-group container has-primary-inverse-color has-text-color has-link-color wp-elements-3 is-content-justification-left">
                <div className="wp-block-group max-w-500 center-content-mobile has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
                  <h2 className="wp-block-heading mb-3 center-text-mobile has-large-font-size" style={{ textTransform: "uppercase" }}>
                    10 Year Worry-Free <br />
                    System Coverage
                  </h2>
                  <Cta href={worryFree.href} ariaLabel="Click here to learn more about our Services">
                    Learn More
                  </Cta>
                  <p className="has-text-align-center has-large-font-size wp-block-paragraph"></p>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Our Services ---------- */}
          <ServicesList />

          {/* ---------- The Carolina Heating Promise ---------- */}
          <div
            id="our-promise"
            className="container splitter py-5 has-background has-white-background-color"
            style={{ ["--CTX-container-split-size" as string]: 0.5 }}
          >
            <div className="splitter-column splitter-column--left splitter-column--start mobile-full-width splitter-column--padded-edge">
              <div className="splitter-column-inner splitter-column-inner--contained splitter-column-inner--padded">
                <div className="wp-block-group flow has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
                  <ImageStack items={promise.images} />
                </div>
              </div>
            </div>
            <div className="splitter-column splitter-column--right splitter-column--start splitter-column--padded-edge">
              <div className="splitter-column-inner splitter-column-inner--contained splitter-column-inner--padded">
                <h2 className="wp-block-heading h-decorator mb-3">{promise.heading}</h2>
                <IconList items={promise.items} />
              </div>
            </div>
          </div>

          {/* ---------- Our Community ---------- */}
          <OurCommunity mapImage={ourCommunity.mapImage} />

          {/* ---------- Who we are ---------- */}
          <div
            id="who-we-are"
            className="container splitter py-5 has-background has-secondary-background-color"
            style={{ ["--CTX-container-split-size" as string]: 0.5 }}
          >
            <div className="splitter-column splitter-column--left splitter-column--center splitter-column--padded-edge">
              <div className="splitter-column-inner splitter-column-inner--contained splitter-column-inner--padded">
                <div className="wp-block-group flow w100 has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
                  <h2
                    className="wp-block-heading has-white-color has-text-color has-link-color has-large-font-size wp-elements-6"
                    style={{ fontStyle: "normal", fontWeight: 600, textTransform: "none" }}
                  >
                    {whoWeAre.heading}
                  </h2>
                  <p className="has-primary-inverse-color has-text-color has-link-color wp-elements-7 wp-block-paragraph">
                    {whoWeAre.body}
                  </p>
                  <Cta href={whoWeAre.href} type="outline" trailingIcon="chevronright">
                    Learn More
                  </Cta>
                </div>
              </div>
            </div>
            <div className="splitter-column splitter-column--right splitter-column--center splitter-column--padded-edge">
              <div className="splitter-column-inner splitter-column-inner--contained">
                <Elevated>
                  <YouTubeEmbed videoId={site.business.youtubeVideoId} title="Carolina Heating Service" />
                </Elevated>
              </div>
            </div>
          </div>

          <MaintenanceFinancing
            maintenanceImage={maintenanceFinancing.maintenanceImage}
            financingImage={maintenanceFinancing.financingImage}
          />
          <Certifications />
          <GoogleReviewsSection />
        </div>
      </article>
    </main>
    </>
  );
}
