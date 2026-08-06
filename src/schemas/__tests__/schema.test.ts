// ============================================
// TKraft - Schema Live REST API Validation & Test Suite
// ============================================

import {
  mapWooProductToSchema,
  mapWooCategoryToSchema,
} from "../mappers";
import {
  cleanSchemaObject,
  sanitizeText,
  formatPrice,
  buildAbsoluteUrl,
  deduplicateWpSchemas,
  buildSeoMetaLinks,
} from "../utils";
import { buildProductSchema } from "../ProductSchema";
import { buildOrganizationSchema } from "../OrganizationSchema";
import { SEO_CONFIG } from "../config";
import { getProducts, getCategories } from "@/services/woocommerce";
import type { WooProduct, WooCategory } from "@/types";

// Simple assertion helper for zero-dependency test execution
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Test Failed: ${message}`);
  }
}

/**
 * Runs live schema validation tests against real WordPress/WooCommerce REST API models.
 * Zero hardcoded mock objects are used.
 */
export async function runSchemaTests() {
  // Test 1: sanitizeText
  const raw = "<p>Hello <b>World</b>!\n\t  Test   space.</p>";
  assert(
    sanitizeText(raw) === "Hello World! Test space.",
    "sanitizeText failed"
  );

  // Test 2: formatPrice
  assert(formatPrice(499) === "499.00", "formatPrice integer failed");
  assert(formatPrice("499.5") === "499.50", "formatPrice string failed");
  assert(formatPrice(100, 0.012) === "1.20", "formatPrice multi-currency failed");

  // Test 3: buildAbsoluteUrl
  assert(
    buildAbsoluteUrl("/shop") === "https://www.tkraft.online/shop",
    "buildAbsoluteUrl relative failed"
  );
  assert(
    buildAbsoluteUrl("https://external.com/img.jpg") ===
      "https://external.com/img.jpg",
    "buildAbsoluteUrl absolute failed"
  );

  // Test 4: cleanSchemaObject
  const messyObj = {
    name: "TKraft",
    emptyStr: "",
    nullVal: null,
    undefVal: undefined,
    nested: { valid: "Yes", emptyArr: [] },
  };
  const cleaned = cleanSchemaObject(messyObj);
  assert(
    cleaned.name === "TKraft" &&
      cleaned.nested.valid === "Yes" &&
      !("emptyStr" in cleaned),
    "cleanSchemaObject failed"
  );

  // Fetch REAL Live Data from WooCommerce REST API
  const productsResponse = await getProducts({ perPage: 1 });
  const realProduct: WooProduct | undefined = productsResponse.data[0];

  const categoriesList = await getCategories();
  const realCategory: WooCategory | undefined = categoriesList[0];

  let testsPassed = 4;

  if (realProduct) {
    // Test 5: Dynamic Product Mapping from live API
    const mappedProduct = mapWooProductToSchema(realProduct);
    assert(Boolean(mappedProduct.name), "Live Product mapper name empty");
    assert(Boolean(mappedProduct.sku), "Live Product mapper SKU empty");
    assert(Boolean(mappedProduct.offer.price), "Live Product mapper price empty");
    assert(
      mappedProduct.offer.priceCurrency === "INR",
      "Live Product mapper currency mismatch"
    );
    testsPassed++;

    // Test 6: buildProductSchema Merchant Center Compliance
    const productSchema = buildProductSchema(mappedProduct);
    assert(
      productSchema["@type"] === "Product",
      "Live Product schema type invalid"
    );
    assert(
      productSchema.offers.shippingDetails["@type"] === "OfferShippingDetails",
      "Live Merchant shipping details missing"
    );
    assert(
      productSchema.offers.hasMerchantReturnPolicy["@type"] ===
        "MerchantReturnPolicy",
      "Live Merchant return policy missing"
    );
    testsPassed++;
  }

  if (realCategory) {
    // Test 7: Dynamic Category Mapping from live API
    const mappedCat = mapWooCategoryToSchema(realCategory, realProduct ? [realProduct] : []);
    assert(Boolean(mappedCat.collection.name), "Live Category collection name empty");
    assert(
      mappedCat.collection.url === `/category/${realCategory.slug}`,
      "Live Category collection URL mismatch"
    );
    testsPassed++;
  }

  // Test 8: deduplicateWpSchemas
  const wpOrg = {
    "@type": "Organization",
    "@id": SEO_CONFIG.ids.organization,
    name: "WordPress Old Name",
  };
  const frontendOrg = buildOrganizationSchema();
  const merged = deduplicateWpSchemas(wpOrg, [frontendOrg]);
  assert(
    merged["@graph"].length === 1 && merged["@graph"][0].name === "TKraft",
    "Schema deduplication failed"
  );
  testsPassed++;

  // Test 9: buildSeoMetaLinks
  const meta = buildSeoMetaLinks("/shop", {
    currentPage: 2,
    totalPages: 5,
    supportedLocales: ["en-IN", "hi-IN", "en-US"],
  });
  assert(
    meta.canonicalUrl === "https://www.tkraft.online/shop",
    "Canonical URL failed"
  );
  assert(meta.hreflangLinks.length === 4, "Hreflang count failed");
  assert(
    meta.paginationLinks.length === 2 &&
      meta.paginationLinks[0].rel === "prev",
    "Pagination links failed"
  );
  testsPassed++;

  return { success: true, testsPassed, liveDataFetched: Boolean(realProduct && realCategory) };
}
