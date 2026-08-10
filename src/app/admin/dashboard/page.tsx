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
  Sparkles,
} from "lucide-react";
import { CAMPAIGN_PRESETS } from "@/services/cms";
import { formatPrice, cn } from "@/lib/utils";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

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

  const [activeTab, setActiveTab] = useState<"analytics" | "funnel" | "cms">("analytics");
  const [cmsTarget, setCmsTarget] = useState<"homepage" | "login">("homepage");
  const [cmsData, setCmsData] = useState<any>(null);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsSaveLoading, setCmsSaveLoading] = useState(false);
  const [cmsError, setCmsError] = useState("");
  const [cmsSuccess, setCmsSuccess] = useState("");
  const [expandedSection, setExpandedSection] = useState<string>("campaign");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // WordPress Media Picker Modal States
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTargetKey, setMediaPickerTargetKey] = useState<string | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaPagination, setMediaPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

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

  // Load CMS data on tab shift or cmsTarget change
  useEffect(() => {
    const savedKey = localStorage.getItem("tkraft_admin_token");
    if (savedKey && activeTab === "cms" && (!cmsData || cmsData._target !== cmsTarget)) {
      fetchCmsData(savedKey, cmsTarget);
    }
  }, [activeTab, cmsTarget]);

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
    setCmsData(null);
  }

  async function fetchCmsData(key: string, target: "homepage" | "login" = cmsTarget) {
    setCmsLoading(true);
    setCmsError("");
    try {
      const endpoint = target === "homepage" ? "/api/admin/homepage-content" : "/api/admin/login-content";
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load ${target === "homepage" ? "Homepage" : "Login"} CMS fields`);
      }

      const resData = await res.json();
      setCmsData({ ...(resData.acf || {}), _target: target });
    } catch (err: any) {
      setCmsError(err.message || "An error occurred fetching CMS fields");
    } finally {
      setCmsLoading(false);
    }
  }

  async function saveCmsData() {
    const savedKey = localStorage.getItem("tkraft_admin_token");
    if (!savedKey) return;
    setCmsSaveLoading(true);
    setCmsError("");
    setCmsSuccess("");
    try {
      const endpoint = cmsTarget === "homepage" ? "/api/admin/homepage-content" : "/api/admin/login-content";
      const payloadAcf = { ...cmsData };
      delete payloadAcf._target;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${savedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acf: payloadAcf,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save CMS fields to WordPress");
      }

      const resData = await res.json();
      setCmsData({ ...(resData.acf || {}), _target: cmsTarget });
      setCmsSuccess(`${cmsTarget === "homepage" ? "Homepage" : "Login Page"} Settings saved successfully to WordPress!`);
      setTimeout(() => setCmsSuccess(""), 4000);
    } catch (err: any) {
      setCmsError(err.message || "An error occurred saving CMS fields");
    } finally {
      setCmsSaveLoading(false);
    }
  }

  async function fetchMediaLibrary(page = 1, search = "") {
    setMediaLoading(true);
    try {
      const res = await fetch(`/api/admin/media?page=${page}&per_page=24&search=${encodeURIComponent(search)}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setMediaLibrary(resData.media || []);
        setMediaPagination(resData.pagination || { total: 0, pages: 1, currentPage: 1 });
      }
    } catch (err) {
      console.error("Failed to load WordPress media:", err);
    } finally {
      setMediaLoading(false);
    }
  }

  const openMediaPicker = (key: string) => {
    setMediaPickerTargetKey(key);
    setMediaPickerOpen(true);
    setMediaSearch("");
    fetchMediaLibrary(1, "");
  };

  const selectMediaItem = (item: any) => {
    if (mediaPickerTargetKey) {
      setCmsData((prev: any) => ({
        ...prev,
        [mediaPickerTargetKey]: {
          id: item.id,
          url: item.url,
        }
      }));
    }
    setMediaPickerOpen(false);
    setMediaPickerTargetKey(null);
  };

  function handleRefresh() {
    const savedKey = localStorage.getItem("tkraft_admin_token");
    if (savedKey) {
      if (activeTab === "cms") {
        fetchCmsData(savedKey);
      } else {
        fetchDashboardData(savedKey, days);
      }
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

  // --- Homepage CMS Editor Render Helper ---
  function renderCmsTab() {
    if (cmsLoading) {
      return (
        <div className="h-96 flex items-center justify-center bg-[hsl(222,47%,6%)]/40 rounded-3xl border border-[hsl(217,32%,17%)]">
          <div className="text-center space-y-3">
            <RefreshCw className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
            <p className="text-[hsl(215,16%,57%)] text-sm font-semibold">Loading WordPress SCF configuration...</p>
          </div>
        </div>
      );
    }

    if (cmsError) {
      return (
        <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-2xl text-center space-y-3">
          <p className="text-red-400 font-semibold">{cmsError}</p>
          <button
            onClick={() => {
              const savedKey = localStorage.getItem("tkraft_admin_token");
              if (savedKey) fetchCmsData(savedKey);
            }}
            className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-xs font-bold"
          >
            Retry Fetching CMS Fields
          </button>
        </div>
      );
    }

    if (!cmsData) return null;

    const updateCmsField = (key: string, value: any) => {
      setCmsData((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    };

    const toggleSection = (section: string) => {
      setExpandedSection(prev => prev === section ? "" : section);
    };

    // Sub-field render helpers
    const textInput = (label: string, key: string, placeholder = "") => (
      <div className="space-y-1 text-left">
        <label className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider block">{label}:</label>
        <input
          type="text"
          value={cmsData[key] || ""}
          onChange={(e) => updateCmsField(key, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
        />
      </div>
    );

    const imageInput = (label: string, key: string) => {
      const val = cmsData[key];
      const url = typeof val === "string" ? val : (val && typeof val === "object" ? (val.url || "") : "");
      return (
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider block">{label}:</label>
          <div className="space-y-2">
            {url && (
              <div className="relative w-full h-28 rounded-xl overflow-hidden bg-neutral-950 border border-[hsl(217,32%,17%)]/60 flex items-center justify-center p-2 group">
                <img src={url} alt={label} className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105" />
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => updateCmsField(key, e.target.value)}
                placeholder="Image URL (e.g. https://...)"
                className="flex-1 bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => openMediaPicker(key)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 hover:text-white text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Browse...
              </button>
            </div>
          </div>
        </div>
      );
    };

    const textareaInput = (label: string, key: string, placeholder = "") => (
      <div className="space-y-1 text-left">
        <label className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider block">{label}:</label>
        <textarea
          value={cmsData[key] || ""}
          onChange={(e) => updateCmsField(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
        />
      </div>
    );

    const numberInput = (label: string, key: string, placeholder = "") => (
      <div className="space-y-1 text-left">
        <label className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider block">{label}:</label>
        <input
          type="number"
          value={cmsData[key] !== undefined ? cmsData[key] : ""}
          onChange={(e) => updateCmsField(key, e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={placeholder}
          className="w-full bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
        />
      </div>
    );

    const toggleInput = (label: string, key: string) => (
      <div className="flex items-center justify-between py-2 border-b border-[hsl(217,32%,17%)]/50">
        <span className="text-sm font-semibold text-white">{label}</span>
        <button
          type="button"
          onClick={() => updateCmsField(key, !cmsData[key])}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
            cmsData[key] ? "bg-blue-600" : "bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)]"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              cmsData[key] ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    );

    const selectInput = (label: string, key: string, options: { value: string; label: string }[]) => (
      <div className="space-y-1 text-left">
        <label className="text-xs font-bold text-[hsl(215,16%,57%)] uppercase tracking-wider block">{label}:</label>
        <select
          value={cmsData[key] || ""}
          onChange={(e) => updateCmsField(key, e.target.value)}
          className="w-full bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none font-bold"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[hsl(222,47%,6%)] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );

    // Expandable card layout builder
    const editorSection = (id: string, title: string, icon: React.ReactNode, children: React.ReactNode) => {
      const isExpanded = expandedSection === id;
      return (
        <div className="rounded-2xl bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection(id)}
            className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-sm bg-[hsl(222,47%,6%)] hover:bg-[hsl(217,32%,17%)]/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                {icon}
              </div>
              <span className="text-base font-extrabold">{title}</span>
            </div>
            <ChevronRight className={cn("h-4 w-4 text-[hsl(215,16%,57%)] transition-transform duration-300", isExpanded && "rotate-90")} />
          </button>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 border-t border-[hsl(217,32%,17%)]/50 space-y-4 bg-[hsl(222,47%,6%)]/40">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Fields Accordion Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Target Content Switcher */}
          <div className="bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] rounded-2xl p-2 flex items-center justify-between shadow-sm">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (cmsTarget !== "homepage") {
                    setCmsTarget("homepage");
                    setExpandedSection("campaign");
                    const savedKey = localStorage.getItem("tkraft_admin_token");
                    if (savedKey) fetchCmsData(savedKey, "homepage");
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer",
                  cmsTarget === "homepage"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-[hsl(215,16%,57%)] hover:text-white hover:bg-[hsl(217,32%,17%)]/50"
                )}
              >
                <span>🏠</span> Homepage Content (6144)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cmsTarget !== "login") {
                    setCmsTarget("login");
                    setExpandedSection("login_copy");
                    const savedKey = localStorage.getItem("tkraft_admin_token");
                    if (savedKey) fetchCmsData(savedKey, "login");
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer",
                  cmsTarget === "login"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-[hsl(215,16%,57%)] hover:text-white hover:bg-[hsl(217,32%,17%)]/50"
                )}
              >
                <span>🔑</span> Login Page Content (login-content)
              </button>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[hsl(215,16%,47%)] px-3 hidden sm:inline">
              Target: {cmsTarget === "homepage" ? "page/6144" : "post/login-content"}
            </span>
          </div>

          {/* Header Action Bar */}
          <div className="flex items-center justify-between bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] rounded-2xl p-4 shadow-sm">
            <span className="text-xs font-extrabold text-[hsl(215,16%,57%)] uppercase tracking-wider">
              DRAFT STATUS: {cmsSaveLoading ? "Saving to WordPress..." : "UNSAVED CHANGES"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const savedKey = localStorage.getItem("tkraft_admin_token");
                  if (savedKey) fetchCmsData(savedKey, cmsTarget);
                }}
                disabled={cmsSaveLoading}
                className="px-4 py-2 border border-[hsl(217,32%,17%)] text-xs font-extrabold rounded-xl hover:bg-[hsl(217,32%,17%)]/50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Reset Draft
              </button>
              <button
                type="button"
                onClick={saveCmsData}
                disabled={cmsSaveLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {cmsSaveLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to WordPress
                  </>
                )}
              </button>
            </div>
          </div>

          {cmsSuccess && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold text-center animate-pulse">
              🎉 {cmsSuccess}
            </div>
          )}

          {cmsTarget === "login" ? (
            <>
              {/* Login Section 1: Title & Subtitle */}
              {editorSection("login_copy", "Login Promo Title & Subtitle Copy", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              ), (
                <div className="space-y-4">
                  {textInput("Login Promo Title", "login_promo_title", "e.g. Exclusive Member Benefits")}
                  {textareaInput("Login Promo Subtitle Copy", "login_promo_subtitle", "e.g. Unlock special deals, custom checkout pricing...")}
                </div>
              ))}

              {/* Login Section 2: Banner Images */}
              {editorSection("login_banners", "Login Promo Banner Images", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ), (
                <div className="space-y-4">
                  {imageInput("Desktop Promo Image", "login_promo_image")}
                  {imageInput("Mobile Promo Image", "login_promo_image_mobile")}
                </div>
              ))}

              {/* Login Section 3: Call-to-Action Button & Redirects */}
              {editorSection("login_cta", "Call-to-Action Button & Redirects", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              ), (
                <div className="space-y-4">
                  {textInput("CTA Button Copy", "login_promo_cta_text", "e.g. Shop Best Sellers")}
                  {textInput("CTA Redirect Link URL", "login_promo_cta_url", "e.g. /shop")}
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Section 0: Campaign Presets */}
              {editorSection("presets", "Quick Campaign Presets", (
                <Sparkles className="h-4 w-4" />
              ), (
                <div className="space-y-3">
                  <p className="text-xs text-[hsl(215,16%,57%)]">
                    Apply a preset to auto-fill campaign fields below. You can then fine-tune and save.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(CAMPAIGN_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setCmsData((prev: any) => ({
                            ...prev,
                            campaign_theme: key,
                            campaign_name: preset.name,
                            campaign_promo_text: preset.promoText,
                            campaign_color_primary: preset.colors.primary,
                            campaign_color_accent: preset.colors.accent,
                            campaign_color_surface: preset.colors.surface,
                            announcement_enabled: true,
                            announcement_text: preset.promoText,
                          }));
                          setExpandedSection("campaign");
                        }}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all hover:scale-[1.02] active:scale-[0.98]",
                          cmsData?.campaign_theme === key
                            ? "border-blue-500 bg-blue-600/20 text-white"
                            : "border-[hsl(217,32%,17%)] bg-[hsl(222,47%,11%)] text-[hsl(215,16%,57%)] hover:text-white hover:border-blue-500/50"
                        )}
                      >
                        <span className="block font-extrabold text-white mb-0.5">{preset.name}</span>
                        <span className="block text-[10px] leading-tight line-clamp-2 opacity-70">{preset.promoText}</span>
                        <div className="flex gap-1 mt-1.5">
                          {[preset.colors.primary, preset.colors.accent, preset.colors.surface].map((c, i) => (
                            <span key={i} className="h-3 w-3 rounded-full border border-white/20 inline-block" style={{ background: c }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Section 1: Campaigns */}
              {editorSection("campaign", "Campaigns & Announcement Ribbon", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
              ), (
                <div className="space-y-4">
                  {toggleInput("Enable Header Announcement Bar", "announcement_enabled")}
                  {textInput("Announcement Bar Text", "announcement_text", "e.g. Free shipping above $499")}
                  {textInput("Announcement Accent Color (Hex)", "announcement_bg_color", "e.g. #c62128")}
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Campaign ID (Unique key)", "campaign_id", "e.g. monsoon_sale_2026")}
                    {textInput("Campaign Display Name", "campaign_name", "e.g. Monsoon Dhamaka")}
                  </div>
                  {selectInput("Campaign HSL Theme", "campaign_theme", [
                    { value: "default", label: "Default Blue Theme" },
                    { value: "summer", label: "Summer Theme (Orange)" },
                    { value: "monsoon", label: "Monsoon Theme (Teal)" },
                    { value: "diwali", label: "Diwali Theme (Gold/Terracotta)" },
                    { value: "blackfriday", label: "Black Friday Theme (Black)" },
                    { value: "christmas", label: "Christmas Theme (Pine/Crimson)" },
                  ])}
                  {textInput("Campaign Banner Title Override", "campaign_headline")}
                  {textInput("Campaign CTA Copy", "campaign_cta_text")}
                  {textInput("Campaign Redirect Link", "campaign_cta_link")}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imageInput("Campaign Banner (Desktop)", "campaign_banner_image")}
                    {imageInput("Campaign Banner (Mobile)", "campaign_banner_image_mobile")}
                  </div>
                  {textInput("Campaign Product slugs or IDs list", "campaign_product_collection")}
                  {textInput("Campaign Ribbon Text", "campaign_promo_text")}
                  <hr className="border-[hsl(217,32%,17%)]/50" />
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Preset Color Overrides</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {textInput("Primary Color", "campaign_color_primary", "e.g. hsl(174,90%,30%)")}
                    {textInput("Accent Color", "campaign_color_accent", "e.g. hsl(150,80%,40%)")}
                    {textInput("Surface Color", "campaign_color_surface", "e.g. hsl(180,50%,98%)")}
                  </div>
                </div>
              ))}

              {/* Section 2: Hero Slide */}
              {editorSection("hero", "Hero Carousel Banner", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ), (
                <div className="space-y-4">
                  {textInput("Hero headline Title", "hero_title")}
                  {textareaInput("Hero subheadline Description", "hero_subtitle")}
                  {imageInput("Hero Desktop Background Image", "hero_desktop_image")}
                  {imageInput("Hero Mobile Background Image", "hero_mobile_image")}
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("CTA Button Copy", "hero_cta_text")}
                    {textInput("CTA Redirect link", "hero_cta_url")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectInput("Hero Text Alignment", "hero_alignment", [
                      { value: "left", label: "Left Aligned" },
                      { value: "center", label: "Centered" },
                      { value: "right", label: "Right Aligned" },
                    ])}
                    {selectInput("Hero Overlay Contrast Theme", "hero_theme", [
                      { value: "default", label: "Default Overlay" },
                      { value: "light", label: "Light Overlay" },
                      { value: "dark", label: "Dark Overlay" },
                      { value: "minimal", label: "Minimalist" },
                    ])}
                  </div>
                  {numberInput("Rotation Interval (Seconds)", "hero_scroll_interval_seconds")}
                </div>
              ))}

              {/* Section 3: Category Grid */}
              {editorSection("categories", "Category Collections Grid", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              ), (
                <div className="space-y-4">
                  {textInput("Section Title Header", "categories_title")}
                  {textInput("Section Subtitle Description", "categories_subtitle")}
                  {textInput("Fallback Category Slugs (comma list)", "categories_slugs")}
                  <hr className="border-[hsl(217,32%,17%)]/50" />
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Collection Card 1 Title", "collection_1_title")}
                    {textInput("Collection Card 1 Category IDs", "collection_1_category", "e.g. 5173,5171")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Collection Card 2 Title", "collection_2_title")}
                    {textInput("Collection Card 2 Category IDs", "collection_2_category", "e.g. 5179,5186")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Collection Card 3 Title", "collection_3_title")}
                    {textInput("Collection Card 3 Category IDs", "collection_3_category", "e.g. 4736,4735")}
                  </div>
                </div>
              ))}

              {/* Section 4: Product Collections */}
              {editorSection("collections", "Product Collection Limits", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              ), (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Trending Collection Title", "trending_title")}
                    {numberInput("Trending Limit Size", "trending_limit")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Best Sellers Title", "bestseller_title")}
                    {numberInput("Best Sellers Limit Size", "bestseller_limit")}
                  </div>
                </div>
              ))}

              {/* Section 5: Banners */}
              {editorSection("banners", "Mid-page Promotional Banners", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              ), (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Promo Banner 1 Settings</h4>
                  {textInput("Promo 1 Headline Title", "promo_title")}
                  {textInput("Promo 1 Subtitle Copy", "promo_description")}
                  {imageInput("Promo 1 Background Image", "promo_image")}
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Promo 1 Button Text", "promo_cta_text")}
                    {textInput("Promo 1 Redirect Link", "promo_cta_url")}
                  </div>
                  <hr className="border-[hsl(217,32%,17%)]/50" />
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">Call-to-Action Segment Banner</h4>
                  {textInput("CTA Section Title", "cta_title")}
                  {textareaInput("CTA Section Description", "cta_description")}
                  {imageInput("CTA Background Image", "cta_image")}
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("CTA Button Copy", "cta_button_text")}
                    {textInput("CTA Redirect link", "cta_button_url")}
                  </div>
                </div>
              ))}

              {/* Section 6: Trust Benefits */}
              {editorSection("trust", "Trust Badges & Benefits", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              ), (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Benefit 1 Heading", "benefit_1_title")}
                    {textInput("Benefit 1 Icon Name", "benefit_1_icon")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Benefit 2 Heading", "benefit_2_title")}
                    {textInput("Benefit 2 Icon Name", "benefit_2_icon")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Benefit 3 Heading", "benefit_3_title")}
                    {textInput("Benefit 3 Icon Name", "benefit_3_icon")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Benefit 4 Heading", "benefit_4_title")}
                    {textInput("Benefit 4 Icon Name", "benefit_4_icon")}
                  </div>
                  <hr className="border-[hsl(217,32%,17%)]/50" />
                  {textInput("Why Choose TKraft Header", "why_buy_title")}
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Bullet Copy item 1", "why_buy_item_1")}
                    {textInput("Bullet Copy item 2", "why_buy_item_2")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {textInput("Bullet Copy item 3", "why_buy_item_3")}
                    {textInput("Bullet Copy item 4", "why_buy_item_4")}
                  </div>
                </div>
              ))}

              {/* Section 7: Section Visibility Settings */}
              {editorSection("visibility", "Section Visibility Controller", (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              ), (
                <div className="space-y-1">
                  {toggleInput("Show Top Hero Carousel Banner", "enable_section_hero")}
                  {toggleInput("Show Customer Trust Benefits ribbon", "enable_section_benefits")}
                  {toggleInput("Show Category Grid section", "enable_section_categories")}
                  {toggleInput("Show Trending Products slider", "enable_section_trending")}
                  {toggleInput("Show Mid-page Promo Banner", "enable_section_promo")}
                  {toggleInput("Show Best Sellers grid", "enable_section_bestsellers")}
                  {toggleInput("Show Call-to-Action segmented block", "enable_section_cta")}
                  {toggleInput("Show Why Buy Highlights segment", "enable_section_highlights")}
                  {toggleInput("Show Customers Testimonial reviews", "enable_section_testimonials")}
                  {toggleInput("Show Homepage Newsletter subscriptions", "enable_section_newsletter")}
                </div>
              ))}
            </>
          )}

        </div>

        {/* Right Side: Visual Interactive Preview Simulator (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
          <div className="bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] rounded-3xl overflow-hidden shadow-lg">
            
            {/* Devices Simulator switcher header */}
            <div className="px-5 py-4 border-b border-[hsl(217,32%,17%)] flex items-center justify-between bg-[hsl(222,47%,6%)]">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[hsl(215,16%,57%)] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Live Mockup Screen
              </span>
              <div className="flex bg-[hsl(222,47%,11%)] border border-[hsl(217,32%,17%)] p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={cn("px-2.5 py-1 rounded transition-colors", previewDevice === "desktop" ? "bg-blue-600 text-white" : "text-[hsl(215,16%,57%)] hover:text-white")}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={cn("px-2.5 py-1 rounded transition-colors", previewDevice === "mobile" ? "bg-blue-600 text-white" : "text-[hsl(215,16%,57%)] hover:text-white")}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Viewport Frame */}
            <div className="p-4 bg-[hsl(222,47%,11%)] flex justify-center">
              <div
                className={cn(
                  "bg-white text-neutral-900 overflow-y-auto overflow-x-hidden border border-neutral-300 shadow-inner transition-all duration-300 rounded-2xl relative scrollbar-none",
                  previewDevice === "desktop" ? "w-full h-[520px]" : "w-[300px] h-[520px]"
                )}
                style={{ fontSize: previewDevice === "desktop" ? "13px" : "11px" }}
              >
                
                {cmsTarget === "login" ? (
                  /* MOCK LOGIN PAGE PREVIEW */
                  <div className="p-4 bg-slate-100 min-h-[500px] flex items-center justify-center">
                    <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden grid grid-cols-1 gap-4 p-4">
                      {/* Left Column Mock: Form */}
                      <div className="space-y-3">
                        <h3 className="font-extrabold text-sm text-slate-800">
                          Welcome back to T<span className="text-orange-500">kraft</span>
                        </h3>
                        <p className="text-[10px] text-slate-500">Log in to manage orders, check out faster, or save preferences.</p>

                        <div className="w-full h-8 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-50">
                          <svg className="h-3 w-3" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.524 0-6.38-2.856-6.38-6.38s2.856-6.38 6.38-6.38c1.6 0 3.056.59 4.186 1.562l3.14-3.14C19.262 2.23 15.966 1 12.24 1 5.683 1 .37 6.313.37 12.87s5.313 11.87 11.87 11.87c7.17 0 11.86-5.043 11.86-12.073 0-.78-.07-1.382-.24-2.382H12.24z"/></svg>
                          Sign in with Google
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="h-7 bg-slate-100 rounded-lg text-[9px] px-2.5 flex items-center text-slate-400 font-medium">Username or Email</div>
                          <div className="h-7 bg-slate-100 rounded-lg text-[9px] px-2.5 flex items-center text-slate-400 font-medium">••••••••</div>
                        </div>
                        <div className="h-7 bg-blue-600 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shadow-sm">Log In</div>
                      </div>

                      {/* Right Column Mock: Promo Card Banner */}
                      <div className="relative rounded-xl overflow-hidden min-h-[160px] flex flex-col justify-end p-3 text-white border border-slate-200">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${cmsData.login_promo_image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80"})`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                        <div className="relative z-10 space-y-1">
                          <span className="bg-orange-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded tracking-wider uppercase inline-block">Member Benefit</span>
                          <h4 className="font-extrabold text-xs leading-tight drop-shadow">
                            {cmsData.login_promo_title || "Exclusive Member Benefits"}
                          </h4>
                          <p className="text-[9px] text-slate-200 line-clamp-2 leading-tight font-medium">
                            {cmsData.login_promo_subtitle || "Unlock special deals, custom checkout pricing, and free shipping on all organizers."}
                          </p>
                          <button className="bg-white text-slate-900 font-bold text-[9px] px-2.5 py-1 rounded-lg mt-1 shadow transition-transform">
                            {cmsData.login_promo_cta_text || "Shop Best Sellers"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 1. MOCK Announcement Bar */}
                    {cmsData.announcement_enabled && (
                      <div
                        style={{ backgroundColor: cmsData.announcement_bg_color || "#c62128" }}
                        className="text-white text-center py-1.5 px-3 font-semibold text-[10px] leading-tight"
                      >
                        {cmsData.announcement_text || "🚚 Free shipping on orders over ₹499"}
                      </div>
                    )}

                    {/* 2. MOCK Navbar */}
                    <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                      <span className="font-extrabold tracking-tight text-blue-600">tkraft.online</span>
                      <div className="flex gap-2.5 text-[10px] font-bold text-neutral-500">
                        <span>Shop</span>
                        <span>Categories</span>
                        <span>Account</span>
                      </div>
                    </div>

                    {/* 3. MOCK Hero Slide Banner */}
                    {cmsData.enable_section_hero !== false && (
                      <div
                        style={{
                          backgroundImage: `url(${cmsData.hero_desktop_image || cmsData.hero_image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                        className={cn(
                          "h-48 relative flex items-center p-6 text-white text-left",
                          cmsData.hero_alignment === "center" && "justify-center text-center",
                          cmsData.hero_alignment === "right" && "justify-end text-right"
                        )}
                      >
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10 max-w-[80%] space-y-1.5">
                          <h2 className="font-black text-sm tracking-tight leading-snug drop-shadow-md text-white">
                            {cmsData.hero_title || "Make Everyday Tasks Easier"}
                          </h2>
                          <p className="text-[10px] text-neutral-200 line-clamp-2 drop-shadow-sm font-medium">
                            {cmsData.hero_subtitle || "Smart kitchen & organizers for storage solutions."}
                          </p>
                          <button style={{ backgroundColor: "#af040ce0", border: "1px solid #ffffff93" }} className="background[hsl(var(--color-primary))] bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg shadow-md mt-1 transition-all">
                            {cmsData.hero_cta_text || "Shop Now"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. MOCK Trust Benefits */}
                    {cmsData.enable_section_benefits !== false && (
                      <div className="bg-neutral-50 border-b py-3 px-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-neutral-700 font-semibold text-[9px]">
                        <div className="flex items-center gap-1.5 justify-center">
                          <span>🚚</span>
                          <span>{cmsData.benefit_1_title || "Fast Shipping"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span>🔒</span>
                          <span>{cmsData.benefit_2_title || "Secure Payments"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span>🔄</span>
                          <span>{cmsData.benefit_3_title || "Easy Returns"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center">
                          <span>⭐</span>
                          <span>{cmsData.benefit_4_title || "Quality Items"}</span>
                        </div>
                      </div>
                    )}

                    {/* 5. MOCK Category Grid */}
                    {cmsData.enable_section_categories !== false && (
                      <div className="py-4 px-4 bg-white border-b space-y-2">
                        <h3 className="font-bold text-center text-neutral-800 text-xs">
                          {cmsData.categories_title || "Shop by Category"}
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="border rounded-xl p-2.5 text-center bg-neutral-50 font-bold text-[10px]">
                            <span className="block text-lg">🍳</span>
                            <span className="text-neutral-700 line-clamp-1">{cmsData.collection_1_title || "Kitchen"}</span>
                          </div>
                          <div className="border rounded-xl p-2.5 text-center bg-neutral-50 font-bold text-[10px]">
                            <span className="block text-lg">📦</span>
                            <span className="text-neutral-700 line-clamp-1">{cmsData.collection_2_title || "Storage"}</span>
                          </div>
                          <div className="border rounded-xl p-2.5 text-center bg-neutral-50 font-bold text-[10px]">
                            <span className="block text-lg">🧹</span>
                            <span className="text-neutral-700 line-clamp-1">{cmsData.collection_3_title || "Cleaning"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. MOCK Product Carousel (Trending) */}
                    {cmsData.enable_section_trending !== false && (
                      <div className="py-4 px-4 bg-neutral-50 border-b space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-neutral-800 text-xs">{cmsData.trending_title || "Trending Now"}</h4>
                          <span className="text-[9px] text-blue-600 font-bold">View all ({cmsData.trending_limit || 8})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-white border rounded-xl p-2 space-y-1">
                            <div className="bg-neutral-100 rounded-lg aspect-square" />
                            <p className="font-bold text-[10px] text-neutral-800 truncate">Premium Organizer</p>
                            <p className="font-extrabold text-[10px] text-blue-600">₹499</p>
                          </div>
                          <div className="bg-white border rounded-xl p-2 space-y-1">
                            <div className="bg-neutral-100 rounded-lg aspect-square" />
                            <p className="font-bold text-[10px] text-neutral-800 truncate">Kitchen Container</p>
                            <p className="font-extrabold text-[10px] text-blue-600">₹299</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. MOCK Promo Banner */}
                    {cmsData.enable_section_promo !== false && (
                      <div
                        style={{
                          backgroundImage: `url(${cmsData.promo_image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                        className="h-28 relative flex items-center p-4 text-white border-b"
                      >
                        <div className="absolute inset-0 bg-black/35" />
                        <div className="relative z-10 space-y-1 max-w-[80%]">
                          <h4 className="font-black text-xs">{cmsData.promo_title || "Summer Clearance"}</h4>
                          <p className="text-[9px] text-neutral-200 line-clamp-1">{cmsData.promo_description || "Up to 50% discount on all organizers"}</p>
                          <button style={{ backgroundColor: "#af040ce0", border: "1px solid #ffffff93" }} className="bg-white text-blue-950 font-bold text-[8px] px-2 py-1 rounded shadow mt-1">
                            {cmsData.promo_cta_text || "Shop Clearance"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 8. MOCK CTA Segment */}
                    {cmsData.enable_section_cta !== false && (
                      <div
                        style={{
                          backgroundImage: `url(${cmsData.cta_image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                        className="h-32 relative flex items-center justify-center p-4 text-white border-b text-center"
                      >
                        <div className="absolute inset-0 bg-blue-900/60" />
                        <div className="relative z-10 space-y-1.5 max-w-[90%]">
                          <h4 className="font-black text-xs text-white">{cmsData.cta_title || "Upgrade Your Space"}</h4>
                          <p className="text-[9px] text-neutral-200 line-clamp-2">{cmsData.cta_description || "Indian household organizers designed for elegance."}</p>
                          <button style={{ backgroundColor: "#af040ce0", border: "1px solid #ffffff93" }} className="bg-white text-blue-950 font-bold text-[8px] px-2.5 py-1 rounded shadow">
                            {cmsData.cta_button_text || "Buy Now"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 9. MOCK Newsletter */}
                    {cmsData.enable_section_newsletter !== false && (
                      <div className="py-5 px-4 bg-neutral-100 border-b text-center space-y-2">
                        <h4 className="font-extrabold text-xs text-neutral-800">{cmsData.newsletter_title || "Join the Newsletter"}</h4>
                        <p className="text-[9px] text-neutral-500 max-w-[80%] mx-auto leading-relaxed">{cmsData.newsletter_subtitle || "Get 15% discount coupon on subscription"}</p>
                        <div className="flex gap-1.5 justify-center max-w-[90%] mx-auto pt-1">
                          <input
                            type="email"
                            disabled
                            placeholder={cmsData.newsletter_placeholder || "Your email address"}
                            className="bg-white border text-[9px] px-2 py-1 rounded flex-1 focus:outline-none"
                          />
                          <button style={{ backgroundColor: "#af040ce0", border: "1px solid #ffffff93" }} className="bg-white text-blue-950 font-bold text-[8px] px-3 py-1 rounded shadow">
                            {cmsData.newsletter_cta_text || "Subscribe"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Footer simulation */}
                    <div className="bg-neutral-900 text-neutral-500 text-center py-4 text-[8px] font-bold">
                      © 2026 tkraft.online • Made with Love
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>

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
              Store Control Panel
            </span>
            <div className="flex flex-wrap items-center gap-6 mt-1">
              <button
                onClick={() => setActiveTab("analytics")}
                className={cn(
                  "text-2xl md:text-3xl font-extrabold tracking-tight transition-colors pb-1 border-b-2",
                  activeTab === "analytics"
                    ? "text-white border-blue-500"
                    : "text-[hsl(215,16%,57%)] hover:text-white border-transparent"
                )}
              >
                Sales Dashboard
              </button>
              <button
                onClick={() => setActiveTab("funnel")}
                className={cn(
                  "text-2xl md:text-3xl font-extrabold tracking-tight transition-colors pb-1 border-b-2",
                  activeTab === "funnel"
                    ? "text-white border-blue-500"
                    : "text-[hsl(215,16%,57%)] hover:text-white border-transparent"
                )}
              >
                Analytics & Funnels
              </button>
              <button
                onClick={() => setActiveTab("cms")}
                className={cn(
                  "text-2xl md:text-3xl font-extrabold tracking-tight transition-colors pb-1 border-b-2",
                  activeTab === "cms"
                    ? "text-white border-blue-500"
                    : "text-[hsl(215,16%,57%)] hover:text-white border-transparent"
                )}
              >
                Visual CMS Editor
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Filter buttons */}
            {activeTab === "analytics" && (
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
            )}

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
        {activeTab === "cms" ? (
          renderCmsTab()
        ) : activeTab === "funnel" ? (
          <AnalyticsDashboard />
        ) : fetchError ? (
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

      {/* WordPress Media Picker Modal */}
      <AnimatePresence>
        {mediaPickerOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl text-white"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[hsl(217,32%,17%)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-bold text-lg">WordPress Media Library</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(false)}
                  className="p-1 rounded-lg hover:bg-[hsl(217,32%,17%)] text-[hsl(215,16%,57%)] hover:text-white transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Toolbar */}
              <div className="px-6 py-3 bg-[hsl(222,47%,11%)] border-b border-[hsl(217,32%,17%)] flex gap-4 items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Search media..."
                    className="w-full bg-[hsl(222,47%,6%)] border border-[hsl(217,32%,17%)] text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchMediaLibrary(1, mediaSearch);
                    }}
                  />
                  <div className="absolute left-3.5 top-2.5 text-[hsl(215,16%,57%)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fetchMediaLibrary(1, mediaSearch)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Search
                </button>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-none bg-[hsl(222,47%,6%)]/40">
                {mediaLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : mediaLibrary.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {mediaLibrary.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectMediaItem(item)}
                        className="group flex flex-col rounded-xl overflow-hidden border border-[hsl(217,32%,17%)] bg-neutral-950/40 hover:border-blue-500/80 transition-all text-left relative focus:outline-none"
                      >
                        <div className="aspect-square bg-neutral-900 flex items-center justify-center p-2 relative overflow-hidden">
                          <img src={item.thumbnail} alt={item.title} className="max-w-full max-h-full object-contain rounded transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="p-2 border-t border-[hsl(217,32%,17%)]">
                          <span className="text-[10px] text-[hsl(215,16%,57%)] group-hover:text-white truncate block">
                            {item.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[hsl(215,16%,57%)] text-sm font-semibold">
                    No WordPress assets found.
                  </div>
                )}
              </div>

              {/* Footer Pagination */}
              <div className="px-6 py-4 border-t border-[hsl(217,32%,17%)] bg-[hsl(222,47%,11%)] flex items-center justify-between">
                <span className="text-xs text-[hsl(215,16%,57%)]">
                  Total items: {mediaPagination.total}
                </span>
                <div className="flex gap-2 text-xs font-bold">
                  <button
                    type="button"
                    disabled={mediaPagination.currentPage <= 1 || mediaLoading}
                    onClick={() => fetchMediaLibrary(mediaPagination.currentPage - 1, mediaSearch)}
                    className="px-3 py-1.5 border border-[hsl(217,32%,17%)] rounded-lg hover:bg-[hsl(217,32%,17%)] transition-colors disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-2 text-[hsl(215,16%,57%)]">
                    Page {mediaPagination.currentPage} of {mediaPagination.pages}
                  </span>
                  <button
                    type="button"
                    disabled={mediaPagination.currentPage >= mediaPagination.pages || mediaLoading}
                    onClick={() => fetchMediaLibrary(mediaPagination.currentPage + 1, mediaSearch)}
                    className="px-3 py-1.5 border border-[hsl(217,32%,17%)] rounded-lg hover:bg-[hsl(217,32%,17%)] transition-colors disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
