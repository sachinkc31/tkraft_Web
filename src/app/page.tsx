import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_CONFIG, API_CONFIG } from "@/lib/constants";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getHomepageLayout, getHomepageContent, DEFAULT_HOMEPAGE_LAYOUT, CAMPAIGN_PRESETS, type HomepageLayout } from "@/services/cms";
import {
  getNewArrivals,
  getOnSaleProducts,
  getFeaturedProducts,
  getTopCategories,
  getProducts,
  getCategoryBySlug,
  getCategoriesByIds,
} from "@/services/woocommerce";

import { getDiscountPercent } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} – ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_CONFIG.name} – ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    url: "/",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
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
    getOnSaleProducts(8, 60).catch(() => []),
    getFeaturedProducts(8).catch(() => []),
  ]);

  const aggregatedProducts = {
    trending: fallbackTrending,
    bestsellers: fallbackNewArrivals,
    featured: fallbackFeatured,
    flashSale: fallbackTrending.filter((p) => p.on_sale && getDiscountPercent(p.regular_price, p.sale_price) >= 60),
  };

  // 3. Resolve dynamic sections on-demand (server-side data population)
  const sectionsToPopulate = (layout && Array.isArray(layout.sections) && layout.sections.length > 0)
    ? layout.sections
    : DEFAULT_HOMEPAGE_LAYOUT.sections;

  const populatedSections = (
    await Promise.all(
      sectionsToPopulate.map(async (section) => {
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
          if (sec.id === "section_grid" && wpContent.enable_section_grid === false) (sec as any).disabled = true;
          if (sec.id === "section_flash" && !wpContent.flash_sale_collection) (sec as any).disabled = true;
        }

        // Hero Banner WordPress SCF resolution
        if (sec.type === "heroBanner" && wpContent) {
          const defaultSlide = sec.data?.slides?.[0] || {};
          const isCampaignActive = wpContent.campaign_theme && wpContent.campaign_theme !== "default";
          
          // Prioritize standard Hero fields edited in CMS, falling back to campaign overrides
          const headline = wpContent.hero_title || wpContent.campaign_headline;
          const ctaText = wpContent.hero_cta_text || wpContent.campaign_cta_text;
          const ctaLink = wpContent.hero_cta_url || wpContent.campaign_cta_link;
          const bannerImage = wpContent.hero_desktop_image || wpContent.hero_image || wpContent.campaign_banner_image;
          const bannerImageMobile = wpContent.hero_mobile_image || wpContent.hero_image_mobile || wpContent.campaign_banner_image_mobile;

          sec.data = {
            ...sec.data,
            slides: [
              {
                id: "wp_hero_1",
                title: headline || defaultSlide.title || "Premium Home Essentials",
                subtitle: wpContent.hero_subtitle || defaultSlide.subtitle || "Curated collections crafted for modern spaces",
                image: bannerImage || defaultSlide.image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
                imageMobile: bannerImageMobile || undefined,
                cta_text: ctaText || defaultSlide.cta_text || "Shop Collection",
                cta_link: ctaLink || defaultSlide.cta_link || "/shop",
                alignment: wpContent.hero_alignment || defaultSlide.alignment || "left",
                theme: wpContent.hero_theme || defaultSlide.theme || "default",
                scroll_interval_seconds: wpContent.hero_scroll_interval_seconds || sec.data?.scroll_interval_seconds || 6,
              }
            ]
          };
        }

        // Customer Benefits Section overrides
        if (sec.type === "customerBenefits" && wpContent) {
          if (wpContent.benefits_title) sec.title = wpContent.benefits_title;
          if (wpContent.benefits_subtitle) sec.subtitle = wpContent.benefits_subtitle;

          const benefits = [];
          if (wpContent.benefit_1_title) {
            benefits.push({ title: wpContent.benefit_1_title, icon: wpContent.benefit_1_icon });
          }
          if (wpContent.benefit_2_title) {
            benefits.push({ title: wpContent.benefit_2_title, icon: wpContent.benefit_2_icon });
          }
          if (wpContent.benefit_3_title) {
            benefits.push({ title: wpContent.benefit_3_title, icon: wpContent.benefit_3_icon });
          }
          if (wpContent.benefit_4_title) {
            benefits.push({ title: wpContent.benefit_4_title, icon: wpContent.benefit_4_icon });
          }

          if (benefits.length > 0) {
            sec.data = {
              ...sec.data,
              benefits,
            };
          }
        }

        // Custom Grid Section overrides
        if ((sec.type === "customGrid" || sec.type === "gridBlock") && wpContent) {
          if (wpContent.grid_title) sec.title = wpContent.grid_title;
          if (wpContent.grid_subtitle) sec.subtitle = wpContent.grid_subtitle;
          sec.data = {
            ...sec.data,
            items: wpContent.grid_items || sec.data?.items || []
          };
        }

        // Category grid categories list fetching
        if (sec.type === "categoryGrid") {
          if (wpContent && (wpContent.collection_1_category || wpContent.collection_2_category || wpContent.collection_3_category)) {
            const allIds: number[] = [];
            const colSlugOrNameList: { categoryVal: string, title?: string }[] = [];

            const addCategory = (title?: string, categoryVal?: any) => {
              if (Array.isArray(categoryVal)) {
                categoryVal.forEach(val => {
                  const num = Number(val);
                  if (!isNaN(num) && num > 0) {
                    allIds.push(num);
                  } else if (val) {
                    colSlugOrNameList.push({ categoryVal: String(val), title });
                  }
                });
              } else if (categoryVal) {
                const num = Number(categoryVal);
                if (!isNaN(num) && num > 0) {
                  allIds.push(num);
                } else {
                  colSlugOrNameList.push({ categoryVal: String(categoryVal), title });
                }
              }
            };

            addCategory(wpContent.collection_1_title, wpContent.collection_1_category);
            addCategory(wpContent.collection_2_title, wpContent.collection_2_category);
            addCategory(wpContent.collection_3_title, wpContent.collection_3_category);

            try {
              let fetched: any[] = [];
              if (allIds.length > 0) {
                const batchFetched = await getCategoriesByIds(allIds).catch(() => []);
                fetched = [...batchFetched];
              }

              if (colSlugOrNameList.length > 0) {
                const slugFetched = await Promise.all(
                  colSlugOrNameList.map(async (col) => {
                    const catObj = await getCategoryBySlug(col.categoryVal).catch(() => null);
                    if (catObj) {
                      return {
                        ...catObj,
                        name: col.title || catObj.name,
                      };
                    }
                    return null;
                  })
                );
                fetched = [...fetched, ...slugFetched.filter((c) => c !== null)];
              }

              if (fetched.length > 0) {
                sec.fetchedCategories = fetched;
              }
            } catch (e) {
              console.error("Error resolving custom collections for categoryGrid:", e);
            }
          } else {
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
                sec.fetchedCategories = fetched.filter((c) => c !== null) as any[];
              } catch (e) {
                console.error("Error resolving custom categories for grid:", e);
              }
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
            if (sec.type === "bestSellerProducts" && (wpContent.bestseller_title || wpContent.bestsellers_title)) {
              sec.title = wpContent.bestseller_title || wpContent.bestsellers_title;
            }
            if (sec.type === "recentlyAdded" && wpContent.new_arrivals_title) sec.title = wpContent.new_arrivals_title;
            if (sec.type === "flashSale" && wpContent.flash_sale_title) sec.title = wpContent.flash_sale_title;

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
            : (sec.type === "bestSellerProducts" && (wpContent?.bestseller_limit || wpContent?.bestsellers_limit))
            ? (wpContent.bestseller_limit || wpContent.bestsellers_limit)
            : (sec.type === "recentlyAdded" && wpContent?.new_arrivals_limit)
            ? wpContent.new_arrivals_limit
            : sec.limit || 8;

          let collectionQuery = sec.data?.collection || "";
          let categoryQuery = sec.data?.category;
          let isCampaignCollection = false;

          if (sec.type === "trendingProducts" && wpContent?.trending_collection) {
            categoryQuery = wpContent.trending_collection;
          } else if (sec.type === "flashSale" && wpContent?.flash_sale_collection) {
            categoryQuery = wpContent.flash_sale_collection;
          } else if (sec.type === "trendingProducts" && wpContent?.campaign_product_collection) {
            const activeTheme = wpContent?.campaign_theme || "default";
            const preset = CAMPAIGN_PRESETS[activeTheme];
            const presetName = preset?.name || "Campaign";
            sec.title = wpContent.campaign_headline || `${presetName} Specials`;
            
            const rawCol = wpContent.campaign_product_collection.trim();
            if (rawCol.includes(",") || !isNaN(Number(rawCol))) {
              collectionQuery = "ids";
            } else {
              categoryQuery = rawCol;
            }
            isCampaignCollection = true;
          }

          if (sec.type === "flashSale" && wpContent) {
            sec.data = {
              ...sec.data,
              end_date: wpContent.flash_sale_end_date,
            };
          }

          try {
            if (isCampaignCollection && collectionQuery === "ids" && wpContent?.campaign_product_collection) {
              const ids = wpContent.campaign_product_collection.split(",").map(Number).filter(Boolean);
              if (ids.length > 0) {
                const res = await getProducts({ include: ids, perPage: limit }).catch(() => ({ data: [] }));
                sec.fetchedProducts = res.data;
              } else {
                sec.fetchedProducts = [];
              }
            } else if (categoryQuery) {
              // Query products in specific category by slug or ID
              const catObj = await getCategoryBySlug(String(categoryQuery)).catch(() => null);
              if (catObj) {
                const res = await getProducts({ category: String(catObj.id), perPage: limit }).catch(() => ({ data: [] }));
                sec.fetchedProducts = res.data;
              } else {
                // Try fetching directly as an ID
                const res = await getProducts({ category: String(categoryQuery), perPage: limit }).catch(() => ({ data: [] }));
                sec.fetchedProducts = res.data;
              }
            } else if (sec.type === "trendingProducts" || collectionQuery === "trending") {
              const res = await getProducts({ sortBy: "popularity", perPage: limit }).catch(() => ({ data: [] }));
              sec.fetchedProducts = res.data;
            } else if (sec.type === "bestSellerProducts" || collectionQuery === "bestsellers") {
              const res = await getProducts({ sortBy: "rating", perPage: limit }).catch(() => ({ data: [] }));
              sec.fetchedProducts = res.data;
            } else if (sec.type === "recentlyAdded" || collectionQuery === "recentlyAdded" || collectionQuery === "new") {
              const res = await getProducts({ sortBy: "date", perPage: limit }).catch(() => ({ data: [] }));
              sec.fetchedProducts = res.data;
            } else if (sec.type === "flashSale" || collectionQuery === "flash") {
              sec.fetchedProducts = await getOnSaleProducts(limit).catch(() => []);
            } else if (sec.type === "featuredProducts" || collectionQuery === "featured") {
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
          if (wpContent.promo_title) {
            sec.data = {
              ...sec.data,
              banners: [
                {
                  id: "wp_promo_single",
                  title: wpContent.promo_title,
                  subtitle: wpContent.promo_description || "",
                  image: wpContent.promo_image || "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
                  cta_text: wpContent.promo_cta_text || "Shop Now",
                  cta_link: wpContent.promo_cta_url || "/shop",
                }
              ]
            };
          } else {
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
          if (wpContent.why_buy_title) sec.title = wpContent.why_buy_title;
          
          const items = [];
          if (wpContent.why_buy_item_1) items.push(wpContent.why_buy_item_1);
          if (wpContent.why_buy_item_2) items.push(wpContent.why_buy_item_2);
          if (wpContent.why_buy_item_3) items.push(wpContent.why_buy_item_3);
          if (wpContent.why_buy_item_4) items.push(wpContent.why_buy_item_4);
          
          if (items.length > 0) {
            sec.data = {
              ...sec.data,
              items,
            };
          } else if (wpContent.highlights_title || wpContent.highlights_subtitle) {
            if (wpContent.highlights_title) sec.title = wpContent.highlights_title;
            if (wpContent.highlights_subtitle) sec.subtitle = wpContent.highlights_subtitle;
          }
        }

        // Testimonials overrides
        if (sec.type === "testimonials" && wpContent) {
          if (wpContent.testimonial_title || wpContent.testimonials_title) {
            sec.title = wpContent.testimonial_title || wpContent.testimonials_title;
          }
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

  // Merge campaign settings from WordPress SCF if campaign_id or theme is active, falling back to reusable presets
  const activeTheme = wpContent?.campaign_theme || "default";
  const preset = CAMPAIGN_PRESETS[activeTheme];

  const campaign = wpContent?.campaign_id || (wpContent?.campaign_theme && wpContent?.campaign_theme !== "default")
    ? {
        id: wpContent.campaign_id || `campaign_${activeTheme}`,
        name: wpContent.campaign_name || preset?.name || "Active Sale",
        theme: activeTheme as any,
        promoText: wpContent.campaign_promo_text || preset?.promoText || "",
        colors: {
          primary: wpContent.campaign_color_primary || preset?.colors?.primary || undefined,
          accent: wpContent.campaign_color_accent || preset?.colors?.accent || undefined,
          surface: wpContent.campaign_color_surface || preset?.colors?.surface || undefined,
        },
        productCollection: wpContent.campaign_product_collection,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        "name": SITE_CONFIG.name,
        "legalName": "Tkraft Home & Kitchen Essentials",
        "url": SITE_CONFIG.url,
        "logo": SITE_CONFIG.logo,
        "description": SITE_CONFIG.description,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@tkraft.online",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"],
        },
        "sameAs": [
          "https://www.instagram.com/tkraft.online",
          "https://www.facebook.com/tkraft.online",
          "https://www.youtube.com/@tkraftin",
          "https://www.trustpilot.com/review/tkraft.online",
          "https://www.amazon.in/stores/Tkraft/page/87C0D0E8-A979-4B52-87C7-93C0C46B1D28",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_CONFIG.url}/#webpage`,
        "url": SITE_CONFIG.url,
        "name": `${SITE_CONFIG.name} – ${SITE_CONFIG.tagline}`,
        "description": SITE_CONFIG.description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${SITE_CONFIG.url}/#website`,
          "url": SITE_CONFIG.url,
          "name": SITE_CONFIG.name,
        },
        "publisher": {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_CONFIG.url}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Tkraft drill-free home and kitchen organization?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tkraft drill-free home and kitchen organization is defined as a storage system utilizing heavy-duty acrylic adhesive pads to mount shelves, racks, and hooks on tiles and smooth surfaces without power tools or wall damage.",
            },
          },
          {
            "@type": "Question",
            "name": "How much weight can Tkraft adhesive wall hooks and storage racks hold?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Tkraft heavy-duty adhesive hooks and stainless steel racks are lab-tested to hold up to 15.4kg of static load per adhesive pad on smooth, non-porous surfaces like ceramic tiles, glass, and polished marble under ASTM D3654 test standards.",
            },
          },
          {
            "@type": "Question",
            "name": "How to install Tkraft adhesive organizers without damaging walls?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To install Tkraft adhesive organizers, clean and dry the surface thoroughly, press the adhesive pad firmly from the center outward to remove trapped air bubbles, wait 12 to 24 hours for full acrylic bonding, and hook the rack onto the pad.",
            },
          },
          {
            "@type": "Question",
            "name": "Does Tkraft offer free shipping across India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Tkraft offers free express shipping across India on all orders above ₹499, with Cash on Delivery (COD) and 7-day hassle-free returns.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* Server-Rendered JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Campaign specific CSS variable override */}
      {campaignCss && (
        <style 
          id="tkraft-campaign-tokens" 
          dangerouslySetInnerHTML={{ __html: campaignCss }} 
        />
      )}

      {/* Dynamic Announcement Bar Ribbon */}
      {wpContent?.announcement_enabled && wpContent.announcement_text && (
        <div 
          style={{ backgroundColor: wpContent.announcement_bg_color || "hsl(var(--color-primary))" }} 
          className="text-white text-xs font-semibold text-center py-2 px-4 transition-colors duration-300"
        >
          {wpContent.announcement_link ? (
            <a href={wpContent.announcement_link} className="hover:underline inline-flex items-center justify-center gap-1">
              {wpContent.announcement_text}
            </a>
          ) : (
            <span>{wpContent.announcement_text}</span>
          )}
        </div>
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
