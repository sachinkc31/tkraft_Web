import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP" | "AUD";

interface CurrencyState {
  currency: SupportedCurrency;
  rates: Record<SupportedCurrency, number>;
  countryCode: string;
  detectedCountry: string;
  isLoading: boolean;
  setCurrency: (currency: SupportedCurrency) => void;
  setCountryCode: (code: string) => void;
  fetchRates: () => Promise<void>;
  detectLocation: () => Promise<void>;
}

const DEFAULT_RATES: Record<SupportedCurrency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0096,
  AUD: 0.018,
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "INR",
      rates: DEFAULT_RATES,
      countryCode: "IN",
      detectedCountry: "",
      isLoading: false,
      setCurrency: (currency) => set((state) => {
        let countryCode = state.countryCode;
        if (currency === "INR") countryCode = "IN";
        else if (currency === "USD") countryCode = "US";
        else if (currency === "GBP") countryCode = "GB";
        else if (currency === "EUR") countryCode = "DE";
        else if (currency === "AUD") countryCode = "AU";
        return { currency, countryCode };
      }),
      setCountryCode: (countryCode) => set({ countryCode }),
      fetchRates: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/INR");
          if (!res.ok) throw new Error("Failed to fetch rates");
          const data = await res.json();
          if (data && data.rates) {
            set({
              rates: {
                INR: 1,
                USD: data.rates.USD || DEFAULT_RATES.USD,
                EUR: data.rates.EUR || DEFAULT_RATES.EUR,
                GBP: data.rates.GBP || DEFAULT_RATES.GBP,
                AUD: data.rates.AUD || DEFAULT_RATES.AUD,
              },
            });
          }
        } catch (error) {
          console.error("Error fetching live exchange rates, using fallback rates:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      detectLocation: async () => {
        try {
          const res = await fetch("https://ipapi.co/json/");
          if (!res.ok) throw new Error("ipapi failed");
          const data = await res.json();
          if (data && data.country_code) {
            const detected = data.country_code.toUpperCase();
            set((state) => {
              const updates: Partial<CurrencyState> = {
                detectedCountry: detected,
                countryCode: state.detectedCountry ? state.countryCode : detected, // set initially if empty
              };
              
              // Only auto-initialize currency if it hasn't been set or was INR
              if (!state.detectedCountry) {
                if (detected === "IN") updates.currency = "INR";
                else if (detected === "US") updates.currency = "USD";
                else if (detected === "GB") updates.currency = "GBP";
                else if (detected === "DE") updates.currency = "EUR";
                else if (detected === "AU") updates.currency = "AUD";
              }
              
              return updates;
            });
          }
        } catch (e) {
          // Secondary fallback
          try {
            const res2 = await fetch("https://ip-api.com/json/");
            if (!res2.ok) throw new Error("ip-api failed");
            const data2 = await res2.json();
            if (data2 && data2.countryCode) {
              const detected = data2.countryCode.toUpperCase();
              set((state) => {
                const updates: Partial<CurrencyState> = {
                  detectedCountry: detected,
                  countryCode: state.detectedCountry ? state.countryCode : detected,
                };
                if (!state.detectedCountry) {
                  if (detected === "IN") updates.currency = "INR";
                  else if (detected === "US") updates.currency = "USD";
                  else if (detected === "GB") updates.currency = "GBP";
                  else if (detected === "DE") updates.currency = "EUR";
                  else if (detected === "AU") updates.currency = "AUD";
                }
                return updates;
              });
            }
          } catch (e2) {
            console.error("Failed to detect geolocation, defaulting to IN:", e2);
          }
        }
      },
    }),
    {
      name: "tkraft-currency-store",
    }
  )
);
