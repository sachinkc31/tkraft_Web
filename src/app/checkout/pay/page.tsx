import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutPayClient } from "@/features/checkout/checkout-pay-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Complete Order Payment | Tkraft",
  description: "Securely finish your checkout and complete payment for your order.",
};

export default function CheckoutPayPage() {
  return (
    <Suspense
      fallback={
        <div className="section min-h-[60vh] flex items-center justify-center bg-[hsl(210,20%,98%)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-[hsl(217,70%,38%)] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[hsl(215,16%,47%)]">Loading checkout session...</p>
          </div>
        </div>
      }
    >
      <CheckoutPayClient />
    </Suspense>
  );
}
