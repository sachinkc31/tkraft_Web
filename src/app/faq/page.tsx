import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { HelpCircle, Search, MessageSquare, Truck, RotateCcw, CreditCard, ShieldCheck } from "lucide-react";
import { WebPageSchema, FAQSchema, BreadcrumbSchema } from "@/schemas";

export const metadata: Metadata = {
  title: `Help & Frequently Asked Questions (FAQ) – ${SITE_CONFIG.name}`,
  description:
    "Find answers to frequently asked questions about TKraft products, order placement, shipping times, Cash on Delivery, and 7-day returns.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: `Help & Frequently Asked Questions (FAQ) – ${SITE_CONFIG.name}`,
    description:
      "Find answers to frequently asked questions about TKraft products, order placement, shipping times, Cash on Delivery, and 7-day returns.",
    url: "/faq",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function FAQPage() {
  const masterFaqs = [
    {
      category: "Ordering & Products",
      icon: ShieldCheck,
      questions: [
        {
          question: "What is TKraft?",
          answer: "TKraft is an online store offering smart home, kitchen, cleaning, storage, bathroom, car care, and utility products designed to simplify everyday life.",
        },
        {
          question: "How do drill-free adhesive storage organizers work?",
          answer: "TKraft drill-free organizers use heavy-duty acrylic adhesive pads that bond firmly to smooth tiles, glass, and polished marble without requiring drilling or wall damage. They hold up to 15.4kg of static weight.",
        },
        {
          question: "Are your products rustproof?",
          answer: "Yes, our metal racks and hooks are crafted from AISI 304 stainless steel and high-grade polymers designed specifically for humid kitchen and bathroom environments.",
        },
      ],
    },
    {
      category: "Shipping & Delivery",
      icon: Truck,
      questions: [
        {
          question: "Does TKraft offer free shipping across India?",
          answer: "Yes! We offer FREE express shipping across India on all orders above ₹499. Orders below ₹499 carry a flat ₹49 delivery charge.",
        },
        {
          question: "How long will delivery take?",
          answer: "Metro deliveries take 2 to 4 business days. Non-metro locations take 3 to 6 business days.",
        },
        {
          question: "How can I track my shipment?",
          answer: "You will receive an SMS/WhatsApp tracking link as soon as your parcel dispatches. You can also track your shipment live on our Track Order page.",
        },
      ],
    },
    {
      category: "Returns & Payment",
      icon: RotateCcw,
      questions: [
        {
          question: "Does TKraft offer Cash on Delivery (COD)?",
          answer: "Yes, Cash on Delivery (COD) is available across major pincodes in India.",
        },
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day hassle-free return window. If you receive a damaged or wrong product, we provide free instant replacement.",
        },
        {
          question: "How long does a refund take?",
          answer: "Refunds are processed within 2 to 4 business days back to your original payment method or bank account.",
        },
      ],
    },
  ];

  const allFaqItems = masterFaqs.flatMap((cat) => cat.questions);

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/faq",
          name: "Frequently Asked Questions – TKraft",
          description: "Answers to common questions regarding ordering, shipping, returns, and products.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "FAQ", url: "/faq" },
          ],
        }}
      />
      <FAQSchema data={{ items: allFaqItems }} />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Help Center
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Have questions about our products, delivery, or returns? Find fast answers below.
          </p>
        </div>

        {/* Categorized FAQs */}
        <div className="space-y-10">
          {masterFaqs.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <div key={catIdx} className="space-y-4">
                <div className="flex items-center gap-2 text-[hsl(var(--color-primary))] border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <Icon className="h-5 w-5" />
                  <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">{cat.category}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-5 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
                      <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">{q.question}</h3>
                      <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">{q.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="p-6 md:p-8 rounded-2xl bg-neutral-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-bold text-lg">Still have questions?</h3>
            <p className="text-xs text-neutral-400">Our customer support team is available Monday to Saturday (9 AM - 7 PM IST).</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-[hsl(var(--color-primary))] text-white font-bold text-sm hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </main>
  );
}
