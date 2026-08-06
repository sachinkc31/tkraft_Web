"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center space-y-2">
        <h3 className="font-bold text-lg">Message Received!</h3>
        <p className="text-sm">Thank you for contacting TKraft support. Our team will get back to you within 2 to 4 business hours.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs font-semibold text-[hsl(var(--color-primary))] underline pt-2 inline-block"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="Enter your name"
            className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Email Address *</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Order Number (Optional)</label>
          <input
            type="text"
            placeholder="e.g. #TK-10293"
            className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Subject</label>
          <select className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]">
            <option>General Inquiry</option>
            <option>Order Status Update</option>
            <option>Return / Exchange Request</option>
            <option>Wholesale & Bulk Orders</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Message *</label>
        <textarea
          rows={4}
          required
          placeholder="How can we help you?"
          className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--color-surface))] border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full md:w-auto px-6 py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white font-bold text-sm hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
      >
        <Send className="h-4 w-4" /> Send Message
      </button>
    </form>
  );
}
