"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, LayoutGrid, List, ChevronDown, X, Check, RotateCcw } from "lucide-react";
import { useInfiniteProducts } from "@/hooks/use-products";
import { ProductCard, ProductCardSkeleton } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { SORT_OPTIONS } from "@/lib/constants";
import { formatPrice, cn } from "@/lib/utils";
import type { SortOption, WooCategory, WooProduct, PaginatedResponse } from "@/types";

interface Props {
  category: WooCategory;
  initialProducts: PaginatedResponse<WooProduct>;
}

export function CategoryClient({ category, initialProducts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // States synchronized with URL params
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "default"
  );
  
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("max_price") || "");
  const [inStock, setInStock] = useState<boolean>(searchParams.get("stock_status") === "instock");

  // Local UI states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Build filters state for React Query key and hook parameters
  const priceMinNum = Number(minPrice) || 0;
  const priceMaxNum = Number(maxPrice) || 99999;
  const priceRangeTuple: [number, number] = [priceMinNum, priceMaxNum];

  const queryFilters = {
    sortBy,
    priceRange: priceRangeTuple,
    inStock: inStock || undefined,
  };

  // Convert initialProducts into infinite query format to seed initialData
  const initialDataSeeding = {
    pages: [initialProducts],
    pageParams: [1],
  };

  // Check if we are using default filters (used to conditionally bypass initialData)
  const isDefaultFilters = sortBy === "default" && !minPrice && !maxPrice && !inStock;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteProducts(
    queryFilters,
    String(category.id),
    isDefaultFilters ? initialDataSeeding : undefined
  );

  const allProducts = data?.pages.flatMap((p) => p.data) ?? [];
  const totalProducts = data?.pages[0]?.total ?? 0;

  // Infinite scroll observer trigger
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

  // Synchronize URLSearchParams on state adjustments (SEO Friendly URL structure)
  const syncParams = useCallback(
    (newSort: SortOption, newMin: string, newMax: string, newStock: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (newSort !== "default") params.set("sort", newSort);
      else params.delete("sort");

      if (newMin) params.set("min_price", newMin);
      else params.delete("min_price");

      if (newMax) params.set("max_price", newMax);
      else params.delete("max_price");

      if (newStock) params.set("stock_status", "instock");
      else params.delete("stock_status");

      router.push(`/category/${category.slug}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, category.slug]
  );

  // Trigger refetches when filters state updates
  useEffect(() => {
    refetch();
  }, [sortBy, minPrice, maxPrice, inStock, refetch]);

  const handleSortChange = (val: SortOption) => {
    setSortBy(val);
    syncParams(val, minPrice, maxPrice, inStock);
  };

  const handleMinPriceChange = (val: string) => {
    setMinPrice(val);
    syncParams(sortBy, val, maxPrice, inStock);
  };

  const handleMaxPriceChange = (val: string) => {
    setMaxPrice(val);
    syncParams(sortBy, minPrice, val, inStock);
  };

  const handleStockChange = (val: boolean) => {
    setInStock(val);
    syncParams(sortBy, minPrice, maxPrice, val);
  };

  const handleClearFilters = () => {
    setSortBy("default");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    router.push(`/category/${category.slug}`, { scroll: false });
  };

  // Quick select price ranges
  const priceTiers = [
    { label: "Under ₹500", min: "", max: "500" },
    { label: "₹500 - ₹1,000", min: "500", max: "1000" },
    { label: "₹1,000 - ₹2,000", min: "1000", max: "2000" },
    { label: "Above ₹2,000", min: "2000", max: "" },
  ];

  // Helper filters content layout (shared between desktop sidebar and mobile drawer)
  const renderFiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[hsl(222,47%,11%)] uppercase tracking-wider">
          Price Range (₹)
        </h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-[hsl(214,13%,90%)] text-xs focus:border-[hsl(var(--color-accent))] focus:outline-none"
          />
          <span className="text-[hsl(215,14%,70%)]">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-[hsl(214,13%,90%)] text-xs focus:border-[hsl(var(--color-accent))] focus:outline-none"
          />
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {priceTiers.map((tier) => {
            const isActive = minPrice === tier.min && maxPrice === tier.max;
            return (
              <button
                key={tier.label}
                type="button"
                onClick={() => {
                  setMinPrice(tier.min);
                  setMaxPrice(tier.max);
                  syncParams(sortBy, tier.min, tier.max, inStock);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all",
                  isActive
                    ? "bg-[hsl(var(--color-accent))] border-[hsl(var(--color-accent))] text-white"
                    : "border-[hsl(214,13%,90%)] text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)]"
                )}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Status Filter */}
      <div className="space-y-3 pt-4 border-t border-[hsl(214,13%,95%)]">
        <h4 className="text-xs font-bold text-[hsl(222,47%,11%)] uppercase tracking-wider">
          Availability
        </h4>
        <label className="flex items-center gap-2.5 text-xs font-semibold text-[hsl(222,47%,11%)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => handleStockChange(e.target.checked)}
            className="rounded text-[hsl(var(--color-accent))] focus:ring-[hsl(var(--color-accent))] h-4 w-4 cursor-pointer"
          />
          In Stock Only
        </label>
      </div>

      {/* Reset button */}
      {(minPrice || maxPrice || inStock || sortBy !== "default") && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors pt-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="section">
      <div className="container">
        {/* ---- COLLECTION BANNER ---- */}
        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm h-48 md:h-64 flex items-center bg-gradient-to-r from-slate-900 to-indigo-950 border border-[hsl(214,13%,85%)]">
          {category.image?.src && (
            <div className="absolute inset-0">
              <Image
                src={category.image.src}
                alt={category.name}
                fill
                className="object-cover object-center opacity-40"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </div>
          )}
          
          <div className="relative z-10 px-6 md:px-10 py-6 max-w-2xl text-left">
            {/* Breadcrumb inside banner */}
            <nav className="flex items-center gap-2 text-xs text-white/80 mb-3 font-semibold">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <span className="opacity-60">/</span>
              <a href="/shop" className="hover:text-white transition-colors">Shop</a>
              <span className="opacity-60">/</span>
              <span className="text-white" dangerouslySetInnerHTML={{ __html: category.name }} />
            </nav>

            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white leading-tight uppercase tracking-wide">
              <span dangerouslySetInnerHTML={{ __html: category.name }} />
            </h1>
            
            {category.description && (
              <p 
                className="text-white/90 text-xs md:text-sm leading-relaxed mt-2 max-w-xl line-clamp-2 md:line-clamp-none font-medium"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            )}
          </div>
        </div>

        {/* ---- TOOLBAR ---- */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6 pb-4 border-b border-[hsl(214,13%,90%)] relative z-20">
          <p className="text-xs md:text-sm text-[hsl(215,16%,47%)] font-semibold">
            {isLoading ? (
              <span className="skeleton h-4 w-32 inline-block rounded" />
            ) : (
              <>
                Showing <strong className="text-[hsl(222,47%,11%)]">{allProducts.length}</strong> of{" "}
                <strong className="text-[hsl(222,47%,11%)]">{totalProducts}</strong> products
              </>
            )}
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Filters Trigger Button (Mobile only) */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden text-xs font-bold"
            >
              Filters
            </Button>

            <div className="flex items-center gap-2">
              {/* Sort selection */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none h-9 pl-3 pr-8 rounded-xl border border-[hsl(214,13%,90%)] text-xs font-bold text-[hsl(222,47%,11%)] bg-white focus:border-[hsl(var(--color-accent))] focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(215,16%,47%)] pointer-events-none" />
              </div>

              {/* View toggle modes */}
              <div className="hidden md:flex items-center border border-[hsl(214,13%,90%)] rounded-xl overflow-hidden">
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
        </div>

        {/* ---- MAIN CONTENT LAYOUT ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 1. Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 border border-[hsl(214,13%,90%)] rounded-2xl p-5 bg-white h-fit sticky top-24 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(214,13%,95%)] mb-4">
              <h3 className="text-sm font-extrabold text-[hsl(222,47%,11%)] uppercase tracking-wider">
                Filters
              </h3>
            </div>
            {renderFiltersContent()}
          </aside>

          {/* 2. Products Grid */}
          <div className="lg:col-span-3">
            {isError ? (
              <div className="text-center py-16">
                <p className="text-[hsl(215,16%,47%)] mb-4 font-medium">Failed to load category products.</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : isLoading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6"
                    : "grid grid-cols-1 gap-4"
                }
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[hsl(214,13%,90%)] rounded-2xl p-6">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-lg font-bold text-[hsl(var(--color-primary-light))] mb-2">No matching products found</h3>
                <p className="text-xs text-[hsl(215,16%,47%)] font-semibold mb-4">Try relaxing your price filters or availability options.</p>
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  layout
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6"
                      : "grid grid-cols-1 gap-4"
                  }
                >
                  {allProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} priority={i < 6} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Scroll Observer Sentinel */}
            <div ref={sentinelRef} className="h-2" />

            {/* Infinite loading spinner */}
            {isFetchingNextPage && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(215,16%,47%)]">
                  <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--color-accent))] border-t-transparent animate-spin" />
                  Loading more products…
                </div>
              </div>
            )}

            {/* End of products check */}
            {!hasNextPage && allProducts.length > 0 && !isLoading && (
              <p className="text-center text-xs font-bold text-[hsl(215,16%,47%)] mt-10">
                You&apos;ve viewed all {totalProducts} products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ---- MOBILE FILTERS OVERLAY DRAWER ---- */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-45"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[280px] bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[hsl(214,13%,95%)] mb-5">
                  <h3 className="text-sm font-extrabold text-[hsl(222,47%,11%)] uppercase tracking-wider">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="h-8 w-8 rounded-full hover:bg-[hsl(210,20%,98%)] flex items-center justify-center text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] transition-colors focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderFiltersContent()}
              </div>

              <div className="pt-6">
                <Button
                  variant="primary"
                  className="w-full justify-center text-xs font-bold"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
