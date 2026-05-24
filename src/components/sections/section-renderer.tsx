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
  User 
} from "lucide-react";
import type { HomepageSection, CampaignConfig } from "@/services/cms";
import type { WooProduct, WooCategory } from "@/types";
import { ProductCarousel } from "@/components/carousel/product-carousel";
import { CategoryGrid } from "@/features/home/category-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function getThemeMotif(theme?: string): { prefix?: string; suffix?: string; classNames?: string } {
  if (!theme) return {};
  switch (theme) {
    case "summer":
      return { prefix: "☀️", suffix: "☀️", classNames: "border-amber-200/50 bg-gradient-to-b from-amber-50/10 to-transparent" };
    case "monsoon":
      return { prefix: "🌧️", suffix: "🌧️", classNames: "border-teal-200/50 bg-gradient-to-b from-teal-50/10 to-transparent" };
    case "diwali":
      return { prefix: "🪔", suffix: "🪔", classNames: "border-yellow-600/30 bg-gradient-to-b from-yellow-50/10 to-transparent" };
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

    case "productCarousel":
    case "trendingProducts":
    case "bestSellerProducts":
    case "featuredProducts":
    case "flashSale":
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
        } else if (section.type === "flashSale") {
          targetProducts = products.flashSale;
          defaultTitle = "Flash Sale";
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
        } else if (section.type === "flashSale") {
          defaultTitle = "Flash Sale";
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

  let tagText = "✨ Featured Offer";
  if (theme === "summer") tagText = "☀️ Summer Special";
  else if (theme === "monsoon") tagText = "🌧️ Monsoon Special";
  else if (theme === "diwali") tagText = "🪔 Diwali Dhamaka";
  else if (theme === "christmas") tagText = "❄️ Christmas Joy";

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
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container py-12 md:py-24">
              <div className="max-w-2xl text-white">
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
                  className="text-white/80 text-sm md:text-lg mb-8 max-w-lg leading-relaxed"
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
                    className={cn(
                      buttonVariants({ size: "xl" }),
                      "bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-dark))] shadow-lg font-bold"
                    )}
                  >
                    {slides[current].cta_text || "Shop Now"}
                    <ArrowRight className="h-4 w-4" />
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

  return (
    <section className={cn("py-8 md:py-10 bg-[hsl(var(--color-surface))] transition-all duration-300", motif.classNames)}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.map((banner: any, idx: number) => (
            <motion.div
              key={banner.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-auto md:h-[280px] bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] group ${
                banner.className || ""
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/25 group-hover:from-black/65 group-hover:to-black/35 transition-colors duration-300 z-10" />
              {banner.imageMobile ? (
                <>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 hidden sm:block"
                  />
                  <Image
                    src={banner.imageMobile}
                    alt={banner.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 block sm:hidden"
                  />
                </>
              ) : (
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8 text-white">
                <span className="text-xs font-bold tracking-widest uppercase text-[hsl(var(--color-primary-light))] mb-1.5 block">
                  Limited Offer
                </span>
                <h3 className="text-xl md:text-2xl font-display font-extrabold mb-1">
                  {banner.title}
                </h3>
                <p className="text-sm text-white/80 mb-4 max-w-sm">
                  {banner.subtitle}
                </p>
                <div>
                  <Link
                    href={banner.cta_link || "/shop"}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-dark))] font-bold"
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
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-dark))] shadow-lg px-8 font-bold"
          )}
        >
          {section.data?.cta_text || "Explore Products"}
        </Link>
      </div>
    </section>
  );
}

// 4. FEATURE ICONS (TRUST BAR)
function FeatureIconsBlock({ section, theme }: { section?: HomepageSection; theme?: string }) {
  const items = [
    { icon: <Truck className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "Free Shipping", desc: "On all orders above ₹499" },
    { icon: <ShieldCheck className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "Secure Payments", desc: "Razorpay secure gateways" },
    { icon: <CreditCard className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "Cash on Delivery", desc: "Pay on arrival options" },
    { icon: <Clock className="h-6 w-6 text-[hsl(var(--color-primary))]" />, title: "24/7 Support", desc: "Always here for help" },
  ];

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start p-2">
              <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-surface-3))] flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[hsl(var(--color-text))]">{item.title}</h4>
                <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">{item.desc}</p>
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
  return (
    <section className={cn("py-8 bg-[hsl(var(--color-surface))] transition-all duration-300", motif.classNames)}>
      <div className="container text-center">
        <p className="text-xs uppercase font-extrabold tracking-widest text-[hsl(var(--color-text-muted))] mb-6 flex items-center justify-center gap-2">
          {motif.prefix && <span>{motif.prefix}</span>}
          {section?.title || "Trusted By Families Across India"}
          {motif.suffix && <span>{motif.suffix}</span>}
        </p>
        {section?.subtitle && (
          <p className="text-xs text-[hsl(var(--color-text-muted))] -mt-4 mb-6">{section.subtitle}</p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-65 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="relative h-12 w-28">
              <div className="absolute inset-0 flex items-center justify-center border border-[hsl(var(--color-border))] rounded-lg bg-[hsl(var(--color-surface-2))] text-[hsl(var(--color-text-muted))] font-display font-black tracking-wide text-xs">
                BRAND_0{idx}
              </div>
            </div>
          ))}
        </div>
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

// 7. NEWSLETTER
function NewsletterBlock({ data, theme }: { data?: any; theme?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  const motif = getThemeMotif(theme);

  return (
    <section className={cn("py-8 md:py-10 bg-[hsl(var(--color-accent))] text-white my-2 rounded-xl max-w-5xl mx-auto border border-white/5 transition-all duration-300", motif.classNames)}>
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
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={data?.placeholder || "Your email address"}
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-11 px-4 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-white/45 focus:outline-none focus:border-[hsl(var(--color-primary-light))] transition-all text-white disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={loading || !email}
              className="h-11 bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-dark))] font-bold whitespace-nowrap"
            >
              {loading ? "Joining..." : (data?.cta_text || "Subscribe")}
            </Button>
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
