"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Plus,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { useAuthStore, useUIStore, useCurrencyStore, useRecentlyViewedStore, useWishlistStore } from "@/store";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { WooOrder, SavedAddress } from "@/types";

export function AccountClient() {
  const router = useRouter();
  const currency = useCurrencyStore((s) => s.currency);
  const storeCountry = useCurrencyStore((s) => s.countryCode) || "IN";
  const { user, token, isAuthenticated, setSession, clearSession } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  // Redirect to unified premium login if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isAuthenticated, router]);

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

  // Saved Address Book States
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    country: storeCountry,
  });

  // Sync country form state if header country selector changes
  useEffect(() => {
    setAddressForm((prev) => ({ ...prev, country: storeCountry }));
  }, [storeCountry]);

  const wishlistItems = useWishlistStore((s) => s.items);
  const recentlyViewed = useRecentlyViewedStore((s) => s.items);
  const [rvMounted, setRvMounted] = useState(false);
  useEffect(() => {
    setRvMounted(true);
    useRecentlyViewedStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  const calculateCompletion = () => {
    if (!user) return 0;
    let points = 0;
    if (user.first_name) points += 20;
    if (user.last_name) points += 20;
    if (user.email) points += 20;
    if (user.billing?.phone) points += 20;
    if (user.billing?.address_1 || user.shipping?.address_1) points += 20;
    return points;
  };

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

      if (user.meta_data) {
        const meta = user.meta_data.find((m: any) => m.key === "saved_addresses");
        if (meta?.value) {
          try {
            const parsed = typeof meta.value === "string" ? JSON.parse(meta.value) : meta.value;
            if (Array.isArray(parsed)) {
              setSavedAddresses(parsed);
            }
          } catch (e) {
            console.error("Error parsing saved addresses:", e);
          }
        }
      }
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
            billing: { ...billingForm, email: user.email, country: storeCountry },
            shipping: { ...billingForm, country: storeCountry },
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

  // Save Address Book list to WooCommerce
  const saveAddressesList = async (updatedList: SavedAddress[], successMsg: string) => {
    if (!user) return;
    setIsUpdatingAddress(true);
    try {
      const userMeta = [...(user.meta_data || [])];
      const addressIndex = userMeta.findIndex((m: any) => m.key === "saved_addresses");
      if (addressIndex > -1) {
        userMeta[addressIndex] = { ...userMeta[addressIndex], value: JSON.stringify(updatedList) };
      } else {
        userMeta.push({ key: "saved_addresses", value: JSON.stringify(updatedList) });
      }

      // Sync default address to primary billing & shipping if default changes or is set
      const defaultAddr = updatedList.find((a) => a.isDefault);
      const syncFields = defaultAddr ? {
        first_name: defaultAddr.first_name,
        last_name: defaultAddr.last_name,
        billing: {
          first_name: defaultAddr.first_name,
          last_name: defaultAddr.last_name,
          address_1: defaultAddr.address_1,
          city: defaultAddr.city,
          state: defaultAddr.state,
          postcode: defaultAddr.postcode,
          phone: defaultAddr.phone,
          country: defaultAddr.country || storeCountry,
          email: user.email,
        },
        shipping: {
          first_name: defaultAddr.first_name,
          last_name: defaultAddr.last_name,
          address_1: defaultAddr.address_1,
          city: defaultAddr.city,
          state: defaultAddr.state,
          postcode: defaultAddr.postcode,
          country: defaultAddr.country || storeCountry,
        }
      } : {};

      const res = await fetch("/api/customer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          customerData: {
            email: user.email,
            ...syncFields,
            meta_data: [
              { key: "saved_addresses", value: JSON.stringify(updatedList) }
            ],
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update addresses");

      setSession(token || "", data.user);
      showToast(successMsg, "success");
      setIsAddressFormOpen(false);
      setEditingAddress(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update address book", "error");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // Submit new or edited address
  const handleSaveAddressForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.first_name || !addressForm.address_1 || !addressForm.city || !addressForm.state || !addressForm.postcode || !addressForm.phone) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    let updatedList: SavedAddress[];
    if (editingAddress) {
      updatedList = savedAddresses.map((addr) =>
        addr.id === editingAddress.id
          ? { ...addr, ...addressForm }
          : addr
      );
    } else {
      const newAddress: SavedAddress = {
        id: Math.random().toString(36).substring(2, 15),
        ...addressForm,
        isDefault: savedAddresses.length === 0,
      };
      updatedList = [...savedAddresses, newAddress];
    }

    await saveAddressesList(updatedList, editingAddress ? "Address updated successfully!" : "New address added successfully!");
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    const target = savedAddresses.find((a) => a.id === addressId);
    let updatedList = savedAddresses.filter((addr) => addr.id !== addressId);
    
    if (target?.isDefault && updatedList.length > 0) {
      updatedList[0].isDefault = true;
    }

    await saveAddressesList(updatedList, "Address deleted successfully.");
  };

  // Set default address
  const handleSetDefaultAddress = async (addressId: string) => {
    const updatedList = savedAddresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    await saveAddressesList(updatedList, "Default address updated.");
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
  // RENDER: REROUTING LOGINS
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="section min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-[hsl(210,20%,98%)] px-4">
        <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--color-accent))] mb-4" />
        <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)] mb-1">
          Secure Authorization
        </h2>
        <p className="text-sm text-[hsl(215,16%,47%)]">
          Redirecting to secure member login panel...
        </p>
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
        <div className="bg-gradient-to-r from-[hsl(var(--color-accent))] to-[hsl(222,47%,11%)] rounded-3xl p-6 md:p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                      ? "bg-white text-[hsl(var(--color-accent))] shadow-sm border border-[hsl(214,13%,90%)]"
                      : "text-[hsl(215,16%,47%)] hover:bg-white/50 hover:text-[hsl(222,47%,11%)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--color-accent))] text-white text-[10px] font-bold">
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

                  {/* Profile Completion Card */}
                  <div className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[hsl(222,47%,11%)] uppercase tracking-wide">
                        Profile Completion
                      </span>
                      <span className="text-sm font-extrabold text-[hsl(var(--color-accent))]">
                        {calculateCompletion()}%
                      </span>
                    </div>
                    <div className="w-full bg-[hsl(214,13%,90%)] rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[hsl(var(--color-accent))] to-[hsl(222,47%,11%)] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${calculateCompletion()}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <button
                      onClick={() => setDashboardTab("orders")}
                      className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] hover:border-[hsl(var(--color-accent))] transition-all text-left flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                        Orders Placed
                      </span>
                      <span className="text-3xl font-display font-extrabold text-[hsl(222,47%,11%)] mt-2">
                        {orders.length}
                      </span>
                    </button>

                    <Link
                      href="/wishlist"
                      className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] hover:border-[hsl(var(--color-accent))] transition-all text-left flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                        Wishlist Items
                      </span>
                      <span className="text-3xl font-display font-extrabold text-[hsl(222,47%,11%)] mt-2">
                        {wishlistItems.length}
                      </span>
                    </Link>

                    <button
                      onClick={() => setDashboardTab("addresses")}
                      className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] hover:border-[hsl(var(--color-accent))] transition-all text-left flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                        Saved Addresses
                      </span>
                      <span className="text-3xl font-display font-extrabold text-[hsl(222,47%,11%)] mt-2">
                        {savedAddresses.length}
                      </span>
                    </button>
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
                          className="text-xs font-semibold text-[hsl(var(--color-accent))] hover:underline flex items-center gap-0.5"
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
                                className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-[hsl(var(--color-accent))] text-white hover:bg-[hsl(217,70%,30%)] transition-colors px-2.5 py-1 rounded-lg flex items-center justify-center gap-1 w-fit"
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

                  {/* Recently Viewed Products widget */}
                  {rvMounted && recentlyViewed.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[hsl(214,13%,90%)]">
                      <h3 className="font-semibold text-sm text-[hsl(222,47%,11%)] mb-4 uppercase tracking-wide">
                        Recently Viewed Items
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {recentlyViewed.slice(0, 4).map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] rounded-xl p-3 flex flex-col justify-between hover:border-[hsl(var(--color-accent))] transition-all group"
                          >
                            <div>
                              <div className="aspect-square bg-white rounded-lg overflow-hidden border border-[hsl(214,13%,90%)] flex items-center justify-center mb-2">
                                {product.images?.[0]?.src ? (
                                  <img
                                    src={product.images[0].src}
                                    alt={product.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <span className="text-lg">📦</span>
                                )}
                              </div>
                              <p className="font-semibold text-xs text-[hsl(222,47%,11%)] line-clamp-1 group-hover:text-[hsl(var(--color-accent))] transition-colors">
                                {product.name}
                              </p>
                            </div>
                            <p className="font-bold text-xs text-[hsl(222,47%,11%)] mt-2">
                              {formatPrice(parseFloat(product.price))}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
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
                                  className="mt-2 text-[10px] font-bold uppercase tracking-wider bg-[hsl(var(--color-accent))] text-white hover:bg-[hsl(217,70%,30%)] transition-colors px-2.5 py-1 rounded-lg flex items-center justify-center gap-1 w-fit"
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
                  {!isAddressFormOpen ? (
                    <>
                      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[hsl(214,13%,90%)] pb-4">
                        <div>
                          <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)]">
                            Address Book
                          </h2>
                          <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">
                            Manage your saved shipping and billing addresses for faster checkout.
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setEditingAddress(null);
                            setAddressForm({
                              first_name: user?.first_name || "",
                              last_name: user?.last_name || "",
                              address_1: "",
                              city: "",
                              state: "",
                              postcode: "",
                              phone: user?.billing?.phone || "",
                              country: storeCountry,
                            });
                            setIsAddressFormOpen(true);
                          }}
                          variant="primary"
                          className="flex items-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Add Address
                        </Button>
                      </div>

                      {savedAddresses.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-[hsl(214,13%,90%)] rounded-2xl bg-[hsl(210,20%,98%)]">
                          <MapPin className="h-10 w-10 text-[hsl(215,16%,47%)]/50 mx-auto mb-3" />
                          <h3 className="font-semibold text-base text-[hsl(222,47%,11%)]">No Addresses Saved</h3>
                          <p className="text-xs text-[hsl(215,16%,47%)] max-w-xs mx-auto mt-1 mb-4">
                            You haven't saved any addresses to your account profile yet.
                          </p>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setEditingAddress(null);
                              setAddressForm({
                                first_name: user?.first_name || "",
                                last_name: user?.last_name || "",
                                address_1: "",
                                city: "",
                                state: "",
                                postcode: "",
                                phone: user?.billing?.phone || "",
                                country: storeCountry,
                              });
                              setIsAddressFormOpen(true);
                            }}
                          >
                            Add Your First Address
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              className={cn(
                                "p-5 rounded-2xl border-2 bg-white transition-all flex flex-col justify-between hover:shadow-md",
                                addr.isDefault
                                  ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))/5]"
                                  : "border-[hsl(214,13%,90%)]"
                              )}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-[hsl(222,47%,11%)]">
                                      {addr.first_name} {addr.last_name}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="px-2 py-0.5 rounded-full bg-[hsl(142,71%,95%)] text-[hsl(142,71%,45%)] text-[10px] font-bold">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1 text-xs text-[hsl(215,16%,47%)] font-medium">
                                  <p>{addr.address_1}</p>
                                  <p>
                                    {addr.city}, {addr.state} - {addr.postcode}
                                  </p>
                                  <p>{addr.country === "IN" ? "India" : addr.country}</p>
                                  <p className="pt-2 text-[hsl(222,47%,11%)] font-semibold">
                                    📞 {addr.phone}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-[hsl(214,13%,90%)] pt-4 mt-5">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingAddress(addr);
                                      setAddressForm({
                                        first_name: addr.first_name,
                                        last_name: addr.last_name,
                                        address_1: addr.address_1,
                                        city: addr.city,
                                        state: addr.state,
                                        postcode: addr.postcode,
                                        phone: addr.phone,
                                        country: addr.country || storeCountry,
                                      });
                                      setIsAddressFormOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg border border-[hsl(214,13%,90%)] text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)] transition-colors"
                                    title="Edit Address"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="p-1.5 rounded-lg border border-[hsl(214,13%,90%)] text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-colors"
                                    title="Delete Address"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>

                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    className="text-xs font-bold text-[hsl(var(--color-accent))] hover:underline"
                                  >
                                    Set as Default
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-[hsl(214,13%,90%)] pb-4 mb-6">
                        <div>
                          <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)]">
                            {editingAddress ? "Edit Address" : "Add New Address"}
                          </h2>
                          <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">
                            {editingAddress ? "Modify your address details below." : "Create a new address for your profile."}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAddressFormOpen(false)}
                          className="text-xs font-semibold text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:underline"
                        >
                          Cancel & Return
                        </button>
                      </div>

                      <form onSubmit={handleSaveAddressForm} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={addressForm.first_name}
                              onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={addressForm.last_name}
                              onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                            />
                          </div>
                        </div>



                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={addressForm.address_1}
                            onChange={(e) => setAddressForm({ ...addressForm, address_1: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                            placeholder="House/Apartment number, street name, layout"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                              City *
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                              State *
                            </label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              maxLength={10}
                              value={addressForm.postcode}
                              onChange={(e) => setAddressForm({ ...addressForm, postcode: e.target.value })}
                              className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                              placeholder="400001"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(222,47%,11%)] mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            maxLength={15}
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/[^\d+]/g, "") })}
                            className="w-full h-11 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] text-sm focus:outline-none focus:border-[hsl(var(--color-accent))]"
                            placeholder="9876543210"
                            required
                          />
                        </div>

                        <div className="flex gap-4 mt-6">
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={isUpdatingAddress}
                          >
                            {editingAddress ? "Save Address" : "Add Address"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            onClick={() => setIsAddressFormOpen(false)}
                            disabled={isUpdatingAddress}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
