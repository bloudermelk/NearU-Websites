import { Cta } from "../Cta";
import { Elevated } from "./Elevated";

const MAINTENANCE_BENEFITS = [
  "15% Off Repair",
  "Heating & Cooling Tune-Up",
  "Reduced Dispatch Fees",
  "Priority Service",
  "Save More with Loyalty Points",
];

const FINANCING_BENEFITS = [
  "Budget-Friendly",
  "Access to Quality Services",
  "Timely Repairs",
  "Flexibility",
  "Increase Home Value",
  "Emergency Protection",
];

/** #maintenance-financing: red maintenance panel + white financing panel splitter. */
export function MaintenanceFinancing({
  maintenanceImage,
  financingImage,
}: {
  maintenanceImage: string;
  financingImage: string;
}) {
  return (
    <div
      id="maintenance-financing"
      className="container splitter splitter--uniform-height-stick-last"
      style={{ ["--CTX-container-split-size" as string]: 0.5 }}
    >
      <div className="splitter-column splitter-column--left splitter-column--start has-background has-primary-background-color">
        <div className="splitter-column-inner splitter-column-inner--contained splitter-column-inner--padded">
          <div className="wp-block-group flow w100 has-global-padding is-layout-constrained wp-container-core-group-is-layout-2468f3b8 wp-block-group-is-layout-constrained">
            <Elevated className="content-fullbleed-mobile w100 border-radius-lg">
              <figure className="wp-block-image size-full is-resized has-custom-border w100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  decoding="async"
                  loading="lazy"
                  width={1916}
                  height={1280}
                  src={maintenanceImage}
                  alt="A Carolina Heating Service technician performing maintenance"
                  style={{ borderRadius: 0, width: 288, height: "auto" }}
                />
              </figure>
            </Elevated>

            <h2 className="wp-block-heading mt-3 has-primary-inverse-color has-text-color has-link-color wp-elements-8">
              Need a Maintenance Plan?
            </h2>
            <p className="has-primary-inverse-color has-text-color has-link-color wp-elements-9 wp-block-paragraph">
              What You Receive With the Carolina Comfort Club:
            </p>
            <ul className="has-primary-inverse-color has-text-color has-link-color wp-block-list wp-elements-10">
              {MAINTENANCE_BENEFITS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Cta href="/maintenance" type="outline" trailingIcon="chevronright" className="full-width-mobile">
              Learn More
            </Cta>
          </div>
        </div>
      </div>

      <div className="splitter-column splitter-column--right splitter-column--start has-background has-primary-inverse-background-color">
        <div className="splitter-column-inner splitter-column-inner--contained splitter-column-inner--padded">
          <div className="wp-block-group flow has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
            <Elevated className="content-fullbleed-mobile border-radius-lg">
              <figure className="wp-block-image size-full has-custom-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  decoding="async"
                  loading="lazy"
                  width={1802}
                  height={1280}
                  src={financingImage}
                  alt="A Carolina Heating Service employee smiling while sitting at a desk and working on their computer"
                  style={{ borderRadius: 0 }}
                />
              </figure>
            </Elevated>

            <h2 className="wp-block-heading mt-3">Ask Us About Financing!</h2>
            <p className="mb-3 wp-block-paragraph">
              Financing plans bring value and benefits to homeowners. By opting for a financing option, you can
              tackle necessary repairs or upgrades without draining your savings or delaying important projects.
              Here are some key advantages:
            </p>
            <ul className="my-0 mb-0 wp-block-list">
              {FINANCING_BENEFITS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mt-3 wp-block-paragraph">
              Keep your home safe and comfortable with a finance plan. Always assess terms and interest rates to
              find the best one for your needs. A professional can help you make an informed decision.
            </p>
            <Cta href="/financing" trailingIcon="chevronright" className="full-width-mobile">
              Learn More
            </Cta>
          </div>
        </div>
      </div>
    </div>
  );
}
