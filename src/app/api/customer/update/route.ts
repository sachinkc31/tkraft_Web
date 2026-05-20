import { NextRequest, NextResponse } from "next/server";
import { updateCustomer } from "@/services/woocommerce";

export async function POST(request: NextRequest) {
  try {
    const { customerId, customerData } = await request.json();

    if (!customerId || !customerData) {
      return NextResponse.json(
        { error: "customerId and customerData are required" },
        { status: 400 }
      );
    }

    const updatedCustomer = await updateCustomer(parseInt(customerId, 10), customerData);
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        first_name: updatedCustomer.first_name || "Mobile User",
        last_name: updatedCustomer.last_name || "",
        billing: updatedCustomer.billing,
        shipping: updatedCustomer.shipping,
      }
    });
  } catch (error) {
    console.error("[API/customer/update] Error:", error);
    return NextResponse.json(
      { error: "Failed to update customer profile" },
      { status: 500 }
    );
  }
}
