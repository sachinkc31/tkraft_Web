// ============================================
// Tkraft - Reusable Product Card Component
// ============================================

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { useCartStore, useUIStore, useWishlistStore, useCurrencyStore } from "@/store";
import type { WooProduct } from "@/types";

const COLOR_MAP: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#FBBF24",
  orange: "#F97316",
  purple: "#8B5CF6",
  pink: "#EC4899",
  white: "#FFFFFF",
  black: "#111827",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  brown: "#78350F",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  teal: "#14B8A6",
  lavender: "#E6E6FA",
  maroon: "#800000",
  navy: "#1E3A8A",
  peach: "#FFDAB9",
  mint: "#A7F3D0",
  rose: "#FDA4AF",
};

export interface ProductCardProps {
  product: WooProduct;
  className?: string;
  priority?: boolean;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const currency = useCurrencyStore((s) => s.currency);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUIStore((s) => s.showToast);
  
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.hasItem(product.id));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const image = product.images[0];
  const discount = getDiscountPercent(product.regular_price, product.sale_price);
  const isOutOfStock = product.stock_status === "outofstock";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product);
    openCart();
    showToast(`${product.name} added to cart!`);
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    showToast(
      isInWishlist
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist!`,
      "success"
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("group relative w-full", className)}
    >
      <div
        className="relative block rounded-[var(--radius-lg)] overflow-hidden bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-xl)] transition-all duration-300 card-lift"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--color-surface-2))]">
          {image?.src ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--color-surface-3))]">
              <ShoppingCart className="h-12 w-12 text-[hsl(var(--color-text-subtle))]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
            {discount > 0 && (
              <span className="badge bg-[hsl(var(--color-error))] text-[hsl(var(--color-surface))] text-[10px] px-2 py-0.5 rounded-[var(--radius-sm)]">
                -{discount}%
              </span>
            )}
            {product.featured && (
              <span className="badge bg-[hsl(var(--color-warning))] text-[hsl(var(--color-surface))] text-[10px] px-2 py-0.5 rounded-[var(--radius-sm)] font-bold">
                ⭐ Featured
              </span>
            )}
            {isOutOfStock && (
              <span className="badge bg-[hsl(var(--color-text-muted))] text-[hsl(var(--color-surface))] text-[10px] px-2 py-0.5 rounded-[var(--radius-sm)]">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Action Buttons (wishlist / quick view) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300 z-20">
            <button
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              onClick={handleToggleWishlist}
              className={cn(
                "h-9 w-9 rounded-full bg-[hsl(var(--color-surface))] shadow-[var(--shadow-md)] flex items-center justify-center transition-colors border border-[hsl(var(--color-border))]",
                mounted && isInWishlist
                  ? "text-[hsl(var(--color-error))] bg-red-50"
                  : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-error))] hover:bg-red-50"
              )}
            >
              <Heart className={cn("h-4 w-4", mounted && isInWishlist && "fill-current")} />
            </button>
            <Link
              href={`/products/${product.slug}`}
              title="Quick View"
              className="h-9 w-9 rounded-full bg-[hsl(var(--color-surface))] shadow-[var(--shadow-md)] flex items-center justify-center text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-primary))] hover:bg-blue-50 transition-colors border border-[hsl(var(--color-border))]"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>

          {/* Add to Cart — bottom slide-up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] text-white py-3 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:bg-[hsl(var(--color-text-subtle))] disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {product.categories[0] && (
            <p className="text-[10px] font-bold text-[hsl(var(--color-primary))] uppercase tracking-wider mb-1 relative z-20">
              {product.categories[0].name}
            </p>
          )}

          <h3 className="font-semibold text-[hsl(var(--color-text))] text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-[hsl(var(--color-primary))] transition-colors">
            <Link href={`/products/${product.slug}`} className="focus:outline-none">
              {/* Stretched Link to make the whole card clickable */}
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {product.name}
            </Link>
          </h3>

          {/* Color Swatches */}
          {(() => {
            const colorAttr = product.attributes?.find(
              (attr) => attr.name.toLowerCase() === "color" || attr.name.toLowerCase() === "colour"
            );
            if (!colorAttr || !colorAttr.options || colorAttr.options.length === 0) return null;
            return (
              <div className="flex items-center gap-1.5 mb-2 relative z-20">
                {colorAttr.options.slice(0, 5).map((colorOption) => {
                  const colorKey = colorOption.toLowerCase().trim();
                  const colorHex = COLOR_MAP[colorKey] || colorKey;
                  return (
                    <span
                      key={colorOption}
                      className="w-3.5 h-3.5 rounded-full border border-[hsl(var(--color-border))] shadow-sm block"
                      style={{ backgroundColor: colorHex }}
                      title={colorOption}
                    />
                  );
                })}
                {colorAttr.options.length > 5 && (
                  <span className="text-[10px] text-[hsl(var(--color-text-muted))] font-medium">
                    +{colorAttr.options.length - 5}
                  </span>
                )}
              </div>
            );
          })()}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2 relative z-20">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= Math.round(parseFloat(product.average_rating || "0"))
                      ? "fill-[hsl(var(--color-warning))] text-[hsl(var(--color-warning))]"
                      : "text-[hsl(var(--color-border))]"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
              ({product.rating_count || 0})
            </span>
          </div>

          {/* Price — formats seamlessly light mode vs dark mode vs dynamic client locale settings */}
          <div className="flex items-center gap-2 flex-wrap min-h-6 relative z-20">
            <span className="font-bold text-[hsl(var(--color-text))] text-base">
              {formatPrice(product.price)}
            </span>
            {product.on_sale && product.regular_price && (
              <span className="text-xs text-[hsl(var(--color-text-subtle))] line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Skeleton Loader ----
export function ProductCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] shadow-[var(--shadow-sm)]">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
    </div>
  );
}
