import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";

const FOOTER_LINKS = {
  About: [
    { label: "How Thrifti Works", href: "/how-it-works" },
    { label: "FAQ's", href: "/faqs" },
    { label: "Our Story", href: "/about" },
  ],
  Community: [
    { label: "Contact Us", href: "/contact" },
    { label: "Partner Up", href: "/partner" },
    { label: "Sell With Us", href: "/sell" },
  ],
  Help: [
    { label: "Returns Policy", href: "/returns" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@thrifti.in", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.52_0.22_25)] text-white">
      <div className="container py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <div
                className="text-3xl font-black tracking-tight text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
              >
                THRIFTI
              </div>
              <div
                className="text-[9px] tracking-[0.25em] text-white/70 font-semibold uppercase mt-0.5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                BUY · SELL · REPEAT
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
              Sell what you've outgrown.<br />
              Wear what you're becoming.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-white font-semibold text-sm mb-4 tracking-wide"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white text-sm transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/60 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            © {new Date().getFullYear()} Thrifti. All rights reserved.
          </p>
          <p className="text-white/60 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            Built for Bangalore. Made for India.
          </p>
        </div>
      </div>
    </footer>
  );
}
