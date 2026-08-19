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
    promoText: " Summer Clearance: Cool deals on home & kitchen essentials! ",
    colors: {
      primary: "hsl(24, 95%, 45%)", // Warm Orange
      accent: "hsl(45, 100%, 50%)",  // Yellow Gold
      surface: "hsl(30, 100%, 98%)", // Warm Cream
    }
  },
  monsoon: {
    name: "Monsoon Sale",
    promoText: " Monsoon Fresh: Smart storage & home organizing deals! ",
    colors: {
      primary: "hsl(174, 90%, 30%)", // Deep Teal
      accent: "hsl(150, 80%, 40%)",  // Emerald Accent
      surface: "hsl(180, 50%, 98%)", // Ice Blue/Mint
    }
  },
  diwali: {
    name: "Diwali Sale",
    promoText: " Festive Diwali Dhamaka: Bring prosperity home with gold class storage! ",
    colors: {
      primary: "hsl(12, 85%, 40%)",  // Deep Terracotta Red
      accent: "hsl(43, 90%, 50%)",   // Royal Gold
      surface: "hsl(20, 70%, 98%)",  // Warm Peach
    }
  },
  blackfriday: {
    name: "Black Friday Sale",
    promoText: " Black Friday Sale: The lowest prices of the entire year! ",
    colors: {
      primary: "hsl(0, 0%, 9%)",     // Jet Black
      accent: "hsl(0, 85%, 55%)",    // Neon Red
      surface: "hsl(0, 0%, 98%)",    // Clean White
    }
  },
  christmas: {
    name: "Christmas Sale",
    promoText: "Christmas Joy: Gift smart organizers and kitchen decors! ",
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
    | "blogHighlights"
    | "customGrid"
    | "gridBlock"
    | "shopByBudget"
    | "shopByProblem"
    | "beforeAfter"
    | "bundleSave"
    | "homeHacks";
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
  // Announcement Bar
  announcement_enabled?: boolean;
  announcement_text?: string;
  announcement_link?: string;
  announcement_bg_color?: string;

  // Hero Banner
  hero_title?: string;
  hero_subtitle?: string;
  hero_desktop_image?: string;
  hero_mobile_image?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  hero_alignment?: string;
  hero_theme?: string;
  hero_image?: string; // backwards compatibility

  // Trust Benefits
  benefit_1_title?: string;
  benefit_1_icon?: string;
  benefit_2_title?: string;
  benefit_2_icon?: string;
  benefit_3_title?: string;
  benefit_3_icon?: string;
  benefit_4_title?: string;
  benefit_4_icon?: string;

  // Trending Now
  trending_title?: string;
  trending_collection?: string;
  trending_limit?: number;

  // Promo Banner
  promo_title?: string;
  promo_description?: string;
  promo_image?: string;
  promo_cta_text?: string;
  promo_cta_url?: string;

  // Best Sellers
  bestseller_title?: string;
  bestseller_limit?: number;
  bestsellers_title?: string;
  bestsellers_limit?: number;

  // Featured Collections
  collection_1_title?: string;
  collection_1_category?: any;
  collection_2_title?: string;
  collection_2_category?: any;
  collection_3_title?: string;
  collection_3_category?: any;

  // Flash Deals
  flash_sale_title?: string;
  flash_sale_end_date?: string;
  flash_sale_collection?: any;

  // Why Buy From TKraft
  why_buy_title?: string;
  why_buy_item_1?: string;
  why_buy_item_2?: string;
  why_buy_item_3?: string;
  why_buy_item_4?: string;

  // Reviews
  testimonial_title?: string;

  // Newsletter
  newsletter_title?: string;
  newsletter_subtitle?: string;

  // Campaign overrides (Backwards compatibility)
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
  categories_title?: string;
  categories_subtitle?: string;
  categories_slugs?: string[];
  new_arrivals_title?: string;
  new_arrivals_limit?: number;
  trending_limit_mobile?: number;
  bestsellers_limit_mobile?: number;
  new_arrivals_limit_mobile?: number;
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
  cta_title?: string;
  cta_subtitle?: string;
  cta_image?: string;
  cta_cta_text?: string;
  cta_cta_link?: string;
  
  // Custom Grid Section
  grid_title?: string;
  grid_subtitle?: string;
  grid_items?: Array<{ image: string; title: string; url: string }>;
  enable_section_grid?: boolean;

  hero_slides?: Array<{
    id?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    imageMobile?: string;
    cta_text?: string;
    cta_link?: string;
    alignment?: string;
    theme?: string;
  }>;

  enable_section_hero?: boolean;
  enable_section_benefits?: boolean;
  enable_section_budget?: boolean;
  enable_section_problem?: boolean;
  enable_section_categories?: boolean;
  enable_section_trending?: boolean;
  enable_section_bundles?: boolean;
  enable_section_before_after?: boolean;
  enable_section_flash?: boolean;
  enable_section_promo?: boolean;
  enable_section_hacks?: boolean;
  enable_section_bestsellers?: boolean;
  enable_section_cta?: boolean;
  enable_section_highlights?: boolean;
  enable_section_testimonials?: boolean;
  enable_section_newsletter?: boolean;
  hero_image_mobile?: string;
  categories_hide_on_mobile?: boolean;
  promo_1_image_mobile?: string;
  promo_2_image_mobile?: string;
  cta_image_mobile?: string;
  benefits_title?: string;
  benefits_subtitle?: string;
  highlights_title?: string;
  highlights_subtitle?: string;
  testimonials_title?: string;
  testimonials_subtitle?: string;
  newsletter_placeholder?: string;
  newsletter_cta_text?: string;

  // Shop By Budget
  budget_title?: string;
  budget_subtitle?: string;
  budget_199_image?: string;
  budget_299_image?: string;
  budget_499_image?: string;
  budget_999_image?: string;

  // Shop By Problem
  problem_title?: string;
  problem_subtitle?: string;
  problem_1_title?: string;
  problem_1_image?: string;
  problem_2_title?: string;
  problem_2_image?: string;
  problem_3_title?: string;
  problem_3_image?: string;
  problem_4_title?: string;
  problem_4_image?: string;

  // Bundles
  bundles_title?: string;
  bundles_subtitle?: string;
  bundle_1_image?: string;
  bundle_2_image?: string;
  bundle_3_image?: string;

  // Before & After
  before_after_title?: string;
  before_after_subtitle?: string;
  before_1_image?: string;
  after_1_image?: string;
  before_2_image?: string;
  after_2_image?: string;

  // Home Hacks
  hacks_title?: string;
  hacks_subtitle?: string;
  hack_1_image?: string;
  hack_2_image?: string;
  hack_3_image?: string;

  [key: string]: any;
}

