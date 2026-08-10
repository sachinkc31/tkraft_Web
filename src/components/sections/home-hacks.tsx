"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Lightbulb, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeHacksSection() {
  const hacks = [
    {
      title: "5 Kitchen Organization Hacks Every Small Apartment Needs",
      category: "Kitchen Tricks",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      excerpt: "Maximize cabinet space without drilling holes in rented walls using adhesive acrylic floating shelves.",
      blogSlug: "how-to-organize-small-kitchen-without-drilling",
    },
    {
      title: "How to Keep Bathroom Tile Grout Mold-Free All Year",
      category: "Cleaning Tips",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      excerpt: "Prevent moisture buildup behind wall racks using elevated slotted drainage caddies.",
      blogSlug: "tile-cleaning-mistakes-weak-adhesive-hooks",
    },
    {
      title: "The Ultimate Closet Drawer Organization Guide",
      category: "Wardrobe Ideas",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
      excerpt: "Categorize clothing, underwear, and accessories using transparent PET honeycomb grid dividers.",
      blogSlug: "storage-solutions-rental-apartments-guide",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-[hsl(var(--color-surface))] border-b border-[hsl(var(--color-border))]">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))] block mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" /> Practical Ideas & Inspiration
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))]">
              Home Hacks & Guides
            </h2>
            <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] mt-1 max-w-xl">
              Expert advice, maintenance tips, and room organization guides curated by our home utility specialists.
            </p>
          </div>
          <Link
            href="/sitemap-page"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary))] hover:underline self-start md:self-auto"
          >
            Browse All Guides <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Home Hacks Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hacks.map((hack, idx) => (
            <Link
              key={idx}
              href={`/sitemap-page`}
              className="group rounded-3xl bg-[hsl(var(--color-surface-2))] border border-[hsl(var(--color-border))] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between card-lift"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <Image
                    src={hack.image}
                    alt={hack.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className="badge bg-[hsl(var(--color-primary))] text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                      {hack.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--color-text-muted))] font-medium">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{hack.readTime}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors line-clamp-2">
                    {hack.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed line-clamp-2">
                    {hack.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between text-xs font-bold text-[hsl(var(--color-primary))] group-hover:underline">
                <span>Read Full Article</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
