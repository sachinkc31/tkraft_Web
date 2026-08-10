// ============================================
// TKraft - Enterprise Analytics & Event Tracking Engine
// ============================================
// Supports Google Analytics 4 (GA4), Meta Pixel (Facebook),
// Pinterest Tag, Microsoft Clarity (Heatmaps), and Conversion Funnels.

import type { WooProduct, CartItem, WooOrder } from "@/types";

// Environment Configuration & Fallbacks
export const ANALYTICS_CONFIG = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "G-TKRAFT2026",
  clarityId: process.env.NEXT_PUBLIC_CLARITY_ID || "cl-tkraft88",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "1029384756",
  pinterestTagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || "2618394059",
  gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "gsc-tkraft-verify-2026",
  gmcVerification: process.env.NEXT_PUBLIC_GMC_VERIFICATION || "gmc-tkraft-merchant-verify",
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    pintrk?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track Page Views across all active analytics providers
 */
export function trackPageView(url: string) {
  if (typeof window === "undefined") return;

  // GA4
  if (window.gtag) {
    window.gtag("config", ANALYTICS_CONFIG.ga4Id, {
      page_path: url,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq("track", "PageView");
  }

  // Pinterest Tag
  if (window.pintrk) {
    window.pintrk("track", "pagevisit");
  }
}

/**
 * Track E-commerce Product Detail View
 */
export function trackViewItem(product: WooProduct) {
  if (typeof window === "undefined") return;

  const priceNum = parseFloat(product.price) || 0;

  // GA4 view_item
  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: "INR",
      value: priceNum,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.categories[0]?.name || "General",
          price: priceNum,
        },
      ],
    });
  }

  // Meta Pixel ViewContent
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      content_category: product.categories[0]?.name || "General",
      content_ids: [String(product.id)],
      content_type: "product",
      value: priceNum,
      currency: "INR",
    });
  }

  // Pinterest Tag PageVisit
  if (window.pintrk) {
    window.pintrk("track", "pagevisit", {
      line_items: [
        {
          product_id: String(product.id),
          product_name: product.name,
          product_price: priceNum,
        },
      ],
    });
  }
}

/**
 * Track Add To Cart Events
 */
export function trackAddToCart(product: WooProduct, quantity = 1) {
  if (typeof window === "undefined") return;

  const priceNum = parseFloat(product.price) || 0;
  const totalVal = priceNum * quantity;

  // GA4 add_to_cart
  if (window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "INR",
      value: totalVal,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.categories[0]?.name || "General",
          price: priceNum,
          quantity,
        },
      ],
    });
  }

  // Meta Pixel AddToCart
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      content_ids: [String(product.id)],
      content_type: "product",
      value: totalVal,
      currency: "INR",
    });
  }

  // Pinterest Tag AddToCart
  if (window.pintrk) {
    window.pintrk("track", "addtocart", {
      value: totalVal,
      order_quantity: quantity,
      currency: "INR",
      line_items: [
        {
          product_id: String(product.id),
          product_name: product.name,
          product_price: priceNum,
          product_quantity: quantity,
        },
      ],
    });
  }
}

/**
 * Track Begin Checkout Event
 */
export function trackBeginCheckout(items: CartItem[], totalValue: number) {
  if (typeof window === "undefined") return;

  const formattedItems = items.map((item) => ({
    item_id: String(item.product.id),
    item_name: item.product.name,
    price: parseFloat(item.product.price) || 0,
    quantity: item.quantity,
  }));

  // GA4 begin_checkout
  if (window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "INR",
      value: totalValue,
      items: formattedItems,
    });
  }

  // Meta Pixel InitiateCheckout
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_ids: items.map((i) => String(i.product.id)),
      content_type: "product",
      num_items: items.reduce((acc, i) => acc + i.quantity, 0),
      value: totalValue,
      currency: "INR",
    });
  }

  // Pinterest Tag Checkout
  if (window.pintrk) {
    window.pintrk("track", "signup", {
      value: totalValue,
      currency: "INR",
    });
  }
}

/**
 * Track Successful Order Purchase
 */
export function trackPurchase(order: WooOrder) {
  if (typeof window === "undefined") return;

  const totalNum = parseFloat(order.total) || 0;
  const lineItems = order.line_items.map((item) => ({
    item_id: String(item.product_id),
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  // GA4 purchase
  if (window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: String(order.id),
      value: totalNum,
      tax: parseFloat(order.total_tax) || 0,
      shipping: parseFloat(order.shipping_total) || 0,
      currency: order.currency || "INR",
      items: lineItems,
    });
  }

  // Meta Pixel Purchase
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      value: totalNum,
      currency: order.currency || "INR",
      content_ids: order.line_items.map((i) => String(i.product_id)),
      content_type: "product",
      num_items: order.line_items.reduce((acc, i) => acc + i.quantity, 0),
    });
  }

  // Pinterest Tag Checkout
  if (window.pintrk) {
    window.pintrk("track", "checkout", {
      value: totalNum,
      order_quantity: order.line_items.reduce((acc, i) => acc + i.quantity, 0),
      currency: order.currency || "INR",
      order_id: String(order.id),
    });
  }
}

/**
 * Track On-Site Search Queries
 */
export function trackSearch(searchQuery: string) {
  if (typeof window === "undefined" || !searchQuery) return;

  if (window.gtag) {
    window.gtag("event", "search", {
      search_term: searchQuery,
    });
  }

  if (window.fbq) {
    window.fbq("track", "Search", {
      search_string: searchQuery,
    });
  }

  if (window.pintrk) {
    window.pintrk("track", "search", {
      search_query: searchQuery,
    });
  }
}
