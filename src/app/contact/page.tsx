import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { OrganizationSchema, WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: `Contact Us – ${SITE_CONFIG.name} Support & Customer Care`,
  description:
    "Get in touch with TKraft customer care. Reach out for order status, shipping inquiries, returns, or wholesale queries via email or phone.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact Us – ${SITE_CONFIG.name} Support & Customer Care`,
    description:
      "Get in touch with TKraft customer care. Reach out for order status, shipping inquiries, returns, or wholesale queries via email or phone.",
    url: "/contact",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  const contactFaqs = [
    {
      question: "How can I contact TKraft customer support?",
      answer: "You can reach our customer support team via email at support@tkraft.in or by calling our hotline during business hours (Mon-Sat, 9 AM - 7 PM IST).",
    },
    {
      question: "What is the response time for customer inquiries?",
      answer: "We strive to answer all emails and contact messages within 2 to 4 business hours.",
    },
    {
      question: "Where is TKraft located?",
      answer: "TKraft operations are headquartered in Mumbai, India, with regional fulfillment centers across the country for fast express shipping.",
    },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <OrganizationSchema />
      <WebPageSchema
        data={{
          url: "/contact",
          name: "Contact Us – TKraft Customer Care",
          description: "Reach TKraft customer support for order help, shipping, returns, and general inquiries.",
          pageType: "ContactPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Contact Us", url: "/contact" },
          ],
        }}
      />
      <FAQSchema data={{ items: contactFaqs }} />

      <div className="container max-w-5xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Customer Support
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            We&apos;re Here to Help
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Have a question about your order, shipping, returns, or product recommendations? Get in touch with our team—we&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3 text-center md:text-left">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mx-auto md:mx-0">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Email Us</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">
              Send us an email anytime and we&apos;ll respond within 2-4 hours.
            </p>
            <a
              href="mailto:support@tkraft.in"
              className="text-sm font-semibold text-[hsl(var(--color-primary))] underline inline-block"
            >
              support@tkraft.in
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3 text-center md:text-left">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mx-auto md:mx-0">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Call Us</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">
              Speak directly with our support specialist during office hours.
            </p>
            <a
              href="tel:+917972029553"
              className="text-sm font-semibold text-[hsl(var(--color-primary))] underline inline-block"
            >
              +91-7972029553
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3 text-center md:text-left">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mx-auto md:mx-0">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Support Hours</h3>
            <p className="text-xs text-[hsl(var(--color-text-muted))]">
              Monday to Saturday<br />
              9:00 AM – 7:00 PM IST
            </p>
            <span className="text-xs text-[hsl(var(--color-primary))] font-semibold">Sunday: Closed</span>
          </div>
        </div>

        {/* Contact Form & Help Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 p-6 md:p-8 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-xl font-bold">Send Us a Message</h2>
            <ContactForm />
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--color-primary))]" /> Quick Self Help
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Looking for immediate answers? Try these quick links before submitting a message:
              </p>
              <div className="space-y-2 text-xs font-semibold pt-1">
                <Link href="/track-order" className="block text-[hsl(var(--color-primary))] hover:underline">
                  → Track Your Package Location
                </Link>
                <Link href="/shipping-policy" className="block text-[hsl(var(--color-primary))] hover:underline">
                  → View Shipping Rates & Delivery Time
                </Link>
                <Link href="/refund-policy" className="block text-[hsl(var(--color-primary))] hover:underline">
                  → Start a 7-Day Return Request
                </Link>
                <Link href="/faq" className="block text-[hsl(var(--color-primary))] hover:underline">
                  → Browse Frequently Asked Questions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="space-y-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold tracking-tight">Support FAQ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactFaqs.map((faq, idx) => (
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
