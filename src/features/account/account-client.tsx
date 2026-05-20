"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  Smartphone,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuthStore, useUIStore, useCurrencyStore } from "@/store";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { WooOrder } from "@/types";

export function AccountClient() {
  const currency = useCurrencyStore((s) => s.currency);
  const { user, token, isAuthenticated, setSession, clearSession } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  // Auth Tabs & States
  const [authTab, setAuthTab] = useState<"mobile" | "jwt">("mobile");
  const [isLoading, setIsLoading] = useState(false);

  // Mobile Auth States
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // JWT Auth States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Authenticated View Tabs
  const [dashboardTab, setDashboardTab] = useState<"dashboard" | "orders" | "addresses">("dashboard");

  // User Data States
  const [orders, setOrders] = useState<WooOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // Address Form States
  const [billingForm, setBillingForm] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Load user details into address forms on auth success
  useEffect(() => {
    if (user) {
      setBillingForm({
        first_name: user.billing?.first_name || user.first_name || "",
        last_name: user.billing?.last_name || user.last_name || "",
        address_1: user.billing?.address_1 || "",
        city: user.billing?.city || "",
        state: user.billing?.state || "",
        postcode: user.billing?.postcode || "",
        phone: user.billing?.phone || "",
      });
      fetchOrders();
    }
  }, [user]);

  // Fetch Order History
  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders/customer?customerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // OTP Send handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showToast("Please enter a valid 10-digit Indian mobile number", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/mobile/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setOtpSent(true);
      setCountdown(59);
      showToast(data.message || "OTP sent successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verify handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/mobile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSession(data.token, data.user);
      showToast("Login successful!", "success");
    } catch (err: any) {
      showToast(err.message || "Invalid OTP code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // JWT Login handler
  const handleJwtLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast("Please fill all fields", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setSession(data.token, data.user);
      showToast("Login successful!", "success");
    } catch (err: any) {
      showToast(err.message || "Invalid username or password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Address Update handler
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdatingAddress(true);
    try {
      const res = await fetch("/api/customer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          customerData: {
            first_name: billingForm.first_name,
            last_name: billingForm.last_name,
            billing: { ...billingForm, email: user.email, country: "IN" },
            shipping: { ...billingForm, country: "IN" },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSession(token || "", data.user);
      showToast("Addresses updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile changes", "error");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // Log out handler
  const handleLogout = () => {
    clearSession();
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setOrders([]);
    showToast("Logged out successfully.", "info");
  };

  // ============================================
  // RENDER: UNAUTHENTICATED
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="section min-h-[calc(100vh-200px)] flex items-center justify-center bg-[hsl(210,20%,98%)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl border border-[hsl(214,13%,90%)] shadow-xl overflow-hidden p-6 md:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl text-[hsl(222,47%,11%)]">
              Welcome to T<span className="text-[hsl(27,96%,55%)]">kraft</span>
            </h1>
            <p className="text-sm text-[hsl(215,16%,47%)] mt-2">
              Sign in to manage orders, addresses, and view your profile details.
            </p>
          </div>

          {/* Auth Tab Buttons */}
          <div className="flex gap-2 p-1.5 bg-[hsl(210,16%,96%)] rounded-2xl mb-6">
            <button
              onClick={() => {
                setAuthTab("mobile");
                setOtpSent(false);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                authTab === "mobile"
                  ? "bg-white text-[hsl(217,70%,38%)] shadow-sm"
                  : "text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)]"
              )}
            >
              <Smartphone className="h-4 w-4" /> Mobile OTP
            </button>
            <button
              onClick={() => setAuthTab("jwt")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
                authTab === "jwt"
                  ? "bg-white text-[hsl(217,70%,38%)] shadow-sm"
                  : "text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)]"
              )}
            >
              <KeyRound className="h-4 w-4" /> Password Login
            </button>
          </div>

          {/* TAB 1: Mobile Auth */}
          {authTab === "mobile" && (
            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.form
                  key="send-phone"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSendOtp}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[hsl(215,16%,47%)]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full h-11 pl-14 pr-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm font-medium focus:outline-none focus:border-[hsl(217,70%,38%)] transition-colors"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-[hsl(215,16%,47%)] mt-2">
                      We will send a 6-digit verification code to this mobile number.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-11"
                    loading={isLoading}
                  >
                    Send OTP Code
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="verify-otp"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-5"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)]">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs font-semibold text-[hsl(217,70%,38%)] hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      className="w-full h-11 px-4 tracking-[0.4em] text-center font-mono font-bold text-lg rounded-xl border-2 border-[hsl(214,13%,90%)] focus:outline-none focus:border-[hsl(217,70%,38%)] transition-colors"
                      required
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center mt-2.5">
                      <p className="text-xs text-[hsl(215,16%,47%)]">
                        Sent to +91 {phone}
                      </p>
                      {countdown > 0 ? (
                        <span className="text-xs text-[hsl(215,16%,47%)]">
                          Resend in {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs font-semibold text-[hsl(217,70%,38%)] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full h-11"
                    loading={isLoading}
                  >
                    Verify & Login
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          )}

          {/* TAB 2: JWT Auth */}
          {authTab === "jwt" && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleJwtLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)] transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)] transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full h-11 mt-2"
                loading={isLoading}
              >
                Sign In
              </Button>
            </motion.form>
          )}

          <div className="flex items-center gap-1.5 justify-center mt-6 text-xs text-[hsl(215,16%,47%)]">
            <ShieldCheck className="h-4 w-4 text-[hsl(142,71%,45%)]" />
            Secure connection via SSL.
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // RENDER: AUTHENTICATED
  // ============================================
  return (
    <div className="section min-h-[calc(100vh-200px)] bg-[hsl(210,20%,98%)] py-10">
      <div className="container max-w-6xl">
        {/* Welcome greeting banner */}
        <div className="bg-gradient-to-r from-[hsl(217,70%,38%)] to-[hsl(222,47%,11%)] rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl">
              Hello, {user?.first_name || "Customer"}! 👋
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Welcome to your account panel. Monitor shipments, manage addresses, or configure profile items.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold rounded-xl"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: User },
              { id: "orders", label: "Order History", icon: ShoppingBag, badge: orders.length || null },
              { id: "addresses", label: "Address Book", icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDashboardTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    dashboardTab === tab.id
                      ? "bg-white text-[hsl(217,70%,38%)] shadow-sm border border-[hsl(214,13%,90%)]"
                      : "text-[hsl(215,16%,47%)] hover:bg-white/50 hover:text-[hsl(222,47%,11%)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[hsl(217,70%,38%)] text-white text-[10px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT Panel Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-[hsl(214,13%,90%)] shadow-sm p-6 md:p-8 min-h-[400px]">
              {/* SUBTAB 1: Dashboard Panel */}
              {dashboardTab === "dashboard" && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)] mb-4">
                    Account Overview
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] flex flex-col justify-between">
                      <span className="text-xs font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                        Order Count
                      </span>
                      <span className="text-3xl font-display font-extrabold text-[hsl(222,47%,11%)] mt-2">
                        {orders.length}
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] flex flex-col justify-between">
                      <span className="text-xs font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                        Registered Email
                      </span>
                      <span className="text-sm font-semibold text-[hsl(222,47%,11%)] mt-2 line-clamp-1">
                        {user?.email}
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] flex flex-col justify-between">
                      <span className="text-xs font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                        Shipping Zone
                      </span>
                      <span className="text-sm font-semibold text-[hsl(222,47%,11%)] mt-2">
                        {user?.billing?.city || "India"}
                      </span>
                    </div>
                  </div>

                  {/* Recent Order Preview */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-[hsl(222,47%,11%)]">
                        Recent Order
                      </h3>
                      {orders.length > 0 && (
                        <button
                          onClick={() => setDashboardTab("orders")}
                          className="text-xs font-semibold text-[hsl(217,70%,38%)] hover:underline flex items-center gap-0.5"
                        >
                          View all <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {ordersLoading ? (
                      <div className="flex items-center gap-2 py-8 text-[hsl(215,16%,47%)]">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading orders…
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-[hsl(214,13%,90%)] rounded-2xl">
                        <p className="text-sm text-[hsl(215,16%,47%)]">You haven&apos;t placed any orders yet.</p>
                      </div>
                    ) : (
                      <div className="border border-[hsl(214,13%,90%)] rounded-2xl overflow-hidden p-5 bg-[hsl(210,20%,98%)]">
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                          <div>
                            <p className="text-xs text-[hsl(215,16%,47%)]">Order ID</p>
                            <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">#{orders[0].id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(215,16%,47%)]">Date Placed</p>
                            <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">
                              {new Date(orders[0].date_created).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[hsl(215,16%,47%)]">Total Amount</p>
                            <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">{formatPrice(parseFloat(orders[0].total), false)}</p>
                          </div>
                          <div>
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block",
                              orders[0].status === "processing" || orders[0].status === "completed"
                                ? "bg-[hsl(142,71%,95%)] text-[hsl(142,71%,45%)]"
                                : "bg-[hsl(38,92%,95%)] text-[hsl(38,92%,50%)]"
                            )}>
                              {orders[0].status}
                            </span>
                            {orders[0].status === "pending" && (
                              <Link
                                href={`/checkout/pay?orderId=${orders[0].id}`}
                                className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-[hsl(217,70%,38%)] text-white hover:bg-[hsl(217,70%,30%)] transition-colors px-2.5 py-1 rounded-lg flex items-center justify-center gap-1 w-fit"
                              >
                                Complete Payment
                              </Link>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-[hsl(214,13%,90%)] pt-3 mt-3">
                          <p className="text-xs font-bold text-[hsl(222,47%,11%)] mb-2">ITEMS:</p>
                          <ul className="space-y-1">
                            {orders[0].line_items.map((item) => (
                              <li key={item.id} className="text-xs text-[hsl(215,16%,47%)] flex justify-between">
                                <span>{item.name} <strong className="text-[hsl(222,47%,11%)]">× {item.quantity}</strong></span>
                                <span className="font-medium text-[hsl(222,47%,11%)]">{formatPrice(parseFloat(item.total), false)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: Order History Panel */}
              {dashboardTab === "orders" && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)] mb-4">
                    Your Order History
                  </h2>

                  {ordersLoading ? (
                    <div className="flex items-center gap-2 py-12 text-[hsl(215,16%,47%)]">
                      <Loader2 className="h-5 w-5 animate-spin" /> Loading orders…
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-[hsl(214,13%,90%)] rounded-2xl">
                      <p className="text-5xl mb-3">🛍️</p>
                      <h3 className="font-semibold text-lg text-[hsl(222,47%,11%)] mb-1">No orders found</h3>
                      <p className="text-sm text-[hsl(215,16%,47%)]">You haven&apos;t completed any checkouts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-[hsl(214,13%,90%)] rounded-2xl overflow-hidden p-5 hover:border-[hsl(217,70%,60%)] transition-colors bg-[hsl(210,20%,98%)]"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-[hsl(215,16%,47%)]">Order ID</p>
                              <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">#{order.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(215,16%,47%)]">Date</p>
                              <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">
                                {new Date(order.date_created).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[hsl(215,16%,47%)]">Total</p>
                              <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">{formatPrice(parseFloat(order.total), false)}</p>
                            </div>
                            <div>
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block",
                                order.status === "processing" || order.status === "completed"
                                  ? "bg-[hsl(142,71%,95%)] text-[hsl(142,71%,45%)]"
                                  : "bg-[hsl(38,92%,95%)] text-[hsl(38,92%,50%)]"
                              )}>
                                {order.status}
                              </span>
                              {order.status === "pending" && (
                                <Link
                                  href={`/checkout/pay?orderId=${order.id}`}
                                  className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-[hsl(217,70%,38%)] text-white hover:bg-[hsl(217,70%,30%)] transition-colors px-2.5 py-1 rounded-lg flex items-center justify-center gap-1 w-fit"
                                >
                                  Complete Payment
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-[hsl(214,13%,90%)] pt-3 mt-2">
                            <p className="text-xs font-bold text-[hsl(222,47%,11%)] mb-2 uppercase tracking-wide">
                              Purchased Items
                            </p>
                            <div className="space-y-1.5">
                              {order.line_items.map((item) => (
                                <div key={item.id} className="text-xs text-[hsl(215,16%,47%)] flex justify-between">
                                  <span>
                                    {item.name}{" "}
                                    <strong className="text-[hsl(222,47%,11%)] font-semibold">
                                      × {item.quantity}
                                    </strong>
                                  </span>
                                  <span className="font-semibold text-[hsl(222,47%,11%)]">
                                    {formatPrice(parseFloat(item.total), false)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: Address Book Panel */}
              {dashboardTab === "addresses" && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)] mb-4">
                    Address Management
                  </h2>

                  <form onSubmit={handleUpdateAddress} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={billingForm.first_name}
                          onChange={(e) => setBillingForm({ ...billingForm, first_name: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={billingForm.last_name}
                          onChange={(e) => setBillingForm({ ...billingForm, last_name: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={billingForm.address_1}
                        onChange={(e) => setBillingForm({ ...billingForm, address_1: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                        placeholder="House/Apartment number, street name, layout"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={billingForm.city}
                          onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          value={billingForm.state}
                          onChange={(e) => setBillingForm({ ...billingForm, state: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                          Pincode
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={billingForm.postcode}
                          onChange={(e) => setBillingForm({ ...billingForm, postcode: e.target.value.replace(/\D/g, "") })}
                          className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                          placeholder="400001"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                        Phone Number (for shipping contact)
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={billingForm.phone}
                        onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value.replace(/\D/g, "") })}
                        className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(217,70%,38%)]"
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="mt-4"
                      loading={isUpdatingAddress}
                    >
                      Save Profile & Addresses
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
