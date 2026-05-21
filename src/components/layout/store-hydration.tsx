"use client";

import { useEffect } from "react";
import { useCartStore, useWishlistStore, useCurrencyStore, useAuthStore } from "@/store";

export function StoreHydration() {
  useEffect(() => {
    // Set global hydration flag
    (window as any).__CLIENT_HYDRATED__ = true;

    // Trigger rehydration of persisted stores post-hydration
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useCurrencyStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}

