import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG, NAVIGATION } from "@/lib/constants";
import { Map, ShoppingBag, ShieldCheck, User, HelpCircle } from "lucide-react";
import { WebPageSchema, BreadcrumbSchema } from "@/schemas";

export const metadata: Metadata = {
  title: `HTML Sitemap – Store Page Index | ${SITE_CONFIG.name}`,
  description:
    "Explore the complete HTML Sitemap of TKraft. Browse all categories, products, customer care pages, legal policies, and account links.",
  alternates: {
    canonical: "/sitemap-page",
  },
  openGraph: {
    title: `HTML Sitemap – Store Page Index | ${SITE_CONFIG.name}`,
    description:
      "Explore the complete HTML Sitemap of TKraft. Browse all categories, products, customer care pages, legal policies, and account links.",
    url: "/sitemap-page",
    images: [{ url: SITE_CONFIG.ogImage, width: 1200, height: 630 }],
  },
};

export default function SitemapPage() {
  const mainCategories = NAVIGATION.categories;

  const customerPages = [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Your Order", href: "/track-order" },
    { label: "Help & FAQ", href: "/faq" },
    { label: "All Products Shop", href: "/shop" },
  ];

  const legalPages = [
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Refund & Return Policy", href: "/refund-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ];

  const accountPages = [
    { label: "My Account Dashboard", href: "/account" },
    { label: "Shopping Cart", href: "/cart" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Checkout", href: "/checkout" },
  ];

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      <WebPageSchema
        data={{
          url: "/sitemap-page",
          name: "HTML Sitemap – TKraft Store Index",
          description: "Structured sitemap index listing all main pages, shop categories, customer support links, and legal policies.",
          pageType: "WebPage",
        }}
      />
      <BreadcrumbSchema
        data={{
          items: [
            { name: "Home", url: "/" },
            { name: "Sitemap", url: "/sitemap-page" },
          ],
        }}
      />

      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            Site Structure
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">
            HTML Sitemap
          </h1>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Welcome to the TKraft site index. Find quick links to all main pages, product collections, customer service guides, and legal policies.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shop Categories */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">Shop Categories</h2>
            </div>
            <ul className="space-y-2 text-sm font-medium">
              {mainCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={cat.href} className="hover:text-[hsl(var(--color-primary))] transition-colors block py-0.5">
                    → {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="text-[hsl(var(--color-primary))] underline font-semibold block py-0.5">
                  → Browse All Products Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
              <HelpCircle className="h-5 w-5" />
              <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">Customer Care</h2>
            </div>
            <ul className="space-y-2 text-sm font-medium">
              {customerPages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-[hsl(var(--color-primary))] transition-colors block py-0.5">
                    → {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Policies */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">Policies & Terms</h2>
            </div>
            <ul className="space-y-2 text-sm font-medium">
              {legalPages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-[hsl(var(--color-primary))] transition-colors block py-0.5">
                    → {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User Account */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
              <User className="h-5 w-5" />
              <h2 className="text-lg font-bold text-[hsl(var(--color-text))]">Account & Orders</h2>
            </div>
            <ul className="space-y-2 text-sm font-medium">
              {accountPages.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="hover:text-[hsl(var(--color-primary))] transition-colors block py-0.5">
                    → {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
