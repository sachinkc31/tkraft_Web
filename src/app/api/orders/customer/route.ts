import { NextRequest, NextResponse } from "next/server";
import { getCustomerOrders } from "@/services/woocommerce";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId query parameter is required" },
        { status: 400 }
      );
    }

    const orders = await getCustomerOrders(parseInt(customerId, 10));
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[API/orders/customer] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders" },
      { status: 500 }
    );
  }
}
