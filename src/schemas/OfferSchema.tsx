// ============================================
// TKraft - Standalone Offer Schema Component
// ============================================

import React from "react";
import type { OfferInput, ShippingDetailsInput, MerchantReturnPolicyInput } from "./types";
import { buildProductOffer } from "./utils";
import { SchemaScript } from "./SchemaScript";

interface OfferSchemaProps {
  offer: OfferInput;
  shippingDetails?: ShippingDetailsInput;
  returnPolicy?: MerchantReturnPolicyInput;
}

export function OfferSchema({ offer, shippingDetails, returnPolicy }: OfferSchemaProps) {
  return (
    <SchemaScript
      schema={buildProductOffer(offer, shippingDetails, returnPolicy)}
      id="offer-schema"
    />
  );
}
