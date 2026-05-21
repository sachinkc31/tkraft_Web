import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getHomepageLayout, type HomepageLayout } from "@/services/cms";
import {
  getNewArrivals,
  getOnSaleProducts,
  getFeaturedProducts,
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
  const [
    layout,
    newArrivals,
    trendingProducts,
    featuredProducts,
    categories
  ] = await Promise.all([
    getHomepageLayout().catch(() => ({ sections: [] } as HomepageLayout)),
    getNewArrivals(8).catch(() => []),
    getOnSaleProducts(8).catch(() => []),
    getFeaturedProducts(8).catch(() => []),
    getTopCategories().catch(() => []),
  ]);

  // Aggregate fetched products for renderer mapping
  const aggregatedProducts = {
    trending: trendingProducts,
    bestsellers: newArrivals, // fallback/mapping
    featured: featuredProducts,
    flashSale: trendingProducts.filter((p) => p.on_sale),
  };

  const campaign = layout.activeCampaign;
  let campaignCss = "";

  // Dynamic CMS Campaign Style Override Compiler
  if (campaign?.colors) {
    const toKebab = (str: string) => str.replace(/([A-Z])/g, "-$1").toLowerCase();
    
    const lightColorVars = Object.entries(campaign.colors.light || {})
      .map(([key, value]) => `  --color-${toKebab(key)}: ${value} !important;`)
      .join("\n");

    const darkColorVars = Object.entries(campaign.colors.dark || {})
      .map(([key, value]) => `  --color-${toKebab(key)}: ${value} !important;`)
      .join("\n");

    campaignCss = `
:root {
${lightColorVars}
}

.dark {
${darkColorVars}
}
    `;
  }

  return (
    <>
      {/* Campaign specific CSS variable override injected server-side to prevent Cumulative Layout Shifts (CLS) */}
      {campaignCss && (
        <style 
          id="tkraft-campaign-tokens" 
          dangerouslySetInnerHTML={{ __html: campaignCss }} 
        />
      )}

      {/* Dynamic Campaign Banner Bar */}
      {campaign?.promoText && (
        <div className="bg-[hsl(var(--color-primary))] text-[hsl(var(--color-surface))] text-xs font-bold text-center py-2 px-4 border-b border-white/10 transition-colors duration-300">
          {campaign.promoText}
        </div>
      )}

      {/* Dynamically Render Layout Blocks */}
      {layout.sections && layout.sections.length > 0 ? (
        layout.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            products={aggregatedProducts}
            categories={categories}
          />
        ))
      ) : (
        <div className="container py-24 text-center">
          <p className="text-[hsl(var(--color-text-muted))]">No homepage layout sections configured.</p>
        </div>
      )}
    </>
  );
}
