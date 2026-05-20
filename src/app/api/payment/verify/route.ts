import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrder, getOrder } from "@/services/woocommerce";
import { triggerN8NOrderWebhook } from "@/services/n8n";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
    } = await request.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

    // 1. Verify Signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.warn("[Payment Verification] Signature verification failed!");
      return NextResponse.json(
        { error: "Invalid signature. Payment could not be verified." },
        { status: 400 }
      );
    }

    console.log(`[Payment Verification] Verified payment for order ${orderId}`);

    // 2. Update WooCommerce Order
    let order;
    try {
      order = await updateOrder(parseInt(orderId, 10), {
        status: "processing",
        transaction_id: razorpay_payment_id,
        set_paid: true,
      });
    } catch (wooError) {
      console.error("[Payment Verification] Failed to update WooCommerce order status:", wooError);
      // Fallback: Try to fetch the order anyway
      order = await getOrder(parseInt(orderId, 10)).catch(() => null);
    }

    // 3. Trigger n8n Webhook for paid order
    if (order) {
      console.log(`[Payment Verification] Triggering n8n webhook for order ${order.id}`);
      await triggerN8NOrderWebhook(order, "order_paid");
    } else {
      console.warn(`[Payment Verification] Could not trigger n8n webhook: Order ${orderId} not found.`);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("[Payment Verification API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
