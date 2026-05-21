// ============================================
// Tkraft - Homepage Dynamic Section Renderer
// ============================================

import React from "react";
import type { HomepageSection } from "@/services/cms";
import type { WooProduct, WooCategory } from "@/types";

// Lazy-load sections to optimize Lighthouse scores and minimize bundle sizes
const HeroBannerShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Hero Banner Placeholder</div>;
const PromoBannerShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Promo Banner Grid Placeholder</div>;
const CategoryGridShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Category Grid Placeholder</div>;
const BrandHighlightsShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Brand Highlights Placeholder</div>;
const CustomerBenefitsShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Customer Benefits Placeholder</div>;
const TestimonialsShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Testimonials Slider Placeholder</div>;
const NewsletterSignupShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Newsletter Signup Block</div>;
const BlogHighlightsShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">Blog Highlights Grid</div>;
const CallToActionBannerShell = () => <div className="p-8 text-center bg-gray-100 rounded-xl">CTA Banner Box</div>;

interface SectionRendererProps {
  section: HomepageSection;
  products: {
    trending: WooProduct[];
    bestsellers: WooProduct[];
    featured: WooProduct[];
    flashSale: WooProduct[];
  };
  categories: WooCategory[];
}

export function SectionRenderer({ section, products, categories }: SectionRendererProps) {
  switch (section.type) {
    case "heroBanner":
      return <HeroBannerShell />;
      
    case "promoBanner":
      return <PromoBannerShell />;

    case "categoryGrid":
      return <CategoryGridShell />;

    case "trendingProducts":
      return (
        <section className="section bg-[hsl(var(--color-surface2))]">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[hsl(var(--color-text))]">
                {section.title || "Trending Now"}
              </h2>
              {section.subtitle && (
                <p className="text-[hsl(var(--color-textMuted))] mt-2 text-sm">{section.subtitle}</p>
              )}
            </div>
            {/* Reusable Product Carousel goes here */}
            <div className="text-center text-xs text-gray-400 mt-2">Trending Products Slider Root</div>
          </div>
        </section>
      );

    case "bestSellerProducts":
      return (
        <section className="section">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[hsl(var(--color-text))]">
                {section.title || "Best Sellers"}
              </h2>
              {section.subtitle && (
                <p className="text-[hsl(var(--color-textMuted))] mt-2 text-sm">{section.subtitle}</p>
              )}
            </div>
            {/* Reusable Product Carousel goes here */}
            <div className="text-center text-xs text-gray-400 mt-2">Bestseller Products Slider Root</div>
          </div>
        </section>
      );

    case "flashSale":
      return (
        <section className="section bg-red-50 dark:bg-red-950/20">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-red-600 dark:text-red-400">
                {section.title || "Flash Sale"}
              </h2>
              {section.subtitle && (
                <p className="text-[hsl(var(--color-textMuted))] mt-2 text-sm">{section.subtitle}</p>
              )}
            </div>
            {/* Reusable Product Carousel with Flash countdown goes here */}
            <div className="text-center text-xs text-gray-400 mt-2">Flash Sale Slider Root</div>
          </div>
        </section>
      );

    case "featuredProducts":
      return (
        <section className="section">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-[hsl(var(--color-text))]">
                {section.title || "Featured Products"}
              </h2>
              {section.subtitle && (
                <p className="text-[hsl(var(--color-textMuted))] mt-2 text-sm">{section.subtitle}</p>
              )}
            </div>
            {/* Reusable Product Carousel goes here */}
            <div className="text-center text-xs text-gray-400 mt-2">Featured Products Slider Root</div>
          </div>
        </section>
      );

    case "ctaBanner":
      return <CallToActionBannerShell />;

    case "brandHighlights":
      return <BrandHighlightsShell />;

    case "customerBenefits":
      return <CustomerBenefitsShell />;

    case "testimonials":
      return <TestimonialsShell />;

    case "newsletterSignup":
      return <NewsletterSignupShell />;

    case "blogHighlights":
      return <BlogHighlightsShell />;

    default:
      return null;
  }
}
