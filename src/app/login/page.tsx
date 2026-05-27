import { Metadata } from "next";
import { getLoginContent } from "@/services/cms";
import { LoginClient } from "@/features/auth/login-client";

export const metadata: Metadata = {
  title: "Secure Member Login | Tkraft",
  description: "Log in to your Tkraft account to track orders, manage addresses, or continue checkout. Guest checkout and social login options available.",
};

// Force dynamic rendering to ensure that changes in WordPress content are reflected immediately on every request
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const loginContent = await getLoginContent();

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)] flex items-center justify-center py-10 md:py-16 px-4">
      <LoginClient loginContent={loginContent} />
    </div>
  );
}
