// ============================================
// Tkraft - CMS & Page Layout API Service
// ============================================

import { API_CONFIG } from "@/lib/constants";

export interface CampaignConfig {
  id: string;
  name: string;
  theme: "summer" | "monsoon" | "diwali" | "blackfriday" | "christmas" | "newyear" | "default";
  colors?: {
    light?: Record<string, string>;
    dark?: Record<string, string>;
    primary?: string;
    accent?: string;
    surface?: string;
  };
  bannerUrl?: string;
  promoText?: string;
}

export interface CampaignPreset {
  name: string;
  promoText: string;
  colors: {
    primary: string;
    accent: string;
    surface: string;
  };
}

export const CAMPAIGN_PRESETS: Record<string, CampaignPreset> = {
  summer: {
    name: "Summer Sale",
    promoText: "☀️ Summer Clearance: Cool deals on home & kitchen essentials! ☀️",
    colors: {
      primary: "hsl(24, 95%, 45%)", // Warm Orange
      accent: "hsl(45, 100%, 50%)",  // Yellow Gold
      surface: "hsl(30, 100%, 98%)", // Warm Cream
    }
  },
  monsoon: {
    name: "Monsoon Sale",
    promoText: "🌧️ Monsoon Fresh: Smart storage & home organizing deals! 🌧️",
    colors: {
      primary: "hsl(174, 90%, 30%)", // Deep Teal
      accent: "hsl(150, 80%, 40%)",  // Emerald Accent
      surface: "hsl(180, 50%, 98%)", // Ice Blue/Mint
    }
  },
  diwali: {
    name: "Diwali Sale",
    promoText: "🪔 Festive Diwali Dhamaka: Bring prosperity home with gold class storage! 🪔",
    colors: {
      primary: "hsl(12, 85%, 40%)",  // Deep Terracotta Red
      accent: "hsl(43, 90%, 50%)",   // Royal Gold
      surface: "hsl(20, 70%, 98%)",  // Warm Peach
    }
  },
  blackfriday: {
    name: "Black Friday Sale",
    promoText: "🛍️ Black Friday Sale: The lowest prices of the entire year! 🛍️",
    colors: {
      primary: "hsl(0, 0%, 9%)",     // Jet Black
      accent: "hsl(0, 85%, 55%)",    // Neon Red
      surface: "hsl(0, 0%, 98%)",    // Clean White
    }
  },
  christmas: {
    name: "Christmas Sale",
    promoText: "❄️ Christmas Joy: Gift smart organizers and kitchen decors! 🎄",
    colors: {
      primary: "hsl(355, 80%, 40%)", // Holiday Red
      accent: "hsl(140, 70%, 30%)",  // Pine Green
      surface: "hsl(0, 0%, 97%)",    // Snowy White
    }
  }
};

export interface HomepageSection {
  id: string;
  type:
    | "heroBanner"
    | "promoBanner"
    | "ctaBanner"
    | "productCarousel"
    | "categoryGrid"
    | "featureIcons"
    | "trustSection"
    | "testimonials"
    | "newsletter"
    | "blogSection"
    // Keep Phase 1 types for backwards compatibility
    | "trendingProducts"
    | "bestSellerProducts"
    | "flashSale"
    | "featuredProducts"
    | "brandHighlights"
    | "customerBenefits"
    | "newsletterSignup"
    | "recentlyAdded"
    | "blogHighlights";
  title?: string;
  subtitle?: string;
  viewAllUrl?: string;
  variant?: "default" | "minimal" | "compact" | "featured" | "boxed" | "accent";
  limit?: number;
  data?: any; // section-specific custom payload
  fetchedProducts?: any[]; // Resolved WooCommerce products
  fetchedCategories?: any[]; // Resolved WooCommerce categories
  fetchedPosts?: any[]; // Resolved WordPress blog posts
}

export interface HomepageLayout {
  sections: HomepageSection[];
  activeCampaign?: CampaignConfig;
}

export interface HomepageContent {
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  // Campaign overrides
  campaign_id?: string;
  campaign_name?: string;
  campaign_theme?: string;
  campaign_promo_text?: string;
  campaign_color_primary?: string;
  campaign_color_accent?: string;
  campaign_color_surface?: string;
  campaign_headline?: string;
  campaign_cta_text?: string;
  campaign_cta_link?: string;
  campaign_banner_image?: string;
  campaign_banner_image_mobile?: string;
  campaign_product_collection?: string;
  hero_scroll_interval_seconds?: number;

