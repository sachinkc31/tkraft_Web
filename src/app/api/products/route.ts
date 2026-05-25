// ============================================
// Next.js Route Handlers — Internal API Layer
// These sit between the frontend and WooCommerce,
// allowing server-side auth header injection so
// WooCommerce secrets never reach the browser.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  getFeaturedProducts,
  getOnSaleProducts,
  getNewArrivals,
} from "@/services/woocommerce";
import type { SortOption } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("per_page") || 12);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = (searchParams.get("sort") as SortOption) || "default";
    const featured = searchParams.get("featured") === "true";
    const onSale = searchParams.get("on_sale") === "true";
    const minPrice = searchParams.get("min_price")
      ? Number(searchParams.get("min_price"))
      : undefined;
        const maxPrice = searchParams.get("max_price")
      ? Number(searchParams.get("max_price"))
      : undefined;
    const stockStatus = searchParams.get("stock_status") || undefined;
    const includeStr = searchParams.get("include");
    const include = includeStr ? includeStr.split(",").map(Number) : undefined;

    // Handle special collection shortcuts
    if (featured) {
      const products = await getFeaturedProducts(perPage);
      return NextResponse.json({ data: products, total: products.length, totalPages: 1, currentPage: 1 });
    }

    if (onSale) {
      const products = await getOnSaleProducts(perPage);
      return NextResponse.json({ data: products, total: products.length, totalPages: 1, currentPage: 1 });
    }

    if (sort === "date" && !category && !search) {
      const products = await getNewArrivals(perPage);
      return NextResponse.json({ data: products, total: products.length, totalPages: 1, currentPage: 1 });
    }

    const result = await getProducts({
      page,
      perPage,
      category,
      search,
      sortBy: sort,
      minPrice,
      maxPrice,
      stockStatus,
      include,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API/products] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
