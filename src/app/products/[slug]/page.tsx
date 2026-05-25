import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProductSlugs, getRelatedProducts, getProductVariations, getProductsByIds } from "@/services/woocommerce";
import { ProductDetailClient } from "@/features/product/product-detail-client";
import { ProductCard } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/constants";
import { stripHtml } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

// dynamicParams is true by default, enabling on-demand ISR for individual product pages
export const dynamicParams = true;

// ISR for individual product pages — 30 min refresh
export const revalidate = 1800;

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product Not Found" };

  const image = product.images[0]?.src;
  const description = stripHtml(product.short_description || product.description).slice(0, 160);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      url: `${SITE_CONFIG.url}/products/${slug}`,
      images: image ? [{ url: image, width: 800, height: 600 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  let variations: any[] = [];
  if (product.type === "variable") {
    variations = await getProductVariations(product.id).catch(() => []);
  }

  const relatedProducts = await getRelatedProducts(product.id, 4).catch(() => []);

  // Fetch bundle products (upsells / cross-sells)
  let bundleProducts: any[] = [];
  const bundleIds = [
    ...(product.upsell_ids || []),
    ...(product.cross_sell_ids || [])
  ].slice(0, 2);

  if (bundleIds.length > 0) {
    bundleProducts = await getProductsByIds(bundleIds).catch(() => []);
  }

  // Fallback to related products if no manual upsells/cross-sells
  if (bundleProducts.length === 0 && relatedProducts.length > 0) {
    bundleProducts = relatedProducts.slice(0, 2);
  }

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripHtml(product.description),
    image: product.images.map((img) => img.src),
    sku: product.sku,
    brand: { "@type": "Brand", name: SITE_CONFIG.name },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability:
        product.stock_status === "instock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_CONFIG.url}/products/${slug}`,
    },
    aggregateRating:
      product.rating_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.average_rating,
            reviewCount: product.rating_count,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} initialVariations={variations} bundleProducts={bundleProducts} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section border-t border-[hsl(214,13%,90%)]">
          <div className="container">
            <h2 className="text-2xl font-display font-bold text-[hsl(222,47%,11%)] mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
