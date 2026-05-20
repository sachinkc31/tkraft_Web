import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/features/home/hero-section";
import { TrustBadges } from "@/features/home/trust-badges";
import { CategoryGrid } from "@/features/home/category-grid";
import { NewArrivalsSection } from "@/features/home/new-arrivals-section";
import { TrendingSection } from "@/features/home/trending-section";
import { ProductCardSkeleton } from "@/components/ui/product-card";
import { SITE_CONFIG } from "@/lib/constants";
import {
  getNewArrivals,
  getOnSaleProducts,
  getTopCategories,
} from "@/services/woocommerce";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} – ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
};

// ISR — regenerate homepage every hour
export const revalidate = 3600;

export default async function HomePage() {
  // Parallel server-side data fetching
  const [newArrivals, trendingProducts, categories] = await Promise.all([
    getNewArrivals(8).catch(() => []),
    getOnSaleProducts(8).catch(() => []),
    getTopCategories().catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Category Grid */}
      <section className="section bg-[hsl(210,20%,98%)]">
        <div className="container">
          <SectionHeading
            label="Shop by Category"
            title="Everything Your Home Needs"
            subtitle="Explore our curated categories for home, kitchen, and personal care"
          />
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <SectionHeading
            label="Fresh In"
            title="New Arrivals"
            subtitle="The latest additions to our collection"
            cta={{ label: "View All", href: "/shop?sort=date" }}
          />
          <Suspense fallback={<ProductGridSkeleton />}>
            <NewArrivalsSection products={newArrivals} />
          </Suspense>
        </div>
      </section>

      {/* Trending / On Sale */}
      <section className="section bg-[hsl(210,20%,98%)]">
        <div className="container">
          <SectionHeading
            label="Hot Deals"
            title="Trending Now"
            subtitle="Best sellers and biggest discounts this week"
            cta={{ label: "View All Deals", href: "/shop?sort=popularity" }}
          />
          <Suspense fallback={<ProductGridSkeleton />}>
            <TrendingSection products={trendingProducts} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

// ---- Shared sub-components ----
function SectionHeading({
  label,
  title,
  subtitle,
  cta,
}: {
  label: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[hsl(27,96%,55%)] mb-2 block">
          {label}
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[hsl(222,47%,11%)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[hsl(215,16%,47%)] mt-2 text-sm">{subtitle}</p>
        )}
      </div>
      {cta && (
        <a
          href={cta.href}
          className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(217,70%,38%)] hover:text-[hsl(217,70%,28%)] transition-colors"
        >
          {cta.label} →
        </a>
      )}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
