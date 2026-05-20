const fs = require("fs");
const path = require("path");

// ---- Load .env.local manually ----
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
      process.env[key] = value;
    }
  });
  console.log("Loaded environment variables from .env.local");
} else {
  console.error(".env.local not found!");
  process.exit(1);
}

// ---- Constants / Settings ----
const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
const wooKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const wooSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
const n8nUrl = process.env.N8N_WEBHOOK_URL;

async function runTests() {
  console.log("\n==============================================");
  console.log("   TKRAFT E-COMMERCE PAYMENT & WEBHOOK TEST");
  console.log("==============================================\n");

  let testOrderId = null;

  // 1. Test WooCommerce Connectivity
  console.log("Step 1: Testing WooCommerce Order Creation...");
  try {
    const auth = Buffer.from(`${wooKey}:${wooSecret}`).toString("base64");
    const res = await fetch(`${wooUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_method: "razorpay",
        payment_method_title: "Pay Online (Test)",
        set_paid: false,
        billing: {
          first_name: "Test",
          last_name: "User",
          email: "testuser@example.com",
          phone: "9876543210",
          address_1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          postcode: "400001",
          country: "IN",
        },
        line_items: [
          {
            product_id: 12, // Let's use a dummy product or whatever is available, usually id matches or WooCommerce handles generic input
            quantity: 1,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`WooCommerce error: ${res.status} - ${errText}`);
    }

    const order = await res.json();
    testOrderId = order.id;
    console.log(`✅ Success: WooCommerce order created successfully. ID: ${order.id}`);
  } catch (err) {
    console.error(`❌ WooCommerce Order Creation Failed: ${err.message}`);
  }

  if (!testOrderId) {
    console.warn("Skipping steps 2 and 3 because WooCommerce order creation failed.");
    return;
  }

  // 2. Test Razorpay Order Creation
  console.log("\nStep 2: Testing Razorpay Order Creation...");
  try {
    const auth = Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 49900, // ₹499 in paise
        currency: "INR",
        receipt: String(testOrderId),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay error: ${res.status} - ${errText}`);
    }

    const rzpOrder = await res.json();
    console.log(`✅ Success: Razorpay order created. ID: ${rzpOrder.id}`);
  } catch (err) {
    console.error(`❌ Razorpay Order Creation Failed: ${err.message}`);
  }

  // 3. Test n8n Webhook Triggering
  console.log("\nStep 3: Testing n8n Webhook delivery...");
  try {
    console.log(`Sending trigger request to: ${n8nUrl}`);
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "order_placed",
        timestamp: new Date().toISOString(),
        order: {
          id: testOrderId,
          status: "pending",
          total: "499.00",
          currency: "INR",
          payment_method: "razorpay",
          billing: {
            first_name: "Test",
            last_name: "User",
            email: "testuser@example.com",
            phone: "9876543210",
          },
          line_items: [
            {
              id: 1,
              name: "Test Product",
              product_id: 12,
              quantity: 1,
              price: "499.00",
              total: "499.00",
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`n8n responded with status: ${res.status}`);
    }

    console.log("✅ Success: Webhook sent to n8n successfully.");
  } catch (err) {
    console.error(`❌ n8n Webhook Delivery Failed: ${err.message}`);
    console.log("   (Note: If n8n isn't running on port 5678, this connection error is expected)");
  }

  // 4. Cleanup WooCommerce Order
  console.log("\nStep 4: Cleaning up WooCommerce Test Order...");
  try {
    const auth = Buffer.from(`${wooKey}:${wooSecret}`).toString("base64");
    const res = await fetch(`${wooUrl}/orders/${testOrderId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ force: true }),
    });

    if (!res.ok) {
      throw new Error(`Delete failed with status: ${res.status}`);
    }

    console.log(`✅ Success: Cleaned up WooCommerce test order #${testOrderId}`);
  } catch (err) {
    console.error(`❌ Cleanup Failed: ${err.message}`);
  }
}

runTests();
