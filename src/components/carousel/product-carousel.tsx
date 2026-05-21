// ============================================
// Tkraft - Reusable Product Carousel Component
// ============================================

"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import type { WooProduct } from "@/types";

interface ProductCarouselProps {
  title: string;
  products: WooProduct[];
  viewAllUrl?: string;
  variant?: "default" | "minimal" | "compact" | "featured" | "boxed" | "accent";
  className?: string;
}

export function ProductCarousel({
  title,
  products,
  viewAllUrl,
  variant = "default",
  className,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll positions to show/hide arrow buttons
  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Run initial check
      checkScroll();
      
      // Also check on window resize
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div
      className={cn(
        "relative py-[var(--spacing-lg)]",
        variant === "boxed" && "bg-[hsl(var(--color-surface2))] p-[var(--spacing-lg)] rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))]",
        variant === "accent" && "bg-[hsl(var(--color-primary))] text-[hsl(var(--color-surface))] p-[var(--spacing-lg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-[var(--spacing-sm)] md:px-0">
        <div>
          <h2
            className={cn(
              "text-xl md:text-2xl font-display font-extrabold tracking-tight",
              variant === "accent" ? "text-[hsl(var(--color-surface))]" : "text-[hsl(var(--color-text))]"
            )}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-all hover:translate-x-0.5",
                variant === "accent"
                  ? "text-[hsl(var(--color-surface))] hover:text-white"
                  : "text-[hsl(var(--color-primary))] hover:text-[hsl(var(--color-primary-dark))]"
              )}
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1.5 ml-4">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 border",
                variant === "accent"
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  : "bg-[hsl(var(--color-surface))] hover:bg-[hsl(var(--color-surface3))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))]"
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 border",
                variant === "accent"
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  : "bg-[hsl(var(--color-surface))] hover:bg-[hsl(var(--color-surface3))] border-[hsl(var(--color-border))] text-[hsl(var(--color-text))]"
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4 px-[var(--spacing-sm)] md:px-0"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={cn(
              "flex-shrink-0 snap-start",
              // Responsive widths based on variant
              variant === "compact"
                ? "w-[160px] sm:w-[200px]"
                : "w-[240px] sm:w-[280px]"
            )}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
