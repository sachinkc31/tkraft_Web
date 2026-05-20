import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // 1. Verify OTP (mock verification '123456')
    if (otp !== "123456") {
      return NextResponse.json(
        { error: "Invalid OTP code. Please try again." },
        { status: 400 }
      );
    }

    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");

    // 2. Search for existing WooCommerce customer by phone
    console.log(`[Mobile Auth Verify] Checking customer database for phone: ${phone}`);
    const searchResponse = await fetch(`${wooUrl}/customers?search=${phone}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    let customer = null;
    if (searchResponse.ok) {
      const customers = await searchResponse.json();
      // Filter list to find exact phone number match in billing details
      customer = customers.find(
        (c: any) =>
          c.billing?.phone === phone ||
          c.username === `mobile_${phone}` ||
          c.email === `${phone}@tkraft.in`
      );
    }

    // 3. Register user on-the-fly if not found
    if (!customer) {
      console.log(`[Mobile Auth Verify] Creating new WooCommerce customer for phone: ${phone}`);
      const createResponse = await fetch(`${wooUrl}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: `${phone}@tkraft.in`,
          username: `mobile_${phone}`,
          first_name: "Mobile",
          last_name: "User",
          billing: {
            first_name: "Mobile",
            last_name: "User",
            phone: phone,
            country: "IN",
          },
          shipping: {
            first_name: "Mobile",
            last_name: "User",
            country: "IN",
          },
        }),
      });

      if (!createResponse.ok) {
        const errText = await createResponse.text();
        console.error("WooCommerce customer creation failed:", errText);
        throw new Error("Failed to register customer profile");
      }

      customer = await createResponse.json();
      console.log(`[Mobile Auth Verify] Customer account created. ID: ${customer.id}`);
    } else {
      console.log(`[Mobile Auth Verify] Existing customer logged in. ID: ${customer.id}`);
    }

    // 4. Generate local JWT/Session Token
    const payload = JSON.stringify({
      id: customer.id,
      email: customer.email,
      phone: phone,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    });

    const jwtSecret = process.env.RAZORPAY_KEY_SECRET || "default_auth_secret_key";
    const hmac = crypto.createHmac("sha256", jwtSecret).update(payload).digest("base64");
    const token = `${Buffer.from(payload).toString("base64")}.${hmac}`;

    return NextResponse.json({
      token,
      user: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name || "Mobile User",
        last_name: customer.last_name || "",
        billing: customer.billing,
        shipping: customer.shipping,
      },
    });
  } catch (error) {
    console.error("[Mobile Verify API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
