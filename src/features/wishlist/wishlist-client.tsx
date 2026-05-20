"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useWishlistStore, useCartStore, useUIStore, useCurrencyStore } from "@/store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function WishlistClient() {
  const currency = useCurrencyStore((s) => s.currency);
  const [mounted, setMounted] = useState(false);
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addItemToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleAddToCart(product: any) {
    if (product.stock_status === "outofstock") {
      showToast("Sorry, this item is out of stock.", "error");
      return;
    }
    addItemToCart(product);
    openCart();
    showToast(`${product.name} added to cart!`, "success");
  }

  function handleRemove(productId: number, productName: string) {
    removeItem(productId);
    showToast(`${productName} removed from wishlist.`, "info");
  }

  if (!mounted) {
    return (
      <div className="section min-h-[50vh] flex items-center justify-center bg-[hsl(210,20%,98%)]">
        <div className="text-center">
          <Heart className="h-8 w-8 text-[hsl(215,14%,70%)] animate-pulse mx-auto mb-3" />
          <p className="text-sm text-[hsl(215,16%,47%)]">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section min-h-[calc(100vh-200px)] bg-[hsl(210,20%,98%)] py-12">
      <div className="container max-w-5xl">
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[hsl(222,47%,11%)] flex items-center justify-center md:justify-start gap-3">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-sm text-[hsl(215,16%,47%)] mt-2">
            Keep track of items you love. Add them to your cart directly or manage your list.
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty-wishlist"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-[hsl(214,13%,90%)] shadow-sm p-12 text-center max-w-md mx-auto"
            >
              <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)] mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-[hsl(215,16%,47%)] mb-8">
                Explore our catalog and click the heart icon on products to save them here.
              </p>
              <Link href="/shop" passHref legacyBehavior>
                <Button variant="primary" size="lg" className="w-full justify-center gap-2">
                  Continue Shopping <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="wishlist-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {items.map((product) => {
                const isOutOfStock = product.stock_status === "outofstock";
                const image = product.images?.[0]?.src;
                
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm p-4 flex gap-4 hover:border-[hsl(217,70%,60%)] transition-colors relative"
                  >
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} className="h-24 w-24 rounded-xl bg-[hsl(210,16%,96%)] overflow-hidden border border-[hsl(214,13%,90%)] flex-shrink-0 flex items-center justify-center">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </Link>

                    {/* Content Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {product.categories?.[0] && (
                          <span className="text-[10px] font-bold text-[hsl(217,70%,38%)] uppercase tracking-wider block mb-1">
                            {product.categories[0].name}
                          </span>
                        )}
                        <Link href={`/products/${product.slug}`} className="font-semibold text-sm text-[hsl(222,47%,11%)] hover:text-[hsl(217,70%,38%)] transition-colors line-clamp-1">
                          {product.name}
                        </Link>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-sm text-[hsl(222,47%,11%)]">
                            {formatPrice(parseFloat(product.price))}
                          </span>
                          {product.on_sale && product.regular_price && (
                            <span className="text-xs text-[hsl(215,14%,70%)] line-through">
                              {formatPrice(parseFloat(product.regular_price))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons row */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 text-xs font-semibold py-2 justify-center gap-1.5"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </Button>

                        <button
                          onClick={() => handleRemove(product.id, product.name)}
                          className="h-9 w-9 rounded-xl border border-[hsl(214,13%,90%)] flex items-center justify-center text-[hsl(215,16%,47%)] hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
