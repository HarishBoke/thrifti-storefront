import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { trpc } from "@/lib/trpc";
import ThriftiLogo from "@/components/ThriftiLogo";
const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20want%20to%20sell%20on%20Thrifti`;

// Category nav links — each href maps to a Shopify collection handle
const CATEGORY_LINKS = [
  { label: "WOMEN", href: "/collections/women" },
  { label: "MEN", href: "/collections/men" },
  { label: "KIDS", href: "/collections/kids" },
  { label: "ACCESSORIES", href: "/collections/accessories" },
];

// Mobile menu links
const MOBILE_NAV_LINKS = [
  { label: "WOMEN", href: "/collections/women" },
  { label: "MEN", href: "/collections/men" },
  { label: "KIDS", href: "/collections/kids" },
  { label: "ACCESSORIES", href: "/collections/accessories" },
  { label: "COLLECTIONS", href: "/collections" },
  { label: "SELL", href: "/sell" },
  { label: "ABOUT", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { totalQuantity, openCart } = useCart();
  const { isAuthenticated, customer } = useShopifyAuth();

  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerEmail: customer?.email ?? "" },
    { enabled: !!customer?.email && isAuthenticated }
  );
  const wishlistCount = wishlistItems?.length ?? 0;
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
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-10">
          {/* Desktop Navbar — 3-column layout matching design */}
          <div className="hidden lg:flex items-center justify-between h-[72px]">

            {/* LEFT: Category navigation */}
            <nav className="flex items-center gap-7">
              {CATEGORY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-black uppercase tracking-wider transition-colors hover:opacity-70"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "var(--thrifti-dark)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CENTER: Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
              <ThriftiLogo height={52} />
            </Link>

            {/* RIGHT: Music toggle + icons */}
            <div className="flex items-center gap-1">
              {/* Music Toggle */}
              <div className="flex items-center gap-2 mr-3">
                <button
                  onClick={() => setMusicOn((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    musicOn ? "bg-[var(--thrifti-red)]" : "bg-[var(--thrifti-red)]"
                  }`}
                  aria-label="Toggle music"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      musicOn ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className="text-xs italic leading-tight max-w-[80px]"
                  style={{ fontFamily: "'Space Mono', monospace", color: "var(--thrifti-red)" }}
                >
                  If you like<br />the music
                </span>
              </div>

              {/* Search */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2.5 hover:bg-black/5 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
              </button>

              {/* Account */}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="p-2.5 hover:bg-black/5 rounded-full transition-colors"
                aria-label={isAuthenticated ? "My Account" : "Sign In"}
              >
                <User className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
              </Link>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/account"
                  className="p-2.5 hover:bg-black/5 rounded-full transition-colors relative"
                  aria-label={`Wishlist (${wishlistCount} items)`}
                >
                  <Heart className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                  {wishlistCount > 0 && (
                    <span
                      className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center leading-none"
                      style={{ backgroundColor: "var(--thrifti-red)" }}
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 hover:bg-black/5 rounded-full transition-colors relative"
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

              {/* Hamburger (for extra pages on desktop) */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2.5 hover:bg-black/5 rounded-full transition-colors"
                aria-label="Menu"
              >
                {mobileOpen
                  ? <X className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                  : <Menu className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                }
              </button>
            </div>
          </div>

          {/* Mobile Navbar */}
          <div className="flex lg:hidden items-center justify-between h-16">
            {/* Logo — left aligned */}
            <Link href="/" className="flex items-center">
              <ThriftiLogo height={44} />
            </Link>

            {/* Mobile Right: music toggle + icons */}
            <div className="flex items-center gap-0.5">
              {/* Music Toggle (mobile) */}
              <div className="flex items-center gap-1.5 mr-1">
                <button
                  onClick={() => setMusicOn((v) => !v)}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: "var(--thrifti-red)" }}
                  aria-label="Toggle music"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      musicOn ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span
                  className="text-[9px] italic leading-tight hidden xs:block"
                  style={{ fontFamily: "'Space Mono', monospace", color: "var(--thrifti-red)", maxWidth: 56 }}
                >
                  If you like<br />the music
                </span>
              </div>
              <button onClick={() => setSearchOpen((v) => !v)} className="p-2.5" aria-label="Search">
                <Search className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
              </button>
              <button onClick={openCart} className="p-2.5 relative" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                {totalQuantity > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center leading-none" style={{ backgroundColor: "var(--thrifti-red)" }}>
                    {totalQuantity > 9 ? "9+" : totalQuantity}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileOpen((v) => !v)} className="p-2.5" aria-label="Menu">
                {mobileOpen ? <X className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} /> : <Menu className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />}
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
          <div className="border-t border-border" style={{ backgroundColor: "var(--thrifti-cream)" }}>
            <nav className="px-4 sm:px-6 py-4 flex flex-col">
              {MOBILE_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-4 text-base font-black uppercase tracking-wider border-b border-border/40 last:border-0 transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "var(--thrifti-dark)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
                >
                  <User className="w-4 h-4" /> {isAuthenticated ? "My Account" : "Sign In"}
                </Link>
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
