import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "@/types";

interface AuthState {
  user: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setSession: (token: string, user: Customer) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setSession: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
        }),

      clearSession: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "tkraft-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
