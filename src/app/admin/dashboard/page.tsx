"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers,
  Percent,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface SummaryData {
  totalRevenue: number;
  completedRevenue: number;
  ordersCount: number;
  averageOrderValue: number;
  codCount: number;
  codAmount: number;
  refundsCount: number;
  refundsAmount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
}

interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  status: string;
  total: number;
  paymentMethod: string;
  date: string;
}

interface DashboardData {
  summary: SummaryData;
  dailySales: DailySale[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [days, setDays] = useState(7);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Check auth status on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("tkraft_admin_token");
    if (savedKey) {
      setIsAuthenticated(true);
      fetchDashboardData(savedKey, days);
    }
  }, []);

  // Sync data when days filter changes
  useEffect(() => {
    const savedKey = localStorage.getItem("tkraft_admin_token");
    if (savedKey) {
      fetchDashboardData(savedKey, days);
    }
  }, [days]);

  async function fetchDashboardData(key: string, daysCount: number) {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`/api/admin/sales?days=${daysCount}`, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Session expired or unauthorized");
        }
        throw new Error("Failed to load dashboard metrics");
      }

      const resData = await res.json();
      setData(resData);
    } catch (err: any) {
      setFetchError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (!passkey) {
      setLoginError("Passkey is required");
      return;
    }

    // Verify key with a test fetch
    setLoading(true);
    fetch(`/api/admin/sales?days=7`, {
      headers: {
        Authorization: `Bearer ${passkey}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem("tkraft_admin_token", passkey);
          setIsAuthenticated(true);
          return res.json();
        } else {
          throw new Error("Invalid admin passkey credentials");
        }
      })
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => {
        setLoginError(err.message || "Unauthorized access");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function handleLogout() {
    localStorage.removeItem("tkraft_admin_token");
    setIsAuthenticated(false);
    setData(null);
    setPasskey("");
  }

  function handleRefresh() {
    const savedKey = localStorage.getItem("tkraft_admin_token");
    if (savedKey) {
      fetchDashboardData(savedKey, days);
    }
  }

  // --- Graph Calculations ---
  function getLinePath(sales: DailySale[], width: number, height: number): string {
    if (sales.length === 0) return "";
    const maxRev = Math.max(...sales.map((s) => s.revenue), 1);
    
    return sales
      .map((s, idx) => {
        const x = (idx / (sales.length - 1)) * width;
        const y = height - (s.revenue / maxRev) * (height - 20) - 10;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }

  function getAreaPoints(sales: DailySale[], width: number, height: number): string {
    if (sales.length === 0) return "";
    const maxRev = Math.max(...sales.map((s) => s.revenue), 1);
    
    const linePoints = sales
      .map((s, idx) => {
        const x = (idx / (sales.length - 1)) * width;
        const y = height - (s.revenue / maxRev) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(" ");

    return `0,${height} ${linePoints} ${width},${height}`;
  }

  // --- Auth Render (Portal Login) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,11%)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-3xl bg-[hsl(222,47%,6%)]/80 backdrop-blur-xl border border-[hsl(217,32%,17%)] shadow-2xl text-center"
        >
          <div className="h-14 w-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
            <ShieldAlert className="h-7 w-7 animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Tkraft Admin Portal
          </h1>
          <p className="text-[hsl(215,16%,57%)] text-sm mb-6">
            Enter the secure authorization passkey to access sales analytics.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider block">
                Security Passkey:
              </label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-xs font-semibold text-left">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Authorize Access"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <div className="min-h-screen bg-[hsl(222,47%,11%)] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[hsl(217,32%,17%)] pb-6">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">
              Store Analytics Panel
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Sales Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Filter buttons */}
            <div className="bg-[hsl(222,47%,6%)] p-1 rounded-xl border border-[hsl(217,32%,17%)] flex gap-1 text-xs font-semibold">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    days === d
                      ? "bg-blue-600 text-white"
                      : "text-[hsl(215,16%,57%)] hover:text-white"
                  }`}
                >
                  Last {d}d
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="h-10 w-10 bg-[hsl(222,47%,6%)] hover:bg-[hsl(217,32%,17%)] rounded-xl border border-[hsl(217,32%,17%)] flex items-center justify-center transition-colors text-[hsl(215,16%,57%)] hover:text-white"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="h-10 px-4 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs font-bold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Content Container */}
        {fetchError ? (
          <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-2xl text-center space-y-3">
            <p className="text-red-400 font-semibold">{fetchError}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        ) : !data ? (
          <div className="h-96 flex items-center justify-center bg-[hsl(222,47%,6%)]/40 rounded-3xl border border-[hsl(217,32%,17%)]">
            <div className="text-center space-y-3">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
              <p className="text-[hsl(215,16%,57%)] text-sm">Aggregating store metrics...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Metric Card 1: Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">
                    {formatPrice(data.summary.totalRevenue)}
                  </h3>
                  <p className="text-[10px] text-[hsl(215,16%,57%)]">
                    ₹{data.summary.completedRevenue} Completed • ₹{data.summary.totalRevenue - data.summary.completedRevenue} Processing
                  </p>
                </div>
              </motion.div>

              {/* Metric Card 2: Orders */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-5 rounded-2xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">
                    {data.summary.ordersCount}
                  </h3>
                  <p className="text-[10px] text-[hsl(215,16%,57%)]">
                    {data.summary.codCount} COD Orders (₹{data.summary.codAmount})
                  </p>
                </div>
              </motion.div>

              {/* Metric Card 3: AOV */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-2xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider">
                    Average Order Value
                  </span>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">
                    {formatPrice(data.summary.averageOrderValue)}
                  </h3>
                  <p className="text-[10px] text-[hsl(215,16%,57%)]">
                    Average revenue value generated per successful transaction
                  </p>
                </div>
              </motion.div>

              {/* Metric Card 4: Statuses */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-2xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider">
                    Fulfillment Status
                  </span>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-1 rounded bg-amber-500/5 text-amber-400 border border-amber-500/10">
                    <span className="block text-[10px] font-bold">Process</span>
                    <span className="text-sm font-black">{data.summary.processingCount}</span>
                  </div>
                  <div className="p-1 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                    <span className="block text-[10px] font-bold">Done</span>
                    <span className="text-sm font-black">{data.summary.completedCount}</span>
                  </div>
                  <div className="p-1 rounded bg-red-500/5 text-red-400 border border-red-500/10">
                    <span className="block text-[10px] font-bold">Refund</span>
                    <span className="text-sm font-black">{data.summary.refundsCount}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 2. Visual Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Line Chart: Revenue Trend */}
              <div className="p-6 rounded-3xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <h3 className="font-bold text-base">Revenue Timeline</h3>
                </div>
                
                {data.dailySales.length > 0 ? (
                  <div className="relative w-full h-64">
                    <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="gradient-rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <polygon
                        points={getAreaPoints(data.dailySales, 500, 200)}
                        fill="url(#gradient-rev)"
                      />

                      {/* Line */}
                      <path
                        d={getLinePath(data.dailySales, 500, 200)}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Timeline labels */}
                    <div className="flex justify-between text-[10px] text-[hsl(215,16%,57%)] mt-2 font-semibold">
                      <span>{data.dailySales[0]?.date}</span>
                      <span>{data.dailySales[Math.floor(data.dailySales.length / 2)]?.date}</span>
                      <span>{data.dailySales[data.dailySales.length - 1]?.date}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-[hsl(215,16%,57%)] text-sm">
                    No timeline records
                  </div>
                )}
              </div>

              {/* Bar Chart: Daily Orders */}
              <div className="p-6 rounded-3xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <h3 className="font-bold text-base">Order Frequency</h3>
                </div>

                {data.dailySales.length > 0 ? (
                  <div>
                    <div className="h-64 flex items-end justify-between gap-1 pt-6">
                      {(() => {
                        const maxOrd = Math.max(...data.dailySales.map((s) => s.orders), 1);
                        return data.dailySales.map((day) => {
                          const heightPct = (day.orders / maxOrd) * 100;
                          return (
                            <div key={day.date} className="group flex-1 flex flex-col items-center">
                              {/* Tooltip on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 border border-neutral-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-8 z-10 pointer-events-none">
                                {day.orders} orders
                              </div>
                              {/* Bar */}
                              <div
                                style={{ height: `${Math.max(heightPct, 4)}%` }}
                                className="w-full rounded-t-md bg-purple-600 group-hover:bg-purple-500 transition-colors shadow-sm"
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>
                    {/* Timeline labels */}
                    <div className="flex justify-between text-[10px] text-[hsl(215,16%,57%)] mt-2 font-semibold">
                      <span>{data.dailySales[0]?.date}</span>
                      <span>{data.dailySales[data.dailySales.length - 1]?.date}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-[hsl(215,16%,57%)] text-sm">
                    No order records
                  </div>
                )}
              </div>
            </div>

            {/* 3. Detailed Data Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column Left: Top Selling Items (2/3 width) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-bold text-base">Top Performing Products</h3>
                </div>

                <div className="space-y-4">
                  {data.topProducts.length > 0 ? (
                    data.topProducts.map((p, idx) => {
                      const maxTotal = Math.max(...data.topProducts.map((t) => t.total), 1);
                      const widthPct = (p.total / maxTotal) * 100;
                      return (
                        <div key={p.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span className="text-white line-clamp-1">{idx + 1}. {p.name}</span>
                            <span className="text-[hsl(215,16%,57%)] flex-shrink-0 ml-3">
                              {p.quantity} sold • {formatPrice(p.total)}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${widthPct}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-[hsl(215,16%,57%)]">No product sales logged in this period.</p>
                  )}
                </div>
              </div>

              {/* Column Right: Recent Orders Feed (1/3 width) */}
              <div className="p-6 rounded-3xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] shadow-md space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-4 w-4 text-orange-400" />
                  <h3 className="font-bold text-base">Recent Orders</h3>
                </div>

                <div className="space-y-3.5 divide-y divide-[hsl(217,32%,17%)]">
                  {data.recentOrders.length > 0 ? (
                    data.recentOrders.map((order, idx) => (
                      <div
                        key={order.id}
                        className={cn(
                          "flex items-center justify-between text-xs",
                          idx > 0 && "pt-3.5"
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-white max-w-[150px] line-clamp-1">
                            {order.customerName}
                          </p>
                          <p className="text-[10px] text-[hsl(215,16%,57%)]">
                            #{order.id} • {order.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-black text-white">{formatPrice(order.total)}</p>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                              order.status === "completed" && "bg-emerald-500/10 text-emerald-400",
                              order.status === "processing" && "bg-blue-500/10 text-blue-400",
                              order.status === "pending" && "bg-amber-500/10 text-amber-400",
                              order.status === "refunded" && "bg-red-500/10 text-red-400"
                            )}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[hsl(215,16%,57%)]">No recent orders logged.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
