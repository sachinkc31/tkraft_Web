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
    alternates: {
      canonical: `/products/${slug}`,
    },
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

  const breadcrumbElements: any[] = [
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
  ];

  if (product.categories && product.categories.length > 0) {
    const primaryCategory = product.categories[0];
    breadcrumbElements.push({
      "@type": "ListItem",
      "position": 3,
      "name": primaryCategory.name,
      "item": `${SITE_CONFIG.url}/category/${primaryCategory.slug}`,
    });
  }

  breadcrumbElements.push({
    "@type": "ListItem",
    "position": breadcrumbElements.length + 1,
    "name": product.name,
    "item": `${SITE_CONFIG.url}/products/${product.slug}`,
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbElements,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "When will my order be shipped?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We typically ship orders within 24-48 hours. Orders above ₹499 qualify for free shipping, with delivery times ranging between 3 to 7 business days across India."
        }
      },
      {
        "@type": "Question",
        "name": "What is your return policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a 30-day return/replacement period. If you are not completely satisfied with your purchase, you can initiate a return or replacement from your account dashboard."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods are accepted?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept all major credit/debit cards, UPI payments (Paytm, Google Pay, PhonePe), Net Banking, and Cash on Delivery (COD) for most locations in India."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
