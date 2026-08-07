import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Scale, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

export const metadata: Metadata = {
  title: `Terms & Conditions – Terms of Service | ${SITE_CONFIG.name}`,
  description:
    "Read TKraft's Terms and Conditions. Understand your rights, user obligations, pricing, order acceptance, and site usage policies.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `Terms & Conditions – Terms of Service | ${SITE_CONFIG.name}`,
    description:
      "Read TKraft's Terms and Conditions. Understand your rights, user obligations, pricing, order acceptance, and site usage policies.",
    url: "/terms",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function TermsPage() {
  const termsFaqs = [
    {
      question: "Are prices on TKraft inclusive of taxes?",
      answer: "Yes, all product prices listed on TKraft are inclusive of applicable GST taxes in India.",
    },
    {
      question: "Can an order be cancelled after placement?",
      answer: "Orders can be cancelled before dispatch via your Account dashboard or by emailing support@tkraft.online.",
    },
    {
      question: "What law governs TKraft transactions?",
      answer: "All transactions and legal disputes are governed by the laws of India under Mumbai jurisdiction.",
    },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/terms",
          name: "Terms & Conditions – TKraft India",
          description: "Terms of Service, order acceptance, and user guidelines for TKraft.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Terms & Conditions", url: "/terms" },
          ],
        }}
      />
      <FAQSchema data={{ items: termsFaqs }} />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Legal Terms
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Welcome to TKraft. By using our website or placing an order, you agree to comply with and be bound by the following Terms of Service.
          </p>
          <p className="text-xs text-[hsl(var(--color-text-muted))]">Effective Date: January 1, 2026</p>
        </div>

        {/* Key Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Scale className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Governing Law</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Subject to laws of India under Mumbai jurisdiction.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <CheckCircle className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">All Taxes Included</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Listed prices include GST with no hidden checkout fees.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <AlertCircle className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Fair Usage Policy</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Protection against fraudulent COD bookings or abuse.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">1. User Eligibility & Account Responsibilities</h2>
            <p>
              By accessing TKraft, you confirm that you are at least 18 years of age or accessing the site under supervision of a parent or legal guardian. You are responsible for maintaining confidentiality of your account credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">2. Pricing, Invoicing & GST</h2>
            <p>
              All prices listed on TKraft are in Indian Rupees (INR) and include GST. We reserve the right to modify prices or discontinue items without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">3. Orders & Cancellation Policy</h2>
            <p>
              Order receipt does not signify final acceptance. TKraft reserves the right to cancel orders due to pricing inaccuracies or stock unavailability. Orders can be cancelled prior to dispatch via your account dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">4. Related Policies</h2>
            <p>
              Please review our <Link href="/shipping-policy" className="text-[hsl(var(--color-primary))] underline font-semibold">Shipping Policy</Link>, <Link href="/refund-policy" className="text-[hsl(var(--color-primary))] underline font-semibold">Refund Policy</Link>, and <Link href="/privacy-policy" className="text-[hsl(var(--color-primary))] underline font-semibold">Privacy Policy</Link> for complete details.
            </p>
          </section>
        </div>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight">Terms FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {termsFaqs.map((faq, idx) => (
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
