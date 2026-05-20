"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    id: 1,
    badge: "New Collection",
    title: "Fresh Home\nEssentials",
    subtitle: "Premium quality products for every corner of your home.",
    cta: { label: "Shop Now", href: "/shop" },
    bg: "from-[hsl(217,70%,38%)] to-[hsl(217,70%,26%)]",
    accent: "hsl(27,96%,55%)",
    stat1: { value: "62+", label: "Products" },
    stat2: { value: "₹499", label: "Free Shipping" },
  },
  {
    id: 2,
    badge: "Limited Deals",
    title: "Up to 75%\nOff Today",
    subtitle: "Incredible discounts on kitchen, storage & personal care.",
    cta: { label: "See Deals", href: "/shop?on_sale=true" },
    bg: "from-[hsl(222,47%,11%)] to-[hsl(217,70%,16%)]",
    accent: "hsl(27,96%,55%)",
    stat1: { value: "75%", label: "Max Off" },
    stat2: { value: "24/7", label: "Support" },
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Main Hero */}
      <div className={`bg-gradient-to-br ${SLIDES[0].bg} min-h-[520px] md:min-h-[580px] flex items-center`}>
        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6"
            >
              <Star className="h-3.5 w-3.5 fill-[hsl(27,96%,55%)] text-[hsl(27,96%,55%)]" />
              New Collection 2026
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-5"
            >
              Premium Home &{" "}
              <span className="text-[hsl(27,96%,55%)]">Kitchen</span>{" "}
              Essentials
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/75 text-lg md:text-xl mb-8 max-w-lg leading-relaxed"
            >
              Discover 62+ premium products for your home, kitchen & personal care — delivered fast across India.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/shop">
                <Button
                  size="xl"
                  className="bg-[hsl(27,96%,55%)] hover:bg-[hsl(27,96%,47%)] text-white shadow-lg shadow-orange-500/30"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/shop?on_sale=true">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 hover:border-white/60"
                >
                  View Deals
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/15"
            >
              {[
                { value: "62+", label: "Products" },
                { value: "₹499", label: "Free Shipping Above" },
                { value: "30 Day", label: "Money Back" },
                { value: "24/7", label: "Support" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:flex items-center justify-center pointer-events-none">
          <div className="absolute right-[-80px] w-[500px] h-[500px] rounded-full bg-white/5 border border-white/10" />
          <div className="absolute right-[40px] w-[350px] h-[350px] rounded-full bg-white/5 border border-white/10" />
          <div className="flex flex-col gap-4 absolute right-20">
            {["🏠 Home Essentials", "🍳 Kitchen Products", "🧹 Cleaning", "💆 Personal Care", "📦 Storage"].map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium backdrop-blur-sm"
              >
                {tag}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Quick-links */}
      <div className="bg-white border-b border-[hsl(214,13%,90%)] py-4 hidden md:block">
        <div className="container flex items-center gap-2 overflow-x-auto scrollbar-none">
          <ShoppingBag className="h-4 w-4 text-[hsl(215,16%,47%)] flex-shrink-0" />
          {[
            { label: "All Products", href: "/shop" },
            { label: "Home Essentials", href: "/category/home" },
            { label: "Storage", href: "/category/storage-and-organization" },
            { label: "Kitchen", href: "/category/kitchen" },
            { label: "Personal Care", href: "/category/personal-care" },
            { label: "Cleaning", href: "/category/cleaning-essential" },
            { label: "🔥 On Sale", href: "/shop?on_sale=true" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-[hsl(215,16%,47%)] hover:text-[hsl(217,70%,38%)] hover:bg-[hsl(217,70%,95%)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
