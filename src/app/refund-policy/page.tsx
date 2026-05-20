import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description: "Read about our 30-day money-back guarantee, return process, and refund timelines.",
};

export default function RefundPolicyPage() {
  return (
    <div className="section">
      <div className="container max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(222,47%,11%)] mb-6">
          Refund and Cancellation Policy
        </h1>
        <p className="text-sm text-[hsl(215,16%,47%)] mb-8">Last Updated: May 19, 2026</p>

        <div className="prose prose-sm max-w-none text-[hsl(215,16%,47%)] space-y-6 leading-relaxed">
          <p>
            At Tkraft, customer satisfaction is our top priority. We offer a 7-day return policy, which means you have 30 days after receiving your item to request a return.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">1. Eligibility Criteria for Returns</h2>
            <p>To be eligible for a return, your item must meet the following conditions:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The item must be unused, unwashed, and in the same condition that you received it.</li>
              <li>It must be in its original packaging with all tags, labels, and accessories intact.</li>
              <li>You must provide the receipt, invoice, or proof of purchase.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">2. Return Process</h2>
            <p>To initiate a return, follow these simple steps:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>Email our customer support at support@tkraft.in with your order ID and the reason for the return.</li>
              <li>Our team will review your request and send instructions on how and where to ship your package.</li>
              <li>Please do not send items back to us without obtaining prior approval.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">3. Refunds & Timeline</h2>
            <p>
              Once we receive and inspect your returned product, we will send you an email confirmation. If the return is approved, we will process your refund:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Refunds will be processed back to the original method of payment (UPI, Credit/Debit Card, Net Banking).</li>
              <li>For Cash on Delivery (COD) orders, we will request your bank account details or UPI ID to transfer the refund amount.</li>
              <li>Refunds typically appear in your account within 5-7 business days, depending on your bank or payment issuer.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">4. Cancellations</h2>
            <p>
              You can cancel your order any time before it is shipped. If the order has already been dispatched from our warehouse, cancellations are not possible, but you can return the package to us once delivered under our standard returns policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
