import { ProductCard } from "@/components/ui/product-card";
import type { WooProduct } from "@/types";

export function TrendingSection({ products }: { products: WooProduct[] }) {
  if (!products.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
