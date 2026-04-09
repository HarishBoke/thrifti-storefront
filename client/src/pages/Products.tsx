import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { SlidersHorizontal, ChevronDown, Heart, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import type { ShopifyProduct } from "@shared/shopifyTypes";

// Launch date for countdown
const LAUNCH_DATE = new Date("2026-04-26T00:00:00+05:30");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, LAUNCH_DATE.getTime() - Date.now()));
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(Math.max(0, LAUNCH_DATE.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, launched: timeLeft <= 0 };
}

const CDN = {
  fashionShow: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-fashion-final_3379776b.png",
  polaroidSell: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-final_a950a217.png",
  polaroidBuy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-buy-final_97b38991.png",
  polaroidRepeat: "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-repeat-final_f6fb09a9.png",
};

const FILTER_OPTIONS = {
  Brand: ["Zara", "H&M", "Mango", "Levi's", "Nike", "Adidas", "Forever 21", "Marks & Spencer"],
  Size: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
  Color: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Brown", "Grey"],
  Condition: ["Like New", "Good", "Fair"],
  Price: ["Under ₹500", "₹500–₹1000", "₹1000–₹2000", "₹2000–₹5000", "Above ₹5000"],
} as const;
type FilterKey = keyof typeof FILTER_OPTIONS;

function parseSearchParams() {
  if (typeof window === "undefined") return { q: "", collection: "" };
  const params = new URLSearchParams(window.location.search);
  return { q: params.get("q") ?? "", collection: params.get("collection") ?? "" };
}

// ── Filter Pill ───────────────────────────────────────────────────────────────
function FilterPill({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasSelection = selected.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          borderColor: hasSelection ? "var(--thrifti-dark)" : "#D1D5DB",
          backgroundColor: hasSelection ? "var(--thrifti-dark)" : "white",
          color: hasSelection ? "white" : "#6B7280",
        }}
      >
        {label}
        {hasSelection && <span className="text-[10px]">({selected.length})</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 shadow-lg min-w-[160px] py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: selected.includes(opt) ? 700 : 400,
                color: selected.includes(opt) ? "var(--thrifti-dark)" : "#6B7280",
              }}
            >
              {opt}
              {selected.includes(opt) && <X className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ListingProductCard({
  product,
  customerEmail,
  isSelected,
}: {
  product: ShopifyProduct;
  customerEmail?: string;
  isSelected?: boolean;
}) {
  const { isAuthenticated } = useShopifyAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerEmail: customerEmail ?? "" },
    { enabled: !!customerEmail && isAuthenticated }
  );
  const addToWishlist = trpc.wishlist.add.useMutation();
  const removeFromWishlist = trpc.wishlist.remove.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (wishlistItems) setWishlisted(wishlistItems.some((w) => w.productId === product.id));
  }, [wishlistItems, product.id]);

  const variant = product.variants.nodes[0];
  const image = product.featuredImage ?? product.images.nodes[0];
  const priceNum = variant?.price ? Math.round(parseFloat(variant.price.amount)) : 0;
  const priceStr = priceNum ? `₹${priceNum.toLocaleString("en-IN")}` : "";
  const attrLine = [product.productType, product.vendor].filter(Boolean).join(", ") || "Thrifti";

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated || !customerEmail) { window.location.href = "/login"; return; }
    if (wishlisted) {
      setWishlisted(false);
      await removeFromWishlist.mutateAsync({ customerEmail, productId: product.id });
    } else {
      setWishlisted(true);
      await addToWishlist.mutateAsync({
        customerEmail, productId: product.id, productTitle: product.title,
        productHandle: product.handle, productImage: image?.url ?? null,
        productPrice: variant?.price?.amount ?? null,
      });
    }
    utils.wishlist.list.invalidate({ customerEmail });
  };

  return (
    <Link href={`/products/${product.handle}`}>
      <div className="cursor-pointer group">
        {/* Image */}
        <div
          className="relative overflow-hidden mb-2"
          style={{
            aspectRatio: "3/4",
            backgroundColor: "#EDEAE4",
            outline: isSelected ? "2px solid var(--thrifti-red)" : "none",
            outlineOffset: "0px",
          }}
        >
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
          )}
          {/* Selected highlight overlay — bottom bar */}
          {isSelected && (
            <div
              className="absolute bottom-0 left-0 right-0 py-1 text-center text-[10px] font-black uppercase tracking-widest text-white"
              style={{ backgroundColor: "var(--thrifti-red)", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Selected
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className="text-[11px] leading-snug flex-1 min-w-0 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#9CA3AF" }}>
            {attrLine}
          </p>
          <button onClick={handleWishlist} className="flex-shrink-0 p-0.5 -mt-0.5 transition-transform hover:scale-110" aria-label="Wishlist">
            <Heart className="w-4 h-4" style={{ color: wishlisted ? "var(--thrifti-red)" : "#9CA3AF", fill: wishlisted ? "var(--thrifti-red)" : "none", strokeWidth: 1.5 }} />
          </button>
        </div>
        <p className="text-sm font-bold leading-snug mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
          {product.title}
        </p>
        <p
          className="font-black text-sm"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: isSelected ? "var(--thrifti-red)" : "var(--thrifti-dark)",
          }}
        >
          {priceStr}
        </p>
      </div>
    </Link>
  );
}

