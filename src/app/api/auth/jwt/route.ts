import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const jwtUrl = process.env.NEXT_PUBLIC_JWT_AUTH_URL || "https://tkraft.in/wp-json/jwt-auth/v1";
    
    // 1. Authenticate with WordPress JWT Auth
    const authResponse = await fetch(`${jwtUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;
    const email = authData.user_email;

    // 2. Fetch Customer Details from WooCommerce
    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");

    const customerResponse = await fetch(`${wooUrl}/customers?email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    let customer = null;
    if (customerResponse.ok) {
      const customers = await customerResponse.json();
      if (customers && customers.length > 0) {
        customer = customers[0];
      }
    }

    // Fallback if WooCommerce customer doesn't exist yet but WordPress user does
    if (!customer) {
      customer = {
        id: 0,
        email: email,
        first_name: authData.user_display_name || username,
        last_name: "",
        billing: {
          first_name: authData.user_display_name || username,
          last_name: "",
          email: email,
          phone: "",
          address_1: "",
          city: "",
          state: "",
          postcode: "",
          country: "IN",
        },
        shipping: {
          first_name: authData.user_display_name || username,
          last_name: "",
          address_1: "",
          city: "",
          state: "",
          postcode: "",
          country: "IN",
        },
      };
    }

    return NextResponse.json({
      token,
      user: customer,
    });
  } catch (error) {
    console.error("[JWT Auth API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
