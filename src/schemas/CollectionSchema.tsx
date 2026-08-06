// ============================================
// TKraft - ItemList / Collection Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { ItemListInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface CollectionSchemaProps {
  data: ItemListInput;
}

export function buildItemListSchema(data: ItemListInput): Record<string, any> {
  return {
    "@type": "ItemList",
    "@id": data.id || `${SEO_CONFIG.siteUrl}/#itemlist-${encodeURIComponent(data.name.toLowerCase().replace(/\s+/g, "-"))}`,
    name: sanitizeText(data.name),
    description: sanitizeText(data.description || `${data.name} listing at TKraft`),
    numberOfItems: data.itemListElement.length,
    itemListElement: data.itemListElement.map((item, idx) => ({
      "@type": "ListItem",
      position: item.position || idx + 1,
      name: sanitizeText(item.name),
      url: buildAbsoluteUrl(item.url),
      image: item.image ? buildAbsoluteUrl(item.image) : undefined,
    })),
  };
}

export function CollectionSchema({ data }: CollectionSchemaProps) {
  return <SchemaScript schema={buildItemListSchema(data)} id="itemlist-schema" />;
}
