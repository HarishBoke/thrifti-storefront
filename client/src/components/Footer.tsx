import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import ThriftiLogo from "@/components/ThriftiLogo";

// Footer link groups matching Figma v6 exactly
const FOOTER_LINKS = [
  {
    heading: "About",
    links: [
      { label: "How Thrifti Works?", href: "/how-it-works" },
      { label: "FAQ's", href: "/faqs" },
    ],
  },
  {
    heading: "Community",
    links: [
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
      <div className="px-9 lg:px-12 pt-11 lg:pt-16 pb-8">

        {/* Brand block — BUY.SELL.REPEAT. above logo per Figma */}
        <div className="mb-8 flex justify-center">
          {/* <p
            className="text-white/70 text-xs font-bold tracking-[0.25em] uppercase mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            BUY. SELL. REPEAT.
          </p> */}
          <Link href="/" className="inline-block">
            <ThriftiLogo height={152} white={true} className="max-w-full" />
          </Link>
        </div>



        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 border-t border-white/20 pt-8">
          <div className="lg:mb-8">
            <p
              className="text-[#F5F1EA] text-sm leading-relaxed mb-3 geist-mono-font"
            >
              Sell what you've outgrown.<br />
              Wear what you're becoming.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#F5F1EA] hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3
                className="text-[#F5F1EA] mb-2 lg:mb-3 font-semibold text-base anek-devanagari-font"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-1 lg:gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#F5F1EA] hover:text-white text-sm transition-colors geist-mono-font"
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
            className="text-white/70 text-xs geist-mono-font text-center"
          >
            © Copyright {new Date().getFullYear()},  Meshi Commerce Pvt. Ltd, All Rights reserved
          </p>
          <p
            className="text-white/70 text-xs geist-mono-font text-center"
          >
            Built for Bangalore. Made for India.
          </p>
        </div>
      </div>
    </footer>
  );
}
