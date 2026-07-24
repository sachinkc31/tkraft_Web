import type { IAuthService, AuthSession, OtpResponse } from "../types";
import type { Customer } from "@/types";

export class SupabaseAuthService implements IAuthService {
  private getSupabaseConfig() {
    const url = process.env.SUPABASE_URL || "https://your-project.supabase.co";
    const anonKey = process.env.SUPABASE_ANON_KEY || "mock-anon-key";
    return { url, anonKey };
  }

  private getWooCommerceAuth(): string {
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
    return Buffer.from(`${key}:${secret}`).toString("base64");
  }

  /**
   * Helper to search or create a WooCommerce customer from a Supabase user.
   */
  private async getOrCreateWooCustomer(supabaseUser: {
    id: string;
    email?: string;
    phone?: string;
    user_metadata?: Record<string, any>;
  }): Promise<Customer> {
    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const auth = this.getWooCommerceAuth();
    const email = supabaseUser.email || `${supabaseUser.phone?.replace("+", "") || supabaseUser.id}@tkraft-supabase.in`;
    const phone = supabaseUser.phone || "";

    console.log(`[Supabase Auth Sync] Checking WooCommerce customer for email: ${email} or phone: ${phone}`);

    // 1. Search WooCommerce by email
    let customerResponse = await fetch(`${wooUrl}/customers?email=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    let customers = customerResponse.ok ? await customerResponse.json() : [];
    let customer = customers && customers.length > 0 ? customers[0] : null;

    // 2. If not found by email and phone is available, search by phone search term
    if (!customer && phone) {
      const cleanedPhone = phone.replace("+91", "").trim();
      customerResponse = await fetch(`${wooUrl}/customers?search=${cleanedPhone}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      customers = customerResponse.ok ? await customerResponse.json() : [];
      customer = customers.find(
        (c: any) =>
          c.billing?.phone === cleanedPhone ||
          c.billing?.phone === phone ||
          c.username === `mobile_${cleanedPhone}`
      );
    }

    // 3. Create on-the-fly if still not found
    if (!customer) {
      const displayName = supabaseUser.user_metadata?.full_name || "Supabase";
      const names = displayName.split(" ");
      const firstName = names[0] || "User";
      const lastName = names.slice(1).join(" ") || "";

      console.log(`[Supabase Auth Sync] Customer not found. Registering in WooCommerce: ${email}`);
      const createResponse = await fetch(`${wooUrl}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          username: `supa_${supabaseUser.id.substring(0, 10)}`,
          first_name: firstName,
          last_name: lastName,
          billing: {
            first_name: firstName,
            last_name: lastName,
            phone: phone.replace("+91", ""), // Store local format for billing
            country: "IN",
          },
          shipping: {
            first_name: firstName,
            last_name: lastName,
            country: "IN",
          },
        }),
      });

      if (!createResponse.ok) {
        const errText = await createResponse.text();
        console.error("WooCommerce sync creation failed:", errText);
        throw new Error("Failed to sync customer profile to ecommerce store");
      }

      customer = await createResponse.json();
    }

    return {
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name || "User",
      last_name: customer.last_name || "",
      avatar_url: customer.avatar_url || "",
      billing: customer.billing,
      shipping: customer.shipping,
    };
  }

  async loginWithCredentials(username: string, password: string): Promise<AuthSession> {
    const { url, anonKey } = this.getSupabaseConfig();

    if (anonKey === "mock-anon-key") {
      console.warn("Supabase credentials not configured. Running mock authentication sandbox.");
      // Fallback sandbox mode for testing compilation without actual Supabase instance
      return {
        token: `mock_supabase_token_${Date.now()}`,
        user: {
          id: 9999,
          email: username.includes("@") ? username : `${username}@tkraft.in`,
          first_name: "Mock Supabase",
          last_name: "User",
          avatar_url: "",
          billing: {
            first_name: "Mock",
            last_name: "User",
            company: "",
            address_1: "123 Supabase Way",
            address_2: "",
            city: "Mumbai",
            state: "MH",
            postcode: "400001",
            country: "IN",
            email: username.includes("@") ? username : `${username}@tkraft.in`,
            phone: "9999999999",
          },
          shipping: {
            first_name: "Mock",
            last_name: "User",
            company: "",
            address_1: "123 Supabase Way",
            address_2: "",
            city: "Mumbai",
            state: "MH",
            postcode: "400001",
            country: "IN",
          },
        },
      };
    }

    // Call Supabase Auth API
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username.includes("@") ? username : `${username}@tkraft.in`,
        password: password,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || "Authentication failed via Supabase");
    }

    const data = await response.json();
    const wooCustomer = await this.getOrCreateWooCustomer({
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      user_metadata: data.user.user_metadata,
    });

    return {
      token: data.access_token,
      user: wooCustomer,
    };
  }

  async sendMobileOtp(phone: string): Promise<OtpResponse> {
    const { url, anonKey } = this.getSupabaseConfig();
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    if (anonKey === "mock-anon-key") {
      console.warn("Supabase credentials not configured. Simulating OTP send.");
      return {
        success: true,
        message: "OTP sent successfully. (Supabase Mock Mode: use code 123456 to verify)",
      };
    }

    // Call Supabase Auth OTP Endpoint
    const response = await fetch(`${url}/auth/v1/otp`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: formattedPhone,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || "Failed to trigger OTP via Supabase");
    }

    return {
      success: true,
      message: "Verification OTP code sent to your mobile phone.",
    };
  }

  async verifyMobileOtp(phone: string, otp: string): Promise<AuthSession> {
    const { url, anonKey } = this.getSupabaseConfig();
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    if (anonKey === "mock-anon-key") {
      console.warn("Supabase credentials not configured. Running mock OTP verification.");
      if (otp !== "123456") {
        throw new Error("Invalid OTP code. Please try again.");
      }
      return {
        token: `mock_supabase_otp_token_${Date.now()}`,
        user: {
          id: 9999,
          email: `${phone}@tkraft.in`,
          first_name: "Mock Supabase Mobile",
          last_name: "User",
          avatar_url: "",
          billing: {
            first_name: "Mock",
            last_name: "User",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            postcode: "",
            country: "IN",
            email: `${phone}@tkraft.in`,
            phone: phone,
          },
          shipping: {
            first_name: "Mock",
            last_name: "User",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            postcode: "",
            country: "IN",
          },
        },
      };
    }

    // Call Supabase Auth OTP Verify Endpoint
    const response = await fetch(`${url}/auth/v1/verify`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "sms",
        phone: formattedPhone,
        token: otp,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || "OTP verification failed via Supabase");
    }

    const data = await response.json();
    const wooCustomer = await this.getOrCreateWooCustomer({
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      user_metadata: data.user.user_metadata,
    });

    return {
      token: data.access_token,
      user: wooCustomer,
    };
  }

  async loginOrRegisterSocial(email: string, firstName: string, lastName: string, avatarUrl?: string): Promise<AuthSession> {
    // Basic fallback implementation for Supabase OAuth compilation
    throw new Error("Supabase social login should be initiated via the client SDK signInWithOAuth method directly.");
  }
}
