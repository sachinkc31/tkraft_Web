import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/services/woocommerce";
import { triggerN8NOrderWebhook } from "@/services/n8n";
import { sendPendingPaymentEmail } from "@/services/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Set initial status: COD starts as processing, Online starts as pending
    if (body.payment_method === "cod") {
      body.status = "processing";
    } else {
      body.status = "pending";
    }

    const order = await createOrder(body);

    if (body.payment_method === "cod") {
      // For COD, trigger the n8n webhook immediately
      await triggerN8NOrderWebhook(order, "order_placed");
    } else {
      // For Online payment, trigger pending event and email notification
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const paymentLink = `${siteUrl}/checkout/pay?orderId=${order.id}`;
      
      // Dispatch both webhook and email notification in the background
      Promise.all([
        triggerN8NOrderWebhook(order, "order_pending").catch((err) =>
          console.error("N8N Pending order webhook failed:", err)
        ),
        sendPendingPaymentEmail(order, paymentLink).catch((err) =>
          console.error("Pending payment email failed:", err)
        ),
      ]);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("[API/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
