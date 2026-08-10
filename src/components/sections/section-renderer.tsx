// ============================================
// Tkraft - Homepage Dynamic Section Renderer
// ============================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Calendar, 
  User,
  Heart 
} from "lucide-react";
import { TbTruckDelivery, TbShieldCheck, TbCreditCard, TbClock, TbHeart } from "react-icons/tb";
import type { HomepageSection, CampaignConfig } from "@/services/cms";
import type { WooProduct, WooCategory } from "@/types";
import { ProductCarousel } from "@/components/carousel/product-carousel";
import { CategoryGrid } from "@/features/home/category-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { useUIStore } from "@/store";
import { ShopByBudgetSection } from "./shop-by-budget";
import { ShopByProblemSection } from "./shop-by-problem";
import { BeforeAfterSection } from "./before-after";
import { BundleSaveSection } from "./bundle-save";
import { HomeHacksSection } from "./home-hacks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export function getThemeMotif(theme?: string): { prefix?: string; suffix?: string; classNames?: string } {
  if (!theme) return {};
  switch (theme) {
    case "summer":
      return { prefix: "☀️", suffix: "☀️", classNames: "border-amber-200/50 bg-gradient-to-b from-amber-50/10 to-transparent" };
    case "monsoon":
      return { prefix: "", suffix: "", classNames: "border-teal-200/50 bg-gradient-to-b from-teal-50/10 to-transparent" };
    case "diwali":
      return { prefix: "🪔", suffix: "🪔", classNames: "border-yellow-600/30 bg-gradient-to-b from-yellow-50/10 to-transparent" };
    case "blackfriday":
      return { classNames: "border-slate-800/30 bg-gradient-to-b from-slate-100/10 to-transparent" };
    case "christmas":
      return { prefix: "❄️", suffix: "🎄", classNames: "border-red-600/30 bg-gradient-to-b from-red-50/10 to-transparent" };
    default:
      return {};
  }
}

interface SectionRendererProps {
  section: HomepageSection;
  products: {
    trending: WooProduct[];
    bestsellers: WooProduct[];
    featured: WooProduct[];
    flashSale: WooProduct[];
  };
  categories: WooCategory[];
  activeCampaign?: CampaignConfig;
}

