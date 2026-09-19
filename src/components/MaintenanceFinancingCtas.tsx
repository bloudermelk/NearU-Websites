import Image from "next/image";
import { Cta } from "./Cta";

const maintenanceBenefits = [
  "15% Off Repair",
  "Heating & Cooling Tune-Up",
  "Reduced Dispatch Fees",
  "Priority Service",
  "Save More with Loyalty Points",
];

const financingBenefits = [
  "Budget-Friendly",
  "Access to Quality Services",
  "Timely Repairs",
  "Flexibility",
  "Increase Home Value",
  "Emergency Protection",
];

export function MaintenanceFinancingCtas() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm md:flex-row">
        <div className="relative h-48 w-full md:h-auto md:w-2/5">
          <Image
            src="https://carolinaheating.com/wp-content/uploads/sites/7/2024/03/A-Carolina-Heating-Service-technician-performing-maintenance.jpg"
            alt="Technician performing maintenance"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center p-6">
          <h3 className="font-heading text-xl font-bold text-brand-secondary">
            Need a Maintenance Plan?
          </h3>
          <p className="mt-1 text-sm font-semibold text-brand-gray-medium">
            What You Receive With the Carolina Comfort Club:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-gray-dark">
            {maintenanceBenefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Cta href="/maintenance" variant="outline" className="mt-4 self-start">
            Learn More
          </Cta>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm md:flex-row">
        <div className="relative h-48 w-full md:h-auto md:w-2/5">
          <Image
            src="https://carolinaheating.com/wp-content/uploads/sites/7/2024/03/A-Carolina-Heating-Service-employee-smiling-while-sitting-at-a-desk-and-working-on-their-computer.jpg"
            alt="Employee smiling at a desk"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center p-6">
          <h3 className="font-heading text-xl font-bold text-brand-secondary">
            Ask Us About Financing!
          </h3>
          <p className="mt-1 text-sm text-brand-gray-medium">
            Financing plans bring value and benefits to homeowners, so you can tackle repairs or
            upgrades without draining your savings.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-gray-dark">
            {financingBenefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Cta href="/financing" variant="outline" className="mt-4 self-start">
            Learn More
          </Cta>
        </div>
      </div>
    </div>
  );
}
