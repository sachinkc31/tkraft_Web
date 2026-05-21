// ============================================
// Tkraft - Cart Store (Zustand)
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, WooProduct } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: WooProduct, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: WooProduct, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === product.id
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems };
          }

          return {
            items: [...state.items, { id: product.id, product, quantity }],
          };
        });
      },

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => {
          const price = parseFloat(item.product.price) || 0;
          return sum + price * item.quantity;
        }, 0);
      },

      getItemQuantity: (productId: number) => {
        const item = get().items.find((i) => i.id === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "tkraft-cart",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);
