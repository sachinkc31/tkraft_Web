import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  getProductVariations,
  getProductsByIds,
} from "@/services/woocommerce";
import { ProductDetailClient } from "@/features/product/product-detail-client";
import { ProductCard } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/constants";
import { stripHtml } from "@/lib/utils";
import {
  mapWooProductToSchema,
  buildProductSchema,
  BreadcrumbSchema,
  FAQSchema,
} from "@/schemas";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

// ISR for individual product pages — 30 min refresh
export const revalidate = 1800;

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Product Not Found" };

  const image = product.images[0]?.src;
  const rawDesc = stripHtml(product.short_description || product.description);
  const description =
    rawDesc.length > 155 ? `${rawDesc.slice(0, 152)}...` : rawDesc;

  const categoryName = product.categories[0]?.name || "Home Utility";
  const seoTitle = `${product.name} – ${categoryName} | ${SITE_CONFIG.name}`;

  return {
    title: seoTitle,
    description,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: seoTitle,
      description,
      url: `${SITE_CONFIG.url}/products/${slug}`,
      images: image ? [{ url: image, width: 800, height: 600 }] : [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  let variations: any[] = [];
  if (product.type === "variable") {
    variations = await getProductVariations(product.id).catch(() => []);
  }

  const relatedProducts = await getRelatedProducts(product.id, 4).catch(() => []);

  // Fetch cross-sell & upsell products
  let bundleProducts: any[] = [];
  const bundleIds = [
    ...(product.upsell_ids || []),
    ...(product.cross_sell_ids || []),
  ].slice(0, 2);

  if (bundleIds.length > 0) {
    bundleProducts = await getProductsByIds(bundleIds).catch(() => []);
  }

  if (bundleProducts.length === 0 && relatedProducts.length > 0) {
    bundleProducts = relatedProducts.slice(0, 2);
  }

  // Dynamic Enterprise Product Schema mapped directly from WooCommerce REST API
  const mappedProductInput = mapWooProductToSchema(product);
  const productLdSchema = buildProductSchema(mappedProductInput);

  // Dynamic Product FAQs
  const productFaqs = [
    {
      question: `What materials are used in ${product.name}?`,
      answer: `${product.name} is crafted from high-grade, durable materials designed for long-lasting household performance and easy maintenance.`,
    },
    {
      question: "How fast is shipping across India?",
      answer: "Orders are processed within 24 hours. Free express shipping is included on orders above ₹499, with delivery taking 2 to 4 business days for metro locations.",
    },
    {
      question: "What is the return and replacement policy?",
      answer: "We offer a 7-day easy return window and instant free replacement for any product damaged during transit.",
    },
    {
      question: "Is Cash on Delivery (COD) supported?",
      answer: "Yes, Cash on Delivery (COD) is available across major pincodes in India alongside UPI, credit/debit cards, and Net Banking.",
    },
  ];

  return (
    <>
      {/* Enterprise Schema JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLdSchema) }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Shop", url: "/shop" },
            ...(product.categories[0]
              ? [{ name: product.categories[0].name, url: `/category/${product.categories[0].slug}` }]
              : []),
            { name: product.name, url: `/products/${product.slug}` },
          ],
        }}
      />
      <FAQSchema data={{ items: productFaqs }} />

      {/* Main Interactive Product Detail Component */}
      <ProductDetailClient
        product={product}
        initialVariations={variations}
        bundleProducts={bundleProducts}
      />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="section border-t border-[hsl(214,13%,90%)] bg-[hsl(210,20%,98%)] py-12">
          <div className="container">
            <h2 className="text-2xl font-display font-bold text-[hsl(222,47%,11%)] mb-8">
              Related Products You May Like
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

