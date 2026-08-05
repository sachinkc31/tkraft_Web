// ============================================
// TKraft - OnlineStore & LocalBusiness Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { OnlineStoreInput, LocalBusinessInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface StoreSchemaProps {
  onlineStore?: OnlineStoreInput;
  localBusiness?: LocalBusinessInput;
}

export function buildOnlineStoreSchema(data?: OnlineStoreInput): Record<string, any> {
  const url = buildAbsoluteUrl(data?.url || SEO_CONFIG.siteUrl);
  const name = sanitizeText(data?.name || SEO_CONFIG.brand);
  const logo = buildAbsoluteUrl(data?.logo || SEO_CONFIG.logo);
  const description = sanitizeText(data?.description || SEO_CONFIG.description);

  return {
    "@type": "OnlineStore",
    "@id": data?.id || SEO_CONFIG.ids.store,
    name,
    url,
    logo,
    description,
    priceRange: data?.priceRange || SEO_CONFIG.priceRange,
    currenciesAccepted: data?.currenciesAccepted || SEO_CONFIG.currency,
    paymentAccepted: data?.paymentAccepted || [...SEO_CONFIG.paymentAccepted],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${name} Main Catalog`,
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Kitchen Essentials",
        },
        {
          "@type": "OfferCatalog",
          name: "Home Organization",
        },
        {
          "@type": "OfferCatalog",
          name: "Cleaning Products",
        },
        {
          "@type": "OfferCatalog",
          name: "Bathroom Accessories",
        },
        {
          "@type": "OfferCatalog",
          name: "Daily Utility Products",
        },
      ],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: data?.address?.addressCountry || SEO_CONFIG.country,
      addressRegion: data?.address?.addressRegion || "Maharashtra",
      addressLocality: data?.address?.addressLocality || "Mumbai",
    },
  };
}

export function buildLocalBusinessSchema(data?: LocalBusinessInput): Record<string, any> {
  const url = buildAbsoluteUrl(data?.url || SEO_CONFIG.siteUrl);
  const name = sanitizeText(data?.name || `${SEO_CONFIG.brand} Corporate Office`);

  return {
    "@type": "LocalBusiness",
    "@id": data?.id || SEO_CONFIG.ids.localBusiness,
    name,
    url,
    logo: buildAbsoluteUrl(data?.logo || SEO_CONFIG.logo),
    image: buildAbsoluteUrl(data?.image || SEO_CONFIG.defaultImage),
    telephone: data?.telephone || SEO_CONFIG.contact.telephone,
    priceRange: data?.priceRange || SEO_CONFIG.priceRange,
    address: {
      "@type": "PostalAddress",
      addressCountry: data?.address?.addressCountry || SEO_CONFIG.country,
      addressRegion: data?.address?.addressRegion || "Maharashtra",
      addressLocality: data?.address?.addressLocality || "Mumbai",
    },
    geo: data?.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: data.geo.latitude,
          longitude: data.geo.longitude,
        }
      : undefined,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
  };
}

export function StoreSchema({ onlineStore, localBusiness }: StoreSchemaProps) {
  const schemas: any[] = [buildOnlineStoreSchema(onlineStore)];
  if (localBusiness) {
    schemas.push(buildLocalBusinessSchema(localBusiness));
  }
  return <SchemaScript schema={schemas} id="store-schema" />;
}
