import Link from "next/link";
import { Icon } from "./Icon";
import { getSite } from "@/lib/db/site";

const LICENSE_LINES = [
  "Com/Indust/Equip Repair/Maint 2023-56064",
  "HVAC 2023-410",
  "Electrical 2023-16672",
];

export async function Footer() {
  const { business, footer } = await getSite();
  const year = new Date().getFullYear();

  const logo = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      width={3468}
      height={2120}
      src={business.logo}
      className="custom-logo"
      alt={`${business.name} Logo`}
      decoding="async"
    />
  );

  return (
    <footer id="colophon" className="site-footer | container">
      <div className="site-footer-content">
        <div className="site-footer-branding">
          <Link href="/" className="custom-logo-link" rel="home">
            {logo}
          </Link>
          <p className="site-footer-licence">
            {LICENSE_LINES.map((line, i) => (
              <span key={line}>
                {line}
                {i < LICENSE_LINES.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        <div className="site-footer-nav">
          {footer.columns.map((col, ci) => (
            <div className="footer-menu" key={ci}>
              <ul id={`secondary-menu-${ci + 1}`} className="menu-list">
                {col.map((link) => (
                  <li key={link.href + link.label} className="menu-item">
                    {link.href.startsWith("http") ? (
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-contact | flex-col flex-gap">
          <div className="paired-icon-text">
            <Icon name="geopin" className="paired-icon" />
            <p className="paired-text">
              <a href={business.mapUrl} target="_blank" rel="noreferrer">
                {business.address.street}, <br />
                {business.address.city}, {business.address.state} {business.address.zip}
              </a>
            </p>
          </div>
          <div className="paired-icon-text">
            <Icon name="phone" className="paired-icon" />
            <p className="paired-text">
              <a href={business.phoneHref} className="phone-link">
                {business.phone}
              </a>
            </p>
          </div>
          <div className="paired-icon-text">
            <Icon name="event" className="paired-icon" />
            <p className="paired-text">
              <Link href={business.scheduleUrl}>Schedule Online</Link>
            </p>
          </div>
          <ul className="footer-social-list | flex-row flex-gap">
            <li>
              <a href={business.social.facebook} target="_blank" rel="noreferrer" title="Facebook">
                <Icon name="facebook" /> <span className="visually-hidden">Find us on Facebook</span>
              </a>
            </li>
            <li>
              <a href={business.social.instagram} target="_blank" rel="noreferrer" title="Instagram">
                <Icon name="instagram" /> <span className="visually-hidden">Find us on Instagram</span>
              </a>
            </li>
            <li>
              <a href={business.social.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                <Icon name="linkedin" /> <span className="visually-hidden">Find us on LinkedIn</span>
              </a>
            </li>
            <li>
              <a href={business.social.youtube} target="_blank" rel="noreferrer" title="Social Media">
                <Icon name="web" /> <span className="visually-hidden">Find us on Social Media</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer-copyright">
        <div className="site-footer-branding">
          <Link href="/" className="custom-logo-link" rel="home">
            {logo}
          </Link>
        </div>
        <div className="site-footer-copyright__p">
          Copyright &copy; {year} {business.legalName}, All Rights Reserved.
          <Link className="inline-footer-menu-item" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="inline-footer-menu-item" href="/privacy-policy#california-notice">
            California Privacy Notice
          </Link>
          <Link className="inline-footer-menu-item" href="/terms-and-conditions">
            Terms and Conditions
          </Link>
          <Link className="inline-footer-menu-item" href="/sitemap">
            Sitemap
          </Link>{" "}
          <span className="site-footer-copyright__p__license">| {LICENSE_LINES.join(" ")}</span>
        </div>
      </div>
    </footer>
  );
}
