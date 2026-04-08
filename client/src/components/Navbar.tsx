import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20want%20to%20sell%20on%20Thrifti`;

const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Sell", href: "/sell" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { totalQuantity, openCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: "var(--thrifti-cream)",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* Logo — matches design: "BUY. SELL. REPEAT." above "THRIFTI" in red */}
            <Link href="/" className="flex-shrink-0 flex flex-col leading-none">
              <span
                className="text-[9px] font-bold tracking-[0.3em] uppercase mb-0.5"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "var(--thrifti-red)",
                }}
              >
                BUY. SELL. REPEAT.
              </span>
              <span
                className="text-[2rem] sm:text-[2.4rem] font-black leading-none"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--thrifti-red)",
                  letterSpacing: "-0.02em",
                }}
              >
                THRIFTI
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold uppercase tracking-wider transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: location === link.href ? "var(--thrifti-red)" : "var(--thrifti-dark)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2.5 hover:bg-muted transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <Link href="/account" className="p-2.5 hover:bg-muted transition-colors hidden sm:flex">
                  <User className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="p-2.5 hover:bg-muted transition-colors hidden sm:flex"
                  aria-label="Login"
                >
                  <User className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                </a>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 hover:bg-muted transition-colors relative"
                aria-label={`Cart (${totalQuantity} items)`}
              >
                <ShoppingBag className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                {totalQuantity > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center leading-none"
                    style={{ backgroundColor: "var(--thrifti-red)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {totalQuantity > 9 ? "9+" : totalQuantity}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2.5 hover:bg-muted transition-colors lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen
                  ? <X className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                  : <Menu className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                }
              </button>
            </div>
          </div>

          {/* Search Bar (expanded) */}
          {searchOpen && (
            <div className="border-t border-border py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for brands, styles, items..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t border-border"
            style={{ backgroundColor: "var(--thrifti-cream)" }}
          >
            <nav className="px-4 sm:px-6 py-4 flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-4 text-base font-black uppercase tracking-wider border-b border-border/40 last:border-0 transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: location === link.href ? "var(--thrifti-red)" : "var(--thrifti-dark)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <Link
                    href="/account"
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
                  >
                    <User className="w-4 h-4" /> My Account
                  </Link>
                ) : (
                  <a
                    href={getLoginUrl()}
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
                  >
                    <User className="w-4 h-4" /> Sign In
                  </a>
                )}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="thrifti-btn-red text-sm text-center mt-2"
                >
                  Start Selling on WhatsApp
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
