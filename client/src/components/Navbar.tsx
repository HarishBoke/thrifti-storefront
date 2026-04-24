import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { trpc } from "@/lib/trpc";
import ThriftiLogo from "@/components/ThriftiLogo";
import indianFusionWearIcon from "@/assets/img/Indian&FusionWear.png";
import dressesIcon from "@/assets/img/Dresses.png";
import swimwearIcon from "@/assets/img/Swimwear.png";
import footwearIcon from "@/assets/img/Footwear.png";
import topsIcon from "@/assets/img/Tops.png";
import coOrdSetsIcon from "@/assets/img/Co-ord Sets.png";
import activewearIcon from "@/assets/img/Activewear.png";
import accessoriesIcon from "@/assets/img/Accessories.png";
import bottomsIcon from "@/assets/img/Bottoms.png";
import outerwearIcon from "@/assets/img/Outerwear.png";
import maternityWearIcon from "@/assets/img/MaternityWear.png";
import bagsLuggagesIcon from "@/assets/img/Bags-Luggages.png";
import jumpsuitsPlaysuitsIcon from "@/assets/img/Jumpsuits&Playsuits.png";
import formalsBlazersIcon from "@/assets/img/Formals-Blazers.png";
import costumesSpecialOutfitsIcon from "@/assets/img/Costumes-Special-Outfits.png";
import favoriteIcon from "@/assets/img/favorite.svg";
const WHATSAPP_NUMBER = "918065253722";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hey!%20I%20want%20to%20sell%20on%20Thrifti`;

// Ambient background music CDN URL (Lofi Study - FASSounds, Pixabay free license)
const AMBIENT_TRACK_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/thrifti-ambient_37354e1c.mp3";

// Category nav links — each href maps to a Shopify collection handle
const CATEGORY_LINKS = [
  { label: "WOMEN", href: "/collections/women" },
  { label: "MEN", href: "/collections/men" },
  { label: "ACCESSORIES", href: "/collections/accessories" },
  // { label: "KIDS", href: "/collections/kids" },
];

// Mobile menu links
const MOBILE_NAV_LINKS = [
  { label: "WOMEN", href: "/collections/women" },
  { label: "MEN", href: "/collections/men" },
  { label: "ACCESSORIES", href: "/collections/accessories" },
  // { label: "KIDS", href: "/collections/kids" },
  // { label: "COLLECTIONS", href: "/collections" },
  // { label: "SELL", href: "/sell" },
  // { label: "ABOUT", href: "/about" },
];

type MegaMenuKey = "women" | "men" | "accessories";

const MEGA_MENU_ITEMS: Record<MegaMenuKey, string[]> = {
  women: [
    "Indian & Fusion Wear",
    "Dresses",
    "Swimwear",
    "Footwear",
    "Tops",
    "Co-Ord Sets",
    "Activewear",
    "Accessories",
    "Bottoms",
    "Outerwear",
    "Maternity Wear",
    "Backpacks & Luggages",
    "Jumpsuits & Playsuits",
    "Formals & Blazers",
    "Costumes & Special Outfits",
  ],
  men: [
    "Indian & Fusion Wear",
    "Co-Ord Sets",
    "Swimwear",
    "Footwear",
    "Formals & Blazers",
    "Outerwear",
    "Sports & Active Wear",
    "Accessories",
    "Bottoms Wear",
    // "Formals & Blazers",
    "Innerwear & Sleepwear",
    "Backpacks & Luggages",
  ],
  accessories: [
    "Indian & Fusion Wear",
    "Co-Ord Sets",
    "Swimwear",
    "Footwear",
    "Formals & Blazers",
    "Outerwear",
    "Sports & Active Wear",
    "Accessories",
    "Bottom Wear",
    "Formals & Blazers",
    "Innerwear & Sleepwear",
    "Bags & Luggages",
  ],
};

const MEGA_MENU_ITEM_IMAGES: Partial<Record<MegaMenuKey, Record<string, string>>> = {
  women: {
    "Indian & Fusion Wear": indianFusionWearIcon,
    Dresses: dressesIcon,
    Swimwear: swimwearIcon,
    Footwear: footwearIcon,
    Tops: topsIcon,
    "Co-Ord Sets": coOrdSetsIcon,
    Activewear: activewearIcon,
    Accessories: accessoriesIcon,
    Bottoms: bottomsIcon,
    Outerwear: outerwearIcon,
    "Maternity Wear": maternityWearIcon,
    "Backpacks & Luggages": bagsLuggagesIcon,
    "Jumpsuits & Playsuits": jumpsuitsPlaysuitsIcon,
    "Formals & Blazers": formalsBlazersIcon,
    "Costumes & Special Outfits": costumesSpecialOutfitsIcon,
  },
  men: {
    "Indian & Fusion Wear": indianFusionWearIcon,
    Footwear: footwearIcon,
    "Formals & Blazers": formalsBlazersIcon,
    Outerwear: outerwearIcon,
    "Sports & Active Wear": activewearIcon,
    Accessories: accessoriesIcon,
    "Co-Ord Sets": coOrdSetsIcon,
    "Backpacks & Luggages": bagsLuggagesIcon,
    Swimwear: swimwearIcon,
    "Bottoms Wear": bottomsIcon,
    "Innerwear & Sleepwear": maternityWearIcon,
  },
  accessories: {
    "Indian & Fusion Wear": indianFusionWearIcon,
    "Co-Ord Sets": coOrdSetsIcon,
    Swimwear: swimwearIcon,
    Footwear: footwearIcon,
    "Formals & Blazers": formalsBlazersIcon,
    Outerwear: outerwearIcon,
    "Sports & Active Wear": activewearIcon,
    Accessories: accessoriesIcon,
    "Bottom Wear": bottomsIcon,
    "Innerwear & Sleepwear": maternityWearIcon,
    "Bags & Luggages": bagsLuggagesIcon,
  },
};

type ShapeKey =
  | "redDiamond"
  | "orangeBurst"
  | "yellowHex"
  | "yellowScallop"
  | "yellowBurst"
  | "greenDiamond"
  | "greenScallop"
  | "greenHex"
  | "greenFlower"
  | "orangeSideBurst"
  | "redBurst";

const MEGA_MENU_SHAPE_STYLES: Record<ShapeKey, React.CSSProperties> = {
  redDiamond: { backgroundColor: "#ef2e2a", clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" },
  orangeBurst: { backgroundColor: "#ff5a1f", clipPath: "polygon(50% 0, 64% 20%, 86% 8%, 80% 30%, 100% 50%, 80% 70%, 86% 92%, 64% 80%, 50% 100%, 36% 80%, 14% 92%, 20% 70%, 0 50%, 20% 30%, 14% 8%, 36% 20%)" },
  yellowHex: { backgroundColor: "#e6b84b", clipPath: "polygon(25% 7%, 75% 7%, 93% 50%, 75% 93%, 25% 93%, 7% 50%)" },
  yellowScallop: { backgroundColor: "#e9bf58", clipPath: "polygon(50% 0, 63% 10%, 78% 6%, 86% 20%, 100% 25%, 94% 40%, 100% 55%, 90% 67%, 92% 82%, 77% 85%, 68% 100%, 50% 92%, 32% 100%, 23% 85%, 8% 82%, 10% 67%, 0 55%, 6% 40%, 0 25%, 14% 20%, 22% 6%, 37% 10%)" },
  yellowBurst: { backgroundColor: "#e6b84b", clipPath: "polygon(50% 0, 62% 18%, 82% 8%, 78% 30%, 100% 35%, 84% 50%, 100% 65%, 78% 70%, 82% 92%, 62% 82%, 50% 100%, 38% 82%, 18% 92%, 22% 70%, 0 65%, 16% 50%, 0 35%, 22% 30%, 18% 8%, 38% 18%)" },
  greenDiamond: { backgroundColor: "#1f5f4c", clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" },
  greenScallop: { backgroundColor: "#1f5a45", clipPath: "polygon(50% 0, 62% 8%, 78% 5%, 90% 16%, 100% 30%, 95% 45%, 100% 60%, 92% 74%, 88% 90%, 72% 90%, 60% 100%, 50% 92%, 40% 100%, 28% 90%, 12% 90%, 8% 74%, 0 60%, 5% 45%, 0 30%, 10% 16%, 22% 5%, 38% 8%)" },
  greenHex: { backgroundColor: "#1f5f4c", clipPath: "polygon(25% 7%, 75% 7%, 93% 50%, 75% 93%, 25% 93%, 7% 50%)" },
  greenFlower: { backgroundColor: "#1f5a45", clipPath: "polygon(50% 0, 60% 8%, 72% 5%, 84% 14%, 95% 26%, 92% 40%, 100% 50%, 92% 60%, 95% 74%, 84% 86%, 72% 95%, 60% 92%, 50% 100%, 40% 92%, 28% 95%, 16% 86%, 5% 74%, 8% 60%, 0 50%, 8% 40%, 5% 26%, 16% 14%, 28% 5%, 40% 8%)" },
  orangeSideBurst: { backgroundColor: "#ff5a1f", clipPath: "polygon(50% 0, 68% 8%, 78% 24%, 92% 30%, 86% 48%, 92% 66%, 78% 76%, 68% 92%, 50% 100%, 32% 92%, 22% 76%, 8% 66%, 14% 48%, 8% 30%, 22% 24%, 32% 8%)" },
  redBurst: { backgroundColor: "#ef2e2a", clipPath: "polygon(50% 0, 62% 18%, 82% 8%, 78% 30%, 100% 35%, 84% 50%, 100% 65%, 78% 70%, 82% 92%, 62% 82%, 50% 100%, 38% 82%, 18% 92%, 22% 70%, 0 65%, 16% 50%, 0 35%, 22% 30%, 18% 8%, 38% 18%)" },
};

const MEGA_MENU_ITEM_SHAPES: Partial<Record<MegaMenuKey, Record<string, ShapeKey>>> = {
  women: {
    "Indian & Fusion Wear": "redDiamond",
    Dresses: "orangeBurst",
    Swimwear: "yellowHex",
    Footwear: "greenScallop",
    Tops: "redDiamond",
    "Co-Ord Sets": "yellowScallop",
    Activewear: "greenDiamond",
    Accessories: "redDiamond",
    Bottoms: "yellowScallop",
    Outerwear: "redDiamond",
    "Maternity Wear": "orangeSideBurst",
    "Backpacks & Luggages": "yellowBurst",
    "Jumpsuits & Playsuits": "greenFlower",
    "Formals & Blazers": "greenHex",
    "Costumes & Special Outfits": "redBurst",
  },
  men: {
    "Indian & Fusion Wear": "redDiamond",
    "Co-Ord Sets": "yellowScallop",
    Swimwear: "yellowHex",
    Footwear: "greenScallop",
    "Formals & Blazers": "greenHex",
    Outerwear: "redDiamond",
    "Sports & Active Wear": "greenDiamond",
    Accessories: "redDiamond",
    "Bottoms Wear": "yellowHex",
    "Innerwear & Sleepwear": "orangeBurst",
    "Backpacks & Luggages": "yellowScallop",
  },
  accessories: {
    "Indian & Fusion Wear": "redDiamond",
    "Co-Ord Sets": "yellowScallop",
    Swimwear: "yellowHex",
    Footwear: "greenScallop",
    "Formals & Blazers": "greenHex",
    Outerwear: "redDiamond",
    "Sports & Active Wear": "greenDiamond",
    Accessories: "redDiamond",
    "Bottom Wear": "yellowScallop",
    "Innerwear & Sleepwear": "orangeSideBurst",
    "Bags & Luggages": "yellowBurst",
  },
};

const MEGA_MENU_IMAGE_POSITION_CLASSES: Partial<Record<MegaMenuKey, Record<string, string>>> = {
  women: {
    "Co-Ord Sets": "translate-x-[1px]",
  },
  men: {
    "Co-Ord Sets": "translate-x-[1px]",
  },
  accessories: {
    "Co-Ord Sets": "translate-x-[1px]",
  },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Initialise audio element once
  useEffect(() => {
    const audio = new Audio(AMBIENT_TRACK_URL);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Fade helper
  const fadeTo = useCallback((targetVol: number, onDone?: () => void) => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    const audio = audioRef.current;
    if (!audio) return;
    const step = targetVol > audio.volume ? 0.05 : -0.05;
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) return;
      const next = Math.min(1, Math.max(0, audioRef.current.volume + step));
      audioRef.current.volume = next;
      if ((step > 0 && next >= targetVol) || (step < 0 && next <= targetVol)) {
        clearInterval(fadeRef.current!);
        if (onDone) onDone();
      }
    }, 40);
  }, []);

  // Play / pause with fade
  const handleMusicToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!musicOn) {
      audio.play().catch(() => {/* autoplay blocked — user interaction required */ });
      fadeTo(0.45);
      setMusicOn(true);
    } else {
      fadeTo(0, () => audio.pause());
      setMusicOn(false);
    }
  }, [musicOn, fadeTo]);
  const { totalQuantity, openCart } = useCart();
  const { isAuthenticated, customer } = useShopifyAuth();

  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerGid: customer?.id ?? "" },
    { enabled: !!customer?.id && isAuthenticated }
  );
  const wishlistCount = wishlistItems?.length ?? 0;
  const [location, navigate] = useLocation();
  const isHomePage = location === "/";

  useEffect(() => {
    if (!isHomePage) {
      setScrollProgress(0);
      setScrolled(false);
      return;
    }

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const nextProgress = Math.min(1, y / 140);
        setScrollProgress(nextProgress);
        setScrolled(y > 8);
        rafId = null;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [isHomePage]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveMegaMenu(null);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };
  const handleSellClick = () => {
    if (isAuthenticated) {
      navigate("/sell-items");
      return;
    }
    navigate("/login");
  };
  const desktopHeaderHeight = isHomePage ? 200 - 142 * scrollProgress : 72;
  const desktopLogoHeight = isHomePage ? 152 - 104 * scrollProgress : 52;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${activeMegaMenu ? "py-0" : "py-1"}`}
        style={{
          backgroundColor: "var(--thrifti-cream)",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-10 container mx-auto">
          {/* Desktop Navbar — 3-column layout matching design */}
          <div
            className={`hidden lg:flex items-center justify-between ${isHomePage ? "transition-[height] duration-150 ease-out" : ""}`}
            style={{ height: `${desktopHeaderHeight}px` }}
          >

            {/* LEFT: Category navigation */}
            <nav className="flex items-center gap-7">
              {CATEGORY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-black uppercase tracking-wider transition-colors hover:opacity-70"
                  onMouseEnter={() => {
                    const menuByLabel: Record<string, MegaMenuKey> = {
                      WOMEN: "women",
                      MEN: "men",
                      ACCESSORIES: "accessories",
                    };
                    setActiveMegaMenu(menuByLabel[link.label] ?? null);
                  }}
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
              <ThriftiLogo height={desktopLogoHeight} />
            </Link>

            {/* RIGHT: Music toggle + icons */}
            <div className="flex items-center gap-1">
              {/* Music Toggle */}
              <div className="flex items-center gap-2 mr-3">
                <button
                  onClick={handleMusicToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${musicOn ? "bg-[var(--thrifti-red)]" : "bg-[var(--thrifti-red)]"
                    }`}
                  aria-label="Toggle music"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${musicOn ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
                <span
                  className="text-xs italic leading-tight max-w-[100px]"
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
                  href="/wishlist"
                  className="p-2.5 hover:bg-black/5 rounded-full transition-colors relative"
                  aria-label={`Wishlist (${wishlistCount} items)`}
                >
                  <img src={favoriteIcon} alt="Wishlist" className="w-5 h-5" />
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
              <Link href="/cart">
                <button
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
              </Link>
              <button
                onClick={handleSellClick}
                className="inline-flex items-center justify-center bg-[#1E1F26] px-4 pt-2 pb-1 text-base font-semibold tracking-[0.08em] text-[#F5F1EA] transition-colors hover:bg-[#15161C] anek-devanagari-font ml-6"
                aria-label="Open sell items page"
              >
                SELL
              </button>
              {/* Hamburger (for extra pages on desktop) */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="p-2.5 hover:bg-black/5 rounded-full transition-colors lg:hidden"
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
                  onClick={handleMusicToggle}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: "var(--thrifti-red)" }}
                  aria-label="Toggle music"
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${musicOn ? "translate-x-4" : "translate-x-0.5"
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
              <Link href="/cart">
                <button className="p-2.5 relative" aria-label="Cart">
                  <ShoppingBag className="w-5 h-5" style={{ color: "var(--thrifti-dark)" }} />
                  {totalQuantity > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center leading-none" style={{ backgroundColor: "var(--thrifti-red)" }}>
                      {totalQuantity > 9 ? "9+" : totalQuantity}
                    </span>
                  )}
                </button>
              </Link>
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

        {/* Page Overlay Behind Mega Menu */}
        {activeMegaMenu && (
          <div
            className="hidden lg:block fixed left-0 right-0 bottom-0 z-[40] bg-black/35"
            style={{ top: `${desktopHeaderHeight}px` }}
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onClick={() => setActiveMegaMenu(null)}
            aria-hidden="true"
          />
        )}

        {/* Desktop Mega Menu */}
        {activeMegaMenu && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full z-[60] bg-[var(--thrifti-cream)]"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="container relative mx-auto px-24 py-18">
              <div className="grid grid-cols-4 gap-x-10 gap-y-6">
                {MEGA_MENU_ITEMS[activeMegaMenu].map((label, idx) => (
                  <Link
                    key={label}
                    href={`/products?category=${encodeURIComponent(label)}`}
                    className="group flex items-center gap-4 px-6 py-2.5 transition-colors hover:bg-black/5 rounded-[8px]"
                  >
                    <div className="relative h-[58px] w-[58px] shrink-0">
                      <span
                        className="absolute inset-[4px]"
                        style={
                          MEGA_MENU_SHAPE_STYLES[
                          MEGA_MENU_ITEM_SHAPES[activeMegaMenu]?.[label] ?? "redDiamond"
                          ]
                        }
                      />
                      <span className="absolute inset-0 flex items-center justify-center">
                        {MEGA_MENU_ITEM_IMAGES[activeMegaMenu]?.[label] ? (
                          <img
                            src={MEGA_MENU_ITEM_IMAGES[activeMegaMenu]?.[label]}
                            alt={label}
                            className={`h-[58px] w-[58px] object-contain ${MEGA_MENU_IMAGE_POSITION_CLASSES[activeMegaMenu]?.[label] ?? ""}`}
                          />
                        ) : (
                          <span className="text-sm font-black text-[#1F1F22CC] uppercase geist-mono-font">
                            {label.charAt(0)}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-base leading-tight text-[#1F1F22CC] font-medium geist-mono-font">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

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
                <button
                  onClick={handleSellClick}
                  className="inline-flex items-center justify-center bg-[#1E1F26] px-4 pt-2 pb-1 text-base font-semibold tracking-[0.08em] text-[#F5F1EA] transition-colors hover:bg-[#15161C] anek-devanagari-font mt-2"
                  aria-label="Open sell items page"
                >
                  SELL
                </button>
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
