import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopClient } from "@/features/shop/shop-client";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our full range of home essentials, kitchen products, storage solutions and personal care items. Filter by category, price and more.",
};

// ISR for shop page
export const revalidate = 1800;

export default function ShopPage() {
  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="text-sm text-[hsl(215,16%,47%)] mb-3">
            <span>Home</span> <span className="mx-2">/</span>
            <span className="text-[hsl(222,47%,11%)] font-medium">Shop</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(var(--color-primary-light))]">
            All Products
          </h1>
          <p className="text-[hsl(215,16%,47%)] mt-2">
            Discover our complete collection of home & kitchen essentials
          </p>
        </div>

        <Suspense fallback={<div className="h-96 skeleton rounded-2xl" />}>
          <ShopClient />
        </Suspense>
      </div>
    </div>
  );
}
