import { Cta } from "./Cta";
import { site } from "@/lib/site";

export function PhoneCtaRow() {
  const { business } = site;
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <Cta href={business.scheduleUrl}>Schedule Now</Cta>
      <a href={business.phoneHref} className="text-lg font-bold text-brand-secondary hover:text-brand-primary">
        {business.phone} Call Now
      </a>
      <p className="text-sm font-semibold text-brand-gray-medium">
        Same Day Appointments Available by Phone
      </p>
    </div>
  );
}
