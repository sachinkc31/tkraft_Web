// ============================================
// TKraft - HowTo Schema Component (for Blogs/Guides)
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { HowToInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface HowToSchemaProps {
  data: HowToInput;
}

export function buildHowToSchema(data: HowToInput): Record<string, any> {
  const name = sanitizeText(data.name);
  const description = sanitizeText(data.description);

  return {
    "@type": "HowTo",
    "@id": data.id || `${SEO_CONFIG.siteUrl}/#howto-${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}`,
    name,
    description,
    image: data.image ? buildAbsoluteUrl(data.image) : undefined,
    totalTime: data.totalTime || "PT15M",
    estimatedCost: data.estimatedCost
      ? {
          "@type": "MonetaryAmount",
          currency: data.estimatedCost.currency || SEO_CONFIG.currency,
          value: String(data.estimatedCost.amount),
        }
      : undefined,
    supply: data.supply?.map((s) => ({
      "@type": "HowToSupply",
      name: sanitizeText(s),
    })),
    tool: data.tool?.map((t) => ({
      "@type": "HowToTool",
      name: sanitizeText(t),
    })),
    step: data.step.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: sanitizeText(s.name),
      text: sanitizeText(s.text),
      url: s.url ? buildAbsoluteUrl(s.url) : undefined,
      image: s.image ? buildAbsoluteUrl(s.image) : undefined,
    })),
  };
}

export function HowToSchema({ data }: HowToSchemaProps) {
  return <SchemaScript schema={buildHowToSchema(data)} id="howto-schema" />;
}
