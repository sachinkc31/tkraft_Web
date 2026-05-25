"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartStore, useCurrencyStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const currency = useCurrencyStore((s) => s.currency);
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCartStore();
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[hsl(214,13%,90%)]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[hsl(var(--color-accent))]" />
                <h2 className="font-display font-bold text-lg">
                  Shopping Cart
                </h2>
                {totalItems > 0 && (
                  <span className="h-5 px-2 rounded-full bg-[hsl(27,96%,55%)] text-white text-xs font-bold flex items-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="h-9 w-9 rounded-lg flex items-center justify-center text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center"
                >
                  <div className="h-24 w-24 rounded-full bg-[hsl(210,20%,98%)] flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-[hsl(215,14%,70%)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(222,47%,11%)] mb-1">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-[hsl(215,16%,47%)]">
                      Start shopping to add items here
                    </p>
                  </div>
                  <Button variant="primary" size="md" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => {
                    const image = item.product.images[0];
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 p-3 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)]"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="flex-shrink-0"
                        >
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white">
                            {image?.src ? (
                              <Image
                                src={image.src}
                                alt={image.alt || item.product.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-[hsl(210,16%,96%)]" />
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-semibold text-[hsl(222,47%,11%)] line-clamp-2 hover:text-[hsl(var(--color-accent))] transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm font-bold text-[hsl(var(--color-accent))] mt-1">
                            {formatPrice(item.product.price)}
                          </p>

                          {/* Qty + Remove */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variation_id)}
                                className="h-7 w-7 rounded-lg border border-[hsl(214,13%,90%)] flex items-center justify-center text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variation_id)}
                                className="h-7 w-7 rounded-lg border border-[hsl(214,13%,90%)] flex items-center justify-center text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id, item.variation_id)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-[hsl(215,14%,70%)] hover:text-red-500 hover:bg-red-50 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[hsl(214,13%,90%)] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[hsl(215,16%,47%)] font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-[hsl(222,47%,11%)]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-[hsl(215,16%,47%)]">
                  Shipping calculated at checkout. Free for orders above ₹499.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    onClick={() => { closeCart(); router.push("/checkout"); }}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => { closeCart(); router.push("/cart"); }}
                  >
                    View Cart
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
