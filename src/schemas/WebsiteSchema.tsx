// ============================================
// TKraft - WebSite & Sitelinks Search Box Schema
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { WebSiteInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface WebsiteSchemaProps {
  data?: WebSiteInput;
}

export function buildWebsiteSchema(data?: WebSiteInput): Record<string, any> {
  const url = buildAbsoluteUrl(data?.url || SEO_CONFIG.siteUrl);
  const name = sanitizeText(data?.name || `${SEO_CONFIG.brand} – ${SEO_CONFIG.tagline}`);
  const description = sanitizeText(data?.description || SEO_CONFIG.description);
  const searchTarget = data?.searchAction?.target || `${url}/shop?search={search_term_string}`;
  const queryInput = data?.searchAction?.queryInput || "required name=search_term_string";

  return {
    "@type": "WebSite",
    "@id": data?.id || SEO_CONFIG.ids.website,
    url,
    name,
    description,
    inLanguage: data?.language || "en-IN",
    copyrightYear: data?.copyrightYear || new Date().getFullYear(),
    publisher: {
      "@type": "Organization",
      "@id": data?.publisherId || SEO_CONFIG.ids.organization,
      name: SEO_CONFIG.brand,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTarget,
      },
      "query-input": queryInput,
    },
  };
}

export function WebsiteSchema({ data }: WebsiteSchemaProps) {
  return <SchemaScript schema={buildWebsiteSchema(data)} id="website-schema" />;
}
