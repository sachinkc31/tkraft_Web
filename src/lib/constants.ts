// ============================================
// Tkraft - Application Constants
// ============================================

export const SITE_CONFIG = {
  name: "Tkraft",
  tagline: "Home & Kitchen Products Online Deals",
  description:
    "Shop premium home essentials, kitchen products, storage solutions, and personal care items at the best prices. Free shipping on orders above ₹499.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.tkraft.in",
  logo: "https://tkraft.in/wp-content/uploads/2025/12/Edited.png",
  ogImage: "/images/og-default.jpg",
  locale: "en_IN",
  currency: "INR",
  currencySymbol: "₹",
} as const;

export const API_CONFIG = {
  wordpressUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://tkraft.in",
  woocommerceUrl:
    process.env.NEXT_PUBLIC_WOOCOMMERCE_URL ||
    "https://tkraft.in/wp-json/wc/v3",
  wpRestUrl:
    process.env.NEXT_PUBLIC_WP_REST_URL ||
    "https://tkraft.in/wp-json/wp/v2",
  jwtAuthUrl:
    process.env.NEXT_PUBLIC_JWT_AUTH_URL ||
    "https://tkraft.in/wp-json/jwt-auth/v1",
  revalidateTime: Number(process.env.NEXT_PUBLIC_REVALIDATE_TIME) || 3600,
} as const;

export const NAVIGATION = {
  categories: [
    {
      label: "Home Essentials",
      href: "/category/home",
      slug: "home",
    },
    {
      label: "Storage & Organization",
      href: "/category/storage-and-organization",
      slug: "storage-and-organization",
    },
    {
      label: "Cleaning Essentials",
      href: "/category/cleaning-essential",
      slug: "cleaning-essential",
    },
    {
      label: "Personal Care",
      href: "/category/personal-care",
      slug: "personal-care",
    },
    {
      label: "Kitchen Essentials",
      href: "/category/kitchen",
      slug: "kitchen",
    },
  ],
  userLinks: [
    { label: "My Account", href: "/account" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ],
} as const;

export const TRUST_BADGES = [
  {
    icon: "truck",
    title: "Free Shipping",
    description: "On orders above ₹499",
  },
  {
    icon: "headphones",
    title: "24/7 Support",
    description: "Dedicated customer service",
  },
  {
    icon: "shield-check",
    title: "Money Back",
    description: "30-day guarantee",
  },
  {
    icon: "lock",
    title: "Secure Payment",
    description: "100% secure checkout",
  },
] as const;

export const FOOTER_LINKS = {
  help: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "COD Policy", href: "/cod-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
  categories: NAVIGATION.categories,
} as const;

export const PRODUCTS_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Popularity", value: "popularity" },
  { label: "Average Rating", value: "rating" },
  { label: "Latest", value: "date" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
] as const;
