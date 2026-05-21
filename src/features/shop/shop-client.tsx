"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, LayoutGrid, List, ChevronDown } from "lucide-react";
import { useInfiniteProducts } from "@/hooks/use-products";
import { ProductCard, ProductCardSkeleton } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { SORT_OPTIONS } from "@/lib/constants";
import type { SortOption } from "@/types";

export function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "default"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProducts({ sortBy }, category);

  const allProducts = data?.pages.flatMap((p) => p.data) ?? [];
  const totalProducts = data?.pages[0]?.total ?? 0;

  // Intersection observer — auto-fetch next page when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortBy(value);
      const params = new URLSearchParams(searchParams.toString());
      if (value !== "default") params.set("sort", value);
      else params.delete("sort");
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6 pb-4 border-b border-[hsl(214,13%,90%)]">
        {/* Results count */}
        <p className="text-sm text-[hsl(215,16%,47%)]">
          {isLoading ? (
            <span className="skeleton h-4 w-32 inline-block rounded" />
          ) : (
            <>
              Showing <strong className="text-[hsl(222,47%,11%)]">{allProducts.length}</strong> of{" "}
              <strong className="text-[hsl(222,47%,11%)]">{totalProducts}</strong> products
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {/* Filters toggle (mobile) */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            Filters
          </Button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="appearance-none h-9 pl-3 pr-8 rounded-xl border border-[hsl(214,13%,90%)] text-sm font-medium text-[hsl(222,47%,11%)] bg-white focus:border-[hsl(var(--color-accent))] focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(215,16%,47%)] pointer-events-none" />
          </div>

          {/* View Mode */}
          <div className="hidden sm:flex items-center border border-[hsl(214,13%,90%)] rounded-xl overflow-hidden">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`h-9 w-9 flex items-center justify-center transition-colors ${
                  viewMode === mode
                    ? "bg-[hsl(var(--color-accent))] text-white"
                    : "text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)]"
                }`}
                aria-label={`${mode} view`}
              >
                {mode === "grid" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <List className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search indicator */}
      {search && (
        <div className="mb-4 text-sm text-[hsl(215,16%,47%)]">
          Results for: <strong className="text-[hsl(222,47%,11%)]">&ldquo;{search}&rdquo;</strong>
        </div>
      )}

      {/* Product Grid */}
      {isError ? (
        <div className="text-center py-16">
          <p className="text-[hsl(215,16%,47%)] mb-4">Failed to load products.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 gap-4"
          }
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-bold text-[hsl(var(--color-primary-light))] mb-2">No products found</h3>
          <p className="text-[hsl(215,16%,47%)]">Try a different filter or search term.</p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                : "grid grid-cols-1 sm:grid-cols-2 gap-4"
            }
          >
            {allProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 8} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading spinner */}
      {isFetchingNextPage && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-sm text-[hsl(215,16%,47%)]">
            <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--color-accent))] border-t-transparent animate-spin" />
            Loading more products…
          </div>
        </div>
      )}

      {/* End of results */}
      {!hasNextPage && allProducts.length > 0 && !isLoading && (
        <p className="text-center text-sm text-[hsl(215,16%,47%)] mt-10">
          You&apos;ve seen all {totalProducts} products
        </p>
      )}
    </div>
  );
}
