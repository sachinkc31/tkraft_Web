import { ProductCardSkeleton } from "@/components/ui/product-card";

export default function CategoryLoading() {
  return (
    <div className="section min-h-screen bg-[hsl(var(--color-surface))] py-10">
      <div className="container max-w-6xl mx-auto px-4 space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-48 md:h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800 w-full" />
        
        {/* Toolbar Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-9 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
