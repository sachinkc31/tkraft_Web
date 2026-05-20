import { algoliasearch } from "algoliasearch";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || "";
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "tkraft_products";

// Initialize search client if credentials are provided
export const client = appId && searchKey ? algoliasearch(appId, searchKey) : null;

export interface SearchProductResult {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  image: string;
  categories: string[];
}

export interface SearchResponse {
  products: SearchProductResult[];
  categories: { name: string; slug: string }[];
}

/**
 * Searches products either via Algolia or via the local API fallback.
 */
export async function searchStoreProducts(query: string): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { products: [], categories: [] };
  }

  // 1. Algolia Active Path
  if (client) {
    try {
      const response = await client.search({
        requests: [
          {
            indexName: indexName,
            query: trimmed,
            hitsPerPage: 8,
          },
        ],
      });

      const result = response.results[0];
      const hits = (result && "hits" in result ? result.hits : []) as any[];

      const products: SearchProductResult[] = hits.map((hit) => ({
        id: hit.id || Number(hit.objectID),
        name: hit.name || "",
        slug: hit.slug || "",
        price: hit.price || "",
        regular_price: hit.regular_price || "",
        sale_price: hit.sale_price || "",
        image: hit.image || "",
        categories: hit.categories || [],
      }));

      // Gather distinct category structures from hits to offer dynamic category shortcuts
      const categoryMap = new Map<string, string>();
      hits.forEach((hit) => {
        if (hit.categories && Array.isArray(hit.categories)) {
          hit.categories.forEach((cat: any) => {
            const name = typeof cat === "string" ? cat : cat.name;
            const slug = typeof cat === "string" ? cat.toLowerCase().replace(/\s+/g, "-") : cat.slug;
            if (name && slug) {
              categoryMap.set(name, slug);
            }
          });
        }
      });

      const categories = Array.from(categoryMap.entries()).map(([name, slug]) => ({
        name,
        slug,
      })).slice(0, 4);

      return { products, categories };
    } catch (err) {
      console.warn("[Algolia Search] Error, falling back to local search api:", err);
    }
  }

  // 2. Local WooCommerce API Fallback Path
  try {
    const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&per_page=8`);
    if (!res.ok) throw new Error(`Fallback HTTP error: ${res.status}`);
    const body = await res.json();
    const data = body.data || [];

    const products: SearchProductResult[] = data.map((prod: any) => ({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      price: prod.price,
      regular_price: prod.regular_price,
      sale_price: prod.sale_price,
      image: prod.images?.[0]?.src || "",
      categories: prod.categories?.map((c: any) => c.name) || [],
    }));

    const categoryMap = new Map<string, string>();
    data.forEach((prod: any) => {
      if (prod.categories && Array.isArray(prod.categories)) {
        prod.categories.forEach((cat: any) => {
          if (cat.name && cat.slug) {
            categoryMap.set(cat.name, cat.slug);
          }
        });
      }
    });

    const categories = Array.from(categoryMap.entries()).map(([name, slug]) => ({
      name,
      slug,
    })).slice(0, 4);

    return { products, categories };
  } catch (err) {
    console.error("[Search Fallback] Error querying local products API:", err);
    return { products: [], categories: [] };
  }
}
