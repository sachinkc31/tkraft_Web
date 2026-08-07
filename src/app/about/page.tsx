import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { 
  ShieldCheck, 
  Truck, 
  Award, 
  CheckCircle2, 
  ExternalLink,
  Utensils,
  Boxes,
  Sparkles,
  Bath,
  Car,
  Wrench,
  Heart,
  Lightbulb,
  Tag,
  Lock,
  HelpCircle,
  ShoppingBag
} from "lucide-react";

export const metadata: Metadata = {
  title: `About TKraft – Smart Solutions for Everyday Living`,
  description:
    "Learn about TKraft, your trusted online destination for smart home, kitchen accessories, cleaning tools, home organization products, bathroom essentials, and car accessories across India.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About TKraft – Smart Solutions for Everyday Living`,
    description:
      "Learn about TKraft, your trusted online destination for smart home, kitchen accessories, cleaning tools, home organization products, bathroom essentials, and car accessories across India.",
    url: "/about",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        "name": "TKraft",
        "legalName": "TKraft Home & Kitchen Essentials",
        "url": SITE_CONFIG.url,
        "logo": SITE_CONFIG.logo,
        "description":
          "TKraft is an online store offering smart home, kitchen, cleaning, storage, bathroom, car care, and utility products designed to simplify everyday life.",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@tkraft.online",
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi"],
        },
        "sameAs": [
          "https://www.instagram.com/tkraft.online",
          "https://www.facebook.com/tkraft.online",
          "https://www.youtube.com/@tkraftin",
          "https://www.trustpilot.com/review/tkraft.online",
          "https://www.amazon.in/stores/Tkraft/page/87C0D0E8-A979-4B52-87C7-93C0C46B1D28",
        ],
      },
      {
        "@type": "AboutPage",
        "@id": `${SITE_CONFIG.url}/about/#webpage`,
        "url": `${SITE_CONFIG.url}/about`,
        "name": "About TKraft – Smart Solutions for Everyday Living",
        "description":
          "Discover TKraft's mission to make everyday household tasks easier with innovative, practical, and affordable home utility products.",
        "publisher": {
          "@id": `${SITE_CONFIG.url}/#organization`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_CONFIG.url}/about/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is TKraft?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "TKraft is an online store offering smart home, kitchen, cleaning, storage, bathroom, car care, and utility products designed to simplify everyday life.",
            },
          },
          {
            "@type": "Question",
            "name": "What products does TKraft sell?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We offer kitchen accessories, home organization products, cleaning tools, bathroom essentials, storage solutions, car accessories, and practical household gadgets.",
            },
          },
          {
            "@type": "Question",
            "name": "Does TKraft offer Cash on Delivery?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Cash on Delivery (COD) is available for eligible locations across India.",
            },
          },
          {
            "@type": "Question",
            "name": "Does TKraft deliver across India?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we deliver to most serviceable locations across India with fast shipping.",
            },
          },
          {
            "@type": "Question",
            "name": "Are your products affordable?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our goal is to offer practical, high-value household products at competitive prices so customers can improve their homes without overspending.",
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[hsl(var(--color-surface))] py-12 md:py-16 text-[hsl(var(--color-text))]">
      {/* Server-Rendered JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-4xl mx-auto px-4 space-y-14">
        {/* Header Hero Section */}
        <section className="space-y-4 text-center md:text-left border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
            About TKraft
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-[hsl(var(--color-text))]">
            Smart Solutions for Everyday Living
          </h1>
          <p className="text-lg md:text-xl text-[hsl(var(--color-primary))] font-semibold">
            Making Everyday Tasks Easier
          </p>
          <p className="text-base md:text-lg text-[hsl(var(--color-text-muted))] leading-relaxed pt-2">
            At <strong>TKraft</strong>, we believe that the little things make the biggest difference. Every organized drawer, every spotless kitchen, every clutter-free home, and every smart household solution contributes to a more comfortable and enjoyable lifestyle.
          </p>
          <p className="text-base md:text-lg text-[hsl(var(--color-text-muted))] leading-relaxed">
            Our mission is simple: to help every home become smarter, cleaner, more organized, and more efficient with practical products at affordable prices.
          </p>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Whether you&apos;re organizing your kitchen, simplifying daily cleaning, upgrading your bathroom, improving home storage, or caring for your vehicle, TKraft offers thoughtfully selected products designed to solve real-life challenges.
          </p>
        </section>

        {/* Our Story */}
        <section className="space-y-4 bg-[hsl(var(--color-surface-2))] p-6 md:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Story</h2>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Modern homes require practical solutions that save time, reduce effort, and improve everyday living. Many people spend hours searching for products that are affordable, useful, durable, and genuinely effective. We created TKraft to make that process easier.
          </p>
          <p className="text-sm md:text-base text-[hsl(var(--color-text-muted))] leading-relaxed">
            Instead of overwhelming customers with endless choices, we carefully curate products that provide real value. Every item is selected based on its functionality, quality, usefulness, and ability to simplify daily routines.
          </p>
          <p className="text-sm md:text-base font-medium text-[hsl(var(--color-text))]">
            Our goal is to help every customer discover products that improve life—one smart solution at a time.
          </p>
        </section>

        {/* What We Offer */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
              Product Categories
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What We Offer</h2>
            <p className="text-sm text-[hsl(var(--color-text-muted))]">
              At TKraft, you&apos;ll find a growing range of products across multiple categories designed for modern homes and busy lifestyles:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mb-3">
                <Utensils className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Kitchen Essentials</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Innovative kitchen tools, food storage containers, cooking accessories, oil sprayers, organizers, dish racks, sink accessories, and time-saving kitchen gadgets.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mb-3">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Home Organization</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Transform clutter into organized spaces with storage boxes, drawer organizers, wardrobe organizers, wall-mounted storage, hooks, shelves, and space-saving solutions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Cleaning Essentials</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Keep your home fresh with cleaning brushes, microfiber tools, scrubbers, bathroom cleaning accessories, reusable cleaning products, and smart cleaning tools online.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mb-3">
                <Bath className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Bathroom Essentials</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Upgrade your bathroom with practical organizers, soap dispensers, shelves, storage racks, holders, and everyday bathroom accessories.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mb-3">
                <Car className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Car Accessories</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Protect and organize your vehicle with car organizers, seat storage solutions, cleaning tools, travel accessories, and practical automotive products.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary))] mb-3">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Home Utility Products</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                From everyday household gadgets to innovative problem-solving tools, our daily utility collection helps simplify routine tasks and improve convenience.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose TKraft */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why Choose TKraft?</h2>
            <p className="text-sm text-[hsl(var(--color-text-muted))]">
              We focus on products that solve real problems—not just trends. Our customers choose TKraft because we prioritize:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Carefully selected products",
              "Practical everyday solutions",
              "Affordable pricing",
              "Reliable product quality",
              "Fast order processing",
              "Secure online shopping",
              "Cash on Delivery availability",
              "Customer-first support",
              "Easy return policies",
              "Regular new arrivals",
            ].map((pillar) => (
              <div
                key={pillar}
                className="p-3.5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5 text-xs font-medium"
              >
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--color-primary))] flex-shrink-0" />
                <span>{pillar}</span>
              </div>
            ))}
          </div>

          <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] text-center md:text-left pt-2">
            Our goal is to deliver products that provide lasting value and improve daily living.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
              <Award className="h-5 w-5" />
              <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">Our Mission</h2>
            </div>
            <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
              To make everyday household tasks easier by providing innovative, practical, and affordable products that improve comfort, organization, cleanliness, and convenience.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
              <Lightbulb className="h-5 w-5" />
              <h2 className="text-xl font-bold text-[hsl(var(--color-text))]">Our Vision</h2>
            </div>
            <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
              To become one of India&apos;s most trusted destinations for smart home, kitchen, cleaning, storage, bathroom, and utility products by continuously delivering value, innovation, and excellent customer experiences.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-base text-[hsl(var(--color-primary))]">Customer First</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Every decision begins with understanding customer needs and delivering maximum satisfaction.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-base text-[hsl(var(--color-primary))]">Quality</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                We focus on products that deliver consistent performance, durability, and long-term utility.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-base text-[hsl(var(--color-primary))]">Innovation</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                We continuously seek practical, smart home products that simplify everyday routines.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-base text-[hsl(var(--color-primary))]">Affordability</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                Everyone deserves access to useful, high-quality household products without paying premium prices.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2 md:col-span-2">
              <h3 className="font-bold text-base text-[hsl(var(--color-primary))]">Trust</h3>
              <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
                We aim to build long-term relationships through transparency, secure online home shopping, and dependable service.
              </p>
            </div>
          </div>
        </section>

        {/* Making Homes Better & Shop With Confidence */}
        <section className="p-6 md:p-8 bg-neutral-900 text-white rounded-2xl space-y-6 shadow-xl">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold">Making Homes Better, One Product at a Time</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              A well-organized home creates more time for family, work, and the things that matter most. From small storage upgrades to kitchen innovations and cleaning solutions, every TKraft product is chosen to help you spend less time managing your home and more time enjoying it.
            </p>
          </div>

          <div className="border-t border-neutral-800 pt-6 space-y-3">
            <h3 className="text-base font-bold text-[hsl(var(--color-primary))]">Shop With Confidence</h3>
            <p className="text-xs text-neutral-400">When you shop with TKraft, you benefit from:</p>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                "Secure Checkout",
                "Fast Shipping",
                "Cash on Delivery",
                "Easy Returns",
                "Responsive Support",
                "Regular Discounts",
                "Seasonal Offers",
                "New Product Launches",
              ].map((benefit) => (
                <span
                  key={benefit}
                  className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-white/90"
                >
                  ✓ {benefit}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--color-primary))]">
              Got Questions?
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">What is TKraft?</h3>
              <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
                TKraft is an online store offering smart home, kitchen, cleaning, storage, bathroom, car care, and utility products designed to simplify everyday life.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">What products does TKraft sell?</h3>
              <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
                We offer kitchen accessories, home organization products, cleaning tools, bathroom essentials, storage solutions, car accessories, and practical household gadgets.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">Does TKraft offer Cash on Delivery?</h3>
              <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
                Yes, Cash on Delivery is available for eligible locations across India.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">Does TKraft deliver across India?</h3>
              <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
                Yes, we deliver to most serviceable locations across India.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800 space-y-2 md:col-span-2">
              <h3 className="font-bold text-sm text-[hsl(var(--color-text))]">Are your products affordable?</h3>
              <p className="text-xs md:text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
                Our goal is to offer practical, high-value products at competitive prices so customers can improve their homes without overspending.
              </p>
            </div>
          </div>
        </section>

        {/* Quality Standards, Citations & Verified Profiles */}
        <section className="p-6 bg-[hsl(var(--color-surface-2))] rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-base font-bold">Material Standards & Official Citation Surfaces</h2>
          <p className="text-xs text-[hsl(var(--color-text-muted))] leading-relaxed">
            All TKraft home utility products adhere to consumer hardware quality guidelines under{" "}
            <a
              href="https://www.iso.org/standard/60055.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--color-primary))] underline font-semibold"
            >
              ISO Material Specifications <ExternalLink className="h-3 w-3 inline" />
            </a>, safety protocols monitored by the{" "}
            <a
              href="https://www.bis.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--color-primary))] underline font-semibold"
            >
              Bureau of Indian Standards (BIS) <ExternalLink className="h-3 w-3 inline" />
            </a>, and polymer non-toxic criteria under{" "}
            <a
              href="https://echa.europa.eu/regulations/reach/understanding-reach"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--color-primary))] underline font-semibold"
            >
              ECHA REACH Guidelines <ExternalLink className="h-3 w-3 inline" />
            </a>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="font-semibold text-[hsl(var(--color-text))]">Verified Outlets:</span>
            <a
              href="https://www.trustpilot.com/review/tkraft.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--color-primary))] underline font-semibold inline-flex items-center gap-1"
            >
              Trustpilot Reviews <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.amazon.in/stores/Tkraft/page/87C0D0E8-A979-4B52-87C7-93C0C46B1D28"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--color-primary))] underline font-semibold inline-flex items-center gap-1"
            >
              Amazon Storefront <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>

        {/* SEO Keywords Covered Badge Cloud */}
        <section className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">
            Category Tags & Indexing Topics
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] text-[hsl(var(--color-text-muted))]">
            {[
              "Home utility products",
              "Kitchen accessories online",
              "Home organization products",
              "Cleaning products online",
              "Bathroom accessories",
              "Storage solutions",
              "Smart home products",
              "Household essentials",
              "Kitchen gadgets",
              "Car accessories",
              "Home improvement products",
              "Daily utility products",
              "Home organizers",
              "Home essentials",
              "Affordable home products",
              "Online home shopping",
            ].map((kw) => (
              <span
                key={kw}
                className="px-2.5 py-1 rounded-md bg-[hsl(var(--color-surface-2))] border border-neutral-200 dark:border-neutral-800"
              >
                #{kw}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
