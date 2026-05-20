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
const smtpFrom = process.env.SMTP_FROM || '"Tkraft Store" <noreply@tkraft.in>';

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
          For queries or assistance, contact us at <a href="mailto:support@tkraft.in">support@tkraft.in</a>.
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
