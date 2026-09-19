import { LogoCarousel } from "./LogoCarousel";
import { site } from "@/lib/site";

/** #our-certifications section: "Our Certifications & Awards" logo carousel. */
export function Certifications() {
  return (
    <div id="our-certifications" className="container certifications-and-awards py-5">
      <h2 className="wp-block-heading has-text-align-center mb-4 d-inline-block h-decorator h-decorator--primary">
        Our Certifications &amp; Awards
      </h2>
      <LogoCarousel logos={site.certifications} />
    </div>
  );
}
