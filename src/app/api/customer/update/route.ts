import { NextRequest, NextResponse } from "next/server";
import { updateCustomer, createCustomer } from "@/services/woocommerce";

export async function POST(request: NextRequest) {
  try {
    const { customerId, customerData } = await request.json();

    if (customerId === undefined || !customerData) {
      return NextResponse.json(
        { error: "customerId and customerData are required" },
        { status: 400 }
      );
    }

    let updatedCustomer;
    const numericId = typeof customerId === "string" ? parseInt(customerId, 10) : customerId;

    if (numericId === 0 || isNaN(numericId)) {
      const email = customerData.email;
      if (email) {
        // Query WooCommerce to see if a customer with this email already exists
        const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || "https://tkraft.online/wp-json/wc/v3";
        const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
        const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
        const auth = Buffer.from(`${key}:${secret}`).toString("base64");
        
        try {
          const checkRes = await fetch(`${wooUrl}/customers?email=${encodeURIComponent(email)}`, {
            headers: { Authorization: `Basic ${auth}` }
          });
          
          if (checkRes.ok) {
            const existing = await checkRes.json();
            if (existing && existing.length > 0) {
              const existingId = existing[0].id;
              console.log(`[API/customer/update] Customer with email ${email} already exists with ID ${existingId}. Updating instead of creating.`);
              updatedCustomer = await updateCustomer(existingId, customerData);
            }
          }
        } catch (checkErr) {
          console.error("[API/customer/update] Failed to check existing customer by email:", checkErr);
        }
      }
      
      // If we didn't find them or update succeeded, fallback to create
      if (!updatedCustomer) {
        const createEmail = email || `customer_${Date.now()}@tkraft.online`;
        const createPayload = {
          email: createEmail,
          first_name: customerData.first_name || "Customer",
          last_name: customerData.last_name || "",
          billing: customerData.billing || { first_name: customerData.first_name || "Customer", email: createEmail },
          shipping: customerData.shipping || { first_name: customerData.first_name || "Customer" },
          meta_data: customerData.meta_data || [],
        };
        updatedCustomer = await createCustomer(createPayload);
      }
    } else {
      updatedCustomer = await updateCustomer(numericId, customerData);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        first_name: updatedCustomer.first_name || "Mobile User",
        last_name: updatedCustomer.last_name || "",
        billing: updatedCustomer.billing,
        shipping: updatedCustomer.shipping,
        meta_data: updatedCustomer.meta_data,
      }
    });
  } catch (error: any) {
    console.error("[API/customer/update] Error:", error);
    return NextResponse.json(
      { error: `Failed to update customer profile: ${error.message || error}` },
      { status: 500 }
    );
  }
}
