// ============================================
// TKraft - VideoObject Schema Component
// ============================================

import React from "react";
import type { VideoObjectInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface VideoObjectSchemaProps {
  data: VideoObjectInput;
}

export function buildVideoObjectSchema(data: VideoObjectInput): Record<string, any> {
  const name = sanitizeText(data.name);
  const description = sanitizeText(data.description);
  const thumbnailUrl = buildAbsoluteUrl(data.thumbnailUrl);

  return {
    "@type": "VideoObject",
    "@id": data.id || `${thumbnailUrl}/#video`,
    name,
    description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: data.uploadDate,
    contentUrl: data.contentUrl ? buildAbsoluteUrl(data.contentUrl) : undefined,
    embedUrl: data.embedUrl ? buildAbsoluteUrl(data.embedUrl) : undefined,
    duration: data.duration || "PT2M",
  };
}

export function VideoObjectSchema({ data }: VideoObjectSchemaProps) {
  return <SchemaScript schema={buildVideoObjectSchema(data)} id="video-object-schema" />;
}
