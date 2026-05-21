"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { WooCategory } from "@/types";
import { NAVIGATION } from "@/lib/constants";

const CATEGORY_EMOJIS: Record<string, string> = {
  home: "🏠",
  "storage-and-organization": "📦",
  "cleaning-essential": "🧹",
  "personal-care": "💆",
  kitchen: "🍳",
};

interface CategoryGridProps {
  categories: WooCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Fallback to nav categories if API returns empty
  const items = categories.length
    ? categories.slice(0, 5)
    : NAVIGATION.categories.map((c) => ({
        id: 0,
        name: c.label,
        slug: c.slug,
        parent: 0,
        description: "",
        display: "default",
        image: null,
        count: 0,
      }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((cat, i) => {
        const href =
          categories.length
            ? `/category/${cat.slug}`
            : NAVIGATION.categories.find((n) => n.slug === cat.slug)?.href || `/category/${cat.slug}`;
        const emoji = CATEGORY_EMOJIS[cat.slug] || "🛍️";

        return (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <Link
              href={href}
              className="group block rounded-2xl overflow-hidden bg-white border border-[hsl(214,13%,90%)] hover:border-[hsl(var(--color-accent))] hover:shadow-lg transition-all duration-300 p-5 text-center card-lift"
            >
              {/* Image or Emoji */}
              <div className="relative h-28 mb-4 rounded-xl overflow-hidden bg-[hsl(210,20%,98%)] flex items-center justify-center">
                {cat.image?.src ? (
                  <Image
                    src={cat.image.src}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                ) : (
                  <span className="text-5xl">{emoji}</span>
                )}
              </div>

              <h3 className="font-semibold text-sm text-[hsl(222,47%,11%)] group-hover:text-[hsl(var(--color-accent))] transition-colors mb-1 leading-snug">
                {cat.name}
              </h3>

              {cat.count > 0 && (
                <p className="text-xs text-[hsl(215,14%,70%)]">{cat.count} products</p>
              )}

              <div className="flex items-center justify-center gap-1 mt-3 text-xs font-semibold text-[hsl(var(--color-accent))] opacity-0 group-hover:opacity-100 transition-opacity">
                Shop <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
