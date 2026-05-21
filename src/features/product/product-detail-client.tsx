"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle,
  MapPin,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, useUIStore, useWishlistStore, useAuthStore, useCurrencyStore } from "@/store";
import { formatPrice, getDiscountPercent, cn, stripHtml } from "@/lib/utils";
import { COUNTRY_RULES } from "@/lib/geo-config";
import type { WooProduct } from "@/types";

interface Props {
  product: WooProduct;
}

type Tab = "description" | "reviews";

export function ProductDetailClient({ product }: Props) {
  const currency = useCurrencyStore((s) => s.currency);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const storeCountry = useCurrencyStore((s) => s.countryCode) || "IN";
  const [deliveryCountry, setDeliveryCountry] = useState(storeCountry);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");

  useEffect(() => {
    if (storeCountry) {
      setDeliveryCountry(storeCountry);
    }
  }, [storeCountry]);

  useEffect(() => {
    setPincode("");
    setPincodeMsg("");
  }, [deliveryCountry]);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUIStore((s) => s.showToast);
  
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.hasItem(product.id));

  const { user, isAuthenticated } = useAuthStore();

  // Reviews & Ratings State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(parseFloat(product.average_rating) || 0);
  const [ratingCount, setRatingCount] = useState(product.rating_count || 0);

  // Write Review Form State
  const [formRating, setFormRating] = useState(5);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setReviewerName(`${user.first_name || ""} ${user.last_name || ""}`.trim());
      setReviewerEmail(user.email || "");
    }
  }, [user, isAuthenticated]);

  // Load reviews on mount/product change
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      try {
        setReviewsLoading(true);
        const res = await fetch(`/api/products/${product.id}/reviews`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setReviews(data);
          if (data.length > 0) {
            const sum = data.reduce((acc: number, item: any) => acc + item.rating, 0);
            setAverageRating(sum / data.length);
            setRatingCount(data.length);
          } else {
            setAverageRating(0);
            setRatingCount(0);
          }
        }
      } catch (err) {
        console.error("Failed to load product reviews:", err);
      } finally {
        if (isMounted) {
          setReviewsLoading(false);
        }
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerEmail.trim() || !reviewText.trim()) {
      showToast("Please fill in all fields before submitting.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review: reviewText,
          reviewer: reviewerName,
          reviewer_email: reviewerEmail,
          rating: formRating,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit review.");
      }

      const newReview = await res.json();
      showToast("Review submitted successfully! Thank you.", "success");
      
      const updated = [newReview, ...reviews];
      setReviews(updated);
      const sum = updated.reduce((acc: number, item: any) => acc + item.rating, 0);
      setAverageRating(sum / updated.length);
      setRatingCount(updated.length);

      setReviewText("");
    } catch (err: any) {
      showToast(err.message || "Failed to submit review.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const discount = getDiscountPercent(product.regular_price, product.sale_price);
  const isOutOfStock = product.stock_status === "outofstock";
  const images = product.images.length ? product.images : [{ id: 0, src: "", name: "", alt: "" }];

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) addItem(product);
    openCart();
    showToast(`${product.name} added to cart!`);
  }

  function handleToggleWishlist() {
    toggleItem(product);
    showToast(
      isInWishlist
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist!`,
      "success"
    );
  }

  function checkPincode() {
    if (!pincode || pincode.trim().length === 0) {
      setPincodeMsg("Please enter a postal code.");
      return;
    }

    const trimmed = pincode.trim().toUpperCase();

    if (deliveryCountry === "IN") {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 6-digit Indian PIN code.");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 2-4 business days.");
    } else if (deliveryCountry === "US") {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 5 or 9-digit US ZIP code.");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 5-10 business days.");
    } else if (deliveryCountry === "GB") {
      const ukRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/;
      if (!ukRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid UK postcode.");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 5-10 business days.");
    } else if (deliveryCountry === "DE") {
      const deRegex = /^\d{5}$/;
      if (!deRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 5-digit Germany postal code.");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 5-10 business days.");
    } else if (deliveryCountry === "AU") {
      const auRegex = /^\d{4}$/;
      if (!auRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 4-digit Australia postal code.");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 5-10 business days.");
    } else if (deliveryCountry === "CA") {
      const caRegex = /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/;
      if (!caRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid Canadian postal code (e.g. K1A 0B1).");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 5-10 business days.");
    } else {
      const generalRegex = /^[A-Z0-9 -]{3,10}$/;
      if (!generalRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid postal code.");
        return;
      }
      setPincodeMsg("✅ Delivery available! Expected in 5-12 business days.");
    }
  }

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[hsl(215,16%,47%)] mb-8">
          <a href="/" className="hover:text-[hsl(var(--color-accent))] transition-colors">Home</a>
          <ChevronRight className="h-3.5 w-3.5" />
          {product.categories[0] && (
            <>
              <a href={`/category/${product.categories[0].slug}`} className="hover:text-[hsl(var(--color-accent))] transition-colors">
                {product.categories[0].name}
              </a>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-[hsl(222,47%,11%)] font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* ---- LEFT: Image Gallery ---- */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[hsl(210,20%,98%)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  {images[selectedImage]?.src ? (
                    <Image
                      src={images[selectedImage].src}
                      alt={images[selectedImage].alt || product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain p-4"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingCart className="h-20 w-20 text-[hsl(215,14%,70%)]" />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {discount > 0 && (
                  <span className="badge bg-[hsl(0,72%,51%)] text-white">-{discount}%</span>
                )}
                {product.featured && (
                  <span className="badge bg-[hsl(27,96%,55%)] text-white">Featured</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition-all",
                      selectedImage === idx
                        ? "border-[hsl(var(--color-accent))] shadow-md"
                        : "border-[hsl(214,13%,90%)] hover:border-[hsl(217,70%,60%)]"
                    )}
                  >
                    {img.src && (
                      <Image src={img.src} alt={img.alt || ""} width={80} height={80} className="object-cover h-full w-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- RIGHT: Product Info ---- */}
          <div className="space-y-6">
            {/* Category + Name */}
            {product.categories[0] && (
              <a href={`/category/${product.categories[0].slug}`} className="text-sm font-semibold text-[hsl(var(--color-accent))] uppercase tracking-wider hover:underline">
                {product.categories[0].name}
              </a>
            )}

            <h1 className="text-2xl md:text-3xl font-display font-bold text-[hsl(var(--color-primary-light))] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-4 w-4",
                      s <= Math.round(averageRating)
                        ? "fill-[hsl(38,92%,50%)] text-[hsl(38,92%,50%)]"
                        : "text-[hsl(215,14%,70%)]"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-[hsl(222,47%,11%)]">
                {averageRating > 0 ? averageRating.toFixed(1) : "No rating"}
              </span>
              <span className="text-sm text-[hsl(215,16%,47%)]">
                ({ratingCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-display font-bold text-[hsl(222,47%,11%)]">
                {formatPrice(product.price)}
              </span>
              {product.on_sale && product.regular_price && (
                <span className="text-xl text-[hsl(215,14%,70%)] line-through mb-0.5">
                  {formatPrice(product.regular_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="badge bg-[hsl(142,71%,45%)] text-white mb-0.5">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0,72%,51%)]" />
                  <span className="text-sm font-medium text-[hsl(0,72%,51%)]">Out of Stock</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                  <span className="text-sm font-medium text-[hsl(142,71%,45%)]">In Stock</span>
                  {product.stock_quantity && (
                    <span className="text-sm text-[hsl(215,16%,47%)]">
                      ({product.stock_quantity} left)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-3">
              {/* Row 1: Quantity + Add to Cart */}
              <div className="flex flex-row gap-3 items-center">
                <div className="flex items-center gap-3 h-12 px-4 rounded-xl border-2 border-[hsl(214,13%,90%)] flex-shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold text-[hsl(222,47%,11%)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  leftIcon={<ShoppingCart className="h-5 w-5" />}
                  className="flex-1 shadow-lg shadow-blue-500/20"
                >
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>

              {/* Row 2: Wishlist + Share */}
              <div className="flex flex-row gap-3">
                <button
                  onClick={handleToggleWishlist}
                  className={cn(
                    "flex-1 h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
                    isInWishlist
                      ? "border-red-200 text-red-500 bg-red-50"
                      : "border-[hsl(214,13%,90%)] text-[hsl(215,16%,47%)] hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                  )}
                  aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                  {isInWishlist ? "Wishlisted" : "Wishlist"}
                </button>

                <button
                  className="flex-1 h-12 rounded-xl border-2 border-[hsl(214,13%,90%)] flex items-center justify-center gap-2 text-sm font-medium text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] transition-all"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="p-4 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)]">
              <p className="text-sm font-semibold text-[hsl(222,47%,11%)] mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[hsl(var(--color-accent))]" />
                Check Delivery Availability
              </p>
              <div className="flex gap-2">
                <select
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  className="h-9 px-2 rounded-lg border border-[hsl(214,13%,90%)] text-xs bg-white focus:border-[hsl(var(--color-accent))] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="IN">🇮🇳 IN</option>
                  <option value="US">🇺🇸 US</option>
                  <option value="GB">🇬🇧 UK</option>
                  <option value="DE">🇩🇪 DE</option>
                  <option value="AU">🇦🇺 AU</option>
                  <option value="CA">🇨🇦 CA</option>
                  <option value="other">🌐 Other</option>
                </select>
                <input
                  type="text"
                  maxLength={deliveryCountry === "IN" ? 6 : deliveryCountry === "DE" ? 5 : deliveryCountry === "AU" ? 4 : 10}
                  placeholder={
                    deliveryCountry === "IN" ? "6-digit PIN" :
                    deliveryCountry === "US" ? "ZIP code" :
                    deliveryCountry === "GB" ? "Postcode" :
                    deliveryCountry === "DE" ? "5-digit PIN" :
                    deliveryCountry === "AU" ? "4-digit PIN" :
                    deliveryCountry === "CA" ? "Postal code" : "Postal code"
                  }
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (deliveryCountry === "IN" || deliveryCountry === "DE" || deliveryCountry === "AU") {
                      setPincode(val.replace(/\D/g, ""));
                    } else if (deliveryCountry === "US") {
                      setPincode(val.replace(/[^0-9-]/g, ""));
                    } else {
                      setPincode(val.replace(/[^a-zA-Z0-9 -]/g, ""));
                    }
                  }}
                  className="flex-1 h-9 px-3 rounded-lg border border-[hsl(214,13%,90%)] text-xs focus:border-[hsl(var(--color-accent))] focus:outline-none"
                />
                <Button variant="primary" size="sm" onClick={checkPincode} className="h-9">
                  Check
                </Button>
              </div>
              {pincodeMsg && (
                <p className={`text-xs mt-2 ${pincodeMsg.startsWith("✅") ? "text-[hsl(142,71%,45%)] font-semibold" : "text-[hsl(0,72%,51%)] font-semibold"}`}>
                  {pincodeMsg}
                </p>
              )}
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { 
                  icon: Truck, 
                  text: (() => {
                    const rule = COUNTRY_RULES[storeCountry as keyof typeof COUNTRY_RULES] || COUNTRY_RULES.IN;
                    return rule.shipping === 0 
                      ? "Free shipping" 
                      : `Free shipping above ${formatPrice(rule.freeLimit, false)}`;
                  })()
                },
                { icon: RotateCcw, text: "30-day easy returns" },
                { icon: Shield, text: "Secure checkout" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-[hsl(210,20%,98%)]"
                >
                  <Icon className="h-5 w-5 text-[hsl(var(--color-accent))]" />
                  <span className="text-[10px] text-[hsl(215,16%,47%)] font-medium leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Tabs: Description / Reviews ---- */}
        <div className="mt-14 border-t border-[hsl(214,13%,90%)] pt-10">
          <div className="flex gap-1 mb-8 border-b border-[hsl(214,13%,90%)]">
            {(["description", "reviews"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "border-[hsl(var(--color-accent))] text-[hsl(var(--color-accent))]"
                    : "border-transparent text-[hsl(215,16%,47%)] hover:text-[hsl(222,47%,11%)]"
                )}
              >
                {tab === "reviews" ? `Reviews (${ratingCount})` : "Description"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "description" ? (
                <div
                  className="prose prose-sm max-w-none text-[hsl(215,16%,47%)] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: product.description || "<p>No description available.</p>",
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 text-left">
                  {/* Left Column: Stats & Write Form */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] p-6 rounded-2xl">
                      <h3 className="font-display font-bold text-base text-[hsl(var(--color-primary-light))] mb-3">Customer Rating</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-display font-extrabold text-[hsl(222,47%,11%)]">
                          {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                        </span>
                        <span className="text-sm text-[hsl(215,16%,47%)]">/ 5.0</span>
                      </div>
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              "h-5 w-5",
                              s <= Math.round(averageRating)
                                ? "fill-[hsl(38,92%,50%)] text-[hsl(38,92%,50%)]"
                                : "text-[hsl(215,14%,70%)]"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[hsl(215,16%,47%)] font-medium">Based on {ratingCount} verified reviews</p>
                    </div>

                    {/* Write Review Form */}
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <h3 className="font-display font-bold text-base text-[hsl(var(--color-primary-light))]">Write a Review</h3>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[hsl(222,47%,11%)] uppercase tracking-wider block">Your Rating</label>
                        <div className="flex gap-1.5 items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormRating(star)}
                              className="text-[hsl(38,92%,50%)] hover:scale-115 transition-transform"
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6",
                                  star <= formRating ? "fill-current" : "text-[hsl(215,14%,70%)]"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="revName" className="text-xs font-semibold text-[hsl(222,47%,11%)] uppercase tracking-wider block">Name</label>
                        <input
                          id="revName"
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full h-10 px-3 rounded-xl border border-[hsl(214,13%,90%)] text-sm focus:border-[hsl(var(--color-accent))] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="revEmail" className="text-xs font-semibold text-[hsl(222,47%,11%)] uppercase tracking-wider block">Email Address</label>
                        <input
                          id="revEmail"
                          type="email"
                          required
                          value={reviewerEmail}
                          onChange={(e) => setReviewerEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full h-10 px-3 rounded-xl border border-[hsl(214,13%,90%)] text-sm focus:border-[hsl(var(--color-accent))] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="revText" className="text-xs font-semibold text-[hsl(222,47%,11%)] uppercase tracking-wider block">Review Message</label>
                        <textarea
                          id="revText"
                          rows={4}
                          required
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="What did you like or dislike about this product?"
                          className="w-full p-3 rounded-xl border border-[hsl(214,13%,90%)] text-sm focus:border-[hsl(var(--color-accent))] focus:outline-none resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        loading={submitting}
                        className="w-full justify-center"
                      >
                        Submit Review
                      </Button>
                    </form>
                  </div>

                  {/* Right Column: List of Reviews */}
                  <div className="lg:col-span-3 space-y-6">
                    <h3 className="font-display font-bold text-base text-[hsl(var(--color-primary-light))] flex items-center gap-2 border-b border-[hsl(214,13%,95%)] pb-3">
                      Reviews <span className="text-sm font-normal text-[hsl(215,16%,47%)]">({reviews.length})</span>
                    </h3>

                    {reviewsLoading ? (
                      <div className="py-8 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="h-6 w-6 border-2 border-[hsl(var(--color-accent))] border-t-transparent rounded-full mx-auto mb-3"
                        />
                        <p className="text-xs text-[hsl(215,16%,47%)]">Loading customer reviews...</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-[hsl(214,13%,90%)] rounded-2xl text-center p-6">
                        <MessageSquare className="h-10 w-10 text-[hsl(215,14%,70%)] mx-auto mb-3" />
                        <p className="font-semibold text-sm text-[hsl(222,47%,11%)] mb-1">No reviews yet</p>
                        <p className="text-xs text-[hsl(215,16%,47%)]">Be the first to review this product and share your experience!</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 divide-y divide-[hsl(214,13%,95%)]">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="pt-4 first:pt-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-[hsl(210,20%,94%)] text-[hsl(var(--color-accent))] font-bold text-sm rounded-full flex items-center justify-center">
                                  {rev.reviewer ? rev.reviewer.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-[hsl(var(--color-primary-light))] leading-snug">{rev.reviewer}</h4>
                                  <span className="text-[10px] text-[hsl(215,16%,47%)] font-medium">
                                    {new Date(rev.date_created).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      s <= rev.rating
                                        ? "fill-[hsl(38,92%,50%)] text-[hsl(38,92%,50%)]"
                                        : "text-[hsl(215,14%,70%)]"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            <div
                              className="text-sm text-[hsl(215,16%,47%)] pl-12 leading-relaxed prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: rev.review }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
