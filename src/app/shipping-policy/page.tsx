import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Truck, ShieldCheck, Clock, MapPin, PackageCheck } from "lucide-react";
import { WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

export const metadata: Metadata = {
  title: `Shipping Policy & Delivery Times – ${SITE_CONFIG.name}`,
  description:
    "Read TKraft's official Shipping Policy. Enjoy free express shipping across India on orders above ₹499, delivery within 2 to 5 business days, and real-time tracking.",
  alternates: {
    canonical: "/shipping-policy",
  },
  openGraph: {
    title: `Shipping Policy & Delivery Times – ${SITE_CONFIG.name}`,
    description:
      "Read TKraft's official Shipping Policy. Enjoy free express shipping across India on orders above ₹499, delivery within 2 to 5 business days, and real-time tracking.",
    url: "/shipping-policy",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function ShippingPolicyPage() {
  const shippingFaqs = [
    {
      question: "How much does shipping cost at TKraft?",
      answer: "We offer FREE express shipping across India on all orders above ₹499. For orders below ₹499, a nominal flat rate of ₹49 applies.",
    },
    {
      question: "How long will my delivery take?",
      answer: "Orders are processed within 24 hours. Estimated delivery time is 2 to 4 business days for metro cities and 3 to 6 business days for rest of India.",
    },
    {
      question: "Is Cash on Delivery (COD) available?",
      answer: "Yes, Cash on Delivery (COD) is available across major pincodes in India.",
    },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/shipping-policy",
          name: "Shipping Policy – TKraft India",
          description: "Details on shipping costs, delivery times, pincode serviceability, and order processing at TKraft.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Shipping Policy", url: "/shipping-policy" },
          ],
        }}
      />
      <FAQSchema data={{ items: shippingFaqs }} />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Logistics & Delivery
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Shipping Policy
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Fast, reliable, and secure delivery across India. Learn everything about our shipping rates, transit times, order processing, and tracking.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Truck className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Free Shipping Over ₹499</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Enjoy 100% free shipping anywhere in India on orders ₹499+.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Clock className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">2-5 Day Express Delivery</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Processed within 24 hours via top courier partners.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <PackageCheck className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Live SMS & WhatsApp Tracking</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Receive real-time tracking updates directly on your phone.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">1. Order Processing Time</h2>
            <p>
              All orders are verified and dispatched within 24 business hours from our fulfillment hub. Orders placed on Sundays or national holidays are dispatched on the next business day.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">2. Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Prepaid Orders above ₹499:</strong> FREE Express Shipping.</li>
              <li><strong>Orders below ₹499:</strong> Nominal flat shipping fee of ₹49.</li>
              <li><strong>Cash on Delivery (COD):</strong> Available across 19,000+ pincodes in India.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">3. Delivery Partners & SLA</h2>
            <p>
              We partner with India&apos;s leading courier services including Shiprocket, BlueDart, Delhivery, Expressbees, and DTDC.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-[hsl(var(--color-text))]">Metro Cities</h4>
                <p className="text-xs">2 to 4 Business Days</p>
              </div>
              <div className="p-4 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800">
                <h4 className="font-bold text-sm text-[hsl(var(--color-text))]">Rest of India & Tier 2/3 Cities</h4>
                <p className="text-xs">3 to 6 Business Days</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">4. Order Tracking</h2>
            <p>
              Once your package is shipped, you will receive an AWB tracking number via SMS, WhatsApp, and Email. You can also track your shipment live on our{" "}
              <Link href="/track-order" className="text-[hsl(var(--color-primary))] underline font-semibold">
                Order Tracking Page
              </Link>.
            </p>
          </section>
        </div>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight">Shipping FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingFaqs.map((faq, idx) => (
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
