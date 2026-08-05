// ============================================
// TKraft - Product, Offer & Merchant Listings Schema
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { ProductInput } from "./types";
import {
  buildAbsoluteUrl,
  buildAggregateRating,
  buildProductOffer,
  sanitizeText,
} from "./utils";
import { SchemaScript } from "./SchemaScript";

interface ProductSchemaProps {
  data: ProductInput;
}

export function buildProductSchema(data: ProductInput): Record<string, any> {
  const absUrl = buildAbsoluteUrl(data.url);
  const productId = data.id || `${absUrl}/#product`;
  const name = sanitizeText(data.name);
  const description = sanitizeText(data.description);
  const images = (data.images || [SEO_CONFIG.defaultImage]).map(buildAbsoluteUrl);
  const brandName = sanitizeText(data.brand || SEO_CONFIG.brand);

  const productSchema: Record<string, any> = {
    "@type": "Product",
    "@id": productId,
    url: absUrl,
    name,
    description,
    sku: data.sku,
    gtin: data.gtin,
    mpn: data.mpn || data.sku,
    image: images,
    brand: {
      "@type": "Brand",
      "@id": `${SEO_CONFIG.siteUrl}/#brand-${encodeURIComponent(brandName.toLowerCase())}`,
      name: brandName,
      logo: SEO_CONFIG.logo,
    },
    color: data.color,
    material: data.material,
    weight: data.weight
      ? {
          "@type": "QuantitativeValue",
          value: data.weight,
          unitCode: "KGM",
        }
      : undefined,
    countryOfOrigin: {
      "@type": "Country",
      name: data.countryOfOrigin || "India",
      identifier: SEO_CONFIG.country,
    },
    category: data.category,
    offers: buildProductOffer(data.offer, data.shippingDetails, data.returnPolicy),
  };

  if (data.aggregateRating) {
    productSchema.aggregateRating = buildAggregateRating(data.aggregateRating);
  }

  if (data.reviews && data.reviews.length > 0) {
    productSchema.review = data.reviews.map((rev) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: sanitizeText(rev.author),
      },
      datePublished:
        rev.datePublished || new Date().toISOString().split("T")[0],
      reviewBody: sanitizeText(rev.reviewBody),
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(rev.ratingValue),
        bestRating: "5",
        worstRating: "1",
      },
      publisher: {
        "@type": "Organization",
        name: rev.publisherName || SEO_CONFIG.brand,
      },
    }));
  }

  if (data.videoUrl) {
    productSchema.subjectOf = {
      "@type": "VideoObject",
      name: `${name} Product Video`,
      description: `Watch feature demonstration of ${name}`,
      thumbnailUrl: images[0],
      contentUrl: buildAbsoluteUrl(data.videoUrl),
      uploadDate: new Date().toISOString().split("T")[0],
    };
  }

  return productSchema;
}

export function ProductSchema({ data }: ProductSchemaProps) {
  return <SchemaScript schema={buildProductSchema(data)} id="product-schema" />;
}
