import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSubServiceParams, getSubServiceContent } from "@/lib/subServices";
import { getServiceCategoryContent } from "@/lib/serviceCategories";
import { SubServiceTemplate } from "@/components/SubServiceTemplate";

export function generateStaticParams() {
  return getAllSubServiceParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subservice: string }>;
}): Promise<Metadata> {
  const { category, subservice } = await params;
  const sub = getSubServiceContent(category, subservice);
  if (!sub) return {};
  return {
    title: `${sub.title} | Carolina Heating Service`,
    description: sub.description,
  };
}

export default async function SubServicePage({
  params,
}: {
  params: Promise<{ category: string; subservice: string }>;
}) {
  const { category: categorySlug, subservice } = await params;
  const sub = getSubServiceContent(categorySlug, subservice);
  const category = getServiceCategoryContent(categorySlug);

  if (!sub || !category) {
    notFound();
  }

  return <SubServiceTemplate subService={sub} category={category} />;
}
