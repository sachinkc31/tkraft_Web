"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star, Plus, Minus, Heart, Eye } from "lucide-react";
import { useCartStore, useUIStore, useWishlistStore, useCurrencyStore } from "@/store";
import { formatPrice, getDiscountPercent, cn, stripHtml } from "@/lib/utils";
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

interface QuickViewModalProps {
  product: WooProduct;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const currency = useCurrencyStore((s) => s.currency);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const showToast = useUIStore((s) => s.showToast);
  
  const toggleWishlistItem = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.hasItem(product.id));

  const [variations, setVariations] = useState<any[]>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch variations if product is variable
  useEffect(() => {
    if (isOpen && product.type === "variable") {
      setLoadingVariations(true);
      fetch(`/api/products/${product.slug}/variations`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setVariations(data);
            // Set initial selected attributes based on first variation
            if (data.length > 0) {
              const initial: Record<string, string> = {};
              data[0].attributes?.forEach((attr: any) => {
                initial[attr.name] = attr.option;
              });
              setSelectedAttributes(initial);
            }
          }
        })
        .catch((err) => console.error("Error loading variations:", err))
        .finally(() => setLoadingVariations(false));
    }
  }, [isOpen, product.type, product.slug]);

  // Find selected variation
  const selectedVariation = variations.find((v) => {
    return v.attributes?.every((attr: any) => {
      const selVal = selectedAttributes[attr.name];
      if (!selVal) return false;
      if (!attr.option) return true;
      return attr.option.toLowerCase() === selVal.toLowerCase();
    });
  });

  const variationAttributes = product.attributes?.filter((attr) => attr.variation) || [];
  const isSelectionComplete = variationAttributes.every((attr) => selectedAttributes[attr.name]);
  const isCombinationUnavailable = product.type === "variable" && isSelectionComplete && !selectedVariation;

  const activePrice = selectedVariation ? selectedVariation.price : product.price;
  const activeRegularPrice = selectedVariation ? selectedVariation.regular_price : product.regular_price;
  const activeSalePrice = selectedVariation ? selectedVariation.sale_price : product.sale_price;
  const activeOnSale = selectedVariation ? selectedVariation.on_sale : product.on_sale;
  const activeStockStatus = selectedVariation ? selectedVariation.stock_status : product.stock_status;
  const isOutOfStock = activeStockStatus === "outofstock" || isCombinationUnavailable || product.stock_status === "outofstock";

  const discount = getDiscountPercent(activeRegularPrice, activeSalePrice);

  // Sync display images
  const variationImage = selectedVariation?.image;
  let displayImages = product.images.length ? [...product.images] : [{ id: 0, src: "", name: "", alt: "" }];
  if (variationImage && variationImage.src && !displayImages.some((img) => img.src === variationImage.src)) {
    displayImages = [variationImage, ...displayImages];
  }
  const images = displayImages;

  // Keep selected image in bounds and update to variant image on switch
  useEffect(() => {
    if (selectedVariation?.image?.src) {
      const idx = images.findIndex((img) => img.src === selectedVariation.image.src);
      if (idx !== -1) {
        setSelectedImage(idx);
      }
    }
  }, [selectedVariation?.id, images]);

  function handleAttributeSelect(name: string, value: string) {
    setSelectedAttributes((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAddToCart() {
    if (isOutOfStock) return;

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

    addItem(productToCart, quantity, selectedVariation?.id, selectedVariation ? selectedAttributes : undefined);
    openCart();
    showToast(`${productToCart.name} added to cart!`, "success");
    onClose();
  }

  function handleToggleWishlist() {
    toggleWishlistItem(product);
    showToast(
      isInWishlist
        ? `${product.name} removed from wishlist.`
        : `${product.name} added to wishlist!`,
      "success"
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors z-30"
              title="Close Quick View"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left: Images */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-neutral-50 border-r border-neutral-100">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-sm">
                {images[selectedImage]?.src ? (
                  <Image
                    src={images[selectedImage].src}
                    alt={images[selectedImage].alt || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                    No image available
                  </div>
                )}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative h-16 w-16 rounded-xl overflow-hidden bg-white border-2 flex-shrink-0 transition-all",
                        selectedImage === idx
                          ? "border-blue-600 scale-95 shadow-sm"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <Image
                        src={img.src}
                        alt="Thumbnail"
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col max-h-[50vh] md:max-h-[80vh] overflow-y-auto">
              <div className="flex-1">
                {/* Category */}
                {product.categories?.[0] && (
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">
                    {product.categories[0].name}
                  </span>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold text-neutral-900 leading-tight mb-2">
                  {product.name}
                </h2>

                {/* Reviews / Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= Math.round(parseFloat(product.average_rating || "0"))
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    ({product.rating_count || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl font-extrabold text-neutral-900">
                    {formatPrice(activePrice)}
                  </span>
                  {activeOnSale && activeRegularPrice && (
                    <span className="text-base text-neutral-400 line-through">
                      {formatPrice(activeRegularPrice)}
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <div
                  className="text-sm text-neutral-600 leading-relaxed mb-6 border-t border-neutral-100 pt-4"
                  dangerouslySetInnerHTML={{
                    __html: product.short_description || stripHtml(product.description).slice(0, 160) + "...",
                  }}
                />

                {/* Variable Options */}
                {product.type === "variable" && (
                  <div className="space-y-4 mb-6 border-t border-neutral-100 pt-4">
                    {loadingVariations ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-100 rounded w-1/4 skeleton" />
                        <div className="flex gap-2">
                          <div className="h-8 bg-neutral-100 rounded w-12 skeleton" />
                          <div className="h-8 bg-neutral-100 rounded w-12 skeleton" />
                        </div>
                      </div>
                    ) : (
                      variationAttributes.map((attr) => {
                        const isColor = attr.name.toLowerCase() === "color" || attr.name.toLowerCase() === "colour";
                        const selectedVal = selectedAttributes[attr.name];

                        return (
                          <div key={attr.name} className="space-y-2">
                            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                              Select {attr.name}:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {attr.options?.map((option) => {
                                const isSelected = selectedVal === option;
                                
                                if (isColor) {
                                  const colorHex = COLOR_MAP[option.toLowerCase().trim()] || option.toLowerCase();
                                  return (
                                    <button
                                      key={option}
                                      onClick={() => handleAttributeSelect(attr.name, option)}
                                      className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all shadow-sm flex items-center justify-center relative",
                                        isSelected ? "border-blue-600 scale-110" : "border-neutral-200 hover:scale-105"
                                      )}
                                      style={{ backgroundColor: colorHex }}
                                      title={option}
                                    >
                                      {isSelected && (
                                        <span
                                          className={cn(
                                            "w-2 h-2 rounded-full",
                                            option.toLowerCase() === "white" ? "bg-black" : "bg-white"
                                          )}
                                        />
                                      )}
                                    </button>
                                  );
                                }

                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleAttributeSelect(attr.name, option)}
                                    className={cn(
                                      "px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all",
                                      isSelected
                                        ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                                        : "bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300"
                                    )}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Add to Cart Actions */}
              <div className="border-t border-neutral-100 pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 px-2.5 py-1.5 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-neutral-500 hover:text-neutral-800 transition-colors p-1"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-neutral-800 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-neutral-500 hover:text-neutral-800 transition-colors p-1"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={handleToggleWishlist}
                    className={cn(
                      "h-12 w-12 rounded-xl border flex items-center justify-center transition-colors shadow-sm",
                      isInWishlist
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-white border-neutral-200 text-neutral-500 hover:text-red-500 hover:border-red-200"
                    )}
                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                  </button>
                </div>

                {/* View Full details link */}
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="w-full text-center block text-xs font-bold text-neutral-500 hover:text-blue-600 transition-colors py-2 flex items-center justify-center gap-1 hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Full Product Details
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
