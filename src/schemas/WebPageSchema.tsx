// ============================================
// TKraft - Dynamic WebPage & Specialized Page Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { WebPageInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface WebPageSchemaProps {
  data: WebPageInput;
}

export function buildWebPageSchema(data: WebPageInput): Record<string, any> {
  const absUrl = buildAbsoluteUrl(data.url);
  const name = sanitizeText(data.name);
  const description = sanitizeText(data.description);
  const pageType = data.pageType || "WebPage";

  return {
    "@type": pageType,
    "@id": data.id || `${absUrl}/#webpage`,
    url: absUrl,
    name,
    description,
    inLanguage: data.inLanguage || "en-IN",
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    isPartOf: {
      "@type": "WebSite",
      "@id": data.isPartOfId || SEO_CONFIG.ids.website,
    },
    publisher: {
      "@type": "Organization",
      "@id": data.publisherId || SEO_CONFIG.ids.organization,
    },
  };
}

export function WebPageSchema({ data }: WebPageSchemaProps) {
  return <SchemaScript schema={buildWebPageSchema(data)} id="webpage-schema" />;
}
