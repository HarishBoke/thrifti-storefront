import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import ThriftiLogo from "@/components/ThriftiLogo";

const FOOTER_LINKS = [
  {
    heading: "About",
    links: [
      { label: "How Thrifti Works?", href: "/how-it-works" },
      { label: "Our Story", href: "/about" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "FAQ's", href: "/faqs" },
      { label: "Contact Us", href: "/contact" },
      { label: "Partner Up", href: "/partner" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Returns Policy", href: "/returns" },
      { label: "Shipping Policy", href: "/shipping" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/thrifti.in" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/thrifti.in" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/thrifti_in" },
  { icon: Mail, label: "Email", href: "mailto:hello@thrifti.in" },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--thrifti-red)" }}>
      <div className="px-5 sm:px-8 lg:px-12 pt-10 pb-8">

        {/* Brand block */}
        <div className="mb-8 text-center lg:text-left">
          <Link href="/" className="inline-block">
            <ThriftiLogo height={80} white={true} className="max-w-full" />
          </Link>
        </div>

        {/* Tagline + Social */}
        <div className="mb-8">
          <p
            className="text-white/80 text-sm leading-relaxed mb-5"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Sell what you've outgrown.<br />
            Wear what you're becoming.
          </p>
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/70 hover:text-white transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-white/20 pt-8">
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3
                className="text-white font-bold text-sm mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white text-sm transition-colors"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-white/50 text-xs"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            © Copyright {new Date().getFullYear()}, Meshi Commerce Pvt. Ltd
          </p>
          <p
            className="text-white/50 text-xs"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Built for Bangalore. Made for India.
          </p>
        </div>
      </div>
    </footer>
  );
}
