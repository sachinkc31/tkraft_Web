import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/services/woocommerce";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await getOrder(orderId);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error(`[API/orders/id] Error retrieving order:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve order" },
      { status: 500 }
    );
  }
}
