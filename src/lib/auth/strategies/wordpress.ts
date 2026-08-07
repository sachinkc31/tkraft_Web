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
    const jwtUrl = process.env.NEXT_PUBLIC_JWT_AUTH_URL || "https://tkraft.online/wp-json/jwt-auth/v1";
    
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
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (accountSid && authToken && serviceSid) {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      try {
        const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formattedPhone,
            Channel: "sms",
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Twilio failed to send verification code");
        }

        return {
          success: true,
          message: "OTP verification code sent to your mobile phone.",
        };
      } catch (error: any) {
        console.error("[WordPress Auth] Twilio OTP send error:", error);
        throw new Error(error.message || "Failed to send OTP via Twilio");
      }
    }

    // Sandbox / Test Mode: Return success with a mock warning or instruction
    const mockOtp = "123456"; 
    return {
      success: true,
      message: `OTP sent successfully. (Use code: ${mockOtp} for sandbox verification)`,
    };
  }

  async verifyMobileOtp(phone: string, otp: string): Promise<AuthSession> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (accountSid && authToken && serviceSid) {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      try {
        const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formattedPhone,
            Code: otp,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Twilio verification failed");
        }

        const data = await res.json();
        if (data.status !== "approved") {
          throw new Error("Invalid OTP code. Please try again.");
        }
      } catch (error: any) {
        console.error("[WordPress Auth] Twilio OTP verification error:", error);
        throw new Error(error.message || "Invalid OTP code. Please try again.");
      }
    } else {
      // 1. Verify OTP (mock verification '123456')
      if (otp !== "123456") {
        throw new Error("Invalid OTP code. Please try again.");
      }
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
          c.email === `${phone}@tkraft.online`
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
          email: `${phone}@tkraft.online`,
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

    const jwtSecret = process.env.JWT_AUTH_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET || "default_auth_secret_key";
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
        meta_data: customer.meta_data,
      },
    };
  }

  async loginOrRegisterSocial(email: string, firstName: string, lastName: string, avatarUrl?: string): Promise<AuthSession> {
    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const auth = this.getWooCommerceAuth();

    console.log(`[WordPress Auth Social] Checking customer database for email: ${email}`);
    const searchResponse = await fetch(`${wooUrl}/customers?email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    let customer: any = null;
    if (searchResponse.ok) {
      const customers = await searchResponse.json();
      if (customers && customers.length > 0) {
        customer = customers[0];
      }
    }

    if (!customer) {
      console.log(`[WordPress Auth Social] Creating new WooCommerce customer for email: ${email}`);
      const createResponse = await fetch(`${wooUrl}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          username: email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl || "",
          billing: {
            first_name: firstName,
            last_name: lastName,
            email: email,
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
        console.error("WooCommerce customer social creation failed:", errText);
        throw new Error("Failed to register social customer profile");
      }

      customer = await createResponse.json();
      console.log(`[WordPress Auth Social] Customer account created. ID: ${customer?.id}`);
    } else {
      console.log(`[WordPress Auth Social] Existing customer logged in. ID: ${customer.id}`);
    }

    if (!customer) {
      throw new Error("Failed to resolve WooCommerce customer profile");
    }

    const payload = JSON.stringify({
      id: customer.id,
      email: customer.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    });

    const jwtSecret = process.env.JWT_AUTH_SECRET_KEY || process.env.RAZORPAY_KEY_SECRET || "default_auth_secret_key";
    const hmac = crypto.createHmac("sha256", jwtSecret).update(payload).digest("base64");
    const token = `${Buffer.from(payload).toString("base64")}.${hmac}`;

    return {
      token,
      user: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name || firstName,
        last_name: customer.last_name || lastName,
        avatar_url: customer.avatar_url || avatarUrl || "",
        billing: customer.billing,
        shipping: customer.shipping,
        meta_data: customer.meta_data,
      },
    };
  }
}
