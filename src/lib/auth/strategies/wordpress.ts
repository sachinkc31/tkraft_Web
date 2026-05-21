import type { IAuthService, AuthSession, OtpResponse } from "../types";
import type { Customer } from "@/types";
import crypto from "crypto";

export class WordPressAuthService implements IAuthService {
  private getWooCommerceAuth(): string {
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
    return Buffer.from(`${key}:${secret}`).toString("base64");
  }

  async loginWithCredentials(username: string, password: string): Promise<AuthSession> {
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
      throw new Error(errorData.message || "Invalid credentials");
    }

    const authData = await authResponse.json();
    const token = authData.token;
    const email = authData.user_email;

    // 2. Fetch Customer Details from WooCommerce
    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const auth = this.getWooCommerceAuth();

    const customerResponse = await fetch(`${wooUrl}/customers?email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    let customer: Customer | null = null;
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
        avatar_url: "",
        billing: {
          first_name: authData.user_display_name || username,
          last_name: "",
          company: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "IN",
          email: email,
          phone: "",
        },
        shipping: {
          first_name: authData.user_display_name || username,
          last_name: "",
          company: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "IN",
        },
      };
    }

    return {
      token,
      user: customer,
    };
  }

  async sendMobileOtp(phone: string): Promise<OtpResponse> {
    // Sandbox / Test Mode: Return success with a mock warning or instruction
    // In production: Connect to Twilio, MSG91, or Fast2SMS here
    const mockOtp = "123456"; 

    return {
      success: true,
      message: `OTP sent successfully. (Use code: ${mockOtp} for sandbox verification)`,
    };
  }

  async verifyMobileOtp(phone: string, otp: string): Promise<AuthSession> {
    // 1. Verify OTP (mock verification '123456')
    if (otp !== "123456") {
      throw new Error("Invalid OTP code. Please try again.");
    }

    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const auth = this.getWooCommerceAuth();

    // 2. Search for existing WooCommerce customer by phone
    console.log(`[WordPress Auth Verify] Checking customer database for phone: ${phone}`);
    const searchResponse = await fetch(`${wooUrl}/customers?search=${phone}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    let customer: Customer | null = null;
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
      console.log(`[WordPress Auth Verify] Creating new WooCommerce customer for phone: ${phone}`);
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
      console.log(`[WordPress Auth Verify] Customer account created. ID: ${customer?.id}`);
    } else {
      console.log(`[WordPress Auth Verify] Existing customer logged in. ID: ${customer.id}`);
    }

    if (!customer) {
      throw new Error("Failed to resolve WooCommerce customer profile");
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

    return {
      token,
      user: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name || "Mobile User",
        last_name: customer.last_name || "",
        avatar_url: customer.avatar_url || "",
        billing: customer.billing,
        shipping: customer.shipping,
      },
    };
  }
}
