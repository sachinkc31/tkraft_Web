import type { Metadata } from "next";
import { WishlistClient } from "@/features/wishlist/wishlist-client";

export const metadata: Metadata = {
  title: "My Wishlist | Tkraft",
  description: "View and manage products you saved to your wishlist, or add them directly to your cart.",
};

export default function WishlistPage() {
  return <WishlistClient />;
}
