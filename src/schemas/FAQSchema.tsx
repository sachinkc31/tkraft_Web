// ============================================
// TKraft - FAQPage Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { FAQPageInput } from "./types";
import { sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface FAQSchemaProps {
  data: FAQPageInput;
}

export function buildFAQSchema(data: FAQPageInput): Record<string, any> {
  return {
    "@type": "FAQPage",
    "@id": data.id || `${SEO_CONFIG.siteUrl}/#faq`,
    mainEntity: data.items.map((item) => ({
      "@type": "Question",
      name: sanitizeText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: sanitizeText(item.answer),
      },
    })),
  };
}

export function FAQSchema({ data }: FAQSchemaProps) {
  return <SchemaScript schema={buildFAQSchema(data)} id="faq-schema" />;
}
