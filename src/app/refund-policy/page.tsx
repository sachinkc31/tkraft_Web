import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { RotateCcw, ShieldAlert, CheckCircle2, DollarSign } from "lucide-react";
import { WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

export const metadata: Metadata = {
  title: `Refund & Return Policy – 7 Days Easy Returns | ${SITE_CONFIG.name}`,
  description:
    "Learn about TKraft's 7-Day Refund & Return Policy. Simple returns, instant replacement for damaged items, and quick refund processing.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: `Refund & Return Policy – 7 Days Easy Returns | ${SITE_CONFIG.name}`,
    description:
      "Learn about TKraft's 7-Day Refund & Return Policy. Simple returns, instant replacement for damaged items, and quick refund processing.",
    url: "/refund-policy",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function RefundPolicyPage() {
  const returnFaqs = [
    {
      question: "What is TKraft's return window?",
      answer: "We offer a 7-day hassle-free return window from the date of package delivery.",
    },
    {
      question: "How long does a refund take?",
      answer: "Refunds are processed within 2 to 4 business days after inspecting the returned item at our hub.",
    },
    {
      question: "What if I receive a damaged or wrong product?",
      answer: "If you receive a damaged or incorrect product, contact us at support@tkraft.in within 48 hours with a photo/video for free instant replacement.",
    },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/refund-policy",
          name: "Refund & Return Policy – TKraft India",
          description: "TKraft's official 7-day return, exchange, and refund terms.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Refund & Return Policy", url: "/refund-policy" },
          ],
        }}
      />
      <FAQSchema data={{ items: returnFaqs }} />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Customer Guarantees
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Refund & Return Policy
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            At TKraft, we stand behind the quality of our home and kitchen organizers. If you are not completely satisfied, we offer 7-day easy returns and exchanges.
          </p>
        </div>

        {/* Policy Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <RotateCcw className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">7-Day Easy Returns</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Return any unused product within 7 days of delivery.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <ShieldAlert className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Free Transit Damage Protection</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Instant free replacement for items damaged in transit.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <DollarSign className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Quick Refund Processing</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Refunds credited back via UPI / original payment method in 2-4 days.</p>
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="space-y-8 text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">1. Eligibility for Returns</h2>
            <p>To be eligible for a return or exchange, your item must meet the following criteria:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Item must be unused, unwashed, and in original condition.</li>
              <li>Must include original packaging, brand tags, and accessories.</li>
              <li>Return request submitted within 7 days of order delivery date.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">2. How to Initiate a Return</h2>
            <p>Initiating a return is simple:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Email us at <a href="mailto:support@tkraft.in" className="text-[hsl(var(--color-primary))] underline font-semibold">support@tkraft.in</a> or visit our <Link href="/contact" className="text-[hsl(var(--color-primary))] underline font-semibold">Contact Page</Link>.</li>
              <li>Provide your Order ID (e.g., #TK-10293) and reason for return.</li>
              <li>If damaged, attach 1 photo or video showing the defect.</li>
              <li>Our logistics courier partner will arrange a doorstep reverse pickup within 48 hours.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">3. Refund SLA & Payment Options</h2>
            <p>
              Once the returned package reaches our warehouse and passes quality inspection, your refund will be initiated within 24 hours:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Prepaid Orders:</strong> Refund credited directly to original bank account / card / UPI in 2-4 business days.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refund credited to your provided UPI ID or bank account details within 2 business days.</li>
            </ul>
          </section>
        </div>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight">Return Policy FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {returnFaqs.map((faq, idx) => (
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
