import { NextRequest, NextResponse } from "next/server";
import { algoliasearch } from "algoliasearch";

export async function POST(request: NextRequest) {
  try {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
    const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "tkraft_products";

    if (!appId || !adminKey) {
      return NextResponse.json(
        { error: "Algolia keys not configured on server" },
        { status: 500 }
      );
    }

    const client = algoliasearch(appId, adminKey);
    const body = await request.json().catch(() => ({}));

    // Case 1: Webhook deletion or trash action
    if (body.action === "delete" || body.status === "trash" || body.status === "draft") {
      const targetId = body.id || body.productId;
      if (!targetId) {
        return NextResponse.json({ error: "Missing product ID for deletion" }, { status: 400 });
      }

      console.log(`[Algolia Webhook Sync] Deleting product #${targetId} from index...`);
      await client.deleteObject({
        indexName,
        objectID: String(targetId),
      });

      return NextResponse.json({ success: true, message: `Product #${targetId} removed from index.` });
    }

    // Case 2: WooCommerce Product Webhook (create / update sends the full product payload)
    if (body.id && body.name && body.slug) {
      console.log(`[Algolia Webhook Sync] Updating product #${body.id} in index...`);
      
      const record = {
        objectID: String(body.id),
        id: body.id,
        name: body.name,
        slug: body.slug,
        price: body.price,
        regular_price: body.regular_price,
        sale_price: body.sale_price,
        image: body.images?.[0]?.src || "",
        categories: body.categories?.map((c: any) => c.name) || [],
        tags: body.tags?.map((t: any) => t.name) || [],
        sku: body.sku || "",
        description: body.description || "",
        short_description: body.short_description || "",
        stock_status: body.stock_status || "instock",
      };

      await client.saveObject({
        indexName,
        body: record,
      });

      return NextResponse.json({ success: true, message: `Product #${body.id} updated in index.` });
    }

    // Case 3: Trigger full sync in background or manually
    if (body.action === "full_sync" || Object.keys(body).length === 0) {
      console.log("[Algolia Sync API] Triggering full product synchronization...");
      
      const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
      const wooKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
      const wooSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
      const auth = Buffer.from(`${wooKey}:${wooSecret}`).toString("base64");

      let products = [];
      let page = 1;
      let fetchMore = true;

      while (fetchMore) {
        const response = await fetch(`${wooUrl}/products?page=${page}&per_page=100&status=publish`, {
          headers: { Authorization: `Basic ${auth}` },
        });

        if (!response.ok) throw new Error(`WooCommerce API Error: ${response.status}`);
        
        const data = await response.json();
        if (data && data.length > 0) {
          products.push(...data);
          fetchMore = data.length === 100;
          page++;
        } else {
          fetchMore = false;
        }
      }

      const records = products.map((prod) => ({
        objectID: String(prod.id),
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        regular_price: prod.regular_price,
        sale_price: prod.sale_price,
        image: prod.images?.[0]?.src || "",
        categories: prod.categories?.map((c: any) => c.name) || [],
        tags: prod.tags?.map((t: any) => t.name) || [],
        sku: prod.sku || "",
        description: prod.description || "",
        short_description: prod.short_description || "",
        stock_status: prod.stock_status || "instock",
      }));

      await client.saveObjects({
        indexName,
        objects: records,
      });

      return NextResponse.json({ success: true, count: records.length, message: "Full index sync completed." });
    }

    return NextResponse.json({ error: "Invalid webhook payload format" }, { status: 400 });
  } catch (error: any) {
    console.error("[Algolia Sync API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process search sync" },
      { status: 500 }
    );
  }
}
