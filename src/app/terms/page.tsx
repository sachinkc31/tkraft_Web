import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read the terms of service governing the use of the Tkraft e-commerce store.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: `Terms and Conditions | ${SITE_CONFIG.name}`,
    description: "Read the terms of service governing the use of the Tkraft e-commerce store.",
    url: "/terms",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function TermsPage() {
  return (
    <div className="section">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(222,47%,11%)] mb-6">
          Terms and Conditions
        </h1>
        <p className="text-sm text-[hsl(215,16%,47%)] mb-8">Last Updated: May 19, 2026</p>

        <div className="prose prose-sm max-w-none text-[hsl(215,16%,47%)] space-y-6 leading-relaxed">
          <p>
            Welcome to Tkraft. These terms and conditions outline the rules and regulations for the use of Tkraft&apos;s Website, located at tkraft.in.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">1. Intellectual Property</h2>
            <p>
              Unless otherwise stated, Tkraft and/or its licensors own the intellectual property rights for all material on Tkraft. All intellectual property rights are reserved. You may access this from Tkraft for your own personal use subjected to restrictions set in these terms and conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">2. Product Pricing & Descriptions</h2>
            <p>
              We strive to ensure all information, descriptions, and prices of products appearing on our site are accurate. However, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible and give you the option of reconfirming your order at the correct price or cancelling it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">3. User Accounts</h2>
            <p>
              If you create an account on our store, you are responsible for maintaining the confidentiality of your account credentials and for restricting access to your computer or mobile device. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">4. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
