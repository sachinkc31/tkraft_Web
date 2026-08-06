// ============================================
// TKraft - Central Enterprise SEO & Schema Config
// ============================================

export const SEO_CONFIG = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.tkraft.online",
  brand: "TKraft",
  legalName: "TKraft Home & Kitchen Essentials",
  tagline: "Drill-Free Home & Kitchen Storage Solutions",
  description:
    "TKraft is a premier online store in India specializing in drill-free kitchen organizers, home storage solutions, cleaning tools, bathroom accessories, and daily utility gadgets.",
  logo: "https://tkraft.in/wp-content/uploads/2025/12/Edited.png",
  defaultImage: "https://www.tkraft.online/images/og-default.jpg",
  currency: "INR",
  currencySymbol: "₹",
  supportedCurrencies: ["INR", "USD", "EUR", "GBP", "AUD"],
  country: "IN",
  supportedLocales: ["en-IN", "hi-IN", "en-US", "en-GB"],
  foundingDate: "2024-01-01",
  priceRange: "₹₹",
  paymentAccepted: [
    "Cash on Delivery",
    "Credit Card",
    "Debit Card",
    "UPI",
    "Net Banking",
    "Razorpay",
  ],
  availableDeliveryMethod: [
    "https://schema.org/ParcelService",
    "https://schema.org/OnSitePickup",
  ],
  contact: {
    email: "support@tkraft.in",
    telephone: "+91-9876543210",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
  socialLinks: [
    "https://www.instagram.com/tkraft.in",
    "https://www.facebook.com/tkraft.in",
    "https://www.youtube.com/@tkraftin",
    "https://www.trustpilot.com/review/tkraft.online",
    "https://www.amazon.in/stores/Tkraft/page/87C0D0E8-A979-4B52-87C7-93C0C46B1D28",
  ],
  knowsAbout: [
    "Drill-Free Kitchen Storage",
    "Home Organization Products",
    "Cleaning Products Online",
    "Bathroom Accessories",
    "Storage Solutions",
    "Smart Home Products",
    "Household Essentials",
    "Kitchen Gadgets",
    "Car Accessories",
    "Daily Utility Products",
  ],
  ids: {
    organization: "https://www.tkraft.online/#organization",
    website: "https://www.tkraft.online/#website",
    store: "https://www.tkraft.online/#store",
    localBusiness: "https://www.tkraft.online/#localbusiness",
    shippingDetails: "https://www.tkraft.online/#shipping-details",
    returnPolicy: "https://www.tkraft.online/#return-policy",
  },
} as const;