  // Category Grid overrides
  categories_title?: string;
  categories_subtitle?: string;
  categories_slugs?: string[];

  // Product Carousels overrides
  trending_title?: string;
  trending_limit?: number;
  bestsellers_title?: string;
  bestsellers_limit?: number;
  new_arrivals_title?: string;
  new_arrivals_limit?: number;

  // Promo Banners overrides
  promo_1_title?: string;
  promo_1_subtitle?: string;
  promo_1_image?: string;
  promo_1_cta_text?: string;
  promo_1_cta_link?: string;
  promo_2_title?: string;
  promo_2_subtitle?: string;
  promo_2_image?: string;
  promo_2_cta_text?: string;
  promo_2_cta_link?: string;

  // CTA Banner overrides
  cta_title?: string;
  cta_subtitle?: string;
  cta_image?: string;
  cta_cta_text?: string;
  cta_cta_link?: string;

  // Enable/Disable Section Toggles
  enable_section_hero?: boolean;
  enable_section_benefits?: boolean;
  enable_section_categories?: boolean;
  enable_section_trending?: boolean;
  enable_section_promo?: boolean;
  enable_section_bestsellers?: boolean;
  enable_section_cta?: boolean;
  enable_section_highlights?: boolean;
  enable_section_testimonials?: boolean;
  enable_section_newsletter?: boolean;

  // Mobile Specific Content
  hero_image_mobile?: string;
  categories_hide_on_mobile?: boolean;
  trending_limit_mobile?: number;
  bestsellers_limit_mobile?: number;
  new_arrivals_limit_mobile?: number;
  promo_1_image_mobile?: string;
  promo_2_image_mobile?: string;
  cta_image_mobile?: string;
  // Extra fields for CMS-driven static blocks
  benefits_title?: string;
  benefits_subtitle?: string;
  highlights_title?: string;
  highlights_subtitle?: string;
  testimonials_title?: string;
  testimonials_subtitle?: string;
  newsletter_title?: string;
  newsletter_subtitle?: string;
  newsletter_placeholder?: string;
  newsletter_cta_text?: string;
}

// Fallback layout when WordPress returns empty layout or fails
export const DEFAULT_HOMEPAGE_LAYOUT: HomepageLayout = {
  sections: [
    {
      id: "section_hero",
      type: "heroBanner",
      data: {
        slides: [
          {
            id: "slide_1",
            title: "Premium Home Essentials",
            subtitle: "Curated collections crafted for modern spaces",
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
            cta_text: "Shop Collection",
            cta_link: "/shop",
          },
          {
            id: "slide_2",
            title: "Smart Storage Solutions",
            subtitle: "Organize your kitchen & living rooms effortlessly",
            image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1600&q=80",
            cta_text: "Explore Organizers",
            cta_link: "/category/storage-and-organization",
          }
        ]
      }
    },
    {
      id: "section_benefits",
      type: "customerBenefits",
    },
    {
      id: "section_categories",
      type: "categoryGrid",
      title: "Shop by Category",
      subtitle: "Explore our curated categories for home, kitchen, and personal care",
    },
    {
      id: "section_trending",
      type: "trendingProducts",
      title: "Trending Now",
      subtitle: "Best sellers and biggest discounts this week",
      viewAllUrl: "/shop?sort=popularity",
      limit: 8,
      variant: "default",
    },
    {
      id: "section_promo",
      type: "promoBanner",
      data: {
        banners: [
          {
            id: "promo_1",
            title: "Kitchen Makeover",
            subtitle: "Up to 30% Off culinary tools",
            image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
            cta_text: "Shop Cooking",
            cta_link: "/category/kitchen",
            className: "md:col-span-2",
          },
          {
            id: "promo_2",
            title: "Eco Cleaning",
            subtitle: "Safe & non-toxic",
            image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
            cta_text: "Browse Cleaners",
            cta_link: "/category/cleaning-essential",
            className: "md:col-span-1",
          }
        ]
      }
    },
    {
      id: "section_bestsellers",
      type: "bestSellerProducts",
      title: "Best Sellers",
      subtitle: "Most loved essentials by our customers",
      viewAllUrl: "/shop?sort=rating",
      limit: 8,
      variant: "featured",
    },
    {
      id: "section_cta",
      type: "ctaBanner",
      title: "Upgrade Your Living Experience",
      subtitle: "Join the Tkraft club to unlock special pricing, early access, and free shipping on all orders.",
      data: {
        cta_text: "Get Premium Membership",
        cta_link: "/account",
        bg_image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
      }
    },
    {
      id: "section_highlights",
      type: "brandHighlights",
    },
    {
      id: "section_testimonials",
      type: "testimonials",
      title: "Customer Testimonials",
      subtitle: "What our community has to say about us",
    },
    {
      id: "section_newsletter",
      type: "newsletterSignup",
    }
  ]
};

