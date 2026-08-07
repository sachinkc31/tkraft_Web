// ============================================
// Tkraft - Application Constants
// ============================================

export const SITE_CONFIG = {
  name: "Tkraft",
  tagline: "Drill-Free Home & Kitchen Storage Solutions",
  description:
    "Tkraft is a premier Indian brand specializing in drill-free home and kitchen storage organizers, heavy-duty adhesive wall hooks, and space-saving essentials. Enjoy free shipping across India on orders above ₹499.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tkraft.in",
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
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/track-order" },
    { label: "Help & FAQ", href: "/faq" },
    { label: "HTML Sitemap", href: "/sitemap-page" },
  ],
  legal: [
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Refund & Return Policy", href: "/refund-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
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
