// ============================================
// TKraft - Schema.org & JSON-LD TypeScript Interfaces
// ============================================

export interface SchemaBase {
  "@context"?: string;
  "@type": string;
  "@id"?: string;
}

export interface PostalAddressInput {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface ContactPointInput {
  email?: string;
  telephone?: string;
  contactType?: string;
  availableLanguage?: string | string[];
}

export interface OrganizationInput {
  id?: string;
  name?: string;
  legalName?: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  telephone?: string;
  foundingDate?: string;
  sameAs?: string[];
  contactPoint?: ContactPointInput;
  address?: PostalAddressInput;
  knowsAbout?: string[];
  keywords?: string[];
  brand?: string;
  parentOrganization?: string;
  areaServed?: string;
}

export interface SearchActionInput {
  target: string; // e.g. "https://www.tkraft.online/shop?search={search_term_string}"
  queryInput?: string; // e.g. "required name=search_term_string"
}

export interface WebSiteInput {
  id?: string;
  url?: string;
  name?: string;
  description?: string;
  language?: string;
  copyrightYear?: number;
  publisherId?: string;
  searchAction?: SearchActionInput;
}

export interface WebPageInput {
  id?: string;
  url: string;
  name: string;
  description: string;
  pageType?:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "ItemPage"
    | "CollectionPage"
    | "CheckoutPage"
    | "SearchResultsPage"
    | "ProfilePage";
  inLanguage?: string;
  datePublished?: string;
  dateModified?: string;
  isPartOfId?: string;
  publisherId?: string;
}

export interface OnlineStoreInput {
  id?: string;
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  priceRange?: string;
  currenciesAccepted?: string;
  paymentAccepted?: string[];
  availableDeliveryMethod?: string[];
  address?: PostalAddressInput;
}

export interface LocalBusinessInput {
  id?: string;
  name?: string;
  url?: string;
  logo?: string;
  image?: string;
  telephone?: string;
  priceRange?: string;
  address?: PostalAddressInput;
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListInput {
  id?: string;
  items: BreadcrumbItem[];
}

export interface CollectionPageInput {
  id?: string;
  url: string;
  name: string;
  description: string;
  numberOfItems?: number;
}

export interface ItemListItem {
  name: string;
  url: string;
  image?: string;
  price?: number | string;
  currency?: string;
  position?: number;
}

export interface ItemListInput {
  id?: string;
  name: string;
  description?: string;
  itemListElement: ItemListItem[];
}

export interface OfferInput {
  id?: string;
  url?: string;
  price: number | string;
  priceCurrency?: string;
  priceValidUntil?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued" | string;
  itemCondition?: string;
  sellerId?: string;
  sku?: string;
  shippingDetailsId?: string;
  returnPolicyId?: string;
}

export interface AggregateRatingInput {
  ratingValue: number | string;
  reviewCount: number | string;
  bestRating?: number | string;
  worstRating?: number | string;
}

export interface ReviewInput {
  author: string;
  reviewBody: string;
  ratingValue: number | string;
  datePublished?: string;
  publisherName?: string;
}

export interface MerchantReturnPolicyInput {
  id?: string;
  merchantReturnDays?: number;
  returnPolicyCategory?: string;
  returnMethod?: string;
  returnFees?: string;
  applicableCountry?: string;
  returnPolicyUrl?: string;
}

export interface ShippingDetailsInput {
  id?: string;
  shippingRate?: number | string;
  shippingCurrency?: string;
  shippingDestinationCountry?: string;
  deliveryTimeDaysMin?: number;
  deliveryTimeDaysMax?: number;
}

export interface ProductInput {
  id?: string;
  url: string;
  name: string;
  description: string;
  sku: string;
  images: string[];
  brand?: string;
  gtin?: string;
  mpn?: string;
  color?: string;
  material?: string;
  weight?: string | number;
  countryOfOrigin?: string;
  category?: string;
  offer: OfferInput;
  aggregateRating?: AggregateRatingInput;
  reviews?: ReviewInput[];
  shippingDetails?: ShippingDetailsInput;
  returnPolicy?: MerchantReturnPolicyInput;
  videoUrl?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageInput {
  id?: string;
  items: FAQItem[];
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToInput {
  id?: string;
  name: string;
  description: string;
  image?: string;
  totalTime?: string; // e.g. "PT10M"
  estimatedCost?: {
    amount: string | number;
    currency: string;
  };
  supply?: string[];
  tool?: string[];
  step: HowToStep[];
}

export interface ArticleInput {
  id?: string;
  url: string;
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherId?: string;
  isBlogPosting?: boolean;
}

export interface ImageObjectInput {
  id?: string;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface VideoObjectInput {
  id?: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
}

export interface BrandInput {
  id?: string;
  name: string;
  logo?: string;
  url?: string;
  description?: string;
}
