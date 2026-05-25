import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/services/woocommerce";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("Authorization") || "";
    const passkey = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const expectedPasskey = process.env.ADMIN_PASSKEY || "tkraft_admin_secure_passkey_2026";

    if (passkey !== expectedPasskey) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Resolve Parameters
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get("days") || "7";
    const daysCount = parseInt(daysParam, 10) || 7;

    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - daysCount);
    // Remove milliseconds and format for WooCommerce compatibility
    const afterDateString = afterDate.toISOString().split(".")[0] + "Z";

    // 3. Fetch Orders in Period
    const orders = await getOrders({
      after: afterDateString,
      per_page: "100",
    }).catch(() => []);

    // 4. Calculate Sales Metrics
    let totalRevenue = 0;
    let completedRevenue = 0;
    let ordersCount = 0;
    let refundsCount = 0;
    let refundsAmount = 0;
    let codCount = 0;
    let codAmount = 0;
    let pendingCount = 0;
    let processingCount = 0;
    let completedCount = 0;

    const productsMap: Record<string, { quantity: number; total: number }> = {};
    const dailyMap: Record<string, { date: string; revenue: number; orders: number }> = {};

    // Initialize daily map with 0s for the past X days so charts show full trends
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const dateStr = order.date_created ? order.date_created.split("T")[0] : "";
      const status = order.status;
      const total = parseFloat(order.total || "0");

      // Categorize by status
      if (status === "refunded") {
        refundsCount++;
        refundsAmount += total;
      } else if (status === "pending") {
        pendingCount++;
      } else if (status === "processing") {
        processingCount++;
      } else if (status === "completed") {
        completedCount++;
      }

      // Successful transactions (processing or completed)
      if (status === "completed" || status === "processing") {
        ordersCount++;
        totalRevenue += total;

        if (status === "completed") {
          completedRevenue += total;
        }

        if (order.payment_method === "cod") {
          codCount++;
          codAmount += total;
        }

        // Daily aggregation
        if (dateStr && dailyMap[dateStr]) {
          dailyMap[dateStr].revenue += total;
          dailyMap[dateStr].orders += 1;
        }

        // Product sales aggregation
        order.line_items?.forEach((item) => {
          const name = item.name;
          const qty = item.quantity || 0;
          const lineTotal = parseFloat(item.total || "0");

          if (!productsMap[name]) {
            productsMap[name] = { quantity: 0, total: 0 };
          }
          productsMap[name].quantity += qty;
          productsMap[name].total += lineTotal;
        });
      }
    });

    // Formatting charts and metrics
    const dailySales = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    const topProducts = Object.entries(productsMap)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        total: data.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const averageOrderValue = ordersCount > 0 ? parseFloat((totalRevenue / ordersCount).toFixed(2)) : 0;

    const recentOrders = orders.slice(0, 10).map((order) => ({
      id: order.id,
      customerName: `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`.trim() || "Guest Customer",
      email: order.billing?.email || "",
      phone: order.billing?.phone || "",
      status: order.status,
      total: parseFloat(order.total || "0"),
      paymentMethod: order.payment_method_title || order.payment_method || "Online",
      date: order.date_created,
    }));

    return NextResponse.json({
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        completedRevenue: parseFloat(completedRevenue.toFixed(2)),
        ordersCount,
        averageOrderValue,
        codCount,
        codAmount: parseFloat(codAmount.toFixed(2)),
        refundsCount,
        refundsAmount: parseFloat(refundsAmount.toFixed(2)),
        pendingCount,
        processingCount,
        completedCount,
      },
      dailySales,
      topProducts,
      recentOrders,
    });
  } catch (error: any) {
    console.error("[API/admin/sales] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate sales data: " + (error.message || "") },
      { status: 500 }
    );
  }
}
