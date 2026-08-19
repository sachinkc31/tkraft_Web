// ============================================
// Tkraft - WooCommerce API Service (Headless Layer)
// ============================================
// This is the core headless API layer that decouples
// the Next.js frontend from WordPress/WooCommerce.
// All WooCommerce REST API calls go through here.
// ============================================

import { API_CONFIG, PRODUCTS_PER_PAGE } from "@/lib/constants";
import { getDiscountPercent } from "@/lib/utils";
import type {
  WooProduct,
  WooCategory,
  WooOrder,
  PaginatedResponse,
  SortOption,
} from "@/types";

// ---- Auth Header Builder ----
function getAuthHeaders(): HeadersInit {
  const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
  const encoded = Buffer.from(`${key}:${secret}`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

// ---- Generic Fetcher ----
// ---- Generic Fetcher with Retry Support for 503 / Network Errors ----
async function wooFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  extractHeaders = false,
  retries = 2
): Promise<T & { _headers?: Headers }> {
  const url = `${API_CONFIG.woocommerceUrl}${endpoint}`;
  let response: Response | null = null;
  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {}),
        },
        next: {
          revalidate: API_CONFIG.revalidateTime,
          ...(options.next || {}),
        },
      });

      // If 502, 503, 504 server overload or maintenance status, retry after backoff
      if (response && [502, 503, 504].includes(response.status) && attempt < retries) {
        await new Promise((res) => setTimeout(res, 350 * (attempt + 1)));
        continue;
      }

      break;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 350 * (attempt + 1)));
      }
    }
  }

  if (!response) {
    throw new Error(lastError?.message || `WooCommerce API network failure: ${url}`);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `WooCommerce API error: ${response.status}`
    );
  }

  const data = await response.json();

  if (extractHeaders) {
    data._headers = response.headers;
  }

  return data;
}

// ---- Sort Mapping ----
function getSortParams(sortBy: SortOption): string {
  switch (sortBy) {
    case "popularity":
      return "&orderby=popularity";
    case "rating":
      return "&orderby=rating";
    case "date":
      return "&orderby=date&order=desc";
    case "price-asc":
      return "&orderby=price&order=asc";
    case "price-desc":
      return "&orderby=price&order=desc";
    default:
      return "&orderby=menu_order";
  }
}

// ============================================
// PRODUCTS
// ============================================

