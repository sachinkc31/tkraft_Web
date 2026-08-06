import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCategoryBySlug, getAllCategorySlugs, getProducts } from "@/services/woocommerce";
import { CategoryClient } from "@/features/category/category-client";
import { ProductCardSkeleton } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = 
    slug === "storage-organization" ? "storage-and-organization" :
    slug === "kitchen-products" ? "kitchen" :
    slug === "cleaning-essentials" ? "cleaning-essential" : 
    slug;
  const category = await getCategoryBySlug(targetSlug).catch(() => null);
  if (!category) return { title: "Category Not Found" };
  const ogTitle = `${category.name} | ${SITE_CONFIG.name}`;
  const ogDesc = category.description || `Shop ${category.name} products at ${SITE_CONFIG.name}`;
  return {
    title: category.name,
    description: ogDesc,
    alternates: {
      canonical: `/category/${targetSlug}`,
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: `/category/${targetSlug}`,
      images: category.image ? [{ url: category.image.src }] : [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
    },
  };
}

import { getCategoryResource } from "@/lib/category-resources";
import { CategorySchema, FAQSchema, HowToSchema, BreadcrumbSchema } from "@/schemas";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "storage-organization") {
    redirect("/category/storage-and-organization");
  }
  if (slug === "kitchen-products") {
    redirect("/category/kitchen");
  }
  if (slug === "cleaning-essentials") {
    redirect("/category/cleaning-essential");
  }
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const productsResult = await getProducts({ category: String(category.id), perPage: 24 })
    .catch(() => ({ data: [], total: 0, totalPages: 0, currentPage: 1 }));

  const resource = getCategoryResource(slug);

  return (
    <>
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
            { name: category.name, url: `/category/${slug}` },
          ],
        }}
      />
      <CategorySchema
        collection={{
          url: `/category/${slug}`,
          name: category.name,
          description: category.description || resource.bluf,
          numberOfItems: productsResult.total,
        }}
        itemList={{
          name: `${category.name} Products`,
          itemListElement: productsResult.data.map((p, idx) => ({
            position: idx + 1,
            name: p.name,
            url: `/products/${p.slug}`,
            image: p.images[0]?.src,
            price: p.price,
          })),
        }}
      />
      <FAQSchema data={{ items: resource.faqs }} />
      <HowToSchema
        data={{
          name: resource.howToContent.title,
          description: `Step-by-step guide for ${category.name}`,
          step: resource.howToContent.steps.map((s) => ({
            name: s.title,
            text: s.text,
          })),
        }}
      />

      <Suspense
        fallback={
          <div className="section">
            <div className="container grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </div>
        }
      >
        <CategoryClient category={category} initialProducts={productsResult} />
      </Suspense>
    </>
  );
}
