// ============================================
// TKraft - Article, BlogPosting & Speakable Schema
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { ArticleInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface ArticleSchemaProps {
  data: ArticleInput;
}

export function buildArticleSchema(data: ArticleInput): Record<string, any> {
  const absUrl = buildAbsoluteUrl(data.url);
  const headline = sanitizeText(data.headline);
  const description = sanitizeText(data.description);
  const images = (data.image || [SEO_CONFIG.defaultImage]).map(buildAbsoluteUrl);
  const authorName = sanitizeText(data.authorName || SEO_CONFIG.brand);

  return {
    "@type": data.isBlogPosting ? "BlogPosting" : "Article",
    "@id": data.id || `${absUrl}/#article`,
    url: absUrl,
    headline,
    description,
    image: images,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absUrl,
    },
    author: {
      "@type": "Person",
      name: authorName,
      url: `${SEO_CONFIG.siteUrl}/about`,
    },
    publisher: {
      "@type": "Organization",
      "@id": data.publisherId || SEO_CONFIG.ids.organization,
      name: SEO_CONFIG.brand,
      logo: {
        "@type": "ImageObject",
        url: SEO_CONFIG.logo,
      },
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-summary", ".article-content"],
    },
  };
}

export function ArticleSchema({ data }: ArticleSchemaProps) {
  return <SchemaScript schema={buildArticleSchema(data)} id="article-schema" />;
}
