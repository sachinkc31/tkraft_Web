"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BeforeAfterSection() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const transformations = [
    {
      title: "Kitchen Counter Makeover",
      description: "From chaotic clutter to crystal-clear modular jar organization in under 60 seconds.",
      beforeImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
      beforeTag: "Before: Scattered Bottles & Messy Jars",
      afterTag: "After: Drill-Free Acrylic Shelf System",
      ctaLink: "/category/kitchen",
      productsUsed: "Airtight Glass Jars + SS304 Shelf Rack",
    },
    {
      title: "Drill-Free Bathroom Space",
      description: "No noisy power drills or cracked tiles. Mount heavy-duty shelves using lab-tested acrylic pads.",
      beforeImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
      beforeTag: "Before: Damaged Wall & Wet Counters",
      afterTag: "After: Clean Floating Wall Organizer",
      ctaLink: "/category/bathroom-accessories",
      productsUsed: "Drill-Free Corner Caddy + Soap Holder",
    },
    {
      title: "Wardrobe Drawer Transformation",
      description: "Stop hunting for socks and undergarments. Modular PET dividers keep every item visible.",
      beforeImage: "https://images.unsplash.com/photo-1507136566006-cfc505b114fe?auto=format&fit=crop&w=1200&q=80",
      afterImage: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
      beforeTag: "Before: Messy Overflowing Drawers",
      afterTag: "After: Neatly Divided PET Grid System",
      ctaLink: "/category/storage-and-organization",
      productsUsed: "Clear Grid Dividers & Foldable Bins",
    },
  ];

  const current = transformations[activeTab];

  return (
    <section className="py-12 md:py-16 bg-[hsl(var(--color-surface))] border-b border-[hsl(var(--color-border))]">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))] block mb-1.5">
            Visual Proof & Transformations
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))]">
            See The TKraft Difference
          </h2>
          <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] mt-1">
            Drag the interactive slider below to see how our drill-free organizers instantly eliminate household clutter.
          </p>

          {/* Transformation Switcher Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {transformations.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setSliderPosition(50);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                  activeTab === idx
                    ? "bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]"
                    : "bg-[hsl(var(--color-surface-2))] text-[hsl(var(--color-text-muted))] border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Image Split Container */}
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-2))] shadow-xl relative">
          <div
            className="relative aspect-[16/9] md:aspect-[21/9] select-none overflow-hidden"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
              setSliderPosition(percent);
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const touch = e.touches[0];
              const x = touch.clientX - rect.left;
              const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
              setSliderPosition(percent);
            }}
          >
            {/* After Image (Background Layer) */}
            <Image
              src={current.afterImage}
              alt="After TKraft Transformation"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{current.afterTag}</span>
            </div>

            {/* Before Image (Clipped Foreground Layer) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <Image
                src={current.beforeImage}
                alt="Before TKraft Transformation"
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{current.beforeTag}</span>
              </div>
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-20"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white shadow-xl border-2 border-[hsl(var(--color-primary))] flex items-center justify-center text-[hsl(var(--color-primary))] text-xs font-black">
                ↔
              </div>
            </div>
          </div>

          {/* Transformation Footer Bar */}
          <div className="p-6 bg-[hsl(var(--color-surface))] flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[hsl(var(--color-border))]">
            <div>
              <h4 className="font-extrabold text-sm text-[hsl(var(--color-text))]">
                {current.title}
              </h4>
              <p className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">
                <strong>Products Used:</strong> {current.productsUsed}
              </p>
            </div>
            <Link
              href={current.ctaLink}
              className="px-6 py-2.5 rounded-2xl bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] text-white font-bold text-xs transition-all shadow-md shadow-[hsl(var(--color-primary))]/20 flex items-center gap-2"
            >
              <span>Shop Products Used In This Look</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
