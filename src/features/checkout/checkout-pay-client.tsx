"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, CreditCard, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUIStore, useCurrencyStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CheckoutPayClient() {
  const currency = useCurrencyStore((s) => s.currency);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const showToast = useUIStore((s) => s.showToast);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided in the payment session link.");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Order not found");
        }
        const data = await res.json();
        setOrder(data);

        // If order status is already paid / processing
        if (data.status === "processing" || data.status === "completed") {
          setPaymentCompleted(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) return;
    setIsPaying(true);

    try {
      // 1. Load Razorpay script
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
        showToast("Failed to load Razorpay payment client.", "error");
        setIsPaying(false);
        return;
      }

      // 2. Initialize Razorpay Order on server
      const payRes = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: order.total,
          orderId: order.id,
        }),
      });

      if (!payRes.ok) {
        throw new Error("Failed to initialize payment order.");
      }

      const rzpOrder = await payRes.json();

      // 3. Open Razorpay Widget
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Tkraft",
        description: `Pay pending Order #${order.id}`,
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          setIsPaying(true);
          try {
            // Verify Payment on Backend
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
              throw new Error(errData.error || "Verification failed");
            }

            setPaymentCompleted(true);
            showToast("Payment verified! Your order is now processing.", "success");
          } catch (verifyErr: any) {
            showToast(verifyErr.message || "Failed to verify transaction.", "error");
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: `${order.billing?.first_name || ""} ${order.billing?.last_name || ""}`,
          email: order.billing?.email || "",
          contact: order.billing?.phone || "",
        },
        theme: {
          color: "hsl(217, 70%, 38%)",
        },
        modal: {
          ondismiss: function () {
            showToast("Payment cancelled. You can try again.", "info");
            setIsPaying(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showToast(err.message || "Failed to initiate payment gateway.", "error");
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="section min-h-[60vh] flex items-center justify-center bg-[hsl(210,20%,98%)]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 border-2 border-[hsl(var(--color-accent))] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-sm text-[hsl(215,16%,47%)]">Retrieving pending checkout details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section min-h-[60vh] flex items-center justify-center bg-[hsl(210,20%,98%)] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[hsl(214,13%,90%)] shadow-xl p-8 text-center">
          <div className="h-14 w-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-[hsl(222,47%,11%)] mb-2">
            Payment Link Error
          </h2>
          <p className="text-sm text-[hsl(215,16%,47%)] mb-6">{error}</p>
          <Link href="/shop" passHref legacyBehavior>
            <Button variant="primary" className="w-full justify-center">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="section min-h-[60vh] flex items-center justify-center bg-[hsl(210,20%,98%)] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl border border-[hsl(214,13%,90%)] shadow-xl p-8 text-center"
        >
          <div className="h-16 w-16 bg-[hsl(142,71%,95%)] text-[hsl(142,71%,45%)] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-9 w-9" />
          </div>
          <h2 className="font-display font-bold text-2xl text-[hsl(222,47%,11%)] mb-3">
            Payment Confirmed!
          </h2>
          <p className="text-sm text-[hsl(215,16%,47%)] mb-6">
            Order #{order?.id} is paid and processing. We will send you updates as items are prepared for shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/account" className="flex-1" passHref legacyBehavior>
              <Button variant="outline" className="w-full justify-center">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/shop" className="flex-1" passHref legacyBehavior>
              <Button variant="primary" className="w-full justify-center">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section min-h-[calc(100vh-200px)] bg-[hsl(210,20%,98%)] py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--color-accent))] hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[hsl(222,47%,11%)] flex items-center gap-2.5">
            <CreditCard className="h-7 w-7 text-[hsl(var(--color-accent))]" /> Complete Payment
          </h1>
          <p className="text-sm text-[hsl(215,16%,47%)] mt-2">
            Finish checkout for your pending Order <strong>#{order.id}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Order Details Column */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm p-6">
              <h2 className="font-display font-bold text-base text-[hsl(222,47%,11%)] mb-4">
                Items in Order
              </h2>
              <ul className="space-y-4 divide-y divide-[hsl(214,13%,95%)]">
                {order.line_items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between items-start pt-3 first:pt-0">
                    <div className="pr-4">
                      <p className="font-semibold text-sm text-[hsl(222,47%,11%)]">{item.name}</p>
                      <p className="text-xs text-[hsl(215,16%,47%)] mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm text-[hsl(222,47%,11%)] whitespace-nowrap">
                      {formatPrice(parseFloat(item.total), false)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Billing details card */}
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm p-6">
              <h2 className="font-display font-bold text-base text-[hsl(222,47%,11%)] mb-3">
                Billing Address
              </h2>
              <div className="text-sm text-[hsl(215,16%,47%)] space-y-1">
                <p className="font-semibold text-[hsl(222,47%,11%)]">
                  {order.billing?.first_name} {order.billing?.last_name}
                </p>
                <p>{order.billing?.address_1}</p>
                <p>{order.billing?.city}, {order.billing?.state} - {order.billing?.postcode}</p>
                <p className="pt-2 font-medium">Contact: {order.billing?.phone}</p>
              </div>
            </div>
          </div>

          {/* Pricing summary column */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[hsl(214,13%,90%)] shadow-sm p-6 sticky top-6">
              <h2 className="font-display font-bold text-base text-[hsl(222,47%,11%)] mb-4">
                Total Payment
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-[hsl(215,16%,47%)]">
                  <span>Payment Method</span>
                  <span className="font-semibold capitalize text-[hsl(222,47%,11%)]">
                    {order.payment_method_title || order.payment_method}
                  </span>
                </div>
                <div className="border-t border-[hsl(214,13%,90%)] pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-[hsl(222,47%,11%)]">Total Amount</span>
                  <span className="text-2xl font-display font-extrabold text-[hsl(var(--color-accent))]">
                    {formatPrice(parseFloat(order.total), false)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={isPaying}
                onClick={handlePayment}
                className="w-full justify-center gap-2 py-3"
              >
                <CreditCard className="h-5 w-5" /> Pay Securely Now
              </Button>
              
              <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] font-semibold text-[hsl(215,16%,47%)] uppercase tracking-wider">
                🛡️ Verified Secure by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
