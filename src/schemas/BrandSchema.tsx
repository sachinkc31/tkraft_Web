// ============================================
// TKraft - Brand Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { BrandInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface BrandSchemaProps {
  data?: BrandInput;
}

export function buildBrandSchema(data?: BrandInput): Record<string, any> {
  const name = sanitizeText(data?.name || SEO_CONFIG.brand);
  const logo = buildAbsoluteUrl(data?.logo || SEO_CONFIG.logo);
  const url = buildAbsoluteUrl(data?.url || SEO_CONFIG.siteUrl);
  const description = sanitizeText(data?.description || SEO_CONFIG.description);

  return {
    "@type": "Brand",
    "@id": data?.id || `${SEO_CONFIG.siteUrl}/#brand`,
    name,
    logo,
    url,
    description,
  };
}

export function BrandSchema({ data }: BrandSchemaProps) {
  return <SchemaScript schema={buildBrandSchema(data)} id="brand-schema" />;
}