// ---- Auth Header Builder for WP REST ----
function getAuthHeaders(): HeadersInit {
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
  const encoded = Buffer.from(`${key}:${secret}`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

// Helper to extract clean JSON text from Gutenberg HTML output
function extractJsonFromHtml(html: string): any {
  if (!html) return null;
  
  // Clean comments (Gutenberg block tags), HTML tags, and common HTML entities
  const cleanText = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Failed to parse JSON from WordPress page content:", err);
    return null;
  }
}

/**
 * Helper to get caching options based on development vs production mode
 */
function getFetchOptions(): RequestInit {
  const isDev = process.env.NODE_ENV === "development";
  return isDev
    ? { cache: "no-store" as RequestCache }
    : { next: { revalidate: 60 } }; // cache for 60 seconds in production
}

/**
 * Fetch dynamic homepage section layout configuration from WordPress CMS
 */
export async function getHomepageLayout(): Promise<HomepageLayout> {
  // 1. Try custom layout endpoint first
  const customUrl = `${API_CONFIG.woocommerceUrl.replace("/wp-json/wc/v3", "/wp-json/tkraft/v1/layout/homepage")}`;
  
  try {
    const res = await fetch(customUrl, getFetchOptions());
    
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.sections)) {
        return data as HomepageLayout;
      }
    }
  } catch (error) {
    console.warn("CMS custom layout endpoint failed:", error instanceof Error ? error.message : String(error));
  }

  // 2. Fallback: Try fetching layout config stored inside the WordPress page slug 'homepage-content'
  try {
    const wpPagesUrl = `${API_CONFIG.wpRestUrl}/pages?slug=homepage-content`;
    const res = await fetch(wpPagesUrl, {
      headers: getAuthHeaders(),
      ...getFetchOptions(),
    });

    if (res.ok) {
      const pages = await res.json();
      if (Array.isArray(pages) && pages.length > 0) {
        const rawContent = pages[0].content?.rendered || "";
        const parsedLayout = extractJsonFromHtml(rawContent);
        if (parsedLayout && Array.isArray(parsedLayout.sections)) {
          return parsedLayout as HomepageLayout;
        }
      }
    }
  } catch (error) {
    console.warn("CMS fallback page 'homepage-layout' failed:", error instanceof Error ? error.message : String(error));
  }

  // 3. Hardcoded fallback
  return DEFAULT_HOMEPAGE_LAYOUT;
}

/**
 * Fetch homepage SCF content fields from WordPress
 */
