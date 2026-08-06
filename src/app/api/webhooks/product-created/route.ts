import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.json");

export async function POST(req: Request) {
  try {
    const product = await req.json();

    // Verify it's a valid product payload (WooCommerce webhooks send the product object)
    if (!product || !product.id || !product.name) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1. Get subscribers
    let subscribers: string[] = [];
    try {
      const fileData = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(fileData);
    } catch (err) {
      console.log("No subscribers found to notify.");
      return NextResponse.json({ success: true, notified: 0 });
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, notified: 0 });
    }

    // 2. Configure Email Transporter
    // In production, configure SMTP credentials in your .env.local
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3. Construct Email Content
    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`;
    const price = product.price ? `₹${product.price}` : "Check website for price";
    
    const mailOptions = {
      from: `"Tkraft Updates" <${process.env.SMTP_USER || "noreply@tkraft.online"}>`,
      to: subscribers, // Bcc is better for privacy but for simplicity sending to all (or use BCC)
      bcc: subscribers,
      subject: `New Arrival: ${product.name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a202c;">We just added a new product!</h2>
          <h3 style="color: #dd6b20;">${product.name}</h3>
          ${product.images && product.images[0] ? `<img src="${product.images[0].src}" alt="${product.name}" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;" />` : ''}
          <p style="font-size: 16px; color: #4a5568;">
            Check out our newest arrival. Available now for just <strong>${price}</strong>!
          </p>
          <div style="margin-top: 30px;">
            <a href="${productUrl}" style="background-color: #dd6b20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Shop Now
            </a>
          </div>
        </div>
      `,
    };

    // 4. Send Email
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[Webhook] Sent new product notification to ${subscribers.length} subscribers.`);
    } else {
      console.log("[Webhook] SMTP credentials not configured. Email notification skipped.");
      console.log("[Webhook] Would have sent to:", subscribers);
      console.log("[Webhook] Content:", mailOptions.subject);
    }

    return NextResponse.json({ success: true, notified: subscribers.length });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
