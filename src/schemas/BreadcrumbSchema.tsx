// ============================================
// TKraft - BreadcrumbList Schema Component
// ============================================

import React from "react";
import type { BreadcrumbListInput } from "./types";
import { buildBreadcrumb } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface BreadcrumbSchemaProps {
  data: BreadcrumbListInput;
}

export function buildBreadcrumbSchema(data: BreadcrumbListInput): Record<string, any> {
  const schema = buildBreadcrumb(data.items);
  if (data.id) {
    schema["@id"] = data.id;
  }
  return schema;
}

export function BreadcrumbSchema({ data }: BreadcrumbSchemaProps) {
  return <SchemaScript schema={buildBreadcrumbSchema(data)} id="breadcrumb-schema" />;
}
