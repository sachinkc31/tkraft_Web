import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WooProduct } from "@/types";

interface RecentlyViewedState {
  items: WooProduct[];
  addProduct: (product: WooProduct) => void;
  clearHistory: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct: (product) => {
        const items = get().items;
        const filtered = items.filter((item) => item.id !== product.id);
        set({ items: [product, ...filtered].slice(0, 6) }); // Capped at 6 items for clean widget display
      },
      clearHistory: () => set({ items: [] }),
    }),
    {
      name: "tkraft-recently-viewed",
      skipHydration: true,
    }
  )
);
