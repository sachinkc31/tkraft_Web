export async function triggerN8NOrderWebhook(
  orderData: any,
  eventType: "order_placed" | "order_paid" | "order_cancelled" | "order_pending" = "order_placed"
) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("[n8n Service] N8N_WEBHOOK_URL is not configured.");
    return { success: false, reason: "N8N_WEBHOOK_URL not configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        order: {
          id: orderData.id,
          number: orderData.number || orderData.id,
          status: orderData.status,
          total: orderData.total,
          currency: orderData.currency,
          payment_method: orderData.payment_method,
          payment_method_title: orderData.payment_method_title,
          billing: orderData.billing,
          shipping: orderData.shipping || orderData.billing,
          line_items: orderData.line_items.map((item: any) => ({
            id: item.id,
            name: item.name,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            sku: item.sku || "",
          })),
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      console.error(`[n8n Service] Failed to trigger webhook. Status: ${response.status}. Response: ${text}`);
      return { success: false, reason: `Status code ${response.status}` };
    }

    console.log(`[n8n Service] Successfully triggered webhook for order ${orderData.id}`);
    return { success: true };
  } catch (error: any) {
    if (error?.cause?.code === "ECONNREFUSED") {
      console.warn("[n8n Service] Connection refused. Is n8n running at", webhookUrl, "?");
      console.warn("[n8n Service] For local dev, ensure n8n is running: n8n");
      console.warn("[n8n Service] For production, check N8N_WEBHOOK_URL in environment config.");
    }
    console.error("[n8n Service] Exception triggering webhook:", error);
    return { success: false, error };
  }
}
