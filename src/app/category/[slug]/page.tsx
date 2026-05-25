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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": `${SITE_CONFIG.url}/shop`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `${SITE_CONFIG.url}/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
