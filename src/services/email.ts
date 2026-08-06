import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { formatPrice } from "@/lib/utils";

// Configure SMTP transporter if credentials are provided in env
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpFrom = process.env.SMTP_FROM || '"Tkraft Store" <noreply@tkraft.online>';

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

/**
 * Generates a clean, modern HTML template for pending payment notifications.
 */
function generatePendingPaymentEmailHTML(order: any, paymentLink: string): string {
  const itemsListHTML = order.line_items
    ?.map(
      (item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
          ${item.name} <strong style="color: #6b7280; font-size: 12px; margin-left: 4px;">× ${item.quantity}</strong>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: 600; color: #1f2937;">
          ${formatPrice(parseFloat(item.total))}
        </td>
      </tr>
    `
    )
    .join("") || "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Order Payment</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .header {
          background-color: #1e3a8a;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 0;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header span {
          color: #f97316;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }
        .intro {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .cta-container {
          text-align: center;
          margin: 32px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #1e3a8a;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 4px 6px rgba(30, 58, 138, 0.25);
          transition: background-color 0.2s;
        }
        .cta-button:hover {
          background-color: #1d4ed8;
        }
        .order-summary {
          background-color: #f9fafb;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #f3f4f6;
          margin-bottom: 24px;
        }
        .order-summary h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 14px;
          color: #111827;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .order-table {
          width: 100%;
          border-collapse: collapse;
        }
        .total-row td {
          font-size: 16px;
          font-weight: bold;
          color: #111827;
          padding-top: 15px !important;
          border-top: 2px solid #e5e7eb;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #f3f4f6;
        }
        .footer a {
          color: #1e3a8a;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>T<span>kraft</span></h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${order.billing?.first_name || "Customer"},</div>
          <p class="intro">
            We noticed that your payment for <strong>Order #${order.id}</strong> could not be completed. Don't worry, your items are reserved! You can easily finish your checkout by clicking the link below.
          </p>

          <div class="cta-container">
            <a href="${paymentLink}" class="cta-button" target="_blank">Complete Your Payment</a>
          </div>

          <div class="order-summary">
            <h3>Order Details (Pending)</h3>
            <table class="order-table">
              <tbody>
                ${itemsListHTML}
                <tr class="total-row">
                  <td style="padding: 10px 0;">Total Amount</td>
                  <td style="padding: 10px 0; text-align: right;">${formatPrice(parseFloat(order.total))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="intro" style="font-size: 12px; color: #9ca3af;">
            If the button above does not work, copy and paste this link into your browser: <br>
            <a href="${paymentLink}" style="color: #1e3a8a; word-break: break-all;">${paymentLink}</a>
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Tkraft. All rights reserved. <br>
          For queries or assistance, contact us at <a href="mailto:support@tkraft.online">support@tkraft.online</a>.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends a pending payment recovery email to the customer.
 * Always saves the generated email to the workspace log for local audit.
 */
export async function sendPendingPaymentEmail(order: any, paymentLink: string): Promise<{ success: boolean; path?: string }> {
  const customerEmail = order.billing?.email;
  if (!customerEmail) {
    console.warn(`[Email Service] Cannot send email. Order #${order.id} has no billing email.`);
    return { success: false };
  }

  const html = generatePendingPaymentEmailHTML(order, paymentLink);
  const subject = `Action Required: Complete your payment for Tkraft Order #${order.id}`;

  // 1. File Logging backup (highly useful for developers in local environment)
  let savedPath: string | undefined;
  try {
    const logsDir = path.join(process.cwd(), "logs/emails");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const filename = `order-${order.id}.html`;
    const fullPath = path.join(logsDir, filename);
    fs.writeFileSync(fullPath, html, "utf-8");
    savedPath = fullPath;
    console.log(`[Email Service] Pending payment email markup saved to: ${fullPath}`);
  } catch (fileErr) {
    console.error("[Email Service] Failed to save email draft copy to disk:", fileErr);
  }

  // 2. Real SMTP Delivery
  if (transporter) {
    try {
      console.log(`[Email Service] Sending pending payment email to ${customerEmail}...`);
      await transporter.sendMail({
        from: smtpFrom,
        to: customerEmail,
        subject: subject,
        html: html,
      });
      console.log(`[Email Service] Email sent successfully to ${customerEmail} for order #${order.id}`);
      return { success: true, path: savedPath };
    } catch (smtpErr) {
      console.error(`[Email Service] SMTP connection failed sending to ${customerEmail}:`, smtpErr);
      return { success: false, path: savedPath };
    }
  } else {
    console.log("[Email Service] SMTP parameters missing in env. Local file logger triggered instead.");
    return { success: true, path: savedPath };
  }
}

/**
 * HTML Template for Newsletter Subscription welcome email
 */
function generateNewsletterCouponEmailHTML(email: string, couponCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your 15% Off Discount Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .header {
          background-color: #1e3a8a;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          margin: 0;
          font-weight: 800;
        }
        .header span {
          color: #f97316;
        }
        .content {
          padding: 35px;
          text-align: center;
        }
        .title {
          font-size: 22px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 12px;
        }
        .message {
          font-size: 15px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .coupon-box {
          display: inline-block;
          background-color: #f9fafb;
          border: 2px dashed #f97316;
          border-radius: 12px;
          padding: 16px 40px;
          margin: 10px 0 30px 0;
        }
        .coupon-code {
          font-family: monospace;
          font-size: 28px;
          font-weight: 800;
          color: #f97316;
          letter-spacing: 2px;
        }
        .validity {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 6px;
        }
        .cta-container {
          margin: 20px 0 30px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #f97316;
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 35px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 15px;
          box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 30px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #f3f4f6;
        }
        .footer a {
          color: #1e3a8a;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>T<span>kraft</span></h1>
        </div>
        <div class="content">
          <h2 class="title">Thanks for subscribing! 🎉</h2>
          <p class="message">
            Welcome to the Tkraft family! Use the unique coupon code below at checkout to get <strong>15% off</strong> your first order.
          </p>
          
          <div class="coupon-box">
            <div class="coupon-code">${couponCode}</div>
            <div class="validity">Valid for 30 days. Applies to all items.</div>
          </div>
          
          <div class="cta-container">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tkraft.online'}/shop" class="cta-button">Shop Tkraft Organizers</a>
          </div>
          
          <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
            Explore our curated collections of premium home and kitchen space organizers.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Tkraft. All rights reserved. <br>
          You received this email because you subscribed to Tkraft. <br>
          For assistance, contact <a href="mailto:support@tkraft.online">support@tkraft.online</a>.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends a newsletter subscriber welcome email with their unique coupon code.
 */
export async function sendNewsletterCouponEmail(email: string, couponCode: string): Promise<{ success: boolean; path?: string }> {
  const html = generateNewsletterCouponEmailHTML(email, couponCode);
  const subject = "Your 15% Off Tkraft Discount Code! 🎁";

  let savedPath: string | undefined;
  try {
    const logsDir = path.join(process.cwd(), "logs/emails");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const filename = `newsletter-${email.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    const fullPath = path.join(logsDir, filename);
    fs.writeFileSync(fullPath, html, "utf-8");
    savedPath = fullPath;
    console.log(`[Email Service] Newsletter subscription email saved to: ${fullPath}`);
  } catch (fileErr) {
    console.error("[Email Service] Failed to save newsletter email draft to disk:", fileErr);
  }

  if (transporter) {
    try {
      console.log(`[Email Service] Sending newsletter coupon email to ${email}...`);
      await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: subject,
        html: html,
      });
      console.log(`[Email Service] Newsletter email sent successfully to ${email}`);
      return { success: true, path: savedPath };
    } catch (smtpErr) {
      console.error(`[Email Service] SMTP failed sending newsletter email to ${email}:`, smtpErr);
      return { success: false, path: savedPath };
    }
  } else {
    console.log("[Email Service] SMTP missing. Local email file logged instead.");
    return { success: true, path: savedPath };
  }
}
