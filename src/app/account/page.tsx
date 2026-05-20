import type { Metadata } from "next";
import { AccountClient } from "@/features/account/account-client";

export const metadata: Metadata = {
  title: "My Account | Tkraft",
  description: "Access your dashboard, manage addresses, track shipments, and view past purchases.",
};

export default function AccountPage() {
  return <AccountClient />;
}
