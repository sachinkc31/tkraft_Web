import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";
import { NewsletterForm } from "./newsletter-form";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-[hsl(222,47%,11%)] text-white mt-auto">
      {/* Trust Badges Strip */}
      <div className="border-b border-white/10">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🚚", title: "Free Shipping", desc: "On orders above ₹499" },
              { icon: "🎧", title: "24/7 Support", desc: "Dedicated customer service" },
              { icon: "🔄", title: "Easy Returns", desc: "7-day return policy" },
              { icon: "🔒", title: "Secure Payment", desc: "100% secure checkout" },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-white/60">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
           <Link
              href="/"
              className="flex-shrink-0 font-display font-800 text-2xl text-[hsl(var(--color-accent))] tracking-tight"
            >
              <Image 
                src={SITE_CONFIG.logo} 
                alt={SITE_CONFIG.name} 
                width={120} 
                height={40} 
                className="inline-block mb-2 align-middle object-contain" 
                priority
              />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Tkraft is your premier destination for drill-free home and kitchen storage organizers, heavy-duty adhesive wall hooks, and space-saving essentials across India.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <a
                href="https://www.trustpilot.com/review/tkraft.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:underline font-semibold bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded inline-flex items-center gap-1"
              >
                ★ Trustpilot Reviews
              </a>
              <a
                href="https://www.amazon.in/stores/Tkraft/page/87C0D0E8-A979-4B52-87C7-93C0C46B1D28"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-300 hover:underline font-semibold bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded inline-flex items-center gap-1"
              >
                Amazon Storefront
              </a>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: FacebookIcon, href: "https://www.facebook.com/tkraft.in", label: "Facebook" },
                { icon: InstagramIcon, href: "https://www.instagram.com/tkraft.in", label: "Instagram" },
                { icon: TwitterIcon, href: "https://twitter.com/tkraftin", label: "Twitter" },
                { icon: YoutubeIcon, href: "https://www.youtube.com/@tkraftin", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-[hsl(27,96%,55%)] hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            
            <NewsletterForm />
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.categories.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Help
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-[hsl(27,96%,55%)]" />
                <a href="mailto:support@tkraft.in" className="hover:text-white transition-colors">
                  support@tkraft.in
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-[hsl(27,96%,55%)]" />
                <span>Available 24/7</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[hsl(27,96%,55%)]" />
                <span>India</span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-6">
              <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">We Accept</p>
              <div className="flex flex-wrap gap-2">
                {["Razorpay", "UPI", "COD", "Cards"].map((method) => (
                  <span
                    key={method}
                    className="px-2.5 py-1 bg-white/10 rounded text-xs text-white/70 font-medium"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}
