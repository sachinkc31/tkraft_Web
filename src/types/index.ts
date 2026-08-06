// ============================================
// Tkraft - Core Type Definitions
// ============================================

// ---- Product Types ----
export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: "simple" | "grouped" | "external" | "variable";
  status: "draft" | "pending" | "private" | "publish";
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  manage_stock: boolean;
  categories: WooCategory[];
  tags: WooTag[];
  images: WooImage[];
  attributes: WooAttribute[];
  variations: number[];
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  date_created: string;
  date_modified: string;
  meta_data: WooMeta[];
}

export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WooImage | null;
  count: number;
}

export interface WooTag {
  id: number;
  name: string;
  slug: string;
}

export interface WooAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooMeta {
  id: number;
  key: string;
  value: string;
}

// ---- Cart Types ----
export interface CartItem {
  id: number;
  product: WooProduct;
  quantity: number;
  variation_id?: number;
  variation?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  coupon?: string;
  discount: number;
}

// ---- Order Types ----
export interface WooOrder {
  id: number;
  status: OrderStatus;
  currency: string;
  total: string;
  subtotal: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  payment_method: string;
  payment_method_title: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  line_items: OrderLineItem[];
  date_created: string;
  customer_note: string;
  coupon_lines: CouponLine[];
  transaction_id?: string;
  set_paid?: boolean;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed";

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  total: string;
  price: number;
  image: WooImage;
}

export interface CouponLine {
  id: number;
  code: string;
  discount: string;
}

// ---- Customer / Auth Types ----
export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  meta_data?: Array<{ id?: number; key: string; value: any }>;
}

export interface SavedAddress {
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}


export interface AuthTokens {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

// ---- UI Types ----
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  cta_text?: string;
  cta_link?: string;
}

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  sortBy: SortOption;
  inStock: boolean;
}

export type SortOption =
  | "default"
  | "popularity"
  | "rating"
  | "date"
  | "price-asc"
  | "price-desc";

// ---- API Response Types ----
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}
