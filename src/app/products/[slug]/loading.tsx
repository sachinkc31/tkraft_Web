export default function ProductDetailLoading() {
  return (
    <div className="section min-h-screen bg-[hsl(var(--color-surface))] py-10">
      <div className="container max-w-6xl mx-auto px-4 space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <span className="text-neutral-300">/</span>
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <span className="text-neutral-300">/</span>
          <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>

        {/* Product Detail Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-neutral-200 dark:bg-neutral-800 w-full" />
            <div className="flex gap-3">
              <div className="h-20 w-20 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-20 w-20 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-20 w-20 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>

          {/* Right: Info Skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-10 w-44 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            
            <div className="h-14 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />

            <div className="space-y-3 pt-4">
              <div className="h-20 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
              <div className="h-20 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
