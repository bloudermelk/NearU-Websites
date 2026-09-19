import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllLocationSlugs, getLocationContent } from "@/lib/locations";
import { LocationTemplate } from "@/components/LocationTemplate";

export function generateStaticParams() {
  return getAllLocationSlugs().map((location) => ({ location }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  const content = getLocationContent(location);
  if (!content) return {};
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  const content = getLocationContent(location);

  if (!content) {
    notFound();
  }

  return <LocationTemplate content={content} />;
}
