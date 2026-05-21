"use client";

import { useEffect } from "react";
import { useCartStore, useWishlistStore, useCurrencyStore } from "@/store";

export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useCurrencyStore.persist.rehydrate();
  }, []);

  return null;
}
