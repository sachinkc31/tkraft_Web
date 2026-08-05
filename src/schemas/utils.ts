// ============================================
// TKraft - Schema & Structured Data Utility Functions
// ============================================

import { SEO_CONFIG } from "./config";
import type {
  BreadcrumbItem,
  OfferInput,
  AggregateRatingInput,
  ShippingDetailsInput,
  MerchantReturnPolicyInput,
} from "./types";

/**
 * Builds an absolute URL from relative path or ensures site URL prefix
 */
export function buildAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SEO_CONFIG.siteUrl;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SEO_CONFIG.siteUrl}${cleanPath}`;
}

/**
 * Formats numeric price into two-decimal string format required by Schema.org
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === "number" ? price : parseFloat(String(price));
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}

/**
 * Generates a clean, canonical Schema `@id` URL
 */
export function generateSchemaId(baseUrl: string, fragment: string): string {
  const absUrl = buildAbsoluteUrl(baseUrl);
  const cleanFrag = fragment.startsWith("#") ? fragment : `#${fragment}`;
  return `${absUrl}${cleanFrag}`;
}

/**
 * Sanitizes text content to prevent broken JSON-LD strings or injection
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[\n\r\t]+/g, " ") // Normalize line breaks and tabs
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Recursively cleans schema objects to remove empty/null/undefined properties
 */
export function cleanSchemaObject<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return undefined as any;

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map((item) => cleanSchemaObject(item))
      .filter((item) => item !== undefined && item !== null && item !== "");
    return (cleanedArray.length > 0 ? cleanedArray : undefined) as any;
  }

  if (typeof obj === "object") {
    const cleanedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanSchemaObject(value);
      if (
        cleanedValue !== undefined &&
        cleanedValue !== null &&
        cleanedValue !== "" &&
        !(Array.isArray(cleanedValue) && cleanedValue.length === 0) &&
        !(
          typeof cleanedValue === "object" &&
          Object.keys(cleanedValue).length === 0
        )
      ) {
        cleanedObj[key] = cleanedValue;
      }
    }
    return (Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined) as any;
  }

  return obj;
}

/**
 * Combines multiple Schema entities into a single `@graph` JSON-LD structure
 */
export function mergeSchema(...schemas: any[]): Record<string, any> {
  const flattened: any[] = [];
  const seenIds = new Set<string>();

  const extractNodes = (node: any) => {
    if (!node) return;
    if (node["@graph"] && Array.isArray(node["@graph"])) {
      node["@graph"].forEach(extractNodes);
      return;
    }

    const cleaned = cleanSchemaObject(node);
    if (!cleaned) return;

    const id = cleaned["@id"];
    if (id) {
      if (seenIds.has(id)) return;
      seenIds.add(id);
    }
    flattened.push(cleaned);
  };

  schemas.forEach(extractNodes);

  return {
    "@context": "https://schema.org",
    "@graph": flattened,
  };
}

/**
 * Helper to build BreadcrumbList Schema structure
 */
export function buildBreadcrumb(items: BreadcrumbItem[]): Record<string, any> {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SEO_CONFIG.siteUrl}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: sanitizeText(item.name),
      item: buildAbsoluteUrl(item.url),
    })),
  };
}

/**
 * Helper to build Google Merchant Center & Rich Results compliant Offer Schema
 */
export function buildProductOffer(
  offer: OfferInput,
  shippingDetails?: ShippingDetailsInput,
  returnPolicy?: MerchantReturnPolicyInput
): Record<string, any> {
  const absUrl = offer.url ? buildAbsoluteUrl(offer.url) : SEO_CONFIG.siteUrl;

  const offerSchema: Record<string, any> = {
    "@type": "Offer",
    "@id": offer.id || `${absUrl}/#offer`,
    url: absUrl,
    price: formatPrice(offer.price),
    priceCurrency: offer.priceCurrency || SEO_CONFIG.currency,
    priceValidUntil:
      offer.priceValidUntil ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    availability: offer.availability
      ? offer.availability.startsWith("http")
        ? offer.availability
        : `https://schema.org/${offer.availability}`
      : "https://schema.org/InStock",
    itemCondition: offer.itemCondition || "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      "@id": offer.sellerId || SEO_CONFIG.ids.organization,
      name: SEO_CONFIG.brand,
    },
    sku: offer.sku,
  };

  if (shippingDetails || offer.shippingDetailsId) {
    offerSchema.shippingDetails = {
      "@type": "OfferShippingDetails",
      "@id": offer.shippingDetailsId || SEO_CONFIG.ids.shippingDetails,
      shippingRate: {
        "@type": "MonetaryAmount",
        value: formatPrice(shippingDetails?.shippingRate ?? 0),
        currency: shippingDetails?.shippingCurrency || SEO_CONFIG.currency,
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry:
          shippingDetails?.shippingDestinationCountry || SEO_CONFIG.country,
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 1,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: shippingDetails?.deliveryTimeDaysMin ?? 2,
          maxValue: shippingDetails?.deliveryTimeDaysMax ?? 5,
          unitCode: "DAY",
        },
      },
    };
  }

  if (returnPolicy || offer.returnPolicyId) {
    offerSchema.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      "@id": offer.returnPolicyId || SEO_CONFIG.ids.returnPolicy,
      applicableCountry:
        returnPolicy?.applicableCountry || SEO_CONFIG.country,
      returnPolicyCategory:
        returnPolicy?.returnPolicyCategory ||
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: returnPolicy?.merchantReturnDays ?? 7,
      returnMethod:
        returnPolicy?.returnMethod ||
        "https://schema.org/ReturnByMail",
      returnFees:
        returnPolicy?.returnFees ||
        "https://schema.org/FreeReturn",
      returnPolicyPage:
        returnPolicy?.returnPolicyUrl || `${SEO_CONFIG.siteUrl}/refund-policy`,
    };
  }

  return offerSchema;
}

/**
 * Helper to build AggregateRating Schema
 */
export function buildAggregateRating(
  rating?: AggregateRatingInput
): Record<string, any> | undefined {
  if (!rating || !rating.ratingValue || !rating.reviewCount) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: String(rating.ratingValue),
    reviewCount: String(rating.reviewCount),
    bestRating: String(rating.bestRating || 5),
    worstRating: String(rating.worstRating || 1),
  };
}
