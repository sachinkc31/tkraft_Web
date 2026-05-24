import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_CONFIG, API_CONFIG } from "@/lib/constants";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getHomepageLayout, getHomepageContent, DEFAULT_HOMEPAGE_LAYOUT, type HomepageLayout } from "@/services/cms";
import {
  getNewArrivals,
  getOnSaleProducts,
  getFeaturedProducts,
  getTopCategories,
  getProducts,
  getCategoryBySlug,
} from "@/services/woocommerce";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} – ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
};

// ISR — regenerate homepage every 60 seconds in production
export const revalidate = 60;

export default async function HomePage() {
  // 1. Fetch layout configuration and WordPress SCF custom fields in parallel
  const [layout, wpContent] = await Promise.all([
    getHomepageLayout().catch(() => ({ sections: [] } as HomepageLayout)),
    getHomepageContent().catch(() => null),
  ]);

  // 2. Fetch fallbacks in parallel to support backwards-compatibility and static schemas
  const [fallbackCategories, fallbackNewArrivals, fallbackTrending, fallbackFeatured] = await Promise.all([
    getTopCategories().catch(() => []),
    getNewArrivals(8).catch(() => []),
    getOnSaleProducts(8).catch(() => []),
    getFeaturedProducts(8).catch(() => []),
  ]);

  const aggregatedProducts = {
    trending: fallbackTrending,
    bestsellers: fallbackNewArrivals,
    featured: fallbackFeatured,
    flashSale: fallbackTrending.filter((p) => p.on_sale),
  };

  // 3. Resolve dynamic sections on-demand (server-side data population)
  const populatedSections = (
    await Promise.all(
      DEFAULT_HOMEPAGE_LAYOUT.sections.map(async (section) => {
        const sec = { ...section };

        // 3a. Enablement toggles check
        if (wpContent) {
          if (sec.id === "section_hero" && wpContent.enable_section_hero === false) (sec as any).disabled = true;
          if (sec.id === "section_benefits" && wpContent.enable_section_benefits === false) (sec as any).disabled = true;
          if (sec.id === "section_categories" && wpContent.enable_section_categories === false) (sec as any).disabled = true;
          if (sec.id === "section_trending" && wpContent.enable_section_trending === false) (sec as any).disabled = true;
          if (sec.id === "section_promo" && wpContent.enable_section_promo === false) (sec as any).disabled = true;
          if (sec.id === "section_bestsellers" && wpContent.enable_section_bestsellers === false) (sec as any).disabled = true;
          if (sec.id === "section_cta" && wpContent.enable_section_cta === false) (sec as any).disabled = true;
          if (sec.id === "section_highlights" && wpContent.enable_section_highlights === false) (sec as any).disabled = true;
          if (sec.id === "section_testimonials" && wpContent.enable_section_testimonials === false) (sec as any).disabled = true;
          if (sec.id === "section_newsletter" && wpContent.enable_section_newsletter === false) (sec as any).disabled = true;
        }

        // Hero Banner WordPress SCF resolution
        if (sec.type === "heroBanner" && wpContent) {
          const defaultSlide = sec.data?.slides?.[0] || {};
          sec.data = {
            ...sec.data,
            slides: [
              {
                id: "wp_hero_1",
                title: wpContent.hero_title || defaultSlide.title || "Premium Home Essentials",
                subtitle: wpContent.hero_subtitle || defaultSlide.subtitle || "Curated collections crafted for modern spaces",
                image: wpContent.hero_image || defaultSlide.image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
                imageMobile: wpContent.hero_image_mobile || undefined,
                cta_text: wpContent.hero_cta_text || defaultSlide.cta_text || "Shop Collection",
                cta_link: wpContent.hero_cta_url || defaultSlide.cta_link || "/shop",
                scroll_interval_seconds: wpContent.hero_scroll_interval_seconds || sec.data?.scroll_interval_seconds || 6,
              }
            ]
          };
        }

        // Customer Benefits Section overrides
        if (sec.type === "customerBenefits" && wpContent) {
          if (wpContent.benefits_title) sec.title = wpContent.benefits_title;
          if (wpContent.benefits_subtitle) sec.subtitle = wpContent.benefits_subtitle;
        }

        // Category grid categories list fetching
        if (sec.type === "categoryGrid") {
          if (wpContent?.categories_title) sec.title = wpContent.categories_title;
          if (wpContent?.categories_subtitle) sec.subtitle = wpContent.categories_subtitle;
          
          if (wpContent?.categories_hide_on_mobile) {
            sec.data = {
              ...sec.data,
              hideOnMobile: true,
            };
          }

          const categorySlugs = wpContent?.categories_slugs || sec.data?.categorySlugs;
          if (Array.isArray(categorySlugs) && categorySlugs.length > 0) {
            try {
              const fetched = await Promise.all(
                categorySlugs.map((slug) => getCategoryBySlug(slug).catch(() => null))
              );
              sec.fetchedCategories = fetched.filter((c) => c !== null);
            } catch (e) {
              console.error("Error resolving custom categories for grid:", e);
            }
          }
        }

        // Product collections resolution
        const isProductSection = [
          "productCarousel",
          "trendingProducts",
          "bestSellerProducts",
          "featuredProducts",
          "flashSale",
          "recentlyAdded"
        ].includes(sec.type);

        if (isProductSection) {
          // Apply ACF title/limit overrides if present
          if (wpContent) {
            if (sec.type === "trendingProducts" && wpContent.trending_title) sec.title = wpContent.trending_title;
            if (sec.type === "bestSellerProducts" && wpContent.bestsellers_title) sec.title = wpContent.bestsellers_title;
            if (sec.type === "recentlyAdded" && wpContent.new_arrivals_title) sec.title = wpContent.new_arrivals_title;

            // Set mobile limits
            const limitMobile = (sec.type === "trendingProducts")
              ? wpContent.trending_limit_mobile
              : (sec.type === "bestSellerProducts")
              ? wpContent.bestsellers_limit_mobile
              : (sec.type === "recentlyAdded")
              ? wpContent.new_arrivals_limit_mobile
              : undefined;

            if (limitMobile) {
              sec.data = {
                ...sec.data,
                limitMobile,
              };
            }
          }

          const limit = (sec.type === "trendingProducts" && wpContent?.trending_limit)
            ? wpContent.trending_limit
            : (sec.type === "bestSellerProducts" && wpContent?.bestsellers_limit)
            ? wpContent.bestsellers_limit
            : (sec.type === "recentlyAdded" && wpContent?.new_arrivals_limit)
            ? wpContent.new_arrivals_limit
            : sec.limit || 8;

          const collection = sec.data?.collection || "";
          const category = sec.data?.category;

          try {
            if (category) {
              // Query products in specific category by slug or ID
              const catObj = await getCategoryBySlug(String(category)).catch(() => null);
              if (catObj) {
                const res = await getProducts({ category: String(catObj.id), perPage: limit }).catch(() => ({ data: [] }));
                sec.fetchedProducts = res.data;
              } else {
                // Try fetching directly as an ID
                const res = await getProducts({ category: String(category), perPage: limit }).catch(() => ({ data: [] }));
                sec.fetchedProducts = res.data;
              }
            } else if (sec.type === "trendingProducts" || collection === "trending") {
              const res = await getProducts({ sortBy: "popularity", perPage: limit }).catch(() => ({ data: [] }));
              sec.fetchedProducts = res.data;
            } else if (sec.type === "bestSellerProducts" || collection === "bestsellers") {
              const res = await getProducts({ sortBy: "rating", perPage: limit }).catch(() => ({ data: [] }));
              sec.fetchedProducts = res.data;
            } else if (sec.type === "recentlyAdded" || collection === "recentlyAdded" || collection === "new") {
              const res = await getProducts({ sortBy: "date", perPage: limit }).catch(() => ({ data: [] }));
              sec.fetchedProducts = res.data;
            } else if (sec.type === "flashSale" || collection === "flash") {
              sec.fetchedProducts = await getOnSaleProducts(limit).catch(() => []);
            } else if (sec.type === "featuredProducts" || collection === "featured") {
              sec.fetchedProducts = await getFeaturedProducts(limit).catch(() => []);
            } else {
              sec.fetchedProducts = await getFeaturedProducts(limit).catch(() => []);
            }
          } catch (e) {
            console.error(`Error resolving products for section ${sec.id}:`, e);
            sec.fetchedProducts = [];
          }
        }

        // Recent WordPress Blog Posts fetching
        if (sec.type === "blogSection" || sec.type === "blogHighlights") {
          try {
            const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
            const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
            const encoded = Buffer.from(`${key}:${secret}`).toString("base64");
            const postsUrl = `${API_CONFIG.wpRestUrl}/posts?per_page=3`;
            
            const isDev = process.env.NODE_ENV === "development";
            const res = await fetch(postsUrl, {
              headers: {
                Authorization: `Basic ${encoded}`,
                "Content-Type": "application/json",
              },
              ...(isDev ? { cache: "no-store" as RequestCache } : { next: { revalidate: 60 } }),
            });

            if (res.ok) {
              const posts = await res.json();
              if (Array.isArray(posts) && posts.length > 0) {
                sec.fetchedPosts = posts.map((post: any) => ({
                  title: post.title?.rendered || "",
                  desc: post.excerpt?.rendered?.replace(/<[^>]*>/g, "")?.slice(0, 150) + "..." || "",
                  date: new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                  author: "Tkraft Team",
                  image: post.jetpack_featured_media_url || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
                }));
              }
            }
          } catch (e) {
            console.error("Error fetching WP posts for blog highlights:", e);
          }
        }

        // Promo Banners overrides
        if (sec.type === "promoBanner" && wpContent) {
          const banners = sec.data?.banners || [];
          const b1 = banners[0] || {};
          const b2 = banners[1] || {};
          
          const newB1 = {
            ...b1,
            title: wpContent.promo_1_title || b1.title,
            subtitle: wpContent.promo_1_subtitle || b1.subtitle,
            image: wpContent.promo_1_image || b1.image,
            imageMobile: wpContent.promo_1_image_mobile || undefined,
            cta_text: wpContent.promo_1_cta_text || b1.cta_text,
            cta_link: wpContent.promo_1_cta_link || b1.cta_link,
          };
          const newB2 = {
            ...b2,
            title: wpContent.promo_2_title || b2.title,
            subtitle: wpContent.promo_2_subtitle || b2.subtitle,
            image: wpContent.promo_2_image || b2.image,
            imageMobile: wpContent.promo_2_image_mobile || undefined,
            cta_text: wpContent.promo_2_cta_text || b2.cta_text,
            cta_link: wpContent.promo_2_cta_link || b2.cta_link,
          };
          sec.data = {
            ...sec.data,
            banners: [newB1, newB2],
          };
        }

        // CTA Banner overrides
        if (sec.type === "ctaBanner" && wpContent) {
          sec.title = wpContent.cta_title || sec.title;
          sec.subtitle = wpContent.cta_subtitle || sec.subtitle;
          if (wpContent.cta_image || wpContent.cta_cta_text || wpContent.cta_cta_link || wpContent.cta_image_mobile) {
            sec.data = {
              ...sec.data,
              bg_image: wpContent.cta_image || sec.data?.bg_image,
              bg_image_mobile: wpContent.cta_image_mobile || undefined,
              cta_text: wpContent.cta_cta_text || sec.data?.cta_text,
              cta_link: wpContent.cta_cta_link || sec.data?.cta_link,
            };
          }
        }

        // Highlights Section overrides
        if (sec.type === "brandHighlights" && wpContent) {
          if (wpContent.highlights_title) sec.title = wpContent.highlights_title;
          if (wpContent.highlights_subtitle) sec.subtitle = wpContent.highlights_subtitle;
        }

        // Testimonials overrides
        if (sec.type === "testimonials" && wpContent) {
          if (wpContent.testimonials_title) sec.title = wpContent.testimonials_title;
          if (wpContent.testimonials_subtitle) sec.subtitle = wpContent.testimonials_subtitle;
        }

        // Newsletter overrides
        if (sec.type === "newsletterSignup" && wpContent) {
          if (wpContent.newsletter_title || wpContent.newsletter_subtitle || wpContent.newsletter_placeholder || wpContent.newsletter_cta_text) {
            sec.data = {
              ...sec.data,
              title: wpContent.newsletter_title || undefined,
              subtitle: wpContent.newsletter_subtitle || undefined,
              placeholder: wpContent.newsletter_placeholder || undefined,
              cta_text: wpContent.newsletter_cta_text || undefined,
            };
          }
        }

        return sec;
      })
    )
  ).filter((sec) => !(sec as any).disabled);

  // Merge campaign settings from WordPress SCF if campaign_id is active
  const campaign = wpContent?.campaign_id
    ? {
        id: wpContent.campaign_id,
        name: wpContent.campaign_name || "",
        theme: (wpContent.campaign_theme || "default") as any,
        promoText: wpContent.campaign_promo_text,
        colors: {
          primary: wpContent.campaign_color_primary,
          accent: wpContent.campaign_color_accent,
          surface: wpContent.campaign_color_surface,
        },
      }
    : layout.activeCampaign;

  let campaignCss = "";

  // Dynamic CMS Campaign Style Override Compiler
  if (campaign?.colors) {
    const toKebab = (str: string) => str.replace(/_/g, "-").replace(/([A-Z])/g, "-$1").toLowerCase();
    
    const colorsObj = campaign.colors as any;
    const hasNested = colorsObj.light || colorsObj.dark;
    
    if (hasNested) {
      const lightColorVars = Object.entries(colorsObj.light || {})
        .map(([key, value]) => `  --color-${toKebab(key)}: ${value} !important;`)
        .join("\n");

      const darkColorVars = Object.entries(colorsObj.dark || {})
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
    } else {
      const colorVars = Object.entries(colorsObj)
        .filter(([_, val]) => !!val)
        .map(([key, value]) => `  --color-${toKebab(key)}: ${value} !important;`)
        .join("\n");

      campaignCss = `
:root {
${colorVars}
}
      `;
    }
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
      {populatedSections && populatedSections.length > 0 ? (
        populatedSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            products={aggregatedProducts}
            categories={fallbackCategories}
            activeCampaign={campaign}
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