export interface LoginContent {
  login_promo_title?: string;
  login_promo_subtitle?: string;
  login_promo_image?: string;
  login_promo_image_mobile?: string;
  login_promo_cta_text?: string;
  login_promo_cta_url?: string;
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
      id: "section_budget",
      type: "shopByBudget" as any,
    },
    {
      id: "section_problem",
      type: "shopByProblem" as any,
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
      id: "section_bundles",
      type: "bundleSave" as any,
    },
    {
      id: "section_before_after",
      type: "beforeAfter" as any,
    },
    {
      id: "section_flash",
      type: "flashSale",
      title: "Flash Deals",
      subtitle: "Super saver limited hours deals!",
      limit: 8,
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
      id: "section_hacks",
      type: "homeHacks" as any,
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
  return {
    signal: AbortSignal.timeout(5000),
    ...(isDev
      ? { cache: "no-store" as RequestCache }
      : { next: { revalidate: 60 } }),
  };
}

// ---- SCF Field Extraction Helpers ----
function cleanLink(urlStr?: string): string | undefined {
  if (!urlStr) return undefined;
  const str = String(urlStr).trim();
  if (str.includes("tkraft.online")) {
    try {
      const absoluteUrl = str.startsWith("http") ? str : `https://${str}`;
      const parsed = new URL(absoluteUrl);
      return parsed.pathname;
    } catch {
      return "/shop";
    }
  }
  return str;
}

