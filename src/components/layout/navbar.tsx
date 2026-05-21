"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Heart,
  User,
  ChevronDown,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, useUIStore, useWishlistStore, useCurrencyStore } from "@/store";
import { NAVIGATION, SITE_CONFIG } from "@/lib/constants";
import type { SupportedCurrency } from "@/store/currency";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const totalItems = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openCart = useCartStore((s) => s.openCart);
  
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, toggleSearch } =
    useUIStore();

  const { currency, setCurrency, fetchRates, detectLocation } = useCurrencyStore();

  useEffect(() => {
    setMounted(true);
    fetchRates();
    detectLocation();
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [fetchRates, detectLocation]);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[hsl(var(--color-accent))] text-white text-xs py-2 hidden md:block">
        <div className="container flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" /> Free shipping on orders above ₹499
          </span>
          <div className="flex items-center gap-4">
            {mounted && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/70 uppercase font-semibold">Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="bg-[hsl(217,70%,32%)] text-white border-0 rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer hover:bg-[hsl(217,70%,28%)] transition-colors"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            )}
            <Link href="/account" className="hover:underline">My Account</Link>
            <Link href="/faq" className="hover:underline">Help & FAQ</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-white transition-shadow duration-300",
          scrolled ? "shadow-md" : "shadow-sm"
        )}
      >
        <div className="container">
          <div className="flex items-center gap-4 h-[72px]">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 font-display font-800 text-2xl text-[hsl(var(--color-accent))] tracking-tight"
            >
              <Image 
                src={SITE_CONFIG.logo} 
                alt={SITE_CONFIG.name} 
                width={120} 
                height={40} 
                className="inline-block mr-2 align-middle object-contain" 
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-6 flex-1">
              {NAVIGATION.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    pathname === cat.href
                      ? "bg-[hsl(217,70%,95%)] text-[hsl(var(--color-accent))]"
                      : "text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(210,16%,96%)]"
                  )}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar — Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <button
                onClick={toggleSearch}
                className="flex items-center gap-2 w-full h-10 px-4 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] text-[hsl(215,16%,47%)] text-sm hover:border-[hsl(var(--color-accent))] transition-colors"
              >
                <Search className="h-4 w-4 flex-shrink-0" />
                <span>Search</span>
              </button>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile Search */}
              <button
                onClick={toggleSearch}
                className="md:hidden h-10 w-10 rounded-xl flex items-center justify-center text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative hidden sm:flex h-10 w-10 rounded-xl items-center justify-center text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/account"
                className="hidden sm:flex h-10 w-10 rounded-xl items-center justify-center text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] transition-colors"
                aria-label="My Account"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative h-10 w-10 rounded-xl flex items-center justify-center text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-[hsl(27,96%,55%)] text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {totalItems > 9 ? "9+" : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)] transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-[hsl(214,13%,90%)] bg-white"
            >
              <nav className="container py-4 flex flex-col gap-1">
                {NAVIGATION.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      pathname === cat.href
                        ? "bg-[hsl(217,70%,95%)] text-[hsl(var(--color-accent))]"
                        : "text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)]"
                    )}
                  >
                    {cat.label}
                  </Link>
                ))}
                <div className="border-t border-[hsl(214,13%,90%)] mt-2 pt-2 flex flex-col gap-1">
                  {mounted && (
                    <div className="px-4 py-3 flex items-center justify-between border-b border-[hsl(214,13%,95%)] mb-1">
                      <span className="text-sm font-semibold text-[hsl(215,16%,47%)]">Select Currency</span>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                        className="bg-[hsl(210,16%,96%)] text-[hsl(222,47%,11%)] border border-[hsl(214,13%,85%)] rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none cursor-pointer hover:bg-[hsl(210,16%,92%)] transition-colors"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>
                  )}
                  <Link href="/account" className="px-4 py-3 rounded-xl text-sm font-medium text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)]">
                    My Account
                  </Link>
                  <Link href="/wishlist" className="px-4 py-3 rounded-xl text-sm font-medium text-[hsl(215,16%,47%)] hover:bg-[hsl(210,16%,96%)]">
                    Wishlist
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
