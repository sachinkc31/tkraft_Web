import { NextRequest, NextResponse } from "next/server";
import { getProductVariations, getProductBySlug } from "@/services/woocommerce";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const variations = await getProductVariations(product.id);
    return NextResponse.json(variations);
  } catch (error) {
    console.error("[API/products/slug/variations] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch variations" },
      { status: 500 }
    );
  }
}