export function SectionRenderer({ section, products, categories, activeCampaign }: SectionRendererProps) {
  const theme = activeCampaign?.theme;
  const motif = getThemeMotif(theme);

  switch (section.type) {
    case "heroBanner":
      return <HeroBannerBlock data={section.data} theme={theme} />;
      
    case "promoBanner":
      return <PromoBannerBlock data={section.data} theme={theme} />;

    case "ctaBanner":
      return <CtaBannerBlock section={section} theme={theme} />;

    case "categoryGrid":
      return (
        <section className={cn(
          "bg-[hsl(var(--color-surface-2))] py-8 md:py-10 border-t transition-all duration-300",
          section.data?.hideOnMobile && "hidden sm:block",
          motif.classNames
        )}>
          <div className="container">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))] flex items-center justify-center gap-2">
                {motif.prefix && <span>{motif.prefix}</span>}
                {section.title || "Shop by Category"}
                {motif.suffix && <span>{motif.suffix}</span>}
              </h2>
              {section.subtitle && (
                <p className="text-[hsl(var(--color-text-muted))] mt-2 text-sm max-w-lg mx-auto leading-relaxed">
                  {section.subtitle}
                </p>
              )}
            </div>
            <CategoryGrid categories={section.fetchedCategories || categories} />
          </div>
        </section>
      );

    case "customGrid":
    case "gridBlock":
      return <CustomGridBlock section={section} theme={theme} />;

    case "shopByBudget":
      return <ShopByBudgetSection />;

    case "shopByProblem":
      return <ShopByProblemSection />;

    case "beforeAfter":
      return <BeforeAfterSection />;

    case "bundleSave":
      return <BundleSaveSection />;

    case "homeHacks":
      return <HomeHacksSection />;

    case "flashSale": {
      const targetProducts = section.fetchedProducts && section.fetchedProducts.length > 0
        ? section.fetchedProducts
        : products.flashSale;
      return <FlashSaleBlock section={section} products={targetProducts} theme={theme} />;
    }

    case "productCarousel":
    case "trendingProducts":
    case "bestSellerProducts":
    case "featuredProducts":
    case "recentlyAdded": {
      let targetProducts: WooProduct[] = [];
      let defaultTitle = "Featured Collection";

      if (section.fetchedProducts && section.fetchedProducts.length > 0) {
        targetProducts = section.fetchedProducts;
      }

      if (targetProducts.length === 0) {
        if (section.type === "trendingProducts") {
          targetProducts = products.trending;
          defaultTitle = "Trending Now";
        } else if (section.type === "bestSellerProducts") {
          targetProducts = products.bestsellers;
          defaultTitle = "Best Sellers";
        } else if (section.type === "featuredProducts") {
          targetProducts = products.featured;
          defaultTitle = "Featured Products";
        } else if (section.type === "recentlyAdded") {
          targetProducts = products.bestsellers;
          defaultTitle = "New Arrivals";
        } else if (section.type === "productCarousel") {
          const collection = section.data?.collection || "featured";
          if (collection === "trending") targetProducts = products.trending;
          else if (collection === "bestsellers") targetProducts = products.bestsellers;
          else if (collection === "flash") targetProducts = products.flashSale;
          else targetProducts = products.featured;
        }
      }

      if (!section.title) {
        if (section.type === "trendingProducts") {
          defaultTitle = "Trending Now";
        } else if (section.type === "bestSellerProducts") {
          defaultTitle = "Best Sellers";
        } else if (section.type === "featuredProducts") {
          defaultTitle = "Featured Products";
        } else if (section.type === "recentlyAdded") {
          defaultTitle = "New Arrivals";
        } else if (section.type === "productCarousel") {
          const collection = section.data?.collection || "";
          const category = section.data?.category || "";
          if (collection === "trending") defaultTitle = "Trending Now";
          else if (collection === "bestsellers") defaultTitle = "Best Sellers";
          else if (collection === "flash") defaultTitle = "Flash Sale";
          else if (collection === "recentlyAdded" || collection === "new") defaultTitle = "New Arrivals";
          else if (category) defaultTitle = `Explore ${category.charAt(0).toUpperCase() + category.slice(1)}`;
        }
      }

      const rawTitle = section.title || defaultTitle;
      const decoratedTitle = `${motif.prefix ? motif.prefix + " " : ""}${rawTitle}${motif.suffix ? " " + motif.suffix : ""}`;
      const autoplayInterval = (section.data?.scroll_interval_seconds ? Number(section.data.scroll_interval_seconds) * 1000 : 4000) || 4000;

      return (
        <section className={cn("py-8 md:py-10 transition-all duration-300", motif.classNames)}>
          <div className="container">
            <ProductCarousel
              title={decoratedTitle}
              products={targetProducts}
              viewAllUrl={section.viewAllUrl}
              variant={section.variant || "default"}
              autoplayInterval={autoplayInterval}
              limitMobile={section.data?.limitMobile}
            />
          </div>
        </section>
      );
    }

    case "featureIcons":
    case "customerBenefits":
      return <FeatureIconsBlock section={section} theme={theme} />;

    case "trustSection":
    case "brandHighlights":
      return <TrustSectionBlock section={section} theme={theme} />;

    case "testimonials":
      return <TestimonialsBlock section={section} theme={theme} />;

    case "newsletter":
    case "newsletterSignup":
      return <NewsletterBlock data={section.data} theme={theme} />;

    case "blogSection":
    case "blogHighlights":
      return <BlogSectionBlock section={section} theme={theme} />;
    default:
      return null;
  }
}