// ── Recently Viewed ───────────────────────────────────────────────────────────
function RecentlyViewedSection({ customerEmail }: { customerEmail?: string }) {
  const [recentHandles, setRecentHandles] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[];
      setRecentHandles(stored.slice(0, 4));
    } catch { /* ignore */ }
  }, []);
  const { data: productsData } = trpc.products.list.useQuery({ first: 20 }, { enabled: recentHandles.length > 0 });
  const recentProducts = (productsData?.products ?? []).filter((p) => recentHandles.includes(p.handle)).slice(0, 4);
  if (recentProducts.length === 0) return null;
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10">
      <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {recentProducts.map((product) => (
          <ListingProductCard key={product.id} product={product} customerEmail={customerEmail} />
        ))}
      </div>
    </div>
  );
}

// ── New Drops Banner ──────────────────────────────────────────────────────────
function NewDropsBanner() {
  const { days, hours, minutes, seconds, launched } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section style={{ backgroundColor: "var(--thrifti-red)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="px-8 sm:px-12 lg:px-16 py-14 sm:py-20">
          {launched ? (
            <span className="inline-block text-white font-black text-sm uppercase tracking-[0.3em] px-4 py-2 border border-white/40 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>WE'RE LIVE!</span>
          ) : (
            <div className="mb-4">
              <p className="text-white/60 text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LAUNCHING IN</p>
              <div className="flex items-end gap-3 sm:gap-4">
                {[{ value: pad(days), label: "DAYS" }, { value: pad(hours), label: "HRS" }, { value: pad(minutes), label: "MIN" }, { value: pad(seconds), label: "SEC" }].map(({ value, label }, i) => (
                  <div key={label} className="flex items-end gap-3 sm:gap-4">
                    {i > 0 && <span className="text-white/40 text-2xl sm:text-3xl font-black leading-none pb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>:</span>}
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-black text-white leading-none tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>{value}</div>
                      <div className="text-white/50 text-[9px] font-bold tracking-[0.25em] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-white/60 text-[10px] font-bold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>LAUNCHING 26 APRIL 2026</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}>
            NEW DROPS,<br />JUST IN
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-10 max-w-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
            Curated pieces, limited time. Once they're gone, they're gone. Experience the shift in modern Indian fashion culture.
          </p>
          <Link href="/products">
            <button className="thrifti-btn-dark text-sm">GRAB THE DEAL</button>
          </Link>
        </div>
        <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: "400px" }}>
          <img src={CDN.fashionShow} alt="New drops fashion show" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}

// ── Sell / Buy / Repeat Polaroids ─────────────────────────────────────────────
function PolaroidSection() {
  return (
    <section className="px-5 sm:px-8 lg:px-16 py-14 sm:py-20" style={{ backgroundColor: "var(--thrifti-cream)" }}>
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-3 lg:gap-10">
        <div className="polaroid relative" style={{ transform: "rotate(-2.5deg)" }}>
          <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>SELL</span>
          <img src={CDN.polaroidSell} alt="Sell the old you" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
          <p className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>SELL THE OLD YOU</p>
        </div>
        <div className="polaroid relative" style={{ transform: "rotate(1.5deg)" }}>
          <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>BUY</span>
          <img src={CDN.polaroidBuy} alt="Wear the new you" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
          <p className="text-center text-xs font-bold tracking-widest uppercase mt-3 pb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>WEAR THE NEW YOU</p>
        </div>
        <div className="polaroid relative" style={{ transform: "rotate(-1deg)" }}>
          <span className="absolute top-3 left-3 text-xs font-black tracking-widest uppercase z-10" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>REPEAT</span>
          <img src={CDN.polaroidRepeat} alt="Be new you with Thrifti" className="w-full block" style={{ aspectRatio: "4/5", objectFit: "cover" }} />
          <div className="flex items-end justify-between mt-3 pb-1">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>BE NEW YOU</p>
            <div className="px-2 py-1 text-white text-[9px] font-black tracking-wider uppercase" style={{ backgroundColor: "var(--thrifti-dark)", fontFamily: "'Space Grotesk', sans-serif", transform: "rotate(-3deg)", flexShrink: 0 }}>WITH THRIFTI</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Products() {
  const [locationPath] = useLocation();
  const [searchParams, setSearchParams] = useState(() => parseSearchParams());
  useEffect(() => { setSearchParams(parseSearchParams()); }, [locationPath]);
  const { q: searchQuery, collection } = searchParams;

  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({ Brand: [], Size: [], Color: [], Condition: [], Price: [] });
  const [page, setPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 16;

  const { customer, isAuthenticated } = useShopifyAuth();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    first: 50,
    query: searchQuery || undefined,
  });

  const allProducts = productsData?.products ?? [];

  // Client-side filter application
  const filteredProducts = allProducts.filter((p) => {
    const tags = p.tags ?? [];
    const vendor = p.vendor ?? "";
    const variant = p.variants.nodes[0];
    const priceNum = variant?.price ? parseFloat(variant.price.amount) : 0;

    if (filters.Brand.length > 0 && !filters.Brand.some((b) => vendor.toLowerCase().includes(b.toLowerCase()))) return false;
    if (filters.Size.length > 0 && !filters.Size.some((s) => tags.some((t) => t.toLowerCase() === s.toLowerCase()))) return false;
    if (filters.Color.length > 0 && !filters.Color.some((c) => tags.some((t) => t.toLowerCase().includes(c.toLowerCase())))) return false;
    if (filters.Condition.length > 0 && !filters.Condition.some((c) => tags.some((t) => t.toLowerCase().includes(c.toLowerCase())))) return false;
    if (filters.Price.length > 0) {
      const inRange = filters.Price.some((range) => {
        if (range === "Under ₹500") return priceNum < 500;
        if (range === "₹500–₹1000") return priceNum >= 500 && priceNum <= 1000;
        if (range === "₹1000–₹2000") return priceNum >= 1000 && priceNum <= 2000;
        if (range === "₹2000–₹5000") return priceNum >= 2000 && priceNum <= 5000;
        if (range === "Above ₹5000") return priceNum > 5000;
        return true;
      });
      if (!inRange) return false;
    }
    return true;
  });

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Derive category label from collection param
  const categoryLabel = collection
    ? collection.split("-").slice(0, -1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : searchQuery ? "Search" : "";

  const pageTitle = collection
    ? collection.split("-").slice(-1)[0].replace(/\b\w/g, (c) => c.toUpperCase())
    : searchQuery ? `"${searchQuery}"` : "All Products";

  const toggleFilter = (key: FilterKey, val: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val],
    }));
    setPage(1);
  };
  const clearAllFilters = () => setFilters({ Brand: [], Size: [], Color: [], Condition: [], Price: [] });
  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);
  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <StorefrontLayout showBanner={false}>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-10 pt-8 pb-4">
          {/* Category label — small red text above heading */}
          {categoryLabel && (
            <p
              className="text-sm font-bold mb-0"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-red)" }}
            >
              {categoryLabel}
            </p>
          )}
          <h1
            className="text-4xl sm:text-5xl font-black leading-none mb-5"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--thrifti-dark)" }}
          >
            {pageTitle}
          </h1>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 mr-1 p-1" aria-label="Filter options">
              <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--thrifti-dark)" }} />
            </button>
            {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map((key) => (
              <FilterPill
                key={key}
                label={key}
                options={FILTER_OPTIONS[key]}
                selected={filters[key]}
                onSelect={(v) => toggleFilter(key, v)}
              />
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ color: "var(--thrifti-red)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs mt-3 mb-2" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
            {isLoading ? "Loading..." : `Results: ${totalProducts} item${totalProducts !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Product Grid ── */}
        <div className="px-4 sm:px-6 lg:px-10 pb-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 mb-3" style={{ aspectRatio: "3/4" }} />
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                No products found
              </h2>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "'Space Mono', monospace" }}>
                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Check back soon for new drops."}
              </p>
              <button onClick={clearAllFilters} className="thrifti-btn-dark text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
                {paginatedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id === selectedProductId ? null : product.id)}
                  >
                    <ListingProductCard
                      product={product}
                      customerEmail={customer?.email}
                      isSelected={product.id === selectedProductId}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => goToPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className="w-9 h-9 text-sm font-bold border transition-colors"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        borderColor: p === page ? "var(--thrifti-dark)" : "#D1D5DB",
                        backgroundColor: p === page ? "var(--thrifti-dark)" : "transparent",
                        color: p === page ? "#ffffff" : "#6B7280",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Animated Ticker Banner ── */}
        <AnimatedBanner />

        {/* ── Recently Viewed ── */}
        <RecentlyViewedSection customerEmail={customer?.email} />

        {/* ── New Drops Banner ── */}
        <NewDropsBanner />

        {/* ── Sell / Buy / Repeat Polaroids ── */}
        <PolaroidSection />

      </div>
    </StorefrontLayout>
  );
}
