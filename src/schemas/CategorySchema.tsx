// ============================================
// TKraft - Category & Collection Page Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { CollectionPageInput, ItemListInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface CategorySchemaProps {
  collection: CollectionPageInput;
  itemList?: ItemListInput;
}

export function buildCategoryPageSchema(
  collection: CollectionPageInput,
  itemList?: ItemListInput
): Record<string, any>[] {
  const absUrl = buildAbsoluteUrl(collection.url);
  const name = sanitizeText(collection.name);
  const description = sanitizeText(collection.description);

  const collectionSchema: Record<string, any> = {
    "@type": "CollectionPage",
    "@id": collection.id || `${absUrl}/#collectionpage`,
    url: absUrl,
    name,
    description,
    numberOfItems: collection.numberOfItems || itemList?.itemListElement?.length || 0,
    isPartOf: {
      "@type": "WebSite",
      "@id": SEO_CONFIG.ids.website,
    },
    publisher: {
      "@type": "Organization",
      "@id": SEO_CONFIG.ids.organization,
    },
  };

  const schemas: Record<string, any>[] = [collectionSchema];

  if (itemList && itemList.itemListElement && itemList.itemListElement.length > 0) {
    schemas.push({
      "@type": "ItemList",
      "@id": itemList.id || `${absUrl}/#itemlist`,
      name: sanitizeText(itemList.name || `${name} Products`),
      description: sanitizeText(itemList.description || `Collection of ${name} at TKraft`),
      numberOfItems: itemList.itemListElement.length,
      itemListElement: itemList.itemListElement.map((item, idx) => ({
        "@type": "ListItem",
        position: item.position || idx + 1,
        name: sanitizeText(item.name),
        url: buildAbsoluteUrl(item.url),
        image: item.image ? buildAbsoluteUrl(item.image) : undefined,
      })),
    });
  }

  return schemas;
}

export function CategorySchema({ collection, itemList }: CategorySchemaProps) {
  return (
    <SchemaScript
      schema={buildCategoryPageSchema(collection, itemList)}
      id="category-schema"
    />
  );
}
