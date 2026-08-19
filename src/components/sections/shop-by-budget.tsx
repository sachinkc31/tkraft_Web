"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Tag, Layers, Zap, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopByBudgetSectionProps {
  title?: string;
  subtitle?: string;
  data?: any;
}

export function ShopByBudgetSection({ title, subtitle, data }: ShopByBudgetSectionProps) {
  const budgetTiers = [
    {
      title: data?.budget_199_title || "Under ₹199",
      subtitle: "Pocket-Friendly Fixes",
      description: "Drill-free hooks, cable clips & essential home accessories",
      itemCount: "45+ Products",
      badge: "Best Value",
      href: "/shop?maxPrice=199",
      image: data?.budget_199_image,
      bgColor: "from-orange-500/10 via-amber-500/5 to-transparent",
      borderColor: "hover:border-orange-500/40",
      icon: Tag,
    },
    {
      title: data?.budget_299_title || "Under ₹299",
      subtitle: "Smart Storage Organizers",
      description: "Transparent drawer dividers & daily utility holders",
      itemCount: "60+ Products",
      badge: "Most Popular",
      href: "/shop?maxPrice=299",
      image: data?.budget_299_image,
      bgColor: "from-amber-500/10 via-orange-500/5 to-transparent",
      borderColor: "hover:border-amber-500/40",
      icon: Sparkles,
    },
    {
      title: data?.budget_499_title || "Under ₹499",
      subtitle: "Kitchen & Bath Systems",
      description: "Heavy-duty acrylic shelves & airtight pantry containers",
      itemCount: "85+ Products",
      badge: "Trending Deals",
      href: "/shop?maxPrice=499",
      image: data?.budget_499_image,
      bgColor: "from-blue-500/10 via-indigo-500/5 to-transparent",
      borderColor: "hover:border-blue-500/40",
      icon: Layers,
    },
    {
      title: data?.budget_999_title || "Under ₹999",
      subtitle: "Multi-Tier Storage Units",
      description: "Space-maximizing trolleys, racks & wardrobe organizers",
      itemCount: "40+ Products",
      badge: "Premium Quality",
      href: "/shop?maxPrice=999",
      image: data?.budget_999_image,
      bgColor: "from-purple-500/10 via-pink-500/5 to-transparent",
      borderColor: "hover:border-purple-500/40",
      icon: Zap,
    },
    {
      title: "Combo Bundles",
      subtitle: "Save 25%+ Extra",
      description: "Curated multi-piece starter sets for entire rooms",
      itemCount: "25+ Packs",
      badge: "Max Savings",
      href: "/shop?onSale=true",
      image: data?.budget_combo_image,
      bgColor: "from-emerald-500/10 via-teal-500/5 to-transparent",
      borderColor: "hover:border-emerald-500/40",
      icon: Gift,
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-[hsl(var(--color-surface))] border-b border-[hsl(var(--color-border))]">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))] block mb-1.5">
              High-Value Discovery
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))]">
              {title || "Shop By Budget"}
            </h2>
            <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] mt-1 max-w-xl">
              {subtitle || "Curated everyday home & kitchen utility solutions priced for every household. Premium engineering without the luxury markup."}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary))] hover:underline self-start md:self-auto"
          >
            View All Price Filters <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {budgetTiers.map((tier, idx) => {
            const Icon = tier.icon;
            return (
              <Link
                key={idx}
                href={tier.href}
                className={cn(
                  "group relative p-6 rounded-3xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden card-lift",
                  tier.borderColor
                )}
              >
                {/* Subtle Background Gradient Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                    tier.bgColor
                  )}
                />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]">
                      {tier.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-[hsl(var(--color-text))] tracking-tight group-hover:text-[hsl(var(--color-primary))] transition-colors">
                      {tier.title}
                    </h3>
                    <p className="text-xs font-bold text-[hsl(var(--color-primary))] mt-0.5">
                      {tier.subtitle}
                    </p>
                    <p className="text-[11px] text-[hsl(var(--color-text-muted))] leading-relaxed mt-2 line-clamp-2">
                      {tier.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-4 border-t border-[hsl(var(--color-border))]/60 flex items-center justify-between text-xs font-bold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
                  <span className="text-[11px] text-[hsl(var(--color-text-muted))] font-normal">
                    {tier.itemCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
