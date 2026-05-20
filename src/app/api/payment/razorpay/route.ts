import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId } = await request.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: "Amount and orderId are required" },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured" },
        { status: 500 }
      );
    }

    // Razorpay amount is in paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: String(orderId),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Razorpay API error:", errorText);
      return NextResponse.json(
        { error: "Failed to create order with Razorpay" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    console.error("[Razorpay Order API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
