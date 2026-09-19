import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllServiceCategorySlugs, getServiceCategoryContent } from "@/lib/serviceCategories";
import { ServiceCategoryTemplate } from "@/components/ServiceCategoryTemplate";

export function generateStaticParams() {
  return getAllServiceCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const content = getServiceCategoryContent(category);
  if (!content) return {};
  return {
    title: content.metaTitle,
    description: content.metaDescription,
  };
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const content = getServiceCategoryContent(category);

  if (!content) {
    notFound();
  }

  return <ServiceCategoryTemplate content={content} />;
}
