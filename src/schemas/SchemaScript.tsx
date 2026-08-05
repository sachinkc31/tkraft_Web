// ============================================
// TKraft - Master SchemaScript Component
// ============================================

import React from "react";
import { cleanSchemaObject, mergeSchema } from "./utils";

interface SchemaScriptProps {
  schema: Record<string, any> | Array<Record<string, any>>;
  id?: string;
}

export function SchemaScript({ schema, id }: SchemaScriptProps) {
  if (!schema) return null;

  let finalJson: Record<string, any>;

  if (Array.isArray(schema)) {
    finalJson = mergeSchema(...schema);
  } else if (schema["@graph"] && Array.isArray(schema["@graph"])) {
    finalJson = mergeSchema(schema);
  } else {
    const cleaned = cleanSchemaObject(schema);
    if (!cleaned) return null;
    finalJson = {
      "@context": "https://schema.org",
      ...cleaned,
    };
  }

  if (
    !finalJson ||
    (finalJson["@graph"] && finalJson["@graph"].length === 0) ||
    Object.keys(finalJson).length <= 1
  ) {
    return null;
  }

  return (
    <script
      id={id || "tkraft-jsonld-schema"}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(finalJson) }}
    />
  );
}
