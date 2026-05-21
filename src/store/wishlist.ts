import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WooProduct } from "@/types";

interface WishlistState {
  items: WooProduct[];
  addItem: (product: WooProduct) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: WooProduct) => void;
  hasItem: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      toggleItem: (product) => {
        const items = get().items;
        const exists = items.find((item) => item.id === product.id);
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      hasItem: (productId) => {
        return !!get().items.find((item) => item.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "tkraft-wishlist",
      skipHydration: true,
    }
  )
);
