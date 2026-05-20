export const GEO_PRICE_MULTIPLIERS: Record<string, number> = {
  IN: 1.0,
  US: 2.0,
  GB: 1.8,
  DE: 1.5,
  AU: 1.6,
  CA: 1.5,
};

export const DEFAULT_MULTIPLIER = 1.2;

export function getPriceMultiplier(countryCode: string): number {
  if (!countryCode) return DEFAULT_MULTIPLIER;
  const code = countryCode.toUpperCase();
  if (code in GEO_PRICE_MULTIPLIERS) {
    return GEO_PRICE_MULTIPLIERS[code];
  }
  return DEFAULT_MULTIPLIER;
}

export const COUNTRY_RULES = {
  IN: { name: "India", tax: 0.18, shipping: 49, freeLimit: 499 },
  US: { name: "United States", tax: 0.08, shipping: 1250, freeLimit: 8300 },
  GB: { name: "United Kingdom", tax: 0.20, shipping: 1250, freeLimit: 8300 },
  DE: { name: "Germany", tax: 0.19, shipping: 1100, freeLimit: 8300 },
  AU: { name: "Australia", tax: 0.10, shipping: 1250, freeLimit: 8300 },
  CA: { name: "Canada", tax: 0.12, shipping: 1250, freeLimit: 8300 },
  other: { name: "Other (International)", tax: 0.10, shipping: 1660, freeLimit: 12500 },
};
