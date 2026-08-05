// ============================================
// TKraft - Standalone Review Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { ReviewInput } from "./types";
import { sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface ReviewSchemaProps {
  data: ReviewInput;
  itemReviewedName: string;
  itemReviewedUrl?: string;
}

export function buildReviewSchema(
  data: ReviewInput,
  itemReviewedName: string,
  itemReviewedUrl?: string
): Record<string, any> {
  return {
    "@type": "Review",
    author: {
      "@type": "Person",
      name: sanitizeText(data.author),
    },
    datePublished: data.datePublished || new Date().toISOString().split("T")[0],
    reviewBody: sanitizeText(data.reviewBody),
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(data.ratingValue),
      bestRating: "5",
      worstRating: "1",
    },
    itemReviewed: {
      "@type": "Product",
      name: sanitizeText(itemReviewedName),
      url: itemReviewedUrl || SEO_CONFIG.siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: data.publisherName || SEO_CONFIG.brand,
    },
  };
}

export function ReviewSchema({ data, itemReviewedName, itemReviewedUrl }: ReviewSchemaProps) {
  return (
    <SchemaScript
      schema={buildReviewSchema(data, itemReviewedName, itemReviewedUrl)}
      id="review-schema"
    />
  );
}
