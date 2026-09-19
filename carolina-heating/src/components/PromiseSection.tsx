const promises = [
  {
    title: "Responsive Service",
    body: "Your satisfaction is our top priority. We address your HVAC, plumbing, and electrical needs promptly and efficiently, with solid solutions and support you can count on.",
  },
  {
    title: "Expert Technicians",
    body: "Every technician is trained and certified, so you can trust the work the first time, every time.",
  },
  {
    title: "Transparent Communication",
    body: "Clear, open dialogue keeps you informed every step of the way, with honesty and integrity in every interaction.",
  },
  {
    title: "Quality Workmanship",
    body: "From installation to maintenance and repairs, we strive for excellence in every job, so your home is in capable hands.",
  },
];

export function PromiseSection() {
  return (
    <div>
      <h2 className="text-center text-2xl font-heading font-bold text-brand-secondary sm:text-3xl">
        The Carolina Heating Promise
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {promises.map((item) => (
          <div key={item.title}>
            <h3 className="font-heading text-lg font-bold text-brand-primary">{item.title}</h3>
            <p className="mt-2 text-sm text-brand-gray-medium">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
