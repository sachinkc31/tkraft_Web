"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight, Loader2, Tag, ShoppingBag, History, TrendingUp } from "lucide-react";
import { useUIStore, useCurrencyStore } from "@/store";
import { useRouter } from "next/navigation";
import { NAVIGATION } from "@/lib/constants";
import Link from "next/link";
import { searchStoreProducts, type SearchProductResult } from "@/lib/algolia";
import { formatPrice } from "@/lib/utils";

// Helper component for client-side matching term highlights
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[hsl(47,95%,80%)] text-[hsl(222,47%,11%)] rounded-sm px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

const POPULAR_SEARCHES = [
  "Water Bottle",
  "Organizer",
  "Mop",
  "Lunch Box",
  "Storage Box",
  "Kitchen Rack"
];

export function SearchOverlay() {
  const currency = useCurrencyStore((s) => s.currency);
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [query, setQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SearchProductResult[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, [isSearchOpen]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Debounced search logic
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const result = await searchStoreProducts(trimmed);
        setProducts(result.products);
        setCategories(result.categories);
      } catch (err) {
        console.error("Search query failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Keyboard navigation escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSearch]);

  const addRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      localStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  const handleSearchTermClick = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    setSearchQuery(term);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
    closeSearch();
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    addRecentSearch(query);
    setSearchQuery(query);
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    closeSearch();
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={(e) => e.target === e.currentTarget && closeSearch()}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[hsl(214,13%,90%)]"
          >
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-[hsl(214,13%,90%)]">
              {loading ? (
                <Loader2 className="h-5 w-5 text-[hsl(var(--color-accent))] animate-spin flex-shrink-0" />
              ) : (
                <Search className="h-5 w-5 text-[hsl(215,14%,70%)] flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products or categories…"
                className="flex-1 text-base outline-none text-[hsl(222,47%,11%)] placeholder-[hsl(215,14%,70%)] font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full hover:bg-[hsl(210,16%,96%)] text-[hsl(215,14%,70%)] hover:text-[hsl(215,16%,47%)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[hsl(var(--color-accent))] hover:bg-[hsl(217,70%,32%)] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors active:scale-95 cursor-pointer"
              >
                Search <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-[hsl(214,13%,90%)]">
              {/* State 1: Empty Query - Show Recent, Popular, and Categories */}
              {!query.trim() && (
                <div className="p-5 space-y-6">
                  {recentSearches.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(215,16%,47%)] flex items-center gap-1.5">
                          <History className="h-3.5 w-3.5 text-blue-500" /> Recent Searches
                        </p>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] text-xs font-semibold text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] group transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => handleSearchTermClick(term)}
                              className="cursor-pointer hover:text-[hsl(var(--color-accent))]"
                            >
                              {term}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeRecentSearch(term)}
                              className="p-0.5 rounded-full hover:bg-[hsl(214,13%,90%)] text-[hsl(215,14%,70%)] hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[hsl(214,13%,95%)] pt-3" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Popular Searches */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[hsl(215,16%,47%)] flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> Popular Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleSearchTermClick(term)}
                            className="px-3.5 py-2 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] text-xs font-semibold text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] hover:bg-white transition-all active:scale-95 cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Browse Categories */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[hsl(215,16%,47%)] flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-500" /> Browse Hot Categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {NAVIGATION.categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={cat.href}
                            onClick={() => {
                              addRecentSearch(cat.label);
                              closeSearch();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] text-xs font-semibold text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] hover:bg-white transition-all active:scale-95"
                          >
                            {cat.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* State 2: Active Results Display */}
              {query.trim() && (products.length > 0 || categories.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[hsl(214,13%,90%)]">
                  {/* Left Section: Products Suggestions (Col-span 2) */}
                  <div className="col-span-2 p-5 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(215,16%,47%)] mb-1 flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5" /> Products ({products.length})
                    </p>

                    <div className="space-y-2.5">
                      {products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug}`}
                          onClick={() => {
                            addRecentSearch(query);
                            closeSearch();
                          }}
                          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[hsl(210,16%,96%)] transition-colors group"
                        >
                          {/* Product Thumbnail */}
                          <div className="h-11 w-11 rounded-xl bg-[hsl(210,16%,96%)] overflow-hidden border border-[hsl(214,13%,90%)] flex-shrink-0 flex items-center justify-center">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-sm">📦</span>
                            )}
                          </div>

                          {/* Product Title and Price */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[hsl(222,47%,11%)] line-clamp-1">
                              <HighlightText text={prod.name} highlight={query} />
                            </h4>
                            <p className="text-[10px] font-semibold text-[hsl(var(--color-accent))] mt-0.5">
                              {formatPrice(parseFloat(prod.price))}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Section: Categories Suggestions (Col-span 1) */}
                  <div className="col-span-1 p-5 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(215,16%,47%)] mb-1 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Matches Categories
                    </p>

                    {categories.length === 0 ? (
                      <p className="text-xs text-[hsl(215,14%,70%)] italic">No category shortcut match</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/category/${cat.slug}`}
                            onClick={() => {
                              addRecentSearch(cat.name);
                              closeSearch();
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-[hsl(210,16%,96%)] text-xs font-semibold text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] group transition-colors"
                          >
                            <span className="truncate">
                              <HighlightText text={cat.name} highlight={query} />
                            </span>
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[hsl(var(--color-accent))]" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* State 3: Active Query & No Results */}
              {query.trim() && !loading && products.length === 0 && categories.length === 0 && (
                <div className="p-10 text-center text-[hsl(215,16%,47%)]">
                  <p className="text-3xl mb-2">🔍</p>
                  <h4 className="font-semibold text-sm text-[hsl(222,47%,11%)] mb-1">
                    No results found for &ldquo;{query}&rdquo;
                  </h4>
                  <p className="text-xs text-[hsl(215,14%,70%)]">
                    Check for spelling errors or try looking for a different key phrase.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