export async function getHomepageContent(): Promise<HomepageContent | null> {
  try {
    const wpPagesUrl = `${API_CONFIG.wpRestUrl}/pages?slug=homepage-content`;
    const res = await fetch(wpPagesUrl, {
      headers: getAuthHeaders(),
      ...getFetchOptions(),
    });

    if (res.ok) {
      const pages = await res.json();
      if (Array.isArray(pages) && pages.length > 0) {
        const page = pages[0];
        const acf = page.acf;
        if (acf) {
          let hero_image = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80";
          if (acf.hero_image) {
            if (typeof acf.hero_image === "string") {
              hero_image = acf.hero_image;
            } else if (typeof acf.hero_image === "object" && acf.hero_image.url) {
              hero_image = acf.hero_image.url;
            } else if (acf.hero_image_source && acf.hero_image_source.url) {
              hero_image = acf.hero_image_source.url;
            }
          }

          // Clean url to keep it local if it contains tkraft.in
          let hero_cta_url = "/shop";
          if (acf.hero_cta_url) {
            const urlStr = String(acf.hero_cta_url).trim();
            if (urlStr.includes("tkraft.in")) {
              try {
                const absoluteUrl = urlStr.startsWith("http") ? urlStr : `https://${urlStr}`;
                const parsed = new URL(absoluteUrl);
                hero_cta_url = parsed.pathname;
              } catch {
                hero_cta_url = "/shop";
              }
            } else {
              hero_cta_url = urlStr;
            }
          }

          const extractImg = (imgField: any) => {
            if (!imgField) return undefined;
            if (typeof imgField === "string") return imgField;
            if (typeof imgField === "object" && imgField.url) return imgField.url;
            return undefined;
          };

          const cleanLink = (urlStr?: string) => {
            if (!urlStr) return undefined;
            const str = String(urlStr).trim();
            if (str.includes("tkraft.in")) {
              try {
                const absoluteUrl = str.startsWith("http") ? str : `https://${str}`;
                const parsed = new URL(absoluteUrl);
                return parsed.pathname;
              } catch {
                return "/shop";
              }
            }
            return str;
          };

          // Parse categories slugs (could be array or comma-separated string)
          let categories_slugs: string[] | undefined = undefined;
          if (acf.categories_slugs) {
            if (Array.isArray(acf.categories_slugs)) {
              categories_slugs = acf.categories_slugs.map((s: any) => typeof s === "object" ? s.slug || s.name : String(s));
            } else if (typeof acf.categories_slugs === "string") {
              categories_slugs = acf.categories_slugs.split(",").map((s: string) => s.trim()).filter(Boolean);
            }
          }

          return {
            hero_title: acf.hero_title || undefined,
            hero_subtitle: acf.hero_subtitle || undefined,
            hero_image: hero_image,
            hero_cta_text: acf.hero_cta_text || undefined,
            hero_cta_url: hero_cta_url,
            // Campaign fields
            campaign_id: acf.campaign_id || undefined,
            campaign_name: acf.campaign_name || undefined,
            campaign_theme: acf.campaign_theme || undefined,
            campaign_promo_text: acf.campaign_promo_text || undefined,
            campaign_color_primary: acf.campaign_color_primary || undefined,
            campaign_color_accent: acf.campaign_color_accent || undefined,
            campaign_color_surface: acf.campaign_color_surface || undefined,
            campaign_headline: acf.campaign_headline || undefined,
            campaign_cta_text: acf.campaign_cta_text || undefined,
            campaign_cta_link: cleanLink(acf.campaign_cta_link) || undefined,
            campaign_banner_image: extractImg(acf.campaign_banner_image) || undefined,
            campaign_banner_image_mobile: extractImg(acf.campaign_banner_image_mobile) || undefined,
            campaign_product_collection: acf.campaign_product_collection || undefined,
            hero_scroll_interval_seconds: acf.hero_scroll_interval_seconds ? Number(acf.hero_scroll_interval_seconds) : undefined,

            // Category Grid
            categories_title: acf.categories_title || undefined,
            categories_subtitle: acf.categories_subtitle || undefined,
            categories_slugs: categories_slugs,

            // Product Carousels
            trending_title: acf.trending_title || undefined,
            trending_limit: acf.trending_limit ? Number(acf.trending_limit) : undefined,
            bestsellers_title: acf.bestsellers_title || undefined,
            bestsellers_limit: acf.bestsellers_limit ? Number(acf.bestsellers_limit) : undefined,
            new_arrivals_title: acf.new_arrivals_title || undefined,
            new_arrivals_limit: acf.new_arrivals_limit ? Number(acf.new_arrivals_limit) : undefined,

            // Promo Banners
            promo_1_title: acf.promo_1_title || undefined,
            promo_1_subtitle: acf.promo_1_subtitle || undefined,
            promo_1_image: extractImg(acf.promo_1_image),
            promo_1_cta_text: acf.promo_1_cta_text || undefined,
            promo_1_cta_link: cleanLink(acf.promo_1_cta_link),
            promo_2_title: acf.promo_2_title || undefined,
            promo_2_subtitle: acf.promo_2_subtitle || undefined,
            promo_2_image: extractImg(acf.promo_2_image),
            promo_2_cta_text: acf.promo_2_cta_text || undefined,
            promo_2_cta_link: cleanLink(acf.promo_2_cta_link),

            // CTA Banner
            cta_title: acf.cta_title || undefined,
            cta_subtitle: acf.cta_subtitle || undefined,
            cta_image: extractImg(acf.cta_image),
            cta_cta_text: acf.cta_cta_text || undefined,
            cta_cta_link: cleanLink(acf.cta_cta_link),

            // Enable/Disable toggles
            enable_section_hero: acf.enable_section_hero !== undefined ? (acf.enable_section_hero === true || acf.enable_section_hero === "1" || acf.enable_section_hero === "true") : undefined,
            enable_section_benefits: acf.enable_section_benefits !== undefined ? (acf.enable_section_benefits === true || acf.enable_section_benefits === "1" || acf.enable_section_benefits === "true") : undefined,
            enable_section_categories: acf.enable_section_categories !== undefined ? (acf.enable_section_categories === true || acf.enable_section_categories === "1" || acf.enable_section_categories === "true") : undefined,
            enable_section_trending: acf.enable_section_trending !== undefined ? (acf.enable_section_trending === true || acf.enable_section_trending === "1" || acf.enable_section_trending === "true") : undefined,
            enable_section_promo: acf.enable_section_promo !== undefined ? (acf.enable_section_promo === true || acf.enable_section_promo === "1" || acf.enable_section_promo === "true") : undefined,
            enable_section_bestsellers: acf.enable_section_bestsellers !== undefined ? (acf.enable_section_bestsellers === true || acf.enable_section_bestsellers === "1" || acf.enable_section_bestsellers === "true") : undefined,
            enable_section_cta: acf.enable_section_cta !== undefined ? (acf.enable_section_cta === true || acf.enable_section_cta === "1" || acf.enable_section_cta === "true") : undefined,
            enable_section_highlights: acf.enable_section_highlights !== undefined ? (acf.enable_section_highlights === true || acf.enable_section_highlights === "1" || acf.enable_section_highlights === "true") : undefined,
            enable_section_testimonials: acf.enable_section_testimonials !== undefined ? (acf.enable_section_testimonials === true || acf.enable_section_testimonials === "1" || acf.enable_section_testimonials === "true") : undefined,
            enable_section_newsletter: acf.enable_section_newsletter !== undefined ? (acf.enable_section_newsletter === true || acf.enable_section_newsletter === "1" || acf.enable_section_newsletter === "true") : undefined,

            // Mobile specific configs
            hero_image_mobile: extractImg(acf.hero_image_mobile),
            categories_hide_on_mobile: acf.categories_hide_on_mobile !== undefined ? (acf.categories_hide_on_mobile === true || acf.categories_hide_on_mobile === "1" || acf.categories_hide_on_mobile === "true") : undefined,
            trending_limit_mobile: acf.trending_limit_mobile ? Number(acf.trending_limit_mobile) : undefined,
            bestsellers_limit_mobile: acf.bestsellers_limit_mobile ? Number(acf.bestsellers_limit_mobile) : undefined,
            new_arrivals_limit_mobile: acf.new_arrivals_limit_mobile ? Number(acf.new_arrivals_limit_mobile) : undefined,
            promo_1_image_mobile: extractImg(acf.promo_1_image_mobile),
            promo_2_image_mobile: extractImg(acf.promo_2_image_mobile),
            cta_image_mobile: extractImg(acf.cta_image_mobile),

            // Extra CMS-driven block content overrides
            benefits_title: acf.benefits_title || undefined,
            benefits_subtitle: acf.benefits_subtitle || undefined,
            highlights_title: acf.highlights_title || undefined,
            highlights_subtitle: acf.highlights_subtitle || undefined,
            testimonials_title: acf.testimonials_title || undefined,
            testimonials_subtitle: acf.testimonials_subtitle || undefined,
            newsletter_title: acf.newsletter_title || undefined,
            newsletter_subtitle: acf.newsletter_subtitle || undefined,
            newsletter_placeholder: acf.newsletter_placeholder || undefined,
            newsletter_cta_text: acf.newsletter_cta_text || undefined,
          };
        }
      }
    }
  } catch (error) {
    console.warn("Error fetching homepage-content from WP REST API:", error instanceof Error ? error.message : String(error));
  }
  return null;
}
