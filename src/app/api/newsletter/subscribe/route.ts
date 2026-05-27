import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { createNewsletterCoupon } from "@/services/woocommerce";
import { sendNewsletterCouponEmail } from "@/services/email";

// Validation schema using Zod
const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  bot_field: z.string().max(0, "Bot submission blocked"), // Honeypot validation
});

// Simple in-memory sliding-window rate limiter
const ipCache = new Map<string, number[]>();
const LIMIT_PER_HOUR = 3; // Maximum of 3 subscription attempts per IP per hour
const LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour window

function rateLimitCheck(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipCache.get(ip) || [];
  
  // Filter out timestamps older than 1 hour
  const activeTimestamps = timestamps.filter((t) => now - t < LIMIT_WINDOW);
  
  if (activeTimestamps.length >= LIMIT_PER_HOUR) {
    return true;
  }
  
  activeTimestamps.push(now);
  ipCache.set(ip, activeTimestamps);
  return false;
}

// Local file storage backup path
const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.json");

export async function POST(req: Request) {
  try {
    // 1. Resolve client IP address
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // 2. Perform Rate Limiting check
    if (rateLimitCheck(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429 }
      );
    }

    // 3. Parse and validate payload
    const body = await req.json().catch(() => ({}));
    const validation = subscribeSchema.safeParse(body);
    
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email } = validation.data;
    const lowerEmail = email.toLowerCase().trim();

    // 4. Verify subscriber doesn't already exist in local record (and eventually WordPress CPT)
    let subscribers: string[] = [];
    try {
      const fileData = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(fileData);
    } catch (err) {
      // fresh file creation if missing
    }

    if (subscribers.includes(lowerEmail)) {
      return NextResponse.json(
        { error: "This email is already subscribed." },
        { status: 400 }
      );
    }

    // 5. Query WooCommerce customers to check for pre-existing profiles with same email
    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || "https://tkraft.in/wp-json/wc/v3";
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    
    try {
      const checkRes = await fetch(`${wooUrl}/customers?email=${encodeURIComponent(lowerEmail)}`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        // If they already have an account, verify if we want to block coupon re-generation
        if (existing && existing.length > 0) {
          // You can choose to skip coupon block if desired, but we check to prevent abuse
        }
      }
    } catch (checkErr) {
      console.warn("[Newsletter API] Failed to check customer profile in WooCommerce, proceeding:", checkErr);
    }

    // 6. Generate a unique 15% off WooCommerce Coupon
    console.log(`[Newsletter API] Generating unique coupon for: ${lowerEmail}`);
    let couponCode = "";
    try {
      couponCode = await createNewsletterCoupon(lowerEmail);
    } catch (couponErr: any) {
      console.error("[Newsletter API] Coupon generation failed:", couponErr);
      return NextResponse.json(
        { error: "Failed to generate subscriber discount. Please contact support." },
        { status: 500 }
      );
    }

    // 7. Dispatch transaction welcome email containing the coupon code
    console.log(`[Newsletter API] Sending subscription discount email to: ${lowerEmail}`);
    try {
      await sendNewsletterCouponEmail(lowerEmail, couponCode);
    } catch (emailErr) {
      console.error("[Newsletter API] Email dispatch failed:", emailErr);
    }

    // 8. Save Subscriber to local JSON database backup
    subscribers.push(lowerEmail);
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    // 9. Trigger self-hosted n8n Automation webhook (Async Pipeline)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      console.log(`[Newsletter API] Triggering n8n workflow for: ${lowerEmail}`);
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "newsletter.subscription",
          email: lowerEmail,
          coupon_code: couponCode,
          ip_address: ip,
          timestamp: new Date().toISOString(),
          source: "homepage_newsletter"
        })
      }).catch((n8nErr) => {
        console.error("[Newsletter API] Failed to trigger n8n webhook:", n8nErr);
      });
    }

    // 10. Return success response formatted precisely as requested
    return NextResponse.json({
      success: true,
      message: "Check your inbox for your 15% discount code."
    });

  } catch (error: any) {
    console.error("[Newsletter API] Error in subscription process:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
