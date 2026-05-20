"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Successfully subscribed! Check your inbox.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-[hsl(142,71%,45%)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-white mb-1">You're on the list!</p>
          <p className="text-xs text-white/60">We'll send you updates on new products and exclusive offers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-sm uppercase tracking-wider text-white/90 mb-3">
        Subscribe to our Newsletter
      </h3>
      <p className="text-xs text-white/60 mb-4 leading-relaxed">
        Get the latest updates on new products, exclusive offers, and home essentials.
      </p>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Mail className="absolute left-3 h-4 w-4 text-white/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            disabled={status === "loading"}
            className="w-full h-11 pl-10 pr-12 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[hsl(27,96%,55%)] focus:bg-white/15 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="absolute right-1.5 h-8 w-8 rounded-md bg-[hsl(27,96%,55%)] flex items-center justify-center text-white hover:bg-[hsl(27,96%,45%)] transition-colors disabled:opacity-50 disabled:hover:bg-[hsl(27,96%,55%)]"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>
        {status === "error" && (
          <p className="text-xs text-red-400 mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
