import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import { WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

export const metadata: Metadata = {
  title: `Privacy Policy – Data Protection & Security | ${SITE_CONFIG.name}`,
  description:
    "Read TKraft's Privacy Policy. Learn how we collect, store, encrypt, and protect your personal information during online shopping.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy – Data Protection & Security | ${SITE_CONFIG.name}`,
    description:
      "Read TKraft's Privacy Policy. Learn how we collect, store, encrypt, and protect your personal information during online shopping.",
    url: "/privacy-policy",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function PrivacyPolicyPage() {
  const privacyFaqs = [
    {
      question: "Does TKraft sell customer data?",
      answer: "No, TKraft never sells, rents, or trades customer data to third-party advertisers.",
    },
    {
      question: "How is my payment information protected?",
      answer: "All payments are processed through Razorpay's PCI-DSS compliant 256-bit SSL encrypted payment gateway.",
    },
    {
      question: "Can I request deletion of my data?",
      answer: "Yes, you can request account and personal data deletion by contacting privacy@tkraft.online.",
    },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/privacy-policy",
          name: "Privacy Policy – TKraft India",
          description: "TKraft's data protection, privacy terms, and encryption standards.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Privacy Policy", url: "/privacy-policy" },
          ],
        }}
      />
      <FAQSchema data={{ items: privacyFaqs }} />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Security & Trust
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Your privacy and data security are fundamental to TKraft. This policy outlines how we handle, protect, and use your personal information.
          </p>
          <p className="text-xs text-[hsl(var(--color-text-muted))]">Last Updated: May 19, 2026</p>
        </div>

        {/* Security Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Lock className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">256-bit SSL Encryption</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">All website data and transactions are fully encrypted.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Shield className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Zero Data Selling</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">We never rent or sell your personal details to third parties.</p>
          </div>
          <div className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Eye className="h-6 w-6 text-[hsl(var(--color-primary))]" />
            <h3 className="font-bold text-base">Full Data Control</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">Request access or deletion of your profile data anytime.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">1. Information We Collect</h2>
            <p>We collect information necessary to fulfill your orders and improve shopping experience:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Personal Details:</strong> Full name, phone number, shipping address, and email address.</li>
              <li><strong>Transaction Data:</strong> Order history, cart contents, and payment receipt confirmations.</li>
              <li><strong>Technical Logs:</strong> IP address, device type, browser information, and cookie analytics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">2. How We Use Your Information</h2>
            <p>Your data is used strictly for legitimate e-commerce operations:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Processing, packing, and dispatching orders via logistics partners.</li>
              <li>Sending SMS / WhatsApp tracking updates and order confirmations.</li>
              <li>Providing responsive customer service and resolving queries.</li>
              <li>Preventing payment fraud and maintaining system security.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">3. Certified Third-Party Services</h2>
            <p>We share data exclusively with verified operational partners:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Payment Gateway:</strong> Razorpay (PCI-DSS Level 1 Compliant).</li>
              <li><strong>Courier Logistics:</strong> Shiprocket, BlueDart, Delhivery for package delivery.</li>
            </ul>
          </section>
        </div>

        {/* FAQs */}
        <section className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight">Privacy FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {privacyFaqs.map((faq, idx) => (
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
