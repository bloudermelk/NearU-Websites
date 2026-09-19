import { Cta } from "@/components/Cta";
import { getSite } from "@/lib/db/site";

export default async function NotFound() {
  const { business, serviceCategories } = await getSite();

  return (
    <main id="primary" className="site-main | container">
      <article className="container page type-page status-publish hentry">
        <div className="entry-content | container">
          <div className="container py-5 text-center flow">
            <h1 className="wp-block-heading">Page Not Found</h1>
            <p className="wp-block-paragraph">
              Sorry, we couldn&apos;t find that page. It may have moved, or the link may be out of date. Call{" "}
              <a href={business.phoneHref} className="phone-link">
                {business.phone}
              </a>{" "}
              if we can help you find what you&apos;re looking for.
            </p>
            <div className="d-flex justify-content-center flex-gap" style={{ flexWrap: "wrap" }}>
              <Cta href="/">Back to Home</Cta>
              <Cta schedule type="outline" trailingIcon="chevronright">
                Schedule Service
              </Cta>
            </div>

            {serviceCategories.length > 0 && (
              <div className="mt-4">
                <h2 className="wp-block-heading">Popular Services</h2>
                <ul className="wp-block-list" style={{ listStyle: "none", padding: 0 }}>
                  {serviceCategories.map((c) => (
                    <li key={c.slug}>
                      <a href={`/services/${c.slug}`}>{c.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
