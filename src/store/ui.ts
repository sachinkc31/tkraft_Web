// ============================================
// Tkraft - UI Store (Zustand)
// ============================================

import { create } from "zustand";

interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  toggleSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;

  // Toast / Notifications
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (
    message: string,
    type?: "success" | "error" | "info"
  ) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  isSearchOpen: false,
  searchQuery: "",
  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false, searchQuery: "" }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  toast: null,
  showToast: (message, type = "success") => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
  clearToast: () => set({ toast: null }),
}));
