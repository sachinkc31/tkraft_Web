"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, CreditCard, Truck, CheckCircle } from "lucide-react";
import { useCartStore, useUIStore, useCurrencyStore } from "@/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { getPriceMultiplier, COUNTRY_RULES } from "@/lib/geo-config";

const checkoutSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  address_1: z.string().min(5, "Please enter a valid address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  postcode: z.string().min(3, "Please enter a valid postal code"),
  country: z.string().min(2, "Please select your country"),
  order_notes: z.string().optional(),
  payment_method: z.enum(["razorpay", "cod"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutClient() {
  const currency = useCurrencyStore((s) => s.currency);
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const showToast = useUIStore((s) => s.showToast);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<"standard" | "express" | "pickup">("standard");

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const storeCountry = useCurrencyStore((s) => s.countryCode) || "IN";
  const setCountryCode = useCurrencyStore((s) => s.setCountryCode);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: "razorpay", country: storeCountry },
  });

  const selectedCountry = watch("country") || "IN";

  useEffect(() => {
    setCountryCode(selectedCountry);
  }, [selectedCountry, setCountryCode]);

  const geoMultiplier = getPriceMultiplier(selectedCountry);
  const multipliedTotalPrice = totalPrice * geoMultiplier;

  const rule = COUNTRY_RULES[selectedCountry as keyof typeof COUNTRY_RULES] || COUNTRY_RULES.IN;
  
  // Calculate shipping costs dynamically
  const standardShippingCost = multipliedTotalPrice >= rule.freeLimit ? 0 : rule.shipping;
  
  const expressSurchargeMap: Record<string, number> = {
    IN: 150,
    US: 1200,
    GB: 1200,
    DE: 1000,
    AU: 1200,
    CA: 1000,
    other: 1500,
  };
  const expressSurcharge = expressSurchargeMap[selectedCountry] || expressSurchargeMap.other;
  const expressShippingCost = standardShippingCost + expressSurcharge;

  let shippingCost = 0;
  if (selectedShippingMethod === "standard") {
    shippingCost = standardShippingCost;
  } else if (selectedShippingMethod === "express") {
    shippingCost = expressShippingCost;
  } else if (selectedShippingMethod === "pickup") {
    shippingCost = 0;
  }

  const taxCost = multipliedTotalPrice * rule.tax;
  const finalTotal = multipliedTotalPrice + shippingCost + taxCost;
  const hasFreeShipping = selectedShippingMethod !== "pickup" && shippingCost === 0;

  const paymentMethod = watch("payment_method");

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        payment_method: data.payment_method,
        billing: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address_1: data.address_1,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
        },
        shipping: {
          first_name: data.first_name,
          last_name: data.last_name,
          address_1: data.address_1,
          city: data.city,
          state: data.state,
          postcode: data.postcode,
          country: data.country,
        },
        line_items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        shipping_lines: [
          {
            method_id: selectedShippingMethod === "pickup" ? "local_pickup" : selectedShippingMethod === "express" ? "express_delivery" : "flat_rate",
            method_title: selectedShippingMethod === "pickup" ? "Local Pickup" : selectedShippingMethod === "express" ? "Express Delivery" : "Standard Delivery",
            total: shippingCost.toFixed(2),
          }
        ],
        customer_note: data.order_notes || "",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error("Failed to create order");
      const order = await res.json();

      if (data.payment_method === "razorpay") {
        showToast("Initializing payment gateway...", "info");
        
        // Dynamically load Razorpay SDK
        const loadRzp = () => {
          return new Promise((resolve) => {
            if ((window as any).Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const isLoaded = await loadRzp();
        if (!isLoaded) {
          showToast("Failed to load payment gateway. Please check your network.", "error");
          return;
        }

        // Create Razorpay Order
        const payRes = await fetch("/api/payment/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            orderId: order.id,
          }),
        });

        if (!payRes.ok) throw new Error("Payment initialization failed");
        const rzpOrder = await payRes.json();

        // Configure checkout options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "Tkraft",
          description: `Order #${order.id}`,
          order_id: rzpOrder.id,
          handler: async function (response: any) {
            setIsSubmitting(true);
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order.id,
                }),
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.error || "Payment verification failed");
              }

              clearCart();
              setOrderPlaced(true);
              showToast("Payment successful! Order confirmed.", "success");
            } catch (err: any) {
              showToast(err.message || "Payment verification failed.", "error");
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            contact: data.phone,
          },
          theme: {
            color: "hsl(217, 70%, 38%)",
          },
          modal: {
            ondismiss: function () {
              showToast("Payment cancelled. You can try again.", "info");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        clearCart();
        setOrderPlaced(true);
        showToast("Order placed successfully!", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to place order. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="text-center py-16">
        <p className="text-[hsl(215,16%,47%)] mb-4">Your cart is empty.</p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "primary" }))}>
          Shop Now
        </Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16"
      >
        <div className="h-24 w-24 rounded-full bg-[hsl(142,71%,95%)] flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-[hsl(142,71%,45%)]" />
        </div>
        <h2 className="text-2xl font-display font-bold text-[hsl(222,47%,11%)] mb-3">
          Order Placed! 🎉
        </h2>
        <p className="text-[hsl(215,16%,47%)] mb-8">
          Thank you for your order. You will receive a confirmation email shortly.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  const fieldClass = (hasError: boolean) =>
    cn(
      "w-full h-11 px-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:border-[hsl(var(--color-accent))]",
      hasError
        ? "border-[hsl(0,72%,51%)] bg-[hsl(0,72%,98%)]"
        : "border-[hsl(214,13%,90%)] bg-white hover:border-[hsl(217,70%,60%)]"
    );

  const labelClass = "block text-sm font-semibold text-[hsl(222,47%,11%)] mb-1.5";
  const errorClass = "text-xs text-[hsl(0,72%,51%)] mt-1";

  return (
    <div className="space-y-6">
      {/* Back to Cart Option */}
      <div className="flex items-center">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--color-accent))] hover:text-[hsl(217,70%,50%)] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Shopping Cart
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ---- LEFT: Form ---- */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] p-6">
              <h2 className="font-display font-bold text-lg text-[hsl(222,47%,11%)] mb-5">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input {...register("first_name")} className={fieldClass(!!errors.first_name)} placeholder="Rahul" />
                  {errors.first_name && <p className={errorClass}>{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input {...register("last_name")} className={fieldClass(!!errors.last_name)} placeholder="Sharma" />
                  {errors.last_name && <p className={errorClass}>{errors.last_name.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input {...register("email")} type="email" className={fieldClass(!!errors.email)} placeholder="rahul@example.com" />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input {...register("phone")} type="tel" className={fieldClass(!!errors.phone)} placeholder="9876543210" />
                  {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] p-6">
              <h2 className="font-display font-bold text-lg text-[hsl(222,47%,11%)] mb-5 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[hsl(var(--color-accent))]" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Country / Region *</label>
                  <select
                    {...register("country")}
                    className={fieldClass(!!errors.country)}
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="other">Other (International)</option>
                  </select>
                  {errors.country && <p className={errorClass}>{errors.country.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Street Address *</label>
                  <input {...register("address_1")} className={fieldClass(!!errors.address_1)} placeholder="House/Flat No., Street, Locality" />
                  {errors.address_1 && <p className={errorClass}>{errors.address_1.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input {...register("city")} className={fieldClass(!!errors.city)} placeholder="Mumbai" />
                    {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input {...register("state")} className={fieldClass(!!errors.state)} placeholder="Maharashtra" />
                    {errors.state && <p className={errorClass}>{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Pincode *</label>
                    <input {...register("postcode")} className={fieldClass(!!errors.postcode)} placeholder="400001" />
                    {errors.postcode && <p className={errorClass}>{errors.postcode.message}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Order Notes (optional)</label>
                  <textarea {...register("order_notes")} rows={3} className={cn(fieldClass(false), "h-auto py-2.5 resize-none")} placeholder="Any special delivery instructions…" />
                </div>
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] p-6">
              <h2 className="font-display font-bold text-lg text-[hsl(222,47%,11%)] mb-5 flex items-center gap-2">
                <Truck className="h-5 w-5 text-[hsl(var(--color-accent))]" />
                Shipping Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "standard",
                    name: "Standard Delivery",
                    time: "3–5 business days",
                    cost: standardShippingCost,
                    formattedCost: standardShippingCost === 0 ? "FREE" : formatPrice(standardShippingCost, false),
                    icon: "🚚",
                  },
                  {
                    id: "express",
                    name: "Express Delivery",
                    time: "1–2 business days",
                    cost: expressShippingCost,
                    formattedCost: formatPrice(expressShippingCost, false),
                    icon: "⚡",
                  },
                  {
                    id: "pickup",
                    name: "Store Pickup",
                    time: "Ready in 24 hours",
                    cost: 0,
                    formattedCost: "FREE",
                    icon: "🏪",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-[hsl(217,70%,60%)]",
                      selectedShippingMethod === method.id
                        ? "border-[hsl(var(--color-accent))] bg-[hsl(217,70%,97%)]"
                        : "border-[hsl(214,13%,90%)] bg-white"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="shipping_method"
                        value={method.id}
                        checked={selectedShippingMethod === method.id}
                        onChange={() => setSelectedShippingMethod(method.id as any)}
                        className="mt-1 accent-[hsl(var(--color-accent))]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{method.icon}</span>
                          <span className="font-semibold text-[hsl(222,47%,11%)] text-sm">{method.name}</span>
                        </div>
                        <p className="text-xs text-[hsl(215,16%,47%)] mt-1">{method.time}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[hsl(214,13%,95%)] flex justify-between items-center">
                      <span className="text-xs text-[hsl(215,16%,47%)]">Price:</span>
                      <span className={cn(
                        "text-sm font-bold",
                        method.cost === 0 ? "text-[hsl(142,71%,45%)]" : "text-[hsl(222,47%,11%)]"
                      )}>
                        {method.formattedCost}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] p-6">
              <h2 className="font-display font-bold text-lg text-[hsl(222,47%,11%)] mb-5 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[hsl(var(--color-accent))]" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "razorpay",
                    label: "Pay Online",
                    description: "Credit/Debit Card, UPI, Net Banking",
                    badge: "Recommended",
                  },
                  {
                    value: "cod",
                    label: "Cash on Delivery",
                    description: "Pay when your order arrives",
                    badge: null,
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      paymentMethod === option.value
                        ? "border-[hsl(var(--color-accent))] bg-[hsl(217,70%,97%)]"
                        : "border-[hsl(214,13%,90%)] hover:border-[hsl(217,70%,60%)]"
                    )}
                  >
                    <input type="radio" {...register("payment_method")} value={option.value} className="mt-0.5 accent-[hsl(var(--color-accent))]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[hsl(222,47%,11%)] text-sm">{option.label}</span>
                        {option.badge && (
                          <span className="badge bg-[hsl(142,71%,45%)] text-white">{option.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ---- RIGHT: Order Summary ---- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg text-[hsl(222,47%,11%)] mb-5">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const image = item.product.images[0];
                  // strip HTML tags
                  const descriptionHtml = item.product.short_description || item.product.description || "";
                  const cleanDescription = descriptionHtml
                    .replace(/<[^>]*>/g, '') // remove HTML tags
                    .replace(/&nbsp;/g, ' ') // replace entity
                    .trim();
                  const truncatedDescription = cleanDescription.length > 70 
                    ? cleanDescription.substring(0, 67) + "..." 
                    : cleanDescription;

                  return (
                    <div key={item.id} className="flex gap-3 py-3 border-b border-[hsl(214,13%,95%)] last:border-0 text-sm">
                      {/* Image */}
                      <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)]">
                        {image?.src ? (
                          <Image
                            src={image.src}
                            alt={image.alt || item.product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[hsl(210,20%,96%)] text-[hsl(215,16%,47%)] text-xs">
                            No Img
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-[hsl(222,47%,11%)] line-clamp-1 hover:text-[hsl(var(--color-accent))] transition-colors">
                            {item.product.name}
                          </h4>
                          {truncatedDescription && (
                            <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5 line-clamp-2 leading-normal">
                              {truncatedDescription}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-[hsl(210,20%,94%)] text-[hsl(222,47%,11%)]">
                            Qty: {item.quantity} (Read-only)
                          </span>
                          <span className="font-semibold text-[hsl(222,47%,11%)]">
                            {formatPrice(parseFloat(item.product.price) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-[hsl(214,13%,90%)] mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[hsl(215,16%,47%)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[hsl(215,16%,47%)]">
                  <span>
                    Tax ({rule.tax * 100}% {selectedCountry === "IN" ? "GST" : selectedCountry === "US" ? "Sales Tax" : selectedCountry === "GB" || selectedCountry === "DE" ? "VAT" : "Tax"})
                  </span>
                  <span>{formatPrice(taxCost, false)}</span>
                </div>
                <div className="flex justify-between text-[hsl(215,16%,47%)]">
                  <span>Shipping ({selectedShippingMethod === "pickup" ? "Pickup" : selectedShippingMethod === "express" ? "Express" : "Standard"})</span>
                  <span className={hasFreeShipping ? "text-[hsl(142,71%,45%)] font-semibold" : ""}>
                    {hasFreeShipping ? "FREE" : formatPrice(shippingCost, false)}
                  </span>
                </div>
              </div>

              <div className="border-t border-[hsl(214,13%,90%)] mt-4 pt-4 flex justify-between font-bold text-[hsl(222,47%,11%)]">
                <span className="text-lg">Total</span>
                <span className="text-xl">{formatPrice(finalTotal, false)}</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full mt-5 shadow-md"
                leftIcon={<ShieldCheck className="h-5 w-5" />}
              >
                {paymentMethod === "cod" ? "Place Order" : "Pay Securely"}
              </Button>

              <div className="flex items-center gap-2 justify-center mt-4 text-xs text-[hsl(215,16%,47%)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured by Razorpay
              </div>

              <Link href="/cart" className="flex items-center justify-center gap-1.5 mt-3 text-xs text-[hsl(var(--color-accent))] hover:underline">
                <ArrowLeft className="h-3 w-3" /> Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
