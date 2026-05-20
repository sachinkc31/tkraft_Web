const fs = require("fs");
const path = require("path");
const { algoliasearch } = require("algoliasearch");

// ---- Load Environment Variables ----
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
      process.env[key] = value;
    }
  });
}

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "tkraft_products";

const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const wooKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const wooSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

async function sync() {
  console.log("==============================================");
  console.log("   TKRAFT ALGOLIA PRODUCTS INDEX SYNC");
  console.log("==============================================\n");

  if (!appId || !adminKey) {
    console.error("❌ Error: NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY must be set in .env.local");
    process.exit(1);
  }

  if (!wooUrl || !wooKey || !wooSecret) {
    console.error("❌ Error: WooCommerce credentials are not configured in .env.local");
    process.exit(1);
  }

  // Initialize Algolia Client
  console.log("Initializing Algolia Admin Client...");
  const client = algoliasearch(appId, adminKey);

  // 1. Fetch products from WooCommerce
  console.log("Fetching products from WooCommerce API...");
  const auth = Buffer.from(`${wooKey}:${wooSecret}`).toString("base64");
  let products = [];
  let page = 1;
  let fetchMore = true;

  while (fetchMore) {
    try {
      console.log(` -> Fetching page ${page}...`);
      const response = await fetch(`${wooUrl}/products?page=${page}&per_page=100&status=publish`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        products.push(...data);
        fetchMore = data.length === 100;
        page++;
      } else {
        fetchMore = false;
      }
    } catch (err) {
      console.error(`❌ Error fetching WooCommerce products page ${page}:`, err.message);
      fetchMore = false;
    }
  }

  console.log(`✅ Retrieved ${products.length} products total.`);

  if (products.length === 0) {
    console.log("No products to sync. Exiting.");
    return;
  }

  // 2. Format products for Algolia Indexing
  console.log("Formatting records for indexing...");
  const records = products.map((prod) => ({
    objectID: String(prod.id),
    id: prod.id,
    name: prod.name,
    slug: prod.slug,
    price: prod.price,
    regular_price: prod.regular_price,
    sale_price: prod.sale_price,
    image: prod.images?.[0]?.src || "",
    categories: prod.categories?.map((c) => c.name) || [],
    tags: prod.tags?.map((t) => t.name) || [],
    sku: prod.sku || "",
    description: prod.description || "",
    short_description: prod.short_description || "",
    stock_status: prod.stock_status || "instock",
  }));

  // 3. Batch upload records to Algolia
  try {
    console.log(`Saving ${records.length} records to Algolia index '${indexName}'...`);
    
    // Save objects
    const saveRes = await client.saveObjects({
      indexName: indexName,
      objects: records,
    });
    console.log("✅ Products synced successfully.");

    // 4. Configure Index Search Settings
    console.log("Applying index configurations and rankings...");
    await client.setSettings({
      indexName: indexName,
      indexSettings: {
        searchableAttributes: [
          "name",
          "categories",
          "tags",
          "sku",
          "short_description",
          "description",
        ],
        attributesForFaceting: [
          "filterOnly(categories)",
          "filterOnly(stock_status)",
        ],
        customRanking: [
          "desc(stock_status)", // In stock products first
        ],
        highlightPreTag: "<mark className='bg-[hsl(47,95%,80%)] text-[hsl(222,47%,11%)] rounded-sm px-0.5'>",
        highlightPostTag: "</mark>",
      },
    });

    console.log("✅ Index settings applied successfully.");
    console.log("\nSync complete! 🎉");
  } catch (err) {
    console.error("❌ Algolia Indexing Error:", err.message);
  }
}

sync();