export async function getProducts(params?: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  sortBy?: SortOption;
  featured?: boolean;
  onSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: string;
  include?: number[];
}): Promise<PaginatedResponse<WooProduct>> {
  const page = params?.page || 1;
  try {
    const {
      perPage = PRODUCTS_PER_PAGE,
      category,
      search,
      sortBy = "default",
      featured,
      onSale,
      minPrice,
      maxPrice,
      stockStatus,
      include,
    } = params || {};

    let endpoint = `/products?page=${page}&per_page=${perPage}&status=publish`;
    endpoint += getSortParams(sortBy);

    if (category) {
      if (isNaN(Number(category))) {
        const catObj = await getCategoryBySlug(category);
        if (catObj) {
          endpoint += `&category=${catObj.id}`;
        } else {
          return {
            data: [],
            total: 0,
            totalPages: 0,
            currentPage: page,
          };
        }
      } else {
        endpoint += `&category=${category}`;
      }
    }
    if (search) endpoint += `&search=${encodeURIComponent(search)}`;
    if (featured) endpoint += `&featured=true`;
    if (onSale) endpoint += `&on_sale=true`;
    if (minPrice) endpoint += `&min_price=${minPrice}`;
    if (include && include.length > 0) endpoint += `&include=${include.join(",")}`;
    if (maxPrice) endpoint += `&max_price=${maxPrice}`;
    if (stockStatus) endpoint += `&stock_status=${stockStatus}`;

    const resData = await wooFetch<WooProduct[]>(endpoint, {}, true);
    const data: WooProduct[] = Array.isArray(resData) ? resData : [];
    const total = parseInt(resData._headers?.get("X-WP-Total") || "0", 10);
    const totalPages = parseInt(
      resData._headers?.get("X-WP-TotalPages") || "0",
      10
    );

    return {
      data,
      total,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

export async function getProductBySlug(
  slug: string
): Promise<WooProduct | null> {
  try {
    const products = await wooFetch<WooProduct[]>(
      `/products?slug=${slug}&status=publish`
    );
    return products[0] || null;
  } catch (error) {
    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }
}

export async function getProductById(id: number): Promise<WooProduct> {
  return wooFetch<WooProduct>(`/products/${id}`);
}

export async function getProductsByIds(ids: number[]): Promise<WooProduct[]> {
  if (!ids || ids.length === 0) return [];
  try {
    return await wooFetch<WooProduct[]>(`/products?include=${ids.join(",")}&status=publish`);
  } catch (error) {
    console.error(`Error fetching products by ids ${ids}:`, error);
    return [];
  }
}

export async function getProductVariations(productId: number): Promise<any[]> {
  try {
    return await wooFetch<any[]>(`/products/${productId}/variations`);
  } catch (error) {
    console.error(`Error fetching variations for product ${productId}:`, error);
    return [];
  }
}

export async function getRelatedProducts(
  productId: number,
  limit = 4
): Promise<WooProduct[]> {
  try {
    const product = await getProductById(productId);
    if (!product || !product.related_ids || !product.related_ids.length) return [];

    const ids = product.related_ids.slice(0, limit).join(",");
    return await wooFetch<WooProduct[]>(
      `/products?include=${ids}&status=publish`
    );
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
}

export async function getFeaturedProducts(
  limit = 8
): Promise<WooProduct[]> {
  try {
    return await wooFetch<WooProduct[]>(
      `/products?featured=true&per_page=${limit}&status=publish`
    );
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getOnSaleProducts(
  limit = 8,
  minDiscountPercent = 60
): Promise<WooProduct[]> {
  try {
    const products = await wooFetch<WooProduct[]>(
      `/products?on_sale=true&per_page=20&status=publish`
    );
    if (!Array.isArray(products)) return [];
    const filtered = products.filter(
      (p) => getDiscountPercent(p.regular_price, p.sale_price) >= minDiscountPercent
    );
    if (filtered.length > 0) {
      return filtered.slice(0, limit);
    }
    return products.slice(0, limit);
  } catch (error) {
    console.error("Error fetching on-sale products:", error);
    return [];
  }
}

export async function getNewArrivals(limit = 8): Promise<WooProduct[]> {
  try {
    return await wooFetch<WooProduct[]>(
      `/products?orderby=date&order=desc&per_page=${limit}&status=publish`
    );
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(): Promise<WooCategory[]> {
  return wooFetch<WooCategory[]>(
    `/products/categories?per_page=100&hide_empty=true&orderby=menu_order`
  );
}

export async function getCategoryBySlug(
  slug: string
): Promise<WooCategory | null> {
  const targetSlug = 
    slug === "storage-organization" ? "storage-and-organization" : 
    slug === "kitchen-products" ? "kitchen" : 
    slug === "cleaning-essentials" ? "cleaning-essential" : 
    slug;
  const categories = await wooFetch<WooCategory[]>(
    `/products/categories?slug=${targetSlug}`
  );
  return categories[0] || null;
}

export async function getTopCategories(): Promise<WooCategory[]> {
  return wooFetch<WooCategory[]>(
    `/products/categories?parent=0&per_page=20&hide_empty=true&orderby=menu_order`
  );
}

// ============================================
// ORDERS
// ============================================

export async function createOrder(
  orderData: Partial<WooOrder>
): Promise<WooOrder> {
  return wooFetch<WooOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
    next: { revalidate: 0 },
  });
}

export async function getOrder(orderId: number): Promise<WooOrder> {
  return wooFetch<WooOrder>(`/orders/${orderId}`, {
    next: { revalidate: 0 },
  });
}

export async function updateOrder(
  orderId: number,
  orderData: Partial<WooOrder>
): Promise<WooOrder> {
  return wooFetch<WooOrder>(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(orderData),
    next: { revalidate: 0 },
  });
}

export async function getCustomerOrders(
  customerId: number
): Promise<WooOrder[]> {
  return wooFetch<WooOrder[]>(`/orders?customer=${customerId}`, {
    next: { revalidate: 0 },
  });
}

export async function getOrders(params: Record<string, string> = {}): Promise<WooOrder[]> {
  const queryStr = Object.entries(params)
    .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
    .join("&");
  return wooFetch<WooOrder[]>(`/orders?${queryStr}`, {
    next: { revalidate: 0 },
  });
}

export async function updateCustomer(
  customerId: number,
  customerData: any
): Promise<any> {
  return wooFetch<any>(`/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(customerData),
    next: { revalidate: 0 },
  });
}

export async function createCustomer(
  customerData: any
): Promise<any> {
  return wooFetch<any>("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
    next: { revalidate: 0 },
  });
}



// ============================================
// PRODUCT SLUGS (for Static Generation / ISR)
// ============================================

export async function getAllProductSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const products = await wooFetch<WooProduct[]>(
      `/products?page=${page}&per_page=100&status=publish&_fields=slug`
    );
    slugs.push(...products.map((p) => p.slug));
    hasMore = products.length === 100;
    page++;
  }

  return slugs;
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await wooFetch<WooCategory[]>(
    `/products/categories?per_page=100&hide_empty=true&_fields=slug`
  );
  return categories.map((c) => c.slug);
}

export async function getProductReviews(productId: number): Promise<any[]> {
  return wooFetch<any[]>(`/products/reviews?product=${productId}&per_page=100`, {
    next: { revalidate: 60 },
  });
}

export async function createProductReview(reviewData: {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}): Promise<any> {
  return wooFetch<any>("/products/reviews", {
    method: "POST",
    body: JSON.stringify(reviewData),
    next: { revalidate: 0 },
  });
}

export async function getCategoriesByIds(ids: number[]): Promise<WooCategory[]> {
  if (!ids || ids.length === 0) return [];
  try {
    return await wooFetch<WooCategory[]>(
      `/products/categories?include=${ids.join(",")}`
    );
  } catch (err) {
    console.error("Failed fetching categories by IDs:", err);
    return [];
  }
}

export async function createNewsletterCoupon(email: string): Promise<string> {

  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const couponCode = `WELCOME15-${randomSuffix}`;

  const payload = {
    code: couponCode,
    amount: "15.00",
    discount_type: "percent",
    description: `15% off coupon for newsletter subscriber: ${email}`,
    individual_use: true,
    usage_limit: 1,
    usage_limit_per_user: 1,
    email_restrictions: [email.toLowerCase()],
    expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0], // 30 days expiry
  };

  await wooFetch<any>("/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
    next: { revalidate: 0 },
  });

  return couponCode;
}
