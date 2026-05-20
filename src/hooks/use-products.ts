import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { FilterOptions, SortOption } from "@/types";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

// Query key factory — ensures consistent cache keys
export const queryKeys = {
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: Partial<FilterOptions> & { page?: number }) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (slug: string) => [...queryKeys.products.details(), slug] as const,
    related: (id: number) => [...queryKeys.products.all, "related", id] as const,
    featured: () => [...queryKeys.products.all, "featured"] as const,
    newArrivals: () => [...queryKeys.products.all, "new-arrivals"] as const,
    onSale: () => [...queryKeys.products.all, "on-sale"] as const,
  },
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    top: () => [...queryKeys.categories.all, "top"] as const,
    detail: (slug: string) => [...queryKeys.categories.all, slug] as const,
  },
};

// ---- Products ----

export function useProducts(
  page: number = 1,
  filters?: Partial<FilterOptions>,
  category?: string
) {
  return useQuery({
    queryKey: queryKeys.products.list({ page, ...filters, ...(category ? { categories: [category] } : {}) }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PRODUCTS_PER_PAGE),
        ...(category && { category }),
        ...(filters?.sortBy && filters.sortBy !== "default" && { sort: filters.sortBy }),
      });
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}

export function useInfiniteProducts(
  filters?: Partial<FilterOptions>,
  category?: string
) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list({ ...filters, ...(category ? { categories: [category] } : {}) }),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        per_page: String(PRODUCTS_PER_PAGE),
        ...(category && { category }),
        ...(filters?.sortBy && { sort: filters.sortBy }),
      });
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: async () => {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&per_page=8");
      if (!res.ok) throw new Error("Failed to fetch featured products");
      return res.json();
    },
  });
}

export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.newArrivals(),
    queryFn: async () => {
      const res = await fetch(`/api/products?sort=date&per_page=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch new arrivals");
      return res.json();
    },
  });
}

export function useOnSaleProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.onSale(),
    queryFn: async () => {
      const res = await fetch(`/api/products?on_sale=true&per_page=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch sale products");
      return res.json();
    },
  });
}

// ---- Categories ----

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.top(),
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    staleTime: 1000 * 60 * 30, // 30 min — categories rarely change
  });
}
