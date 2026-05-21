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
      <Link
        href={`/products/${product.slug}`}
        className="block rounded-[var(--radius-lg)] overflow-hidden bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-xl)] transition-all duration-300 card-lift"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--color-surface2))]">
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
            <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--color-surface3))]">
              <ShoppingCart className="h-12 w-12 text-[hsl(var(--color-textSubtle))]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-[var(--spacing-sm)] left-[var(--spacing-sm)] flex flex-col gap-[var(--spacing-xs)]">
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
              <span className="badge bg-[hsl(var(--color-textMuted))] text-[hsl(var(--color-surface))] text-[10px] px-2 py-0.5 rounded-[var(--radius-sm)]">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Action Buttons (wishlist / quick view) */}
          <div className="absolute top-[var(--spacing-sm)] right-[var(--spacing-sm)] flex flex-col gap-[var(--spacing-xs)] opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300 z-10">
            <button
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              onClick={handleToggleWishlist}
              className={cn(
                "h-9 w-9 rounded-full bg-[hsl(var(--color-surface))] shadow-[var(--shadow-md)] flex items-center justify-center transition-colors border border-[hsl(var(--color-border))]",
                mounted && isInWishlist
                  ? "text-[hsl(var(--color-error))] bg-red-50 dark:bg-red-950/20"
                  : "text-[hsl(var(--color-textMuted))] hover:text-[hsl(var(--color-error))] hover:bg-red-50 dark:hover:bg-red-950/20"
              )}
            >
              <Heart className={cn("h-4 w-4", mounted && isInWishlist && "fill-current")} />
            </button>
            <Link
              href={`/products/${product.slug}`}
              title="Quick View"
              className="h-9 w-9 rounded-full bg-[hsl(var(--color-surface))] shadow-[var(--shadow-md)] flex items-center justify-center text-[hsl(var(--color-textMuted))] hover:text-[hsl(var(--color-primary))] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors border border-[hsl(var(--color-border))]"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>

          {/* Add to Cart — bottom slide-up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-dark))] text-[hsl(var(--color-surface))] py-[var(--spacing-md)] font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:bg-[hsl(var(--color-textSubtle))] disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-[var(--spacing-md)]">
          {product.categories[0] && (
            <p className="text-[10px] font-bold text-[hsl(var(--color-primary))] uppercase tracking-wider mb-1">
              {product.categories[0].name}
            </p>
          )}

          <h3 className="font-semibold text-[hsl(var(--color-text))] text-sm leading-snug line-clamp-2 mb-1.5 h-10 group-hover:text-[hsl(var(--color-primary))] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
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
            <span className="text-[10px] text-[hsl(var(--color-textMuted))]">
              ({product.rating_count || 0})
            </span>
          </div>

          {/* Price — formats seamlessly light mode vs dark mode vs dynamic client locale settings */}
          <div className="flex items-center gap-2 flex-wrap min-h-6">
            <span className="font-bold text-[hsl(var(--color-text))] text-base">
              {formatPrice(product.price)}
            </span>
            {product.on_sale && product.regular_price && (
              <span className="text-xs text-[hsl(var(--color-textSubtle))] line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ---- Skeleton Loader ----
export function ProductCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden bg-[hsl(var(--color-surface))] border border-[hsl(var(--color-border))] shadow-[var(--shadow-sm)]">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-[var(--spacing-md)] space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
    </div>
  );
}
