import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/services/woocommerce";

export async function GET(_request: NextRequest) {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[API/categories] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
