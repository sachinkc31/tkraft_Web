// ============================================
// Tkraft - CMS & Page Layout API Service
// ============================================

import { API_CONFIG } from "@/lib/constants";

export interface HomepageSection {
  id: string;
  type:
    | "heroBanner"
    | "promoBanner"
    | "categoryGrid"
    | "trendingProducts"
    | "bestSellerProducts"
    | "flashSale"
    | "featuredProducts"
    | "ctaBanner"
    | "brandHighlights"
    | "customerBenefits"
    | "testimonials"
    | "newsletterSignup"
    | "blogHighlights";
  title?: string;
  subtitle?: string;
  viewAllUrl?: string;
  variant?: "default" | "minimal" | "compact" | "featured" | "boxed" | "accent";
  limit?: number;
  data?: any; // section-specific custom payload
}

export interface HomepageLayout {
  sections: HomepageSection[];
}

// Fallback layout when WordPress returns empty layout or fails
const DEFAULT_HOMEPAGE_LAYOUT: HomepageLayout = {
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
            cta_link: "/category/storage-organization",
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
            cta_link: "/category/kitchen-products",
            className: "md:col-span-2",
          },
          {
            id: "promo_2",
            title: "Eco Cleaning",
            subtitle: "Safe & non-toxic",
            image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
            cta_text: "Browse Cleaners",
            cta_link: "/category/cleaning-essentials",
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

/**
 * Fetch dynamic homepage section layout configuration from WordPress CMS
 */
export async function getHomepageLayout(): Promise<HomepageLayout> {
  // WordPress GraphQL / REST ACF dynamic schema url
  const url = `${API_CONFIG.woocommerceUrl.replace("/wp-json/wc/v3", "/wp-json/tkraft/v1/layout/homepage")}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // cache for 30 minutes (ISR)
    });
    
    if (!res.ok) throw new Error("CMS layout endpoint returned non-ok status");
    const data = await res.json();
    if (data && Array.isArray(data.sections)) {
      return data as HomepageLayout;
    }
  } catch (error) {
    // Silent fail & fallback to robust design schema
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn("CMS homepage layout endpoint failed or is not configured. Using static design layout configuration:", errorMessage);
  }

  return DEFAULT_HOMEPAGE_LAYOUT;
}
