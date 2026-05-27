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
  X,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, useUIStore, useWishlistStore, useAuthStore, useCurrencyStore, useRecentlyViewedStore } from "@/store";
import { formatPrice, getDiscountPercent, cn, stripHtml } from "@/lib/utils";
import { COUNTRY_RULES } from "@/lib/geo-config";
import type { WooProduct } from "@/types";

const COLOR_MAP: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#FBBF24",
  orange: "#F97316",
  purple: "#8B5CF6",
  pink: "#EC4899",
  white: "#FFFFFF",
  black: "#111827",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  brown: "#78350F",
  beige: "#F5F5DC",
  cream: "#FFFDD0",
  silver: "#C0C0C0",
  gold: "#D4AF37",
  teal: "#14B8A6",
  lavender: "#E6E6FA",
  maroon: "#800000",
  navy: "#1E3A8A",
  peach: "#FFDAB9",
  mint: "#A7F3D0",
  rose: "#FDA4AF",
};

interface Props {
  product: WooProduct;
  initialVariations?: any[];
  bundleProducts?: WooProduct[];
}

type Tab = "description" | "reviews";

export function ProductDetailClient({ product, initialVariations = [], bundleProducts = [] }: Props) {
  const currency = useCurrencyStore((s) => s.currency);

  // Extra states for optimizations
  const [activeAccordion, setActiveAccordion] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Swiping state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Delivery countdown urgency
  const [timeLeft, setTimeLeft] = useState("");
  const [estDeliveryDate, setEstDeliveryDate] = useState("");

  // Frequently bought together bundle
  const [checkedBundleIds, setCheckedBundleIds] = useState<number[]>(() => {
    return bundleProducts?.map((p) => p.id) || [];
  });

  // Variation selection state
  const variations = initialVariations || [];
  const variationAttributes = product.attributes?.filter((attr) => attr.variation) || [];

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (variations.length > 0) {
      const firstVar = variations[0];
      firstVar.attributes?.forEach((attr: any) => {
        initial[attr.name] = attr.option;
      });
    } else {
      variationAttributes.forEach((attr) => {
        if (attr.options && attr.options.length > 0) {
          initial[attr.name] = attr.options[0];
        }
      });
    }
    return initial;
  });

  const selectedVariation = variations.find((v) => {
    return v.attributes?.every((attr: any) => {
      const selVal = selectedAttributes[attr.name];
      if (!selVal) return false;
      if (!attr.option) return true;
      return attr.option.toLowerCase() === selVal.toLowerCase();
    });
  });

  // Dynamically computed properties
  const activePrice = selectedVariation ? selectedVariation.price : product.price;
  const activeRegularPrice = selectedVariation ? selectedVariation.regular_price : product.regular_price;
  const activeSalePrice = selectedVariation ? selectedVariation.sale_price : product.sale_price;
  const activeOnSale = selectedVariation ? selectedVariation.on_sale : product.on_sale;
  
  const activeStockStatus = selectedVariation ? selectedVariation.stock_status : product.stock_status;
  const activeStockQuantity = selectedVariation ? selectedVariation.stock_quantity : product.stock_quantity;

  const isSelectionComplete = variationAttributes.every((attr) => selectedAttributes[attr.name]);
  const isCombinationUnavailable = product.type === "variable" && isSelectionComplete && !selectedVariation;
  const isOutOfStock = activeStockStatus === "outofstock" || isCombinationUnavailable;

  const discount = getDiscountPercent(activeRegularPrice, activeSalePrice);

  const variationImage = selectedVariation?.image;
  let displayImages = product.images.length ? [...product.images] : [{ id: 0, src: "", name: "", alt: "" }];
  if (variationImage && variationImage.src && !displayImages.some((img) => img.src === variationImage.src)) {
    displayImages = [variationImage, ...displayImages];
  }
  const images = displayImages;

  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (selectedVariation?.image?.src) {
      const idx = displayImages.findIndex((img) => img.src === selectedVariation.image.src);
      if (idx !== -1) {
        setSelectedImage(idx);
      }
    }
  }, [selectedVariation?.id]);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const storeCountry = useCurrencyStore((s) => s.countryCode) || "IN";
  const [deliveryCountry, setDeliveryCountry] = useState(storeCountry);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

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

  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addProduct);
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

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

  function handleAddToCart() {
    if (isOutOfStock || isCombinationUnavailable) return;

    const productToCart = { ...product };
    if (selectedVariation) {
      const attributesString = Object.entries(selectedAttributes)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
      
      productToCart.name = `${product.name} (${attributesString})`;
      productToCart.price = selectedVariation.price || product.price;
      if (selectedVariation.regular_price) {
        productToCart.regular_price = selectedVariation.regular_price;
      }
      if (selectedVariation.sale_price) {
        productToCart.sale_price = selectedVariation.sale_price;
      }
      if (selectedVariation.image && selectedVariation.image.src) {
        productToCart.images = [selectedVariation.image, ...product.images];
      }
    }

    for (let i = 0; i < quantity; i++) {
      addItem(productToCart, 1, selectedVariation?.id, selectedVariation ? selectedAttributes : undefined);
    }
    openCart();
    showToast(`${productToCart.name} added to cart!`);
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

  // Scroll listener for sticky add to cart
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Delivery urgency countdown and estimated date
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(17, 0, 0, 0); // 5 PM cutoff

      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }

      const diffMs = cutoff.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft(`${diffHrs}h ${diffMins}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    const getEstDelivery = () => {
      const targetDate = new Date();
      let daysToAdd = 3;
      while (daysToAdd > 0) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (targetDate.getDay() !== 0) { // Skip Sunday
          daysToAdd--;
        }
      }
      return targetDate.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
    };
    setEstDeliveryDate(getEstDelivery());

    return () => clearInterval(interval);
  }, []);

  // Swipe handlers for mobile image gallery
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setSelectedImage((prev) => (prev + 1) % images.length);
    } else if (isRightSwipe) {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Frequently bought together toggle & add-to-cart
  const toggleBundleId = (id: number) => {
    setCheckedBundleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const mainPriceNum = parseFloat(activePrice) || 0;
  const bundleItemsChecked = bundleProducts?.filter((p) => checkedBundleIds.includes(p.id)) || [];
  const rawBundlePrice = mainPriceNum + bundleItemsChecked.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
  const hasBundleDiscount = bundleItemsChecked.length > 0;
  const bundleDiscountPercent = 5;
  const finalBundlePrice = hasBundleDiscount ? rawBundlePrice * (1 - bundleDiscountPercent / 100) : rawBundlePrice;
  const bundleSavings = rawBundlePrice - finalBundlePrice;

  const handleAddBundleToCart = () => {
    const mainProductToCart = { ...product };
    if (selectedVariation) {
      const attributesString = Object.entries(selectedAttributes)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
      
      mainProductToCart.name = `${product.name} (${attributesString})`;
      mainProductToCart.price = selectedVariation.price || product.price;
      if (selectedVariation.regular_price) {
        mainProductToCart.regular_price = selectedVariation.regular_price;
      }
      if (selectedVariation.sale_price) {
        mainProductToCart.sale_price = selectedVariation.sale_price;
      }
      if (selectedVariation.image && selectedVariation.image.src) {
        mainProductToCart.images = [selectedVariation.image, ...product.images];
      }
    }

    addItem(mainProductToCart, 1, selectedVariation?.id, selectedVariation ? selectedAttributes : undefined);

    bundleItemsChecked.forEach((item) => {
      addItem(item, 1);
    });

    openCart();
    showToast(`${bundleItemsChecked.length + 1} items added as a bundle!`, "success");
  };

  // Share actions
  const handleShareClick = async () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Tkraft!`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // failed or cancelled, toggle menu
      }
    }
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard!", "success");
    setShowShareMenu(false);
  };

  // Highlights calculator
  const highlightsList: { label: string; value: string }[] = [];
  product.attributes?.forEach((attr) => {
    if (!attr.variation && attr.options?.length > 0) {
      highlightsList.push({
        label: attr.name,
        value: attr.options.join(", "),
      });
    }
  });

  if (highlightsList.length === 0) {
    const cats = product.categories.map((c) => c.name.toLowerCase());
    const isKitchen = cats.some((c) => c.includes("kitchen") || c.includes("home"));
    const isStorage = cats.some((c) => c.includes("storage") || c.includes("organiz"));
    if (isKitchen) {
      highlightsList.push(
        { label: "Material", value: "Premium Food-Grade Acrylic / Glass" },
        { label: "BPA Free", value: "100% Non-Toxic materials" },
        { label: "Design", value: "Modular, space-saving design" },
        { label: "Cleaning", value: "Easy-to-wash smooth finish" }
      );
    } else if (isStorage) {
      highlightsList.push(
        { label: "Material", value: "High-strength PET / PP polymer" },
        { label: "Durability", value: "Shatterproof and scratch-resistant" },
        { label: "Visibility", value: "Crystal clear transparent body" },
        { label: "Stackable", value: "Nestable, space-maximizing alignment" }
      );
    } else {
      highlightsList.push(
        { label: "Premium Build", value: "Hand-picked high quality homeware" },
        { label: "Design", value: "Elegant and modern aesthetic" },
        { label: "Usability", value: "Designed for everyday convenience" },
        { label: "Eco-Friendly", value: "Sustainable packaging & durable build" }
      );
    }
  }

  async function checkPincode() {
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
    } else if (deliveryCountry === "US") {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 5 or 9-digit US ZIP code.");
        return;
      }
    } else if (deliveryCountry === "GB") {
      const ukRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/;
      if (!ukRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid UK postcode.");
        return;
      }
    } else if (deliveryCountry === "DE") {
      const deRegex = /^\d{5}$/;
      if (!deRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 5-digit Germany postal code.");
        return;
      }
    } else if (deliveryCountry === "AU") {
      const auRegex = /^\d{4}$/;
      if (!auRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid 4-digit Australia postal code.");
        return;
      }
    } else if (deliveryCountry === "CA") {
      const caRegex = /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/;
      if (!caRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid Canadian postal code (e.g. K1A 0B1).");
        return;
      }
    } else {
      const generalRegex = /^[A-Z0-9 -]{3,10}$/;
      if (!generalRegex.test(trimmed)) {
        setPincodeMsg("Please enter a valid postal code.");
        return;
      }
    }

    setIsCheckingPincode(true);
    setPincodeMsg("Checking delivery options...");

    try {
      const res = await fetch(`/api/shipping/estimate?pincode=${trimmed}`);
      if (!res.ok) {
        throw new Error("Pincode check failed");
      }
      const data = await res.json();
      setPincodeMsg(data.message || "✅ Delivery available!");
    } catch (err) {
      console.error("Failed to check delivery estimate:", err);
      // Fallback
      if (deliveryCountry === "IN") {
        setPincodeMsg("✅ Delivery available! Expected in 2-4 business days.");
      } else {
        setPincodeMsg("✅ Delivery available! Expected in 5-10 business days.");
      }
    } finally {
      setIsCheckingPincode(false);
    }
  }

  return (
    <>
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
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setIsZoomOpen(true)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[hsl(210,20%,98%)] cursor-zoom-in group/gallery"
            >
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
                      className="object-contain p-4 transition-transform duration-300 group-hover/gallery:scale-102"
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

              {/* Click to Zoom badge */}
              <div className="absolute bottom-4 right-4 bg-white/85 backdrop-blur-md text-[hsl(222,47%,11%)] px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-20 pointer-events-none">
                <Plus className="h-3.5 w-3.5" /> Click to Zoom
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
                {formatPrice(activePrice)}
              </span>
              {activeOnSale && activeRegularPrice && (
                <span className="text-xl text-[hsl(215,14%,70%)] line-through mb-0.5">
                  {formatPrice(activeRegularPrice)}
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
              {isCombinationUnavailable ? (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0,72%,51%)]" />
                  <span className="text-sm font-medium text-[hsl(0,72%,51%)]">Combination Unavailable</span>
                </>
              ) : isOutOfStock ? (
                <>
                  <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0,72%,51%)]" />
                  <span className="text-sm font-medium text-[hsl(0,72%,51%)]">Out of Stock</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                  <span className="text-sm font-medium text-[hsl(142,71%,45%)]">In Stock</span>
                  {activeStockQuantity && (
                    <span className="text-sm text-[hsl(215,16%,47%)]">
                      ({activeStockQuantity} left)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Delivery urgency banner */}
            {!isOutOfStock && timeLeft && estDeliveryDate && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(222,47%,11%)] bg-amber-50/70 border border-amber-100/80 rounded-xl p-3 mt-1.5 relative z-20">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
                <span>
                  Order within <span className="text-amber-700 font-extrabold">{timeLeft}</span> for same-day dispatch. Est. delivery by <span className="text-[hsl(var(--color-accent))] font-extrabold">{estDeliveryDate}</span>.
                </span>
              </div>
            )}

            {/* Variation Attributes Selectors */}
            {variationAttributes.length > 0 && (
              <div className="space-y-4 border-t border-b border-[hsl(214,13%,90%)] py-5">
                {variationAttributes.map((attr) => {
                  const isColor = attr.name.toLowerCase() === "color" || attr.name.toLowerCase() === "colour";
                  const selectedVal = selectedAttributes[attr.name];

                  return (
                    <div key={attr.id || attr.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[hsl(222,47%,11%)] uppercase tracking-wider">
                          {attr.name}
                        </span>
                        {selectedVal && (
                          <span className="text-xs text-[hsl(215,16%,47%)] font-semibold">
                            {selectedVal}
                          </span>
                        )}
                      </div>

                      {isColor ? (
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {attr.options.map((option) => {
                            const colorKey = option.toLowerCase().trim();
                            const colorHex = COLOR_MAP[colorKey] || colorKey;
                            const isActive = selectedVal === option;

                            return (
                              <button
                                key={option}
                                type="button"
                                title={option}
                                onClick={() =>
                                  setSelectedAttributes((prev) => ({
                                    ...prev,
                                    [attr.name]: option,
                                  }))
                                }
                                className={cn(
                                  "w-8 h-8 rounded-full border border-[hsl(214,13%,90%)] transition-all flex items-center justify-center relative",
                                  isActive
                                    ? "ring-2 ring-offset-2 ring-[hsl(var(--color-accent))]"
                                    : "hover:scale-105"
                                )}
                                style={{ backgroundColor: colorHex }}
                              >
                                {isActive && (
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      colorKey === "white" || colorKey === "beige" || colorKey === "cream"
                                        ? "bg-black"
                                        : "bg-white"
                                    )}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          {attr.options.map((option) => {
                            const isActive = selectedVal === option;

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() =>
                                  setSelectedAttributes((prev) => ({
                                    ...prev,
                                    [attr.name]: option,
                                  }))
                                }
                                className={cn(
                                  "px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200",
                                  isActive
                                    ? "bg-[hsl(var(--color-primary))] border-[hsl(var(--color-primary))] text-white shadow-sm"
                                    : "border-[hsl(214,13%,90%)] text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)] hover:border-[hsl(215,16%,47%)]"
                                )}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

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
                  {isCombinationUnavailable ? "Unavailable" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>

              {/* Row 2: Wishlist + Share */}
              <div className="flex flex-row gap-3">
                <button
                  type="button"
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

                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={handleShareClick}
                    className="w-full h-12 rounded-xl border-2 border-[hsl(214,13%,90%)] flex items-center justify-center gap-2 text-sm font-medium text-[hsl(215,16%,47%)] hover:border-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent))] transition-all"
                    aria-label="Share"
                  >
                    <Share2 className="h-5 w-5" />
                    Share
                  </button>
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-14 right-0 z-30 bg-white border border-[hsl(214,13%,90%)] rounded-xl shadow-xl p-3 min-w-[200px] flex flex-col gap-1.5"
                      >
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="flex items-center gap-2.5 w-full text-left p-2.5 rounded-lg text-xs font-semibold text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)] transition-colors focus:outline-none"
                        >
                          <Copy className="h-4 w-4 text-[hsl(var(--color-accent))]" />
                          Copy Product Link
                        </button>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + " - " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowShareMenu(false)}
                          className="flex items-center gap-2.5 w-full text-left p-2.5 rounded-lg text-xs font-semibold text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)] transition-colors"
                        >
                          <svg className="h-4 w-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.432 2.56 1.288 3.578l-.847 3.09 3.169-.83c.978.533 2.079.815 3.197.816 3.18 0 5.765-2.586 5.766-5.766 0-3.18-2.585-5.766-5.765-5.766zm3.385 8.195c-.186.522-.962.96-1.32.996-.358.037-.7.202-2.28-.42-2.022-.796-3.32-2.86-3.42-3-.1-.14-.73-.974-.73-1.856 0-.88.46-1.32.62-1.485.16-.165.36-.206.48-.206.12 0 .24 0 .34.005.115.003.266-.045.415.312.16.388.54 1.32.588 1.414.048.1.08.21.01.35-.07.14-.1.23-.21.35-.1.12-.22.27-.31.37-.1.1-.21.21-.09.42.12.21.53.87 1.14 1.41.78.69 1.44.91 1.64 1.01.2.1.32.08.44-.06.12-.14.52-.6.66-.8.14-.2.28-.17.48-.1.2.07 1.27.6 1.49.71.22.11.36.16.41.25.06.09.06.52-.13 1.04z" />
                          </svg>
                          Share to WhatsApp
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="p-4 rounded-xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] relative z-20">
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
                <Button variant="primary" size="sm" onClick={checkPincode} className="h-9" loading={isCheckingPincode}>
                  Check
                </Button>
              </div>
              {pincodeMsg && (
                <p className={`text-xs mt-2 ${pincodeMsg.startsWith("✅") ? "text-[hsl(142,71%,45%)] font-semibold" : "text-[hsl(0,72%,51%)] font-semibold"}`}>
                  {pincodeMsg}
                </p>
              )}
            </div>

            {/* Accordion Info: Shipping & Return Policies */}
            <div className="space-y-2 relative z-20">
              {[
                {
                  id: "shipping",
                  title: "Shipping & Delivery Info",
                  content: `We ship all orders within 24 hours of receipt (except Sundays). Standard delivery takes 2-4 business days for metros and 3-6 business days for other regions. Shipping is free for orders above ₹${COUNTRY_RULES[storeCountry as keyof typeof COUNTRY_RULES]?.freeLimit || 499}.`
                },
                {
                  id: "returns",
                  title: "30-Day Hassle-Free Returns & Refunds",
                  content: "We offer a hassle-free 30-day return policy. If you are not satisfied with the item, simply contact support@tkraft.in. We schedule a free reverse pickup and initiate a full refund to your original payment method once the item is inspected."
                },
                {
                  id: "guarantee",
                  title: "Quality & Payment Guarantee",
                  content: "Every item is checked for quality before packing. Payments are fully secure via Razorpay's PCI-DSS compliant checkout, supporting UPI, NetBanking, and credit/debit cards."
                }
              ].map((accordion) => {
                const isOpen = activeAccordion === accordion.id;
                return (
                  <div key={accordion.id} className="border border-[hsl(214,13%,90%)] rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? "" : accordion.id)}
                      className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)] transition-colors focus:outline-none"
                    >
                      <span>{accordion.title}</span>
                      <ChevronRight className={cn("h-4 w-4 text-[hsl(215,16%,47%)] transition-transform duration-200", isOpen && "rotate-90")} />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 pt-0 text-[11px] text-[hsl(215,16%,47%)] leading-relaxed border-t border-[hsl(214,13%,95%)] bg-[hsl(210,20%,98%)]">
                        {accordion.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Premium Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[hsl(214,13%,90%)] relative z-20">
              {[
                { 
                  icon: Truck, 
                  title: "Free Delivery",
                  text: (() => {
                    const rule = COUNTRY_RULES[storeCountry as keyof typeof COUNTRY_RULES] || COUNTRY_RULES.IN;
                    return rule.shipping === 0 
                      ? "On all orders today" 
                      : `On orders above ${formatPrice(rule.freeLimit, false)}`;
                  })()
                },
                { icon: RotateCcw, title: "30-Day Returns", text: "100% no-questions refund" },
                { icon: Shield, title: "Secure Pay", text: "Fully encrypted Razorpay checkouts" },
                { icon: User, title: "Quality Guarantee", text: "Rigorous safety checks on homeware" }
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-3 items-center p-3 rounded-xl bg-white border border-[hsl(214,13%,95%)] hover:shadow-sm transition-shadow"
                >
                  <div className="h-9 w-9 rounded-lg bg-[hsl(210,20%,96%)] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4.5 w-4.5 text-[hsl(var(--color-accent))]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-[hsl(222,47%,11%)] leading-tight">{title}</h4>
                    <span className="text-[10px] text-[hsl(215,16%,47%)] font-semibold truncate leading-tight block mt-0.5">{text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights Grid */}
            <div className="border border-[hsl(214,13%,90%)] rounded-2xl p-5 bg-white relative z-20">
              <h3 className="font-display font-bold text-base text-[hsl(222,47%,11%)] mb-4">
                Product Highlights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {highlightsList.map((highlight, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] font-bold text-[hsl(215,16%,47%)] uppercase tracking-wider block">
                      {highlight.label}
                    </span>
                    <span className="text-sm font-semibold text-[hsl(222,47%,11%)] leading-snug block">
                      {highlight.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Bought Together (Bundle Cross-sell) */}
            {bundleProducts.length > 0 && (
              <div className="border border-[hsl(214,13%,90%)] rounded-2xl p-5 bg-[hsl(210,20%,98%)] relative z-20 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-[hsl(222,47%,11%)]">
                    Frequently Bought Together
                  </h3>
                  <p className="text-xs text-[hsl(215,16%,47%)] mt-1">
                    Get these compatible items together and save!
                  </p>
                </div>

                {/* Products Flex Display */}
                <div className="flex items-center gap-3 overflow-x-auto py-2">
                  {/* Main Product */}
                  <div className="flex flex-col items-center text-center max-w-[80px] flex-shrink-0">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white border border-[hsl(214,13%,90%)] shadow-sm">
                      <Image
                        src={images[0]?.src || ""}
                        alt={product.name}
                        fill
                        className="object-cover p-1.5"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[hsl(222,47%,11%)] mt-2 line-clamp-1">
                      This Item
                    </span>
                    <span className="text-xs font-semibold text-[hsl(var(--color-accent))] mt-0.5">
                      {formatPrice(activePrice)}
                    </span>
                  </div>

                  {bundleProducts.map((bp) => {
                    const isChecked = checkedBundleIds.includes(bp.id);
                    return (
                      <div key={bp.id} className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-lg font-bold text-[hsl(215,14%,70%)]">+</span>
                        <div className="flex flex-col items-center text-center max-w-[80px]">
                          <div className={cn(
                            "relative h-16 w-16 rounded-xl overflow-hidden bg-white border shadow-sm transition-all",
                            isChecked ? "border-[hsl(var(--color-accent))]" : "border-[hsl(214,13%,90%)] opacity-60"
                          )}>
                            <Image
                              src={bp.images[0]?.src || ""}
                              alt={bp.name}
                              fill
                              className="object-cover p-1.5"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[hsl(222,47%,11%)] mt-2 line-clamp-1">
                            {bp.name}
                          </span>
                          <span className="text-xs font-semibold text-[hsl(var(--color-accent))] mt-0.5">
                            {formatPrice(bp.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Checkboxes List */}
                <div className="space-y-2.5 pt-2 border-t border-[hsl(214,13%,90%)]">
                  <label className="flex items-center gap-3 text-xs font-semibold text-[hsl(222,47%,11%)] cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="rounded text-[hsl(var(--color-accent))] focus:ring-[hsl(var(--color-accent))] h-4 w-4 cursor-not-allowed"
                    />
                    <span className="flex-1 truncate">
                      <strong>This item:</strong> {product.name} ({formatPrice(activePrice)})
                    </span>
                  </label>

                  {bundleProducts.map((bp) => {
                    const isChecked = checkedBundleIds.includes(bp.id);
                    return (
                      <label 
                        key={bp.id} 
                        className="flex items-center gap-3 text-xs font-semibold text-[hsl(222,47%,11%)] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBundleId(bp.id)}
                          className="rounded text-[hsl(var(--color-accent))] focus:ring-[hsl(var(--color-accent))] h-4 w-4 cursor-pointer"
                        />
                        <span className="flex-1 truncate">
                          <strong>Add:</strong> {bp.name} ({formatPrice(bp.price)})
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Price and Add Button */}
                <div className="bg-white rounded-xl p-4 border border-[hsl(214,13%,90%)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[hsl(215,16%,47%)] font-semibold">Total Bundle Price:</span>
                      {hasBundleDiscount && (
                        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Save 5%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-bold text-[hsl(222,47%,11%)]">
                        {formatPrice(finalBundlePrice.toFixed(2))}
                      </span>
                      {hasBundleDiscount && (
                        <span className="text-xs text-[hsl(215,14%,70%)] line-through font-medium">
                          {formatPrice(rawBundlePrice.toFixed(2))}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAddBundleToCart}
                    className="w-full sm:w-auto shadow-md"
                  >
                    Add Bundle to Cart
                  </Button>
                </div>
              </div>
            )}
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

    {/* Mobile Sticky Add to Cart */}
    <AnimatePresence>
      {showSticky && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[hsl(214,13%,90%)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] p-3 md:hidden flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)] flex-shrink-0">
              <Image
                src={images[0]?.src || ""}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[hsl(222,47%,11%)] truncate max-w-[150px]">
                {product.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-extrabold text-[hsl(222,47%,11%)]">
                  {formatPrice(activePrice)}
                </span>
                {selectedVariation && (
                  <span className="text-[10px] text-[hsl(215,16%,47%)] font-semibold truncate max-w-[80px]">
                    ({Object.values(selectedAttributes).join("/")})
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            leftIcon={<ShoppingCart className="h-4 w-4" />}
            className="h-10 px-4 text-xs font-bold shadow-md shadow-blue-500/10"
          >
            {isCombinationUnavailable ? "Unavailable" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Zoom Modal */}
    <AnimatePresence>
      {isZoomOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>

          <div 
            className="relative w-full max-w-4xl aspect-square md:aspect-[4/3] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {images[selectedImage]?.src && (
              <Image
                src={images[selectedImage].src}
                alt={images[selectedImage].alt || product.name}
                fill
                className="object-contain"
              />
            )}

            {/* Navigation Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 md:left-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
                >
                  <ChevronRight className="h-6 w-6 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 md:right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails indicator */}
          <div className="absolute bottom-4 flex justify-center gap-2 overflow-x-auto max-w-full px-4">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(idx);
                }}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-all",
                  selectedImage === idx ? "bg-[hsl(var(--color-accent))]" : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}
