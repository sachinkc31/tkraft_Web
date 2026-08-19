"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopByProblemSectionProps {
  title?: string;
  subtitle?: string;
  data?: any;
}

export function ShopByProblemSection({ title, subtitle, data }: ShopByProblemSectionProps) {
  const defaultCards = [
    {
      title: "Kitchen Made Easy",
      problem: "Cluttered Countertops & Spilled Spices",
      solution: "Stackable airtight jars & drill-free adhesive spice racks",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      categorySlug: "kitchen",
      badge: "Kitchen Utility",
    },
    {
      title: "Faster Cleaning",
      problem: "Back-Breaking Scrubbing & Wet Floors",
      solution: "360° squeegees & microfiber groove cleaning tools",
      image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80",
      categorySlug: "cleaning-essential",
      badge: "Zero Effort",
    },
    {
      title: "Bathroom Solutions",
      problem: "Damaged Rented Tiles & Wet Toiletries",
      solution: "Rust-proof SS304 drill-free shelves with drainage slots",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      categorySlug: "bathroom-accessories",
      badge: "Rental Friendly",
    },
    {
      title: "Home Organization",
      problem: "Overflowing Wardrobes & Tangled Drawers",
      solution: "Modular PET divider boxes & fabric wardrobe organizers",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
      categorySlug: "storage-and-organization",
      badge: "Space Saver",
    },
  ];

  const problemCards = [
    {
      title: data?.problem_1_title || defaultCards[0].title,
      problem: data?.problem_1_problem || defaultCards[0].problem,
      solution: data?.problem_1_solution || defaultCards[0].solution,
      image: data?.problem_1_image || defaultCards[0].image,
      categorySlug: "kitchen",
      badge: "Kitchen Utility",
    },
    {
      title: data?.problem_2_title || defaultCards[1].title,
      problem: data?.problem_2_problem || defaultCards[1].problem,
      solution: data?.problem_2_solution || defaultCards[1].solution,
      image: data?.problem_2_image || defaultCards[1].image,
      categorySlug: "cleaning-essential",
      badge: "Zero Effort",
    },
    {
      title: data?.problem_3_title || defaultCards[2].title,
      problem: data?.problem_3_problem || defaultCards[2].problem,
      solution: data?.problem_3_solution || defaultCards[2].solution,
      image: data?.problem_3_image || defaultCards[2].image,
      categorySlug: "bathroom-accessories",
      badge: "Rental Friendly",
    },
    {
      title: data?.problem_4_title || defaultCards[3].title,
      problem: data?.problem_4_problem || defaultCards[3].problem,
      solution: data?.problem_4_solution || defaultCards[3].solution,
      image: data?.problem_4_image || defaultCards[3].image,
      categorySlug: "storage-and-organization",
      badge: "Space Saver",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-[hsl(var(--color-surface-2))] border-b border-[hsl(var(--color-border))]">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))] block mb-1.5">
              Targeted Problem Solvers
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-[hsl(var(--color-text))]">
              {title || "Shop By Problem"}
            </h2>
            <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] mt-1 max-w-xl">
              {subtitle || "Solve real household frustrations with thoughtfully engineered organizers that protect your walls and save time every single day."}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary))] hover:underline self-start md:self-auto"
          >
            Explore All Solutions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemCards.map((card, idx) => (
            <div
              key={idx}
              className="group rounded-3xl bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col card-lift"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="badge bg-[hsl(var(--color-accent))] text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-[hsl(var(--color-text))] group-hover:text-[hsl(var(--color-primary))] transition-colors">
                    {card.title}
                  </h3>

                  {/* Problem vs Solution Callout */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-start gap-2 text-red-600 dark:text-red-400 font-medium">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      <span><strong>Problem:</strong> {card.problem}</span>
                    </div>
                    <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span><strong>TKraft Solution:</strong> {card.solution}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/category/${card.categorySlug}`}
                  className="inline-flex items-center justify-between w-full pt-4 border-t border-[hsl(var(--color-border))] text-xs font-bold text-[hsl(var(--color-primary))] group-hover:underline"
                >
                  <span>Solve This Problem</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
