import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function ServiceGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {site.serviceCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/services/${category.slug}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <Image
              src={category.image}
              alt={category.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-heading text-lg font-bold text-brand-secondary">
              {category.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-brand-gray-medium">{category.summary}</p>
            <span className="mt-4 text-sm font-bold uppercase text-brand-primary">
              Read More &rarr;
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
