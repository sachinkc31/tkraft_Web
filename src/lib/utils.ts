import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCurrencyStore } from "@/store/currency";
import { getPriceMultiplier } from "@/lib/geo-config";

/**
 * Merge Tailwind classes with clsx — shadcn/ui pattern
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price using dynamic currency conversion with live exchange rates and geo pricing multipliers
 */
export function formatPrice(price: string | number, isProduct: boolean = true): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "₹0";

  // Check if browser context exists
  if (typeof window !== "undefined") {
    try {
      const state = useCurrencyStore.getState();
      const currentCurrency = state.currency;
      const rate = state.rates[currentCurrency] || 1;
      const countryCode = state.countryCode || "IN";
      const geoMultiplier = isProduct ? getPriceMultiplier(countryCode) : 1.0;
      const convertedPrice = numPrice * geoMultiplier * rate;

      let locale = "en-IN";
      if (currentCurrency === "USD") locale = "en-US";
      else if (currentCurrency === "EUR") locale = "en-IE";
      else if (currentCurrency === "GBP") locale = "en-GB";
      else if (currentCurrency === "AUD") locale = "en-AU";

      // Decimals are appropriate for non-INR conversion
      const decimals = currentCurrency === "INR" ? 0 : 2;

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currentCurrency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(convertedPrice);
    } catch (e) {
      // Fallback below
    }
  }

  // Fallback to INR (SSR or if browser store fails)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercent(
  regularPrice: string,
  salePrice: string
): number {
  const regular = parseFloat(regularPrice);
  const sale = parseFloat(salePrice);
  if (!regular || !sale || regular <= sale) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

/**
 * Strip HTML tags from string (for WooCommerce descriptions)
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Clean up and format WordPress HTML error messages
 */
export function cleanErrorMessage(msg: string): { text: string; html: string } {
  if (!msg) return { text: "", html: "" };
  
  let cleaned = msg.trim();
  
  // Keep stripping common error prefixes
  let lastCleaned = "";
  while (cleaned !== lastCleaned) {
    lastCleaned = cleaned;
    cleaned = cleaned
      .replace(/^(error|exception)\s*:\s*/i, "")
      .replace(/^error\s+/i, "")
      .replace(/^<strong>(error|exception):?<\/strong>\s*/i, "")
      .replace(/^<strong>(error|exception)<\/strong>:?\s*/i, "")
      .trim();
  }
  
  const text = cleaned.replace(/<[^>]*>/g, "").trim();
  
  return {
    text: text || "An unexpected error occurred",
    html: cleaned || "An unexpected error occurred"
  };
}

/**
 * Generate a slug-friendly string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Debounce function for search, scroll events, etc.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Build WooCommerce image URL with CDN optimization
 */
export function optimizeImageUrl(
  src: string,
  width: number = 800,
  quality: number = 80
): string {
  // If already using Jetpack CDN, append size params
  if (src.includes("i0.wp.com")) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("quality", quality.toString());
    return url.toString();
  }
  return src;
}
