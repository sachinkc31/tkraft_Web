"use client";

import { motion } from "framer-motion";
import { Truck, Headphones, ShieldCheck, RotateCcw } from "lucide-react";

const BADGES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹499",
    color: "text-[hsl(142,71%,45%)]",
    bg: "bg-[hsl(142,71%,95%)]",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Always here to help",
    color: "text-[hsl(199,89%,48%)]",
    bg: "bg-[hsl(199,89%,95%)]",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% safe & encrypted",
    color: "text-[hsl(var(--color-accent))]",
    bg: "bg-[hsl(217,70%,95%)]",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day money back",
    color: "text-[hsl(27,96%,55%)]",
    bg: "bg-[hsl(27,96%,95%)]",
  },
];

export function TrustBadges() {
  return (
    <section className="py-8 border-b border-[hsl(214,13%,90%)]">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[hsl(214,13%,90%)] shadow-sm"
              >
                <div className={`h-10 w-10 rounded-xl ${badge.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${badge.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">{badge.title}</p>
                  <p className="text-xs text-[hsl(215,16%,47%)]">{badge.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
