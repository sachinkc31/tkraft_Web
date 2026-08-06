"use client";

import React, { useState } from "react";
import { Package, Search, Truck, CheckCircle2 } from "lucide-react";

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState("");
  const [mobile, setMobile] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setTrackingResult({
      orderId: orderId.toUpperCase(),
      status: "In Transit via Shiprocket Express",
      estimatedDelivery: "2 to 3 Business Days",
      steps: [
        { label: "Order Confirmed", done: true, date: "Aug 05, 2026" },
        { label: "Dispatched from Mumbai Hub", done: true, date: "Aug 06, 2026" },
        { label: "In Transit to Destination Hub", done: true, date: "Aug 06, 2026" },
        { label: "Out for Delivery", done: false, date: "Expected Soon" },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="p-6 md:p-8 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-6">
        <form className="space-y-4" onSubmit={handleTrack}>
          <div>
            <label className="block text-xs font-semibold mb-1">Order ID or AWB Tracking Number *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. TK-10293 or 143029102"
                className="w-full px-4 py-3 pl-11 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
              />
              <Package className="h-5 w-5 text-neutral-400 absolute left-3.5 top-3" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Mobile Number or Email *</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number used during checkout"
              className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[hsl(var(--color-primary))] text-white font-bold text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" /> Track Package Status
          </button>
        </form>
      </div>

      {trackingResult && (
        <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <span className="text-xs text-[hsl(var(--color-text-muted))]">Tracking Result for:</span>
              <h3 className="font-bold text-base text-[hsl(var(--color-text))]">{trackingResult.orderId}</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" /> {trackingResult.status}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[hsl(var(--color-primary))]">
              Shipment Timeline
            </h4>
            <div className="space-y-3 pl-2 border-l-2 border-[hsl(var(--color-primary))]/30">
              {trackingResult.steps.map((step: any, idx: number) => (
                <div key={idx} className="relative pl-4">
                  <div
                    className={`absolute -left-[17px] top-0.5 h-3.5 w-3.5 rounded-full ${
                      step.done
                        ? "bg-[hsl(var(--color-primary))]"
                        : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  />
                  <p className="text-xs font-semibold text-[hsl(var(--color-text))]">{step.label}</p>
                  <p className="text-[11px] text-[hsl(var(--color-text-muted))]">{step.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
