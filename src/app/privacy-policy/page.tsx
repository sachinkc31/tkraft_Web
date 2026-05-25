import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Tkraft collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: `Privacy Policy | ${SITE_CONFIG.name}`,
    description: "Learn how Tkraft collects, uses, and protects your personal information.",
    url: "/privacy-policy",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="section">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(222,47%,11%)] mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm text-[hsl(215,16%,47%)] mb-8">Last Updated: May 19, 2026</p>

        <div className="prose prose-sm max-w-none text-[hsl(215,16%,47%)] space-y-6 leading-relaxed">
          <p>
            At Tkraft, accessible from tkraft.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Tkraft and how we use it.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">1. Information We Collect</h2>
            <p>
              We collect personal information that you provide to us when you make a purchase, register an account, or contact us. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Name and contact details (email address, phone number, shipping and billing address).</li>
              <li>Payment details (processed securely via our certified payment gateway).</li>
              <li>Order history and shopping preferences.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">2. How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide, operate, and maintain our e-commerce platform.</li>
              <li>Process and ship your orders, and send you transaction notifications.</li>
              <li>Understand and analyze how you use our website to improve our offerings.</li>
              <li>Communicate with you for customer support and promotional updates.</li>
              <li>Prevent fraudulent transactions and secure our systems.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">3. Information Sharing & Third Parties</h2>
            <p>
              We do not sell or rent your personal information to third parties. We share information only with trusted service providers to run our store operations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Payment Processors:</strong> Razorpay for secure checkout.</li>
              <li><strong>Logistics Providers:</strong> Shiprocket for shipping and tracking services.</li>
              <li><strong>Hosting and Analytics:</strong> Standard services to run and monitor site performance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">4. Cookies and Tracking</h2>
            <p>
              Tkraft uses cookies to store information about visitors&apos; preferences and pages accessed. This optimizes the shopping experience by customizing our web page content based on browser type.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information stored with us. If you wish to make a request, please contact us at support@tkraft.in.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
