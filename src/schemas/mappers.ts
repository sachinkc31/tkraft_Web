// ============================================
// TKraft - WooCommerce API to Schema.org Dynamic Mapper
// ============================================

import type { WooProduct, WooCategory } from "@/types";
import { SEO_CONFIG } from "./config";
import type {
  ProductInput,
  CollectionPageInput,
  ItemListInput,
  ItemListItem,
} from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";

/**
 * Extracts meta value by key from WooProduct meta_data array
 */
function getMetaValue(product: WooProduct, key: string): string | undefined {
  if (!product.meta_data || !Array.isArray(product.meta_data)) return undefined;
  const meta = product.meta_data.find((m) => m.key === key);
  return meta ? String(meta.value) : undefined;
}

/**
 * Extracts attribute value by name from WooProduct attributes array
 */
function getAttributeValue(product: WooProduct, attrName: string): string | undefined {
  if (!product.attributes || !Array.isArray(product.attributes)) return undefined;
  const attr = product.attributes.find(
    (a) => a.name.toLowerCase() === attrName.toLowerCase()
  );
  return attr && attr.options && attr.options.length > 0 ? attr.options[0] : undefined;
}

/**
 * Dynamically maps WooCommerce REST API Product response to Schema.org ProductInput
 */
export function mapWooProductToSchema(
  product: WooProduct,
  options?: {
    currency?: string;
    rate?: number;
    language?: string;
  }
): ProductInput {
  const currency = options?.currency || SEO_CONFIG.currency;
  const rate = options?.rate || 1;

  const rawPrice = parseFloat(product.price || "0");
  const convertedPrice = (rawPrice * rate).toFixed(2);

  // Extract images safely
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => buildAbsoluteUrl(img.src))
      : [SEO_CONFIG.defaultImage];

  // Extract Brand / GTIN / MPN / Color / Material / Weight from WooAttributes or WooMeta
  const brand =
    getAttributeValue(product, "brand") ||
    getMetaValue(product, "_brand") ||
    getMetaValue(product, "brand") ||
    SEO_CONFIG.brand;

  const gtin =
    getMetaValue(product, "_gtin") ||
    getMetaValue(product, "_barcode") ||
    getMetaValue(product, "gtin") ||
    getMetaValue(product, "ean");

  const mpn =
    getMetaValue(product, "_mpn") ||
    getMetaValue(product, "mpn") ||
    product.sku ||
    `TK-${product.id}`;

  const color =
    getAttributeValue(product, "color") ||
    getAttributeValue(product, "colour") ||
    getMetaValue(product, "_color");

  const material =
    getAttributeValue(product, "material") ||
    getMetaValue(product, "_material");

  const weight =
    getMetaValue(product, "_weight") ||
    (product as any).weight ||
    undefined;

  // Map stock availability
  let availability = "https://schema.org/InStock";
  if (product.stock_status === "outofstock") {
    availability = "https://schema.org/OutOfStock";
  } else if (product.stock_status === "onbackorder") {
    availability = "https://schema.org/PreOrder";
  }

  // Primary category name
  const categoryName =
    product.categories && product.categories.length > 0
      ? sanitizeText(product.categories[0].name)
      : undefined;

  // Rating mapping
  const avgRating = parseFloat(product.average_rating || "0");
  const ratingCount = product.rating_count || 0;

  return {
    id: `${SEO_CONFIG.siteUrl}/products/${product.slug}#product`,
    url: `/products/${product.slug}`,
    name: sanitizeText(product.name),
    description: sanitizeText(product.short_description || product.description || product.name),
    sku: product.sku || `TK-${product.id}`,
    gtin,
    mpn,
    images,
    brand,
    color,
    material,
    weight,
    category: categoryName,
    countryOfOrigin: "India",
    offer: {
      id: `${SEO_CONFIG.siteUrl}/products/${product.slug}#offer`,
      url: `/products/${product.slug}`,
      price: convertedPrice,
      priceCurrency: currency,
      availability,
      sku: product.sku || `TK-${product.id}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    aggregateRating:
      ratingCount > 0 && avgRating > 0
        ? {
            ratingValue: avgRating,
            reviewCount: ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    shippingDetails: {
      shippingRate: parseFloat(convertedPrice) > 499 ? 0 : 49,
      shippingCurrency: currency,
      deliveryTimeDaysMin: 2,
      deliveryTimeDaysMax: 5,
    },
    returnPolicy: {
      merchantReturnDays: 7,
      returnPolicyUrl: `${SEO_CONFIG.siteUrl}/refund-policy`,
    },
  };
}

/**
 * Dynamically maps WooCommerce Category response to Schema.org CollectionPageInput & ItemListInput
 */
export function mapWooCategoryToSchema(
  category: WooCategory,
  products: WooProduct[] = [],
  options?: {
    currency?: string;
    rate?: number;
  }
): { collection: CollectionPageInput; itemList: ItemListInput } {
  const collectionUrl = `/category/${category.slug}`;
  const rate = options?.rate || 1;

  const itemListElement: ItemListItem[] = products.map((p, idx) => {
    const rawPrice = parseFloat(p.price || "0");
    const convertedPrice = (rawPrice * rate).toFixed(2);
    return {
      position: idx + 1,
      name: sanitizeText(p.name),
      url: `/products/${p.slug}`,
      image: p.images && p.images.length > 0 ? buildAbsoluteUrl(p.images[0].src) : undefined,
      price: convertedPrice,
      currency: options?.currency || SEO_CONFIG.currency,
    };
  });

  return {
    collection: {
      id: `${SEO_CONFIG.siteUrl}${collectionUrl}#collectionpage`,
      url: collectionUrl,
      name: sanitizeText(category.name),
      description: sanitizeText(
        category.description || `Browse ${category.name} collection at TKraft`
      ),
      numberOfItems: category.count || products.length,
    },
    itemList: {
      id: `${SEO_CONFIG.siteUrl}${collectionUrl}#itemlist`,
      name: `${sanitizeText(category.name)} Products`,
      description: `List of products under ${sanitizeText(category.name)}`,
      itemListElement,
    },
  };
}
