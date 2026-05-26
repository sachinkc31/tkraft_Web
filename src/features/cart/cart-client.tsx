"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useCurrencyStore, useAuthStore } from "@/store";
import { formatPrice, cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { getPriceMultiplier, COUNTRY_RULES } from "@/lib/geo-config";
import type { WooProduct } from "@/types";
import { ProductCard } from "@/components/ui/product-card";

export function CartClient() {
  const currency = useCurrencyStore((s) => s.currency);
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { countryCode, setCountryCode } = useCurrencyStore();
  const estCountry = countryCode || "IN";

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const geoMultiplier = getPriceMultiplier(estCountry);
  const multipliedTotalPrice = totalPrice * geoMultiplier;

  const rule = COUNTRY_RULES[estCountry as keyof typeof COUNTRY_RULES] || COUNTRY_RULES.IN;
  const shippingCost = multipliedTotalPrice >= rule.freeLimit ? 0 : rule.shipping;
  const taxCost = multipliedTotalPrice * rule.tax;
  const hasFreeShipping = shippingCost === 0;

  const [recommendedProducts, setRecommendedProducts] = useState<WooProduct[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  useEffect(() => {
    async function fetchRecommended() {
      if (items.length === 0) {
        setRecommendedProducts([]);
        return;
      }
      
      const cartProductIds = new Set(items.map((item) => item.product.id));
      
      const relatedIds = new Set<number>();
      items.forEach((item) => {
        item.product.cross_sell_ids?.forEach((id) => relatedIds.add(id));
        item.product.upsell_ids?.forEach((id) => relatedIds.add(id));
      });
      
      // Filter out products already in cart
      const fetchIds = Array.from(relatedIds).filter((id) => !cartProductIds.has(id));
      
      if (fetchIds.length === 0) {
        setRecommendedProducts([]);
        return;
      }
      
      setLoadingRecommended(true);
      try {
        // Fetch up to 4 related products
        const limit = fetchIds.slice(0, 4);
        const res = await fetch(`/api/products?include=${limit.join(',')}`);
        const data = await res.json();
        if (data.data) {
          setRecommendedProducts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch related products", err);
      } finally {
        setLoadingRecommended(false);
      }
    }
    
    fetchRecommended();
  }, [items]);


  if (!mounted) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="h-32 w-32 rounded-full bg-[hsl(210,20%,98%)] flex items-center justify-center mb-6">
          <ShoppingBag className="h-16 w-16 text-[hsl(215,14%,70%)]" />
        </div>
        <h2 className="text-2xl font-display font-bold text-[hsl(222,47%,11%)] mb-3">
          Your cart is empty
        </h2>
        <p className="text-[hsl(215,16%,47%)] mb-8 max-w-sm">
          Looks like you haven&apos;t added anything yet. Start exploring our collection!
        </p>
        <Link 
          href="/shop"
          className={cn(
            buttonVariants({ variant: "primary", size: "lg" }),
            "inline-flex items-center gap-2"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-[hsl(222,47%,11%)]">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </h2>
          <button
            onClick={clearCart}
            className="text-sm text-[hsl(215,16%,47%)] hover:text-[hsl(0,72%,51%)] transition-colors"
          >
            Clear all
          </button>
        </div>

        <AnimatePresence>
          {items.map((item) => {
            const image = item.product.images[0];
            const itemTotal = parseFloat(item.product.price) * item.quantity;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm"
              >
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-[hsl(210,20%,98%)]">
                    {image?.src && (
                      <Image src={image.src} alt={image.alt || item.product.name} fill sizes="96px" className="object-cover" />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-semibold text-[hsl(222,47%,11%)] line-clamp-2 text-sm hover:text-[hsl(var(--color-accent))] transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.product.categories[0] && (
                    <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">{item.product.categories[0].name}</p>
                  )}
                  <p className="font-semibold text-[hsl(var(--color-accent))] mt-2">
                    {formatPrice(item.product.price)}
                    <span className="text-xs text-[hsl(215,16%,47%)] font-normal"> each</span>
                  </p>
                </div>

                {/* Qty + Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id, item.variation_id)}
                    className="text-[hsl(215,14%,70%)] hover:text-[hsl(0,72%,51%)] transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-[hsl(222,47%,11%)]">{formatPrice(itemTotal)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variation_id)}
                        className="h-7 w-7 rounded-lg border border-[hsl(214,13%,90%)] flex items-center justify-center text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variation_id)}
                        className="h-7 w-7 rounded-lg border border-[hsl(214,13%,90%)] flex items-center justify-center text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div className="pt-2">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--color-accent))] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm p-6 sticky top-24">
          <h2 className="font-display font-bold text-lg text-[hsl(222,47%,11%)] mb-5">
            Order Summary
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-[hsl(222,47%,11%)] mb-1.5">
              Estimate Shipping & Tax
            </label>
            <select
              value={estCountry}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[hsl(214,13%,90%)] text-xs bg-white focus:outline-none focus:border-[hsl(var(--color-accent))] cursor-pointer"
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              <option value="other">Other (International)</option>
            </select>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[hsl(215,16%,47%)]">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-medium text-[hsl(222,47%,11%)]">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[hsl(215,16%,47%)]">
              <span>
                Est. Tax ({rule.tax * 100}% {estCountry === "IN" ? "GST" : estCountry === "US" ? "Sales Tax" : estCountry === "GB" || estCountry === "DE" ? "VAT" : "Tax"})
              </span>
              <span className="font-medium text-[hsl(222,47%,11%)]">{formatPrice(taxCost, false)}</span>
            </div>
            <div className="flex justify-between text-[hsl(215,16%,47%)]">
              <span>Est. Shipping</span>
              <span className={`font-medium ${hasFreeShipping ? "text-[hsl(142,71%,45%)] font-semibold" : "text-[hsl(222,47%,11%)]"}`}>
                {hasFreeShipping ? "FREE" : formatPrice(shippingCost, false)}
              </span>
            </div>
          </div>

          {!hasFreeShipping && (
            <div className="mt-4 p-3 rounded-xl bg-[hsl(217,70%,95%)] text-[hsl(var(--color-accent))] text-xs leading-relaxed">
              Add {formatPrice(rule.freeLimit - multipliedTotalPrice, false)} more for <strong>free shipping</strong> to {rule.name}!
            </div>
          )}

          <div className="border-t border-[hsl(214,13%,90%)] my-5" />
          <div className="flex justify-between font-bold text-[hsl(222,47%,11%)]">
            <span className="text-lg">Total</span>
            <span className="text-xl">{formatPrice(multipliedTotalPrice + shippingCost + taxCost, false)}</span>
          </div>

          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push("/checkout");
              } else {
                router.push("/login?redirect=/checkout");
              }
            }}
            className={cn(
              buttonVariants({ variant: "primary", size: "lg" }),
              "block w-full text-center shadow-md shadow-blue-500/20 mt-5 w-full"
            )}
          >
            Proceed to Checkout
          </button>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[hsl(215,16%,47%)]">
            {["Razorpay", "UPI", "COD"].map((method) => (
              <span key={method} className="px-2 py-0.5 bg-[hsl(210,20%,98%)] rounded font-medium">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Recommended Products (Cross-sells & Upsells) */}
      {!loadingRecommended && recommendedProducts.length > 0 && (
        <div className="pt-8 border-t border-[hsl(214,13%,90%)]">
          <h3 className="text-2xl font-display font-bold text-[hsl(222,47%,11%)] mb-6">
            You might also like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
