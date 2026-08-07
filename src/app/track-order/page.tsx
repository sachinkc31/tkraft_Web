import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Package, Search, Truck, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

import { TrackOrderForm } from "@/components/forms/track-order-form";

export const metadata: Metadata = {
  title: `Track Your Order – Live Courier Package Tracking | ${SITE_CONFIG.name}`,
  description:
    "Track your TKraft package live. Enter your Order ID or AWB tracking number to check real-time courier status and estimated delivery time.",
  alternates: {
    canonical: "/track-order",
  },
  openGraph: {
    title: `Track Your Order – Live Courier Package Tracking | ${SITE_CONFIG.name}`,
    description:
      "Track your TKraft package live. Enter your Order ID or AWB tracking number to check real-time courier status and estimated delivery time.",
    url: "/track-order",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function TrackOrderPage() {
  const trackFaqs = [
    {
      question: "Where can I find my Order ID or AWB tracking number?",
      answer: "Your Order ID (e.g. #TK-10293) and AWB tracking number are sent via SMS, WhatsApp, and Email immediately after your order is dispatched.",
    },
    {
      question: "When will my tracking link activate?",
      answer: "Tracking links typically activate within 6 to 12 hours after the courier partner picks up your package from our warehouse.",
    },
    {
      question: "What if my tracking status hasn't updated?",
      answer: "Courier partners update scans at major transit hubs. If your status has not updated for over 48 hours, contact support@tkraft.online.",
    },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/track-order",
          name: "Track Your Order – TKraft Package Tracking",
          description: "Live order and shipment tracking for TKraft orders across India.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Track Order", url: "/track-order" },
          ],
        }}
      />
      <FAQSchema data={{ items: trackFaqs }} />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Package Status
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Enter your Order ID (e.g., #TK-10293) or AWB Tracking Number below to view live shipment updates.
          </p>
        </div>

        {/* Tracking Input Component */}
        <TrackOrderForm />

        {/* Courier Partner Badges */}
        <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3 text-center">
          <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">Official Delivery Courier Partners</h3>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[hsl(var(--color-text-muted))]">
            <span className="px-3 py-1 bg-[hsl(var(--color-surface))] rounded-lg border border-neutral-200 dark:border-neutral-800">Shiprocket</span>
            <span className="px-3 py-1 bg-[hsl(var(--color-surface))] rounded-lg border border-neutral-200 dark:border-neutral-800">BlueDart</span>
            <span className="px-3 py-1 bg-[hsl(var(--color-surface))] rounded-lg border border-neutral-200 dark:border-neutral-800">Delhivery</span>
            <span className="px-3 py-1 bg-[hsl(var(--color-surface))] rounded-lg border border-neutral-200 dark:border-neutral-800">Expressbees</span>
            <span className="px-3 py-1 bg-[hsl(var(--color-surface))] rounded-lg border border-neutral-200 dark:border-neutral-800">DTDC</span>
          </div>
        </div>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight">Tracking FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trackFaqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h3 className="font-bold text-sm">{faq.question}</h3>
                <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
