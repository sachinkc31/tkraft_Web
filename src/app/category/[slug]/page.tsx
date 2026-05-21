import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCategoryBySlug, getAllCategorySlugs, getProducts } from "@/services/woocommerce";
import { ProductCard, ProductCardSkeleton } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = slug === "storage-organization" ? "storage-and-organization" : slug;
  const category = await getCategoryBySlug(targetSlug).catch(() => null);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: category.description || `Shop ${category.name} products at ${SITE_CONFIG.name}`,
    openGraph: {
      title: `${category.name} | ${SITE_CONFIG.name}`,
      images: category.image ? [{ url: category.image.src }] : [],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (slug === "storage-organization") {
    redirect("/category/storage-and-organization");
  }
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) notFound();

  const productsResult = await getProducts({ category: String(category.id), perPage: 24 })
    .catch(() => ({ data: [], total: 0, totalPages: 0, currentPage: 1 }));

  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="mb-10">
          <nav className="text-sm text-[hsl(215,16%,47%)] mb-3">
            <a href="/" className="hover:text-[hsl(var(--color-accent))]">Home</a>
            <span className="mx-2">/</span>
            <a href="/shop" className="hover:text-[hsl(var(--color-accent))]">Shop</a>
            <span className="mx-2">/</span>
            <span className="text-[hsl(222,47%,11%)] font-medium" dangerouslySetInnerHTML={{ __html: category.name }} />
          </nav>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(var(--color-primary-light))]">
            <span dangerouslySetInnerHTML={{ __html: category.name }} />
          </h1>
          {category.description && (
            <p className="text-[hsl(215,16%,47%)] mt-2 max-w-2xl" dangerouslySetInnerHTML={{ __html: category.description }} />
          )}
          <p className="text-sm text-[hsl(215,16%,47%)] mt-3">
            {productsResult.total} products
          </p>
        </div>

        {/* Products Grid */}
        {productsResult.data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <h2 className="text-xl font-bold text-[hsl(var(--color-primary-light))] mb-2">No products yet</h2>
            <p className="text-[hsl(215,16%,47%)]">Check back soon — new items are being added.</p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productsResult.data.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 8} />
              ))}
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}
