import type { Metadata } from "next";
import { CartClient } from "@/features/cart/cart-client";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your selected items and proceed to checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-display font-bold text-[hsl(222,47%,11%)] mb-8">
          Shopping Cart
        </h1>
        <CartClient />
      </div>
    </div>
  );
}