function extractImg(imgField: any, sourceField?: any): string | undefined {
  const sanitizeUrl = (val: any): string | undefined => {
    if (!val) return undefined;
    if (typeof val === "object") {
      const possibleUrl =
        val.url ||
        val.source_url ||
        val.src ||
        val.formatted_value?.url ||
        (typeof val.formatted_value === "string" ? val.formatted_value : undefined);
      if (possibleUrl && typeof possibleUrl === "string") return sanitizeUrl(possibleUrl);
      return undefined;
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return undefined;
      if (/^\d+$/.test(trimmed)) return undefined;
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
        return trimmed;
      }
    }
    return undefined;
  };

  return sanitizeUrl(imgField) || sanitizeUrl(sourceField) || undefined;
}

function extractText(textField: any, sourceField?: any): string | undefined {
  if (textField && typeof textField === "string") return textField;
  if (sourceField) {
    if (typeof sourceField === "string") return sourceField;
    if (typeof sourceField === "object") {
      if (typeof sourceField.formatted_value === "string") return sourceField.formatted_value;
    }
  }
  return undefined;
}

/**
 * Fetch dynamic homepage section layout configuration from WordPress CMS
 */
export async function getHomepageLayout(): Promise<HomepageLayout> {
  try {
    const wpPageUrl = `${API_CONFIG.wpRestUrl}/pages/6144`;
    const res = await fetch(wpPageUrl, { signal: AbortSignal.timeout(3000), next: { revalidate: 60 } });
    if (res.ok) {
      const page = await res.json();
      if (page && page.acf && page.acf.layout_sections && Array.isArray(page.acf.layout_sections)) {
        return { sections: page.acf.layout_sections };
      }
    }
  } catch (e) {}

  return DEFAULT_HOMEPAGE_LAYOUT;
}

/**
 * Fetch homepage SCF content fields from WordPress
 */
