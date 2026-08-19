"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Sparkles, Check, ArrowRight } from "lucide-react";
import { formatPrice, getDiscountPercent } from "@/lib/utils";
import { useCartStore, useUIStore } from "@/store";

interface BundleSaveSectionProps {
  title?: string;
  subtitle?: string;
  data?: any;
}

export function BundleSaveSection({ title, subtitle, data }: BundleSaveSectionProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUIStore((s) => s.showToast);

  const bundles = [
    {
      id: "bundle_kitchen_starter",
      title: data?.bundle_1_title || "Kitchen Organization Starter Pack",
      subtitle: "Complete drill-free spice & jar storage setup",
      regularPrice: 1999,
      salePrice: 1299,
      saveAmount: 700,
      image: data?.bundle_1_image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      itemsIncluded: [
        "4x Airtight Glass Pantry Jars (1000ml)",
        "1x SS304 Drill-Free Spice Rack",
        "6x Waterproof Spice Label Stickers",
      ],
      badge: "Save 35% Extra",
    },
    {
      id: "bundle_bathroom_caddy",
      title: data?.bundle_2_title || "Drill-Free Bathroom Caddy Set",
      subtitle: "Corner shelf + towel bar + soap dispenser holder",
      regularPrice: 1599,
      salePrice: 999,
      saveAmount: 600,
      image: data?.bundle_2_image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      itemsIncluded: [
        "2x Heavy-Duty Corner Wall Shelves",
        "1x Stainless Steel Towel Bar",
        "2x Spare High-Bond Acrylic Adhesive Pads",
      ],
      badge: "Best Selling Pack",
    },
    {
      id: "bundle_cleaning_express",
      title: data?.bundle_3_title || "Express Home Deep Clean Kit",
      subtitle: "Window squeegee + groove brush + microfiber mop",
      regularPrice: 1299,
      salePrice: 799,
      saveAmount: 500,
      image: data?.bundle_3_image || "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
      itemsIncluded: [
        "1x 360° Rotating Squeegee Mop",
        "1x Window Sill Groove Cleaning Brush",
        "2x Washable Microfiber Refill Pads",
      ],
      badge: "Fast Shipping",
    },
  ];

  function handleAddBundleToCart(bundle: typeof bundles[0]) {
    // Construct synthetic bundle product object for cart addition
    const bundleProduct = {
      id: 999000 + Math.floor(Math.random() * 1000),
      name: bundle.title,
      slug: "bundle-deal",
      permalink: "/shop",
      type: "simple" as const,
      status: "publish" as const,
      featured: true,
      description: bundle.subtitle,
      short_description: bundle.itemsIncluded.join(", "),
      sku: `BUNDLE-${bundle.id}`,
      price: String(bundle.salePrice),
      regular_price: String(bundle.regularPrice),
      sale_price: String(bundle.salePrice),
      on_sale: true,
      stock_status: "instock" as const,
      stock_quantity: 50,
      manage_stock: false,
      categories: [{ id: 100, name: "Bundle Packs", slug: "bundles", parent: 0, description: "", display: "", image: null, count: 10 }],
      tags: [],
      images: [{ id: 1, src: bundle.image, name: bundle.title, alt: bundle.title }],
      attributes: [],
      variations: [],
      average_rating: "5.0",
      rating_count: 42,
      related_ids: [],
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
      meta_data: [],
    };

    addItem(bundleProduct as any);
    openCart();
    showToast(`${bundle.title} added to cart!`);
  }

  return (
    <section className="py-12 md:py-16 bg-[hsl(var(--color-surface-2))] border-b border-[hsl(var(--color-border))]">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))] block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Multi-Item Value Bundles
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))]">
              {title || "Bundle & Save More"}
            </h2>
            <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] mt-1 max-w-xl">
              {subtitle || "Equip your home with complete starter packs engineered for maximum utility and maximum savings."}
            </p>
          </div>
          <Link
            href="/shop?onSale=true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary))] hover:underline self-start md:self-auto"
          >
            Explore All Bundles <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bundles.map((bundle) => {
            const discount = getDiscountPercent(String(bundle.regularPrice), String(bundle.salePrice));
            return (
              <div
                key={bundle.id}
                className="group rounded-3xl bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between card-lift"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <Image
                      src={bundle.image}
                      alt={bundle.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                      <span className="badge bg-[hsl(var(--color-error))] text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                        -{discount}% OFF
                      </span>
                      <span className="badge bg-[hsl(var(--color-accent))] text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                        {bundle.badge}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
                        {bundle.title}
                      </h3>
                      <p className="text-xs text-[hsl(var(--color-text-muted))] mt-1">
                        {bundle.subtitle}
                      </p>
                    </div>

                    {/* What's Included Bullet Points */}
                    <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--color-border))]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] block mb-1">
                        Included In This Pack:
                      </span>
                      {bundle.itemsIncluded.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[hsl(var(--color-text))]">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--color-border))]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-[hsl(var(--color-text))]">
                          {formatPrice(bundle.salePrice)}
                        </span>
                        <span className="text-xs text-[hsl(var(--color-text-subtle))] line-through">
                          {formatPrice(bundle.regularPrice)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                        Instant Savings: ₹{bundle.saveAmount}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBundleToCart(bundle)}
                    className="w-full bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-[hsl(var(--color-primary))]/20"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add Complete Bundle to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
