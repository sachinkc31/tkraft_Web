import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ)",
  description: "Find answers to common questions about shipping, tracking, payments, and returns.",
};

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "We usually dispatch orders within 24-48 hours. Depending on your location in India, delivery takes 3 to 5 business days.",
      },
      {
        q: "Is there a shipping charge?",
        a: "We offer free shipping on all orders above ₹499. For orders below ₹499, a flat shipping charge of ₹49 is applied.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is shipped, you will receive a tracking link via email and SMS to monitor the real-time status of your delivery.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer an easy 30-day money-back guarantee on all our products. The items must be unused, in their original packaging, and in the same condition that you received them.",
      },
      {
        q: "How do I request a return or exchange?",
        a: "You can initiate a return by contacting our customer support team at support@tkraft.in with your order number and details of the product.",
      },
      {
        q: "When will I get my refund?",
        a: "Once we receive and inspect your return, we will process your refund within 5-7 business days to your original payment method or bank account.",
      },
    ],
  },
  {
    category: "Payments & Security",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD).",
      },
      {
        q: "Is it safe to pay online on Tkraft?",
        a: "Yes, our website uses industry-standard 256-bit SSL encryption. All transactions are securely processed through Razorpay, a certified secure payment gateway.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="section">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(222,47%,11%)] mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-[hsl(215,16%,47%)] mb-10">
          Got questions? We have answers. If you can&apos;t find what you&apos;re looking for, feel free to reach out to our support team.
        </p>

        <div className="space-y-8">
          {FAQS.map((cat) => (
            <div key={cat.category} className="space-y-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-[hsl(217,70%,38%)] border-b border-[hsl(214,13%,90%)] pb-2">
                {cat.category}
              </h2>
              <div className="space-y-4">
                {cat.items.map((item) => (
                  <div key={item.q} className="p-5 rounded-2xl bg-[hsl(210,20%,98%)] border border-[hsl(214,13%,90%)]">
                    <h3 className="font-semibold text-[hsl(222,47%,11%)] mb-2">
                      {item.q}
                    </h3>
                    <p className="text-sm text-[hsl(215,16%,47%)] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