export async function getHomepageContent(): Promise<HomepageContent | null> {
  try {
    // 1. Try Page 6144 directly (primary CMS target)
    let page: any = null;
    const wpPageUrl = `${API_CONFIG.wpRestUrl}/pages/6144`;
    try {
      const res = await fetch(wpPageUrl, getFetchOptions());
      if (res.ok) {
        page = await res.json();
      }
    } catch (e) {
      // Fallback below
    }

    // 2. Fallback to slug search if page 6144 fails
    if (!page || !page.acf) {
      const wpPagesUrl = `${API_CONFIG.wpRestUrl}/pages?slug=homepage-content`;
      const res = await fetch(wpPagesUrl, getFetchOptions());
      if (res.ok) {
        const pages = await res.json();
        if (Array.isArray(pages) && pages.length > 0) {
          page = pages[0];
        }
      }
    }

    let acf: Record<string, any> = (page && page.acf) ? { ...page.acf } : {};

    // Merge with local persistent storage fallback (Server-side only)
    if (typeof window === "undefined") {
      try {
        const fs = eval('require("fs")');
        const path = eval('require("path")');
        const localFile = path.join(process.cwd(), "data", "homepage_content.json");
        if (fs.existsSync(localFile)) {
          const text = fs.readFileSync(localFile, "utf-8");
          const localData = JSON.parse(text);
          acf = { ...acf, ...localData };
        }
      } catch (e) {}
    }

    if (Object.keys(acf).length > 0) {
      // Dynamic parser helper to search for keys with optional trailing underscores
      const getVal = (key: string) => {
        const raw = acf[key] || acf[`${key}_`] || acf[`${key}__`] || acf[`${key}___`] || acf[`${key}____`] || acf[`${key}_____`];
        const source = acf[`${key}_source`] || acf[`${key}__source`] || acf[`${key}___source`] || acf[`${key}____source`] || acf[`${key}_____source`];
        return { raw, source };
      };

          const text = (key: string) => {
            const { raw, source } = getVal(key);
            return extractText(raw, source);
          };

          const img = (key: string) => {
            const { raw, source } = getVal(key);
            return extractImg(raw, source);
          };

          const toggle = (key: string) => {
            const { raw } = getVal(key);
            if (raw === undefined || raw === null) return undefined;
            return raw === true || raw === "1" || raw === "true";
          };

          const num = (key: string) => {
            const { raw } = getVal(key);
            if (raw === undefined || raw === null || raw === "") return undefined;
            return Number(raw);
          };

          const link = (key: string) => {
            const { raw } = getVal(key);
            return cleanLink(raw);
          };

          const categoryVal = (key: string) => {
            const { raw } = getVal(key);
            if (!raw) return undefined;
            if (Array.isArray(raw)) {
              return raw.map((item: any) => {
                if (typeof item === "object" && item !== null) {
                  return item.id || item.term_id || item.slug || item;
                }
                return item;
              });
            }
            if (typeof raw === "object" && raw !== null) {
              return raw.id || raw.term_id || raw.slug || raw;
            }
            return raw;
          };

          const collectionVal = (key: string) => {
            const { raw } = getVal(key);
            if (!raw) return undefined;
            if (typeof raw === "object" && raw !== null) {
              return raw.slug || raw.name || raw.caption || raw.title || raw.url || undefined;
            }
            return raw;
          };

          // Parse categories slugs (could be array or comma-separated string)
          const categories_slugs_val = acf.categories_slugs || acf.categories_slugs_;
          let categories_slugs: string[] | undefined = undefined;
          if (categories_slugs_val) {
            if (Array.isArray(categories_slugs_val)) {
              categories_slugs = categories_slugs_val.map((s: any) => typeof s === "object" ? s.slug || s.name : String(s));
            } else if (typeof categories_slugs_val === "string") {
              categories_slugs = categories_slugs_val.split(",").map((s: string) => s.trim()).filter(Boolean);
            }
          }

          const hero_image_val = img("hero_image") || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80";

          return {
            // Announcement Bar
            announcement_enabled: toggle("announcement_enabled"),
            announcement_text: text("announcement_text"),
            announcement_link: link("announcement_link"),
            announcement_bg_color: text("announcement_bg_color"),

            // Hero Banner
            hero_title: text("hero_title"),
            hero_subtitle: text("hero_subtitle"),
            hero_desktop_image: img("hero_desktop_image"),
            hero_mobile_image: img("hero_mobile_image"),
            hero_cta_text: text("hero_cta_text"),
            hero_cta_url: link("hero_cta_url"),
            hero_alignment: text("hero_alignment"),
            hero_theme: text("hero_theme"),
            hero_image: img("hero_desktop_image") || img("hero_image"), // compat

            // Trust Benefits
            benefit_1_title: text("benefit_1_title"),
            benefit_1_icon: text("benefit_1_icon"),
            benefit_2_title: text("benefit_2_title"),
            benefit_2_icon: text("benefit_2_icon"),
            benefit_3_title: text("benefit_3_title"),
            benefit_3_icon: text("benefit_3_icon"),
            benefit_4_title: text("benefit_4_title"),
            benefit_4_icon: text("benefit_4_icon"),

            // Trending Now
            trending_title: text("trending_title"),
            trending_collection: text("trending_collection"),
            trending_limit: num("trending_limit"),

            // Promo Banner
            promo_title: text("promo_title"),
            promo_description: text("promo_description"),
            promo_image: img("promo_image"),
            promo_cta_text: text("promo_cta_text"),
            promo_cta_url: link("promo_cta_url"),

            // Best Sellers
            bestseller_title: text("bestseller_title") || text("bestsellers_title"),
            bestseller_limit: num("bestseller_limit") || num("bestsellers_limit"),
            bestsellers_title: text("bestsellers_title") || text("bestseller_title"),
            bestsellers_limit: num("bestsellers_limit") || num("bestseller_limit"),

            // Featured Collections
            collection_1_title: text("collection_1_title"),
            collection_1_category: categoryVal("collection_1_category"),
            collection_2_title: text("collection_2_title"),
            collection_2_category: categoryVal("collection_2_category"),
            collection_3_title: text("collection_3_title"),
            collection_3_category: categoryVal("collection_3_category"),

            // Flash Deals
            flash_sale_title: text("flash_sale_title"),
            flash_sale_end_date: text("flash_sale_end_date"),
            flash_sale_collection: collectionVal("flash_sale_collection"),

            // Why Buy From TKraft
            why_buy_title: text("why_buy_title"),
            why_buy_item_1: text("why_buy_item_1"),
            why_buy_item_2: text("why_buy_item_2"),
            why_buy_item_3: text("why_buy_item_3"),
            why_buy_item_4: text("why_buy_item_4"),

            // Reviews
            testimonial_title: text("testimonial_title"),

            // Newsletter
            newsletter_title: text("newsletter_title"),
            newsletter_subtitle: text("newsletter_subtitle"),

            // Campaign overrides / toggles / limits (Backwards compatibility)
            campaign_id: text("campaign_id"),
            campaign_name: text("campaign_name"),
            campaign_theme: text("campaign_theme"),
            campaign_promo_text: text("campaign_promo_text"),
            campaign_color_primary: text("campaign_color_primary"),
            campaign_color_accent: text("campaign_color_accent"),
            campaign_color_surface: text("campaign_color_surface"),
            campaign_headline: text("campaign_headline") || text("campaign_headline_"),
            campaign_cta_text: text("campaign_cta_text") || text("campaign_cta_text_"),
            campaign_cta_link: link("campaign_cta_link"),
            campaign_banner_image: img("campaign_banner_image"),
            campaign_banner_image_mobile: img("campaign_banner_image_mobile"),
            campaign_product_collection: text("campaign_product_collection"),
            hero_scroll_interval_seconds: num("hero_scroll_interval_seconds") || num("hero_scroll_interval_seconds_") || num("hero_scroll_interval_seconds__"),
            categories_title: text("categories_title"),
            categories_subtitle: text("categories_subtitle"),
            categories_slugs: categories_slugs,
            trending_limit_mobile: num("trending_limit_mobile"),
            bestsellers_limit_mobile: num("bestsellers_limit_mobile"),
            new_arrivals_title: text("new_arrivals_title"),
            new_arrivals_limit: num("new_arrivals_limit"),
            new_arrivals_limit_mobile: num("new_arrivals_limit_mobile"),
            promo_1_title: text("promo_1_title"),
            promo_1_subtitle: text("promo_1_subtitle"),
            promo_1_image: img("promo_1_image"),
            promo_1_cta_text: text("promo_1_cta_text"),
            promo_1_cta_link: link("promo_1_cta_link"),
            promo_2_title: text("promo_2_title"),
            promo_2_subtitle: text("promo_2_subtitle"),
            promo_2_image: img("promo_2_image"),
            promo_2_cta_text: text("promo_2_cta_text"),
            promo_2_cta_link: link("promo_2_cta_link"),
            cta_title: text("cta_title"),
            cta_subtitle: text("cta_subtitle") || text("cta_description"),
            cta_image: img("cta_image"),
            cta_cta_text: text("cta_cta_text") || text("cta_button_text"),
            cta_cta_link: link("cta_cta_link") || link("cta_button_url"),
            // Custom Grid Section
            grid_title: text("grid_title"),
            grid_subtitle: text("grid_subtitle"),
            grid_items: (() => {
              const grid_items_val = acf.grid_items || acf.grid_items_;
              let grid_items: Array<{ image: string; title: string; url: string }> = [];

              if (Array.isArray(grid_items_val)) {
                grid_items = grid_items_val.map((item: any) => {
                  const rawImg = item.image || item.image_source || item.img || item.image_;
                  const imgUrl = typeof rawImg === "string" ? rawImg : (rawImg?.url || rawImg?.sizes?.large || "");
                  return {
                    image: (imgUrl || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80") as string,
                    title: String(item.title || item.name || ""),
                    url: (cleanLink(item.url || item.link || item.cta_url) || "/shop") as string
                  };
                });
              } else {
                // Fallback to individual fields: grid_item_1_image, grid_item_1_title, grid_item_1_url, etc.
                for (let i = 1; i <= 8; i++) {
                  const { raw: rawImg, source: imgSource } = getVal(`grid_item_${i}_image`);
                  const title = text(`grid_item_${i}_title`);
                  const url = (link(`grid_item_${i}_url`) || link(`grid_item_${i}_link`) || "/shop") as string;
                  const image = extractImg(rawImg, imgSource);
                  if (image || title) {
                    grid_items.push({
                      image: (image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80") as string,
                      title: title || "",
                      url: url
                    });
                  }
                }
              }
              return grid_items;
            })(),
            enable_section_grid: toggle("enable_section_grid"),

            enable_section_hero: toggle("enable_section_hero"),
            enable_section_benefits: toggle("enable_section_benefits"),
            enable_section_budget: toggle("enable_section_budget"),
            enable_section_problem: toggle("enable_section_problem"),
            enable_section_categories: toggle("enable_section_categories"),
            enable_section_trending: toggle("enable_section_trending"),
            enable_section_bundles: toggle("enable_section_bundles"),
            enable_section_before_after: toggle("enable_section_before_after"),
            enable_section_flash: toggle("enable_section_flash"),
            enable_section_promo: toggle("enable_section_promo"),
            enable_section_hacks: toggle("enable_section_hacks"),
            enable_section_bestsellers: toggle("enable_section_bestsellers"),
            enable_section_cta: toggle("enable_section_cta"),
            enable_section_highlights: toggle("enable_section_highlights"),
            hero_slides: (() => {
              const slides: any[] = [];
              const rawSlides = acf.hero_slides || acf.slides;
              if (Array.isArray(rawSlides) && rawSlides.length > 0) {
                return rawSlides.map((item: any, idx: number) => ({
                  id: `hero_slide_${idx + 1}`,
                  title: extractText(item.title, item.headline) || "",
                  subtitle: extractText(item.subtitle, item.description) || "",
                  image: extractImg(item.image || item.desktop_image),
                  imageMobile: extractImg(item.imageMobile || item.mobile_image),
                  cta_text: extractText(item.cta_text, item.button_text) || "Shop Collection",
                  cta_link: cleanLink(item.cta_link || item.button_link || item.url) || "/shop",
                }));
              }
              for (let i = 1; i <= 5; i++) {
                const title = text(`hero_slide_${i}_title`) || (i === 1 ? text("hero_title") : undefined);
                const subtitle = text(`hero_slide_${i}_subtitle`) || (i === 1 ? text("hero_subtitle") : undefined);
                const { raw: rawImg, source: imgSource } = getVal(`hero_slide_${i}_desktop_image`);
                const { raw: rawImgMobile, source: imgMobileSource } = getVal(`hero_slide_${i}_mobile_image`);
                const fallbackImg = i === 1 ? getVal("hero_desktop_image").raw || getVal("hero_image").raw : undefined;
                const fallbackMobile = i === 1 ? getVal("hero_mobile_image").raw : undefined;
                
                const image = extractImg(rawImg, imgSource) || extractImg(fallbackImg);
                const imageMobile = extractImg(rawImgMobile, imgMobileSource) || extractImg(fallbackMobile);
                const cta_text = text(`hero_slide_${i}_cta_text`) || (i === 1 ? text("hero_cta_text") : undefined);
                const cta_link = link(`hero_slide_${i}_cta_url`) || link(`hero_slide_${i}_cta_link`) || (i === 1 ? link("hero_cta_url") : undefined);

                if (title || image || subtitle) {
                  slides.push({
                    id: `hero_slide_${i}`,
                    title: title || "Premium Home Essentials",
                    subtitle: subtitle || "",
                    image: image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
                    imageMobile: imageMobile,
                    cta_text: cta_text || "Shop Collection",
                    cta_link: cta_link || "/shop",
                  });
                }
              }
              return slides;
            })(),
            categories_hide_on_mobile: toggle("categories_hide_on_mobile"),
            promo_1_image_mobile: img("promo_1_image_mobile"),
            promo_2_image_mobile: img("promo_2_image_mobile"),
            cta_image_mobile: img("cta_image_mobile"),
            benefits_title: text("benefits_title"),
            benefits_subtitle: text("benefits_subtitle"),
            highlights_title: text("highlights_title"),
            highlights_subtitle: text("highlights_subtitle"),
            testimonials_title: text("testimonials_title"),
            testimonials_subtitle: text("testimonials_subtitle"),
            newsletter_placeholder: text("newsletter_placeholder"),
            newsletter_cta_text: text("newsletter_cta_text"),

            // Shop By Budget
            budget_title: text("budget_title"),
            budget_subtitle: text("budget_subtitle"),
            budget_199_image: img("budget_199_image"),
            budget_299_image: img("budget_299_image"),
            budget_499_image: img("budget_499_image"),
            budget_999_image: img("budget_999_image"),

            // Shop By Problem
            problem_title: text("problem_title"),
            problem_subtitle: text("problem_subtitle"),
            problem_1_title: text("problem_1_title"),
            problem_1_image: img("problem_1_image"),
            problem_2_title: text("problem_2_title"),
            problem_2_image: img("problem_2_image"),
            problem_3_title: text("problem_3_title"),
            problem_3_image: img("problem_3_image"),
            problem_4_title: text("problem_4_title"),
            problem_4_image: img("problem_4_image"),

            // Bundles
            bundles_title: text("bundles_title"),
            bundles_subtitle: text("bundles_subtitle"),
            bundle_1_image: img("bundle_1_image"),
            bundle_2_image: img("bundle_2_image"),
            bundle_3_image: img("bundle_3_image"),

            // Before & After
            before_after_title: text("before_after_title"),
            before_after_subtitle: text("before_after_subtitle"),
            before_1_image: img("before_1_image"),
            after_1_image: img("after_1_image"),
            before_2_image: img("before_2_image"),
            after_2_image: img("after_2_image"),

            // Home Hacks
            hacks_title: text("hacks_title"),
            hacks_subtitle: text("hacks_subtitle"),
            hack_1_image: img("hack_1_image"),
            hack_2_image: img("hack_2_image"),
            hack_3_image: img("hack_3_image"),
          };
        }
  } catch (error) {
    console.warn("Error fetching homepage-content from WP REST API:", error instanceof Error ? error.message : String(error));
  }
  return null;
}

/**
 * Fetch login page promotion fields from WordPress
 */
export async function getLoginContent(): Promise<LoginContent | null> {
  try {
    // Add cache buster query parameter to bypass CDN/varnish caching on WordPress host
    const wpPostsUrl = `${API_CONFIG.wpRestUrl}/posts?slug=login-content&t=${Date.now()}`;
    const res = await fetch(wpPostsUrl, {
      cache: "no-store",
    });

    if (res.ok) {
      const posts = await res.json();
      if (Array.isArray(posts) && posts.length > 0) {
        const post = posts[0];
        const acf = post.acf;
        if (acf) {
          // Support keys with or without trailing underscores
          const login_promo_title = acf.login_promo_title || acf.login_promo_title_;
          const login_promo_title_source = acf.login_promo_title_source || acf.login_promo_title__source;

          const login_promo_subtitle = acf.login_promo_subtitle || acf.login_promo_subtitle_;
          const login_promo_subtitle_source = acf.login_promo_subtitle_source || acf.login_promo_subtitle__source;

          const login_promo_image = acf.login_promo_image || acf.login_promo_image_;
          const login_promo_image_source = acf.login_promo_image_source || acf.login_promo_image__source;

          const login_promo_image_mobile = acf.login_promo_image_mobile || acf.login_promo_image_mobile_;
          const login_promo_image_mobile_source = acf.login_promo_image_mobile_source || acf.login_promo_image_mobile__source;

          const login_promo_cta_text = acf.login_promo_cta_text || acf.login_promo_cta_text_;
          const login_promo_cta_text_source = acf.login_promo_cta_text_source || acf.login_promo_cta_text__source;

          const login_promo_cta_url = acf.login_promo_cta_url || acf.login_promo_cta_url_;

          return {
            login_promo_title: extractText(login_promo_title, login_promo_title_source),
            login_promo_subtitle: extractText(login_promo_subtitle, login_promo_subtitle_source),
            login_promo_image: extractImg(login_promo_image, login_promo_image_source),
            login_promo_image_mobile: extractImg(login_promo_image_mobile, login_promo_image_mobile_source),
            login_promo_cta_text: extractText(login_promo_cta_text, login_promo_cta_text_source),
            login_promo_cta_url: cleanLink(login_promo_cta_url),
          };
        }
      }
    }
  } catch (error) {
    console.warn("Error fetching login-content from WP REST API:", error instanceof Error ? error.message : String(error));
  }
  return null;
}
