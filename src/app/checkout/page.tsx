import type { Metadata } from "next";
import { CheckoutClient } from "@/features/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order securely.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="section bg-[hsl(210,20%,98%)] min-h-screen">
      <div className="container">
        <h1 className="text-3xl font-display font-bold text-[hsl(222,47%,11%)] mb-8">
          Checkout
        </h1>
        <CheckoutClient />
      </div>
    </div>
  );
}