// ============================================
// SUB-BLOCK COMPONENTS
// ============================================

// 1. HERO BANNER
function HeroBannerBlock({ data, theme }: { data: any; theme?: string }) {
  const slides = data?.slides || [
    {
      id: "fallback_1",
      title: "Premium Home Essentials",
      subtitle: "Curated collections crafted for modern Indian homes",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80",
      cta_text: "Shop Collection",
      cta_link: "/shop",
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slideTheme = slides[current].theme || theme;
  let tagText = "✨ Featured Offer";
  if (slideTheme === "summer") tagText = "☀️ Summer Special";
  else if (slideTheme === "monsoon") tagText = " Monsoon Special";
  else if (slideTheme === "diwali") tagText = "🪔 Diwali Dhamaka";
  else if (slideTheme === "christmas") tagText = "❄️ Christmas Joy";
  else if (slideTheme === "blackfriday") tagText = "⚡ Black Friday Deals";

  const alignment = slides[current].alignment || "left";

  return (
    <section className="relative overflow-hidden w-full h-[500px] md:h-[600px] bg-[hsl(var(--color-surface-2))]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-black/45 z-10" />
          {slides[current].imageMobile ? (
            <>
              <Image
                src={slides[current].image}
                alt={slides[current].title}
                fill
                priority
                sizes="100vw"
                className="object-cover hidden sm:block"
              />
              <Image
                src={slides[current].imageMobile}
                alt={slides[current].title}
                fill
                priority
                sizes="100vw"
                className="object-cover block sm:hidden"
              />
            </>
          ) : (
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className={cn("absolute inset-0 z-20 flex items-center",
            alignment === "center" ? "justify-center text-center" :
            alignment === "right" ? "justify-end text-right" : "justify-start text-left"
          )}>
            <div className="container py-12 md:py-24">
              <div className={cn("max-w-2xl text-white",
                alignment === "center" ? "mx-auto text-center" :
                alignment === "right" ? "ml-auto text-right" : "mr-auto text-left"
              )}>
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider mb-4"
                >
                  {tagText}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-4"
                >
                  {slides[current].title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn("text-white/80 text-sm md:text-lg mb-8 leading-relaxed",
                    alignment === "center" ? "max-w-lg mx-auto" : 
                    alignment === "right" ? "max-w-lg ml-auto" : "max-w-lg mr-auto"
                  )}
                >
                  {slides[current].subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href={slides[current].cta_link || "/shop"}
                    style={{ backgroundColor: "#af040ce0", border: "1px solid #ffffff93" }}
                    className="inline-flex items-center justify-center gap-2 font-display font-extrabold text-white text-base md:text-lg px-8 py-3.5 rounded-xl shadow-xl shadow-black/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {slides[current].cta_text || "Shop Now"}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white backdrop-blur-sm transition-all active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white backdrop-blur-sm transition-all active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === current ? "w-6 bg-[hsl(var(--color-primary))]" : "w-2.5 bg-white/45"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// 2. PROMO BANNER GRID
function PromoBannerBlock({ data, theme }: { data: any; theme?: string }) {
  const banners = data?.banners || [
    {
      id: "promo_1",
      title: "Kitchen Tools",
      subtitle: "Up to 30% Off Home Chef Gear",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      cta_text: "Explore Culinary",
      cta_link: "/category/kitchen",
      className: "md:col-span-2",
    },
    {
      id: "promo_2",
      title: "Organizers",
      subtitle: "Smart Storage Hacks",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
      cta_text: "Browse Organizers",
      cta_link: "/category/storage-and-organization",
      className: "md:col-span-1",
    }
  ];

  const motif = getThemeMotif(theme);
  const isSingle = banners.length === 1;

  return (
    <section className={cn("py-8 md:py-10 bg-[hsl(var(--color-surface))] transition-all duration-300", motif.classNames)}>
      <div className="container">
        <div className={cn("grid gap-6", isSingle ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
          {banners.map((banner: any, idx: number) => (
            <motion.div
              key={banner.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] group",
                isSingle 
                  ? "aspect-[21/9] md:h-[350px] w-full" 
                  : `aspect-[4/3] md:aspect-auto md:h-[280px] ${banner.className || ""}`
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/25 group-hover:from-black/65 group-hover:to-black/35 transition-colors duration-300 z-10" />
              {banner.imageMobile ? (
                <>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes={isSingle ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105 hidden sm:block"
                  />
                  <Image
                    src={banner.imageMobile}
                    alt={banner.title}
                    fill
                    sizes={isSingle ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105 block sm:hidden"
                  />
                </>
              ) : (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes={isSingle ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8 text-white">
                <span className="text-xs font-bold tracking-widest uppercase text-[hsl(var(--color-primary-light))] mb-1.5 block">
                  Limited Offer
                </span>
                <h3 className={cn("font-display font-extrabold mb-1", isSingle ? "text-2xl md:text-3xl" : "text-xl md:text-2xl")}>
                  {banner.title}
                </h3>
                <p className="text-sm text-white/80 mb-4 max-w-sm">
                  {banner.subtitle}
                </p>
                <div>
                  <Link
                    href={banner.cta_link || "/shop"}
                    style={{ backgroundColor: "hsl(var(--color-primary))" }}
                    className={cn(
                      buttonVariants({ size: isSingle ? "md" : "sm" }),
                      "text-white hover:opacity-90 font-bold"
                    )}
                  >
                    {banner.cta_text || "Shop Deals"}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3. CTA BANNER
function CtaBannerBlock({ section, theme }: { section: HomepageSection; theme?: string }) {
  const bgImage = section.data?.bg_image || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80";
  const bgImageMobile = section.data?.bg_image_mobile;
  const motif = getThemeMotif(theme);

  return (
    <section className={cn("relative overflow-hidden py-12 md:py-16 bg-[hsl(var(--color-surface-3))] transition-all duration-300", motif.classNames)}>
      <div className="absolute inset-0 bg-black/55 z-10" />
      {bgImageMobile ? (
        <>
          <Image
            src={bgImage}
            alt={section.title || "Call to Action"}
            fill
            sizes="100vw"
            className="object-cover hidden sm:block"
          />
          <Image
            src={bgImageMobile}
            alt={section.title || "Call to Action"}
            fill
            sizes="100vw"
            className="object-cover block sm:hidden"
          />
        </>
      ) : (
        <Image
          src={bgImage}
          alt={section.title || "Call to Action"}
          fill
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="container relative z-20 text-center text-white max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-4 leading-tight flex items-center justify-center gap-2">
          {motif.prefix && <span>{motif.prefix}</span>}
          {section.title || "Upgrade Your Space Today"}
          {motif.suffix && <span>{motif.suffix}</span>}
        </h2>
        {section.subtitle && (
          <p className="text-sm md:text-base text-white/85 mb-8 leading-relaxed">
            {section.subtitle}
          </p>
        )}
        <Link
          href={section.data?.cta_link || "/shop"}
          style={{ backgroundColor: "hsl(var(--color-primary))" }}
          className={cn(
            buttonVariants({ size: "lg" }),
            "text-white hover:opacity-90 shadow-lg px-8 font-bold"
          )}
        >
          {section.data?.cta_text || "Explore Products"}
        </Link>
      </div>
    </section>
  );
}

function getIconComponent(iconName?: string) {
  const name = iconName?.toLowerCase().trim();
  if (!name) return <TbTruckDelivery className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
  if (name.includes("truck") || name.includes("ship") || name.includes("delivery") || name.includes("free")) {
    return <TbTruckDelivery className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
  }
  if (name.includes("shield") || name.includes("secure") || name.includes("safe") || name.includes("pay")) {
    return <TbShieldCheck className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
  }
  if (name.includes("card") || name.includes("credit") || name.includes("cod") || name.includes("cash")) {
    return <TbCreditCard className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
  }
  if (name.includes("clock") || name.includes("support") || name.includes("time") || name.includes("help")) {
    return <TbClock className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
  }
  if (name.includes("heart") || name.includes("love") || name.includes("care")) {
    return <TbHeart className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
  }
  return <TbTruckDelivery className="h-6 w-6 text-[hsl(var(--color-primary))]" />;
}

// 3. CUSTOM CENTERED GRID BLOCK
function CustomGridBlock({ section, theme }: { section: any; theme?: string }) {
  const motif = getThemeMotif(theme);
  const items = section.data?.items || [];
  
  if (items.length === 0) return null;

  return (
    <section className={cn("py-8 md:py-12 bg-[hsl(var(--color-surface))] border-t transition-all duration-300", motif.classNames)}>
      <div className="container max-w-6xl px-4 mx-auto">
        {/* Centered Headers */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))] flex items-center justify-center gap-2">
            {motif.prefix && <span>{motif.prefix}</span>}
            {section.title || "Featured Highlights"}
            {motif.suffix && <span>{motif.suffix}</span>}
          </h2>
          {section.subtitle && (
            <p className="text-[hsl(var(--color-text-muted))] mt-2 text-sm max-w-lg mx-auto leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Centered Responsive Grid */}
        <div className={cn(
          "grid gap-6 md:gap-8 justify-center items-stretch",
          items.length === 1 && "grid-cols-1 max-w-sm mx-auto",
          items.length === 2 && "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto",
          items.length >= 3 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
        )}>
          {items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col items-center justify-between text-center p-5 bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] rounded-2xl shadow-sm hover:shadow-md hover:border-[hsl(var(--color-accent))] transition-all duration-300 group"
            >
              <Link href={item.url || "/shop"} className="w-full flex flex-col items-center justify-center flex-1">
                {/* Centered Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 shadow-sm border border-[hsl(var(--color-border))] bg-neutral-100 flex items-center justify-center">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"}
                    alt={item.title || "Grid Item"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Centered Title */}
                <h3 className="font-display font-extrabold text-base md:text-lg text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-accent))] transition-colors line-clamp-2 max-w-[240px] leading-tight text-center">
                  {item.title}
                </h3>
              </Link>
              {/* Centered CTA URL Button */}
              <Link href={item.url || "/shop"} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-accent))] group-hover:underline">
                Explore More <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--color-primary))]" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 4. FEATURE ICONS (TRUST BAR)
function FeatureIconsBlock({ section, theme }: { section?: HomepageSection; theme?: string }) {
  let items = [
    { icon: <Truck className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "Free Shipping", desc: "On all orders above ₹499" },
    { icon: <ShieldCheck className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "Secure Payments", desc: "Razorpay secure gateways" },
    { icon: <CreditCard className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "Cash on Delivery", desc: "Pay on arrival options" },
    { icon: <Clock className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "24/7 Support", desc: "Always here for help" },
  ];

  if (section?.data?.benefits && Array.isArray(section.data.benefits) && section.data.benefits.length > 0) {
    items = section.data.benefits.map((b: any) => {
      const parts = b.title.split(":");
      const title = parts[0]?.trim() || "";
      const desc = parts.slice(1).join(":").trim() || "";
      return {
        icon: getIconComponent(b.icon),
        title: title,
        desc: desc,
      };
    });
  }

  const motif = getThemeMotif(theme);

  return (
    <section className={cn("py-6 bg-[hsl(var(--color-surface-2))] border-y border-[hsl(var(--color-border))] transition-all duration-300", motif.classNames)}>
      <div className="container">
        {section?.title && (
          <div className="text-center mb-6">
            <h3 className="text-lg md:text-xl font-display font-extrabold flex items-center justify-center gap-2">
              {motif.prefix && <span>{motif.prefix}</span>}
              {section.title}
              {motif.suffix && <span>{motif.suffix}</span>}
            </h3>
            {section.subtitle && (
              <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">{section.subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center p-4 rounded-2xl bg-white border border-[hsl(var(--color-border))]/60 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div 
                style={{ backgroundColor: "rgba(198, 5, 15, 0.06)", borderColor: "rgba(198, 5, 15, 0.12)" }}
                className="h-12 w-12 rounded-xl border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
              >
                {item.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">{item.title}</h4>
                {item.desc && <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1 font-medium">{item.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 5. TRUST BADGES
function TrustSectionBlock({ section, theme }: { section?: HomepageSection; theme?: string }) {
  const motif = getThemeMotif(theme);
  const items = section?.data?.items || [];

  return (
    <section className={cn("py-8 bg-[hsl(var(--color-surface))] transition-all duration-300", motif.classNames)}>
      <div className="container text-center">
        <h3 className="text-xl md:text-2xl font-display font-extrabold text-[hsl(var(--color-text))] mb-6 flex items-center justify-center gap-2">
          {motif.prefix && <span>{motif.prefix}</span>}
          {section?.title || "Why Buy From TKraft"}
          {motif.suffix && <span>{motif.suffix}</span>}
        </h3>
        {section?.subtitle && (
          <p className="text-xs text-[hsl(var(--color-text-muted))] -mt-4 mb-6">{section.subtitle}</p>
        )}
        
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto text-left mt-8">
            {items.map((item: string, idx: number) => {
              const parts = item.split(":");
              const title = parts[0]?.trim() || "";
              const desc = parts.slice(1).join(":").trim() || "";
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="h-10 w-10 rounded-full bg-[hsl(var(--color-primary-light))]/15 text-[hsl(var(--color-primary))] flex items-center justify-center mb-3 font-bold">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-sm text-[hsl(var(--color-text))] mb-1">{title}</h4>
                  {desc && <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">{desc}</p>}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-65 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="relative h-12 w-28">
                <div className="absolute inset-0 flex items-center justify-center border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-2))] text-[hsl(var(--color-text-muted))] font-display font-black tracking-wide text-xs">
                  BRAND_0{idx}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// 5b. FLASH SALE COUNTDOWN BLOCK
function FlashSaleBlock({ section, products, theme }: { section: HomepageSection; products: WooProduct[]; theme?: string }) {
  const endDateStr = section.data?.end_date;
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!endDateStr) return;
    const targetDate = new Date(endDateStr).getTime();
    if (isNaN(targetDate)) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endDateStr]);

  const motif = getThemeMotif(theme);
  const autoplayInterval = (section.data?.scroll_interval_seconds ? Number(section.data.scroll_interval_seconds) * 1000 : 4000) || 4000;

  const filteredDeals = (products || []).filter(
    (p) => p.on_sale && getDiscountPercent(p.regular_price, p.sale_price) >= 60
  );

  if (filteredDeals.length === 0) return null;

  return (
    <section className={cn("py-8 md:py-10 bg-[hsl(var(--color-surface))] transition-all duration-300 border-b border-[hsl(var(--color-border))]", motif.classNames)}>
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))] flex items-center gap-2">
                {motif.prefix && <span>{motif.prefix}</span>}
                {section.title || "Flash Sale"}
                {motif.suffix && <span>{motif.suffix}</span>}
              </h2>
            </div>
            {section.subtitle && (
              <p className="text-[hsl(var(--color-text-muted))] mt-2 text-sm max-w-lg leading-relaxed">
                {section.subtitle}
              </p>
            )}
          </div>

          {timeLeft && (
            <div className="flex items-center gap-2 self-start md:self-auto bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-2xl">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider mr-2 hidden sm:inline">Ends In:</span>
              <div className="flex gap-1.5 text-center items-center">
                {timeLeft.days > 0 && (
                  <>
                    <div className="bg-red-500 text-white rounded-lg px-2 py-0.5 font-mono font-bold text-sm min-w-[28px]">{timeLeft.days}d</div>
                    <span className="font-bold text-red-500 text-sm">:</span>
                  </>
                )}
                <div className="bg-red-500 text-white rounded-lg px-2 py-0.5 font-mono font-bold text-sm min-w-[28px]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <span className="font-bold text-red-500 text-sm">:</span>
                <div className="bg-red-500 text-white rounded-lg px-2 py-0.5 font-mono font-bold text-sm min-w-[28px]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <span className="font-bold text-red-500 text-sm">:</span>
                <div className="bg-red-500 text-white rounded-lg px-2 py-0.5 font-mono font-bold text-sm min-w-[28px]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>
            </div>
          )}
        </div>

        <ProductCarousel
          title=""
          products={filteredDeals}
          viewAllUrl={section.viewAllUrl}
          variant={section.variant || "default"}
          autoplayInterval={autoplayInterval}
          limitMobile={section.data?.limitMobile}
        />
      </div>
    </section>
  );
}

// 6. TESTIMONIALS
function TestimonialsBlock({ section, theme }: { section: HomepageSection; theme?: string }) {
  const reviews = [
    { name: "Rohan Sharma", loc: "Mumbai", stars: 5, comment: "Superb quality! The airtight kitchen jars are sturdy, leakproof, and they look incredibly elegant on my pantry shelves. Exceeded all expectations." },
    { name: "Priyanka Patel", loc: "Ahmedabad", stars: 5, comment: "Fast delivery to Gujarat. Ordered cleaning items and they are far better quality than standard cheap items from offline local shops." },
    { name: "Vikram Malhotra", loc: "Delhi", stars: 4, comment: "Highly functional storage organizers. Reduced cabinet clutter instantly. Shipping was fast. Recommend the product range." },
  ];

  const motif = getThemeMotif(theme);

  return (
    <section className={cn("py-8 md:py-10 bg-[hsl(var(--color-surface-2))] border-y border-[hsl(var(--color-border))] transition-all duration-300", motif.classNames)}>
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))] flex items-center justify-center gap-2">
            {motif.prefix && <span>{motif.prefix}</span>}
            {section.title || "Loved by Customers"}
            {motif.suffix && <span>{motif.suffix}</span>}
          </h2>
          {section.subtitle && (
            <p className="text-[hsl(var(--color-text-muted))] mt-2 text-sm max-w-lg mx-auto leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] shadow-[var(--shadow-sm)]">
              <div className="flex gap-1 text-[hsl(var(--color-warning))] mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`h-4 w-4 ${s < rev.stars ? "fill-current" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-sm text-[hsl(var(--color-text))] italic mb-4 leading-relaxed">"{rev.comment}"</p>
              <div className="border-t border-[hsl(var(--color-border))] pt-3 flex justify-between items-center text-xs">
                <span className="font-bold text-[hsl(var(--color-text))]">{rev.name}</span>
                <span className="text-[hsl(var(--color-text-muted))]">{rev.loc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Zod schema for newsletter
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  bot_field: z.string().max(0, "Bot detected"), // Honeypot field must remain empty
});

type NewsletterFormInput = z.infer<typeof newsletterSchema>;

// 7. NEWSLETTER
function NewsletterBlock({ data, theme }: { data?: any; theme?: string }) {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showToast = useUIStore((s) => s.showToast);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewsletterFormInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", bot_field: "" }
  });

  const onSubscribeSubmit = async (values: NewsletterFormInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const resData = await res.json();

      if (res.ok) {
        setSubscribed(true);
        reset();
        showToast("Successfully subscribed! Check your inbox for the discount code.", "success");
      } else {
        setError(resData.error || "Failed to subscribe. Please try again.");
        showToast(resData.error || "Failed to subscribe.", "error");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      showToast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const motif = getThemeMotif(theme);

  return (
    <section 
      style={{ backgroundColor: "#171717", color: "#ffffff" }}
      className={cn("py-8 md:py-10 text-white my-2 rounded-xl max-w-5xl mx-auto border border-white/5 transition-all duration-300", motif.classNames)}
    >
      <div className="container max-w-3xl text-center px-6">
        <Mail className="h-10 w-10 text-[hsl(var(--color-primary-light))] mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-display font-extrabold mb-3 flex items-center justify-center gap-2">
          {motif.prefix && <span>{motif.prefix}</span>}
          {data?.title || "Get 15% Off Your First Purchase"}
          {motif.suffix && <span>{motif.suffix}</span>}
        </h2>
        <p className="text-sm text-white/70 mb-8 max-w-md mx-auto leading-relaxed">
          {data?.subtitle || "Subscribe to our newsletter for exclusive offers, styling guides, and fresh launches."}
        </p>
        {subscribed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-white/10 border border-white/10 text-center max-w-md mx-auto"
          >
            <p className="text-sm font-bold">🎉 Welcome to the club!</p>
            <p className="text-xs text-white/60 mt-1">Check your inbox for your 15% discount code.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubscribeSubmit)} className="flex flex-col gap-2 max-w-md mx-auto">
            {/* Honeypot Field */}
            <div className="absolute overflow-hidden -z-10 w-0 h-0 opacity-0 select-none pointer-events-none" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("bot_field")}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex flex-col items-start gap-1">
                <input
                  type="email"
                  placeholder={data?.placeholder || "Your email address"}
                  disabled={loading}
                  {...register("email")}
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-white/45 focus:outline-none focus:border-[hsl(var(--color-primary-light))] transition-all text-white disabled:opacity-50",
                    errors.email && "border-red-400 focus:border-red-400"
                  )}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#af040ce0", border: "1px solid #ffffff93" }}
                className="h-11 text-white hover:opacity-90 font-bold whitespace-nowrap background[hsl(var(--color-primary))]"
              >
                {loading ? "Joining..." : (data?.cta_text || "Subscribe")}
              </Button>
            </div>
            {errors.email && (
              <p className="text-xs text-red-300 text-left font-semibold mt-1">⚠️ {errors.email.message}</p>
            )}
            {error && !errors.email && (
              <p className="text-xs text-red-300 text-left font-semibold mt-1">⚠️ {error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

// 8. BLOG SECTION
function BlogSectionBlock({ section, theme }: { section: HomepageSection; theme?: string }) {
  const posts = (section.fetchedPosts && section.fetchedPosts.length > 0)
    ? section.fetchedPosts
    : [
        {
          title: "5 Kitchen Organization Ideas to Save Space",
          desc: "Maximize cabinet capacity and speed up meal prep with these smart organizers.",
          date: "May 15, 2026",
          author: "Sneha Sen",
          image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
        },
        {
          title: "How to Keep Your Home Dust-Free Naturally",
          desc: "Eco-friendly dusting hacks and essential routines to improve air quality.",
          date: "May 08, 2026",
          author: "Aryan Goel",
          image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80",
        }
      ];

  const motif = getThemeMotif(theme);

  return (
    <section className={cn("py-8 md:py-10 bg-[hsl(var(--color-surface))] transition-all duration-300", motif.classNames)}>
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))] flex items-center gap-2">
              {motif.prefix && <span>{motif.prefix}</span>}
              {section.title || "Home Styling & Guides"}
              {motif.suffix && <span>{motif.suffix}</span>}
            </h2>
            {section.subtitle && (
              <p className="text-[hsl(var(--color-text-muted))] mt-2 text-sm leading-relaxed">
                {section.subtitle}
              </p>
            )}
          </div>
          <Link href="/blog" className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-dark))] mt-2 sm:mt-0 flex items-center gap-1">
            View All Guides <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-[hsl(var(--color-border))]">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-[hsl(var(--color-text-muted))] mb-2">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors mb-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2">
                {post.desc}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
