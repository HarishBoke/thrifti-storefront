import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { user, isAuthenticated } = useAuth();
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
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white"
        } border-b border-border`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex flex-col leading-none">
                <span
                  className="text-2xl sm:text-3xl font-black tracking-tight text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
                >
                  THRIFTI
                </span>
                <span className="text-[9px] tracking-[0.25em] text-[oklch(0.52_0.22_25)] font-semibold uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  BUY · SELL · REPEAT
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[oklch(0.52_0.22_25)] ${
                    location === link.href
                      ? "text-[oklch(0.52_0.22_25)]"
                      : "text-foreground"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <Link href="/account" className="p-2 rounded-full hover:bg-muted transition-colors hidden sm:flex">
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="p-2 rounded-full hover:bg-muted transition-colors hidden sm:flex"
                  aria-label="Login"
                >
                  <User className="w-5 h-5" />
                </a>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2 rounded-full hover:bg-muted transition-colors relative"
                aria-label={`Cart (${totalQuantity} items)`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[oklch(0.52_0.22_25)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {totalQuantity > 9 ? "9+" : totalQuantity}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-muted transition-colors md:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-3 border-t border-border pt-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for clothing, brands, styles..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-[oklch(0.52_0.22_25)] hover:bg-[oklch(0.45_0.22_25)] text-white">
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <nav className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-2 text-base font-medium hover:text-[oklch(0.52_0.22_25)] border-b border-border/50 last:border-0"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                {isAuthenticated ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-3 px-2 text-base font-medium hover:text-[oklch(0.52_0.22_25)]"
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                ) : (
                  <a
                    href={getLoginUrl()}
                    className="flex items-center gap-2 py-3 px-2 text-base font-medium hover:text-[oklch(0.52_0.22_25)]"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
