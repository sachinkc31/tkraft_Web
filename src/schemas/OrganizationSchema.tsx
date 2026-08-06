// ============================================
// TKraft - Organization & LocalBusiness Schema Component
// ============================================

import React from "react";
import { SEO_CONFIG } from "./config";
import type { OrganizationInput } from "./types";
import { buildAbsoluteUrl, sanitizeText } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface OrganizationSchemaProps {
  data?: OrganizationInput;
}

export function buildOrganizationSchema(data?: OrganizationInput): Record<string, any> {
  const name = sanitizeText(data?.name || SEO_CONFIG.brand);
  const legalName = sanitizeText(data?.legalName || SEO_CONFIG.legalName);
  const url = buildAbsoluteUrl(data?.url || SEO_CONFIG.siteUrl);
  const logo = buildAbsoluteUrl(data?.logo || SEO_CONFIG.logo);
  const description = sanitizeText(data?.description || SEO_CONFIG.description);
  const sameAs = data?.sameAs || [...SEO_CONFIG.socialLinks];

  return {
    "@type": "Organization",
    "@id": data?.id || SEO_CONFIG.ids.organization,
    name,
    legalName,
    url,
    logo: {
      "@type": "ImageObject",
      "@id": `${url}/#logo`,
      url: logo,
      caption: name,
    },
    image: logo,
    description,
    foundingDate: data?.foundingDate || SEO_CONFIG.foundingDate,
    email: data?.email || SEO_CONFIG.contact.email,
    telephone: data?.telephone || SEO_CONFIG.contact.telephone,
    sameAs,
    areaServed: {
      "@type": "Country",
      name: "India",
      identifier: SEO_CONFIG.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: data?.contactPoint?.email || SEO_CONFIG.contact.email,
      telephone: data?.contactPoint?.telephone || SEO_CONFIG.contact.telephone,
      contactType: data?.contactPoint?.contactType || SEO_CONFIG.contact.contactType,
      availableLanguage: data?.contactPoint?.availableLanguage || [...SEO_CONFIG.contact.availableLanguage],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: data?.address?.addressCountry || SEO_CONFIG.country,
      addressRegion: data?.address?.addressRegion || "Maharashtra",
      addressLocality: data?.address?.addressLocality || "Mumbai",
    },
    knowsAbout: data?.knowsAbout || [...SEO_CONFIG.knowsAbout],
    keywords: data?.keywords?.join(", "),
  };
}

export function OrganizationSchema({ data }: OrganizationSchemaProps) {
  return <SchemaScript schema={buildOrganizationSchema(data)} id="organization-schema" />;
}
