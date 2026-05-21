"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { cn, formatPrice, getDiscountPercent } from "@/lib/utils";
import { useCartStore, useUIStore, useWishlistStore, useCurrencyStore } from "@/store";
import type { WooProduct } from "@/types";

interface ProductCardProps {
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
      className={cn("group relative", className)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-product overflow-hidden bg-[hsl(210,20%,98%)]">
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
            <div className="absolute inset-0 flex items-center justify-center bg-[hsl(210,16%,96%)]">
              <ShoppingCart className="h-12 w-12 text-[hsl(215,14%,70%)]" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-[hsl(0,72%,51%)] text-white">
                -{discount}%
              </span>
            )}
            {product.featured && (
              <span className="badge bg-[hsl(27,96%,55%)] text-white">
                ⭐ Featured
              </span>
            )}
            {isOutOfStock && (
              <span className="badge bg-[hsl(215,16%,47%)] text-white">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick Action Buttons — reveal on hover */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
            <button
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              onClick={handleToggleWishlist}
              className={cn(
                "h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center transition-colors",
                isInWishlist
                  ? "text-red-500 bg-red-50"
                  : "text-[hsl(215,16%,47%)] hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
            </button>
            <Link
              href={`/products/${product.slug}`}
              title="Quick View"
              className="h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center text-[hsl(215,16%,47%)] hover:text-[hsl(217,70%,38%)] hover:bg-blue-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>

          {/* Add to Cart — bottom slide-up on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full bg-[hsl(217,70%,38%)] hover:bg-[hsl(217,70%,32%)] text-white py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:bg-[hsl(215,16%,47%)] disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {product.categories[0] && (
            <p className="text-xs font-medium text-[hsl(217,70%,38%)] uppercase tracking-wider mb-1.5">
              {product.categories[0].name}
            </p>
          )}

          <h3 className="font-semibold text-[hsl(222,47%,11%)] text-sm leading-snug line-clamp-2 mb-2">
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
                      ? "fill-[hsl(38,92%,50%)] text-[hsl(38,92%,50%)]"
                      : "text-[hsl(214,13%,82%)]"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-[hsl(215,16%,47%)]">
              ({product.rating_count || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[hsl(222,47%,11%)] text-base">
              {formatPrice(product.price)}
            </span>
            {product.on_sale && product.regular_price && (
              <span className="text-sm text-[hsl(215,14%,70%)] line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ---- Skeleton loader ----
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="skeleton aspect-product" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
    </div>
  );
}
