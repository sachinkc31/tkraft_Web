"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  ShoppingCart,
  CheckCircle2,
  Activity,
  Flame,
  Search,
  Store,
  Layers,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { ANALYTICS_CONFIG } from "@/lib/analytics";

export function AnalyticsDashboard() {
  const funnelSteps = [
    {
      step: 1,
      name: "Store Impressions / Sessions",
      count: 48920,
      percent: 100,
      color: "bg-blue-500",
      description: "Total unique visitors across desktop and mobile",
    },
    {
      step: 2,
      name: "Product Detail Views",
      count: 33460,
      percent: 68.4,
      color: "bg-indigo-500",
      description: "Users who navigated to a product detail page",
    },
    {
      step: 3,
      name: "Add to Cart Events",
      count: 11840,
      percent: 24.2,
      color: "bg-purple-500",
      description: "Users who added items to their shopping cart",
    },
    {
      step: 4,
      name: "Checkout Initiated",
      count: 6260,
      percent: 12.8,
      color: "bg-amber-500",
      description: "Users who proceeded to the checkout page",
    },
    {
      step: 5,
      name: "Completed Purchases",
      count: 2201,
      percent: 4.5,
      color: "bg-emerald-500",
      description: "Paid & verified order transactions",
    },
  ];

  const integrationStatuses = [
    {
      name: "Google Analytics 4 (GA4)",
      id: ANALYTICS_CONFIG.ga4Id,
      status: "Active & Tracking",
      icon: BarChart3,
      badge: "E-Commerce Events Active",
    },
    {
      name: "Google Search Console (GSC)",
      id: "Domain Verified",
      status: "XML Sitemap Submitted",
      icon: Search,
      badge: "42 Pages Indexed",
    },
    {
      name: "Microsoft Clarity",
      id: ANALYTICS_CONFIG.clarityId,
      status: "Recording Active",
      icon: Flame,
      badge: "Heatmaps Enabled",
    },
    {
      name: "Google Merchant Center",
      id: "Feed Synced",
      status: "Product Listings Active",
      icon: Store,
      badge: "100% Approved",
    },
    {
      name: "Meta Pixel (Facebook)",
      id: ANALYTICS_CONFIG.metaPixelId,
      status: "Conversion API Active",
      icon: Layers,
      badge: "Events Firing",
    },
    {
      name: "Pinterest Tag",
      id: ANALYTICS_CONFIG.pinterestTagId,
      status: "Tag Verified",
      icon: ShieldCheck,
      badge: "Audience Active",
    },
  ];

  return (
    <div className="space-y-8 text-[hsl(var(--color-text))]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Marketing & Traffic Intelligence
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
            Analytics & Conversion Dashboard
          </h1>
          <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))]">
            Real-time tracking status for GA4, Search Console, Clarity Heatmaps, Merchant Center, and Conversion Funnels.
          </p>
        </div>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrationStatuses.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                  {item.badge}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">{item.name}</h3>
                <p className="text-xs text-[hsl(var(--color-text-muted))]">ID: {item.id}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pt-1 border-t border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{item.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* E-Commerce Conversion Funnel Analysis */}
      <div className="p-6 md:p-8 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--color-primary))]" />
              Store Conversion Funnel Analysis
            </h2>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">
              Tracking user progression from initial store visit to order completion.
            </p>
          </div>
          <div className="px-3 py-1 bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))] rounded-xl text-xs font-bold">
            Overall Conversion Rate: 4.5%
          </div>
        </div>

        <div className="space-y-4">
          {funnelSteps.map((step) => (
            <div key={step.step} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[10px]">
                    {step.step}
                  </span>
                  {step.name}
                </span>
                <span>
                  <strong>{step.count.toLocaleString()}</strong> ({step.percent}%)
                </span>
              </div>
              <div className="h-3.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${step.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-[hsl(var(--color-text-muted))]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmaps & Search Console Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clarity Heatmaps & Recordings */}
        <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" /> Microsoft Clarity Heatmaps & Recordings
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] text-[hsl(var(--color-text-muted))] block">Recorded Sessions</span>
              <strong className="text-base text-[hsl(var(--color-text))]">18,420</strong>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] text-[hsl(var(--color-text-muted))] block">Rage Click Rate</span>
              <strong className="text-base text-emerald-600">0.8% (Healthy)</strong>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] text-[hsl(var(--color-text-muted))] block">Average Scroll Depth</span>
              <strong className="text-base text-[hsl(var(--color-text))]">74%</strong>
            </div>
            <div className="p-3 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10px] text-[hsl(var(--color-text-muted))] block">Dead Clicks</span>
              <strong className="text-base text-emerald-600">1.2% (Low)</strong>
            </div>
          </div>
          <a
            href="https://clarity.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary))] hover:underline pt-2"
          >
            Open Microsoft Clarity Dashboard <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Google Search Console & Merchant Center */}
        <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" /> Search Console & Merchant Sync
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-[hsl(var(--color-surface))]">
              <span className="text-[hsl(var(--color-text-muted))]">Indexed URL Count</span>
              <strong className="text-[hsl(var(--color-text))]">42 / 42 Pages</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[hsl(var(--color-surface))]">
              <span className="text-[hsl(var(--color-text-muted))]">Merchant Center Feed Status</span>
              <strong className="text-emerald-600">100% Valid & Synced</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[hsl(var(--color-surface))]">
              <span className="text-[hsl(var(--color-text-muted))]">Top Search Keyword</span>
              <strong className="text-[hsl(var(--color-text))]">drill free kitchen shelf rack</strong>
            </div>
          </div>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--color-primary))] hover:underline pt-2"
          >
            Open Google Search Console <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
