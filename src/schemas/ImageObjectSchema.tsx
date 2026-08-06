// ============================================
// TKraft - ImageObject Schema Component
// ============================================

import React from "react";
import type { ImageObjectInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface ImageObjectSchemaProps {
  data: ImageObjectInput;
}

export function buildImageObjectSchema(data: ImageObjectInput): Record<string, any> {
  const url = buildAbsoluteUrl(data.url);
  return {
    "@type": "ImageObject",
    "@id": data.id || `${url}/#image`,
    contentUrl: url,
    url,
    caption: data.caption ? sanitizeText(data.caption) : undefined,
    width: data.width,
    height: data.height,
  };
}

export function ImageObjectSchema({ data }: ImageObjectSchemaProps) {
  return <SchemaScript schema={buildImageObjectSchema(data)} id="image-object-schema" />;
}
