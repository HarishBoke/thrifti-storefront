import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { SlidersHorizontal, ChevronDown, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import SellBuyRepeatSection from "@/components/SellBuyRepeatSection";
import RecentlyViewedGrid from "@/components/RecentlyViewedGrid";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import type { ShopifyProduct } from "@shared/shopifyTypes";
import built3 from "@/assets/img/Built3.png";
import repeat1Polaroid from "@/assets/img/Repeat1.png";
import repeatPolaroid from "@/assets/img/Repeat.png";
import LaunchSplitSection from "@/components/LaunchSplitSection";
import launchingImage from "@/assets/img/launching.png";
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
};

const FILTER_OPTIONS = {
  Brand: ["Zara", "H&M", "Mango", "Levi's", "Nike", "Adidas", "Forever 21", "Marks & Spencer"],
  Size: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
  Color: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Brown", "Grey"],
  Condition: ["Like New", "Good", "Fair"],
  Price: ["Under ₹500", "₹500–₹1000", "₹1000–₹2000", "₹2000–₹5000", "Above ₹5000"],
} as const;
type FilterKey = keyof typeof FILTER_OPTIONS;

function HeartSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="13"
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.4464 7.625C11.2141 8.97317 10.0273 10.1785 8.68978 11.3403L6.78036 13.0007L2.21499 8.32692C1.14303 7.2329 0.298391 5.9283 0.0543298 4.4107C-0.287834 2.30253 1.01622 0.296014 3.11945 0.0297692C4.63167 -0.161443 6.00032 0.584042 6.98135 1.81845C7.79249 0.816401 8.85488 0.129006 10.1446 0.0297692C11.9655 -0.108194 13.5447 1.12379 13.8964 2.89795C14.2481 4.67211 13.6595 6.2962 12.4464 7.62258V7.625ZM13.0518 4.41312C13.3748 2.75515 12.3794 1.17462 10.7452 0.951944C9.4411 0.775254 8.14901 1.5522 7.58432 2.68253C7.87624 3.27069 8.17055 3.81286 8.2208 4.40828C8.29019 5.23606 7.74942 5.90167 6.9981 5.88473C6.33291 5.87021 5.70841 5.31352 5.76822 4.50268C5.81369 3.89274 6.14389 3.29974 6.44298 2.69222C5.87351 1.72647 4.87573 1.04392 3.72481 0.932581C2.50929 0.813981 1.42059 1.58125 1.03057 2.73578C0.0878283 5.52651 3.01895 7.85494 4.80873 9.66298L6.88564 11.7615C8.57971 10.1616 10.147 8.68514 11.6616 7.032C12.3387 6.29136 12.8508 5.42969 13.0494 4.4107L13.0518 4.41312ZM7.24934 4.76892C7.35941 4.40102 7.2302 3.90726 6.95982 3.64344C6.71336 4.20497 6.50519 4.67453 6.90239 4.93835C6.97178 4.98434 7.22063 4.86332 7.24934 4.77134V4.76892Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
        className={`flex items-center gap-3 px-5 py-2 text-md font-medium anek-devanagari-font border-1 border-[#35392D] transition-all rounded-4xl
          }`}
      >
        <p className="text-foreground leading-[1] -mb-1.5 text-sm lg:text-base">
          {label}

        </p>
        {hasSelection && <span className="text-[10px]">({selected.length})</span>}
        <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 shadow-lg min-w-[160px] py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between font-['Space_Grotesk',sans-serif] ${selected.includes(opt) ? "font-bold text-[var(--thrifti-dark)]" : "font-normal text-gray-500"
                }`}
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
      <div className="cursor-pointer group bg-transparent p-3 transition-colors duration-300 hover:bg-[var(--thrifti-red)]">
        {/* Image */}
        <div
          className={`relative overflow-hidden aspect-[3/4] mb-4 bg-[#EDEAE4] ${isSelected ? "outline-2 outline-[var(--thrifti-red)]" : ""}`}
        >
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 transition-colors duration-300 group-hover:text-white" />
            </div>
          )}
          {/* Selected highlight overlay — bottom bar */}
          {isSelected && (
            <div
              className="absolute bottom-0 left-0 right-0 py-1 text-center text-[10px] font-black uppercase tracking-widest text-white bg-[var(--thrifti-red)] font-['Space_Grotesk',sans-serif]"
            >
              Selected
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className="font-light text-xs lg:text-sm text-[#1F1F22] geist-mono-font transition-colors duration-300 group-hover:text-white">
            {attrLine}
          </p>
          <button onClick={handleWishlist} className="flex-shrink-0 p-0.5 -mt-0.5 transition-transform hover:scale-110" aria-label="Wishlist">
            <HeartSvg className={`h-4 w-4 transition-colors duration-300 group-hover:text-white ${wishlisted ? "text-[var(--thrifti-red)]" : "text-[#9CA3AF] hover:text-[var(--thrifti-red)]"}`} />
          </button>
        </div>
        <p className="font-medium text-sm lg:text-lg text-[#1F1F22] geist-mono-font transition-colors duration-300 group-hover:text-white">
          {product.title}
        </p>
        <p
          className={`text-[#1F1F22] anek-devanagari-font text-xl lg:text-3xl font-semibold mt-2 transition-colors duration-300 group-hover:text-white`}
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
  return (
    <RecentlyViewedGrid
      items={recentProducts}
      renderItem={(product) => (
        <ListingProductCard
          key={product.id}
          product={product}
          customerEmail={customerEmail}
        />
      )}
    />
  );
}

// ── New Drops Banner ──────────────────────────────────────────────────────────
function NewDropsBanner() {
  const { days, hours, minutes, seconds, launched } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <LaunchSplitSection
      pretitle="LAUNCHING 26 APRIL 2026"
      title={<>New drops,<br /> just in</>}
      description="Curated pieces, limited time. Once they're gone,they're gone. Experience the shift in modern Indian fashion culture."
      ctaLabel="Grab the deal"
      ctaHref="/products"
      imageSrc={launchingImage}
      imageAlt="Fashion show"
    />
  );
}

// ── Sell / Buy / Repeat Polaroids ─────────────────────────────────────────────
function PolaroidSection() {
  return (
    <SellBuyRepeatSection
      leftCard={{
        heading: "BUY",
        imageSrc: built3,
        imageAlt: "Sell the old you",
        caption: "SELL THE OLD YOU",
        wrapperClassName: "w-full rotate-[-8deg] lg:rotate-[-12deg] pl-8 lg:pl-0",
        imageClassName: "block aspect-[4/5] w-full object-cover h-[218px] sm:h-[250px] md:h-[282px] lg:h-[400px] object-center",
        captionClassName:
          "geist-mono-font mt-1.5 lg:mt-3 text-center 2xl:text-2xl text-sm lg:text-xl uppercase leading-none tracking-wide text-[var(--thrifti-dark)]",
      }}
      centerCard={{
        heading: "SELL",
        imageSrc: repeat1Polaroid,
        imageAlt: "Wear the new you",
        caption: "WEAR THE NEW YOU",
        wrapperClassName: "w-full -mt-10 sm:mt-2 lg:mt-10 relative lg:static pr-8 lg:pr-0",
        imageClassName: "block aspect-[4/5] w-full object-cover h-[238px] sm:h-[270px] md:h-[302px] lg:h-[400px] object-center",
        captionClassName:
          "geist-mono-font mt-1.5 lg:mt-3 text-center uppercase leading-none tracking-wide text-[var(--thrifti-dark)] 2xl:text-2xl text-sm lg:text-xl",
      }}
      rightCard={{
        heading: "REPEAT",
        imageSrc: repeatPolaroid,
        imageAlt: "Be new you with Thrifti",
        caption: "BE NEW YOU",
        wrapperClassName: "w-full rotate-[-10deg] lg:rotate-[14deg] -mt-7 lg:mt-0 pr-8 lg:pr-0",
        imageClassName: "block aspect-[4/5] w-full object-cover h-[218px] sm:h-[250px] md:h-[282px] lg:h-[400px] object-center",
        captionClassName:
          "geist-mono-font uppercase leading-none tracking-wide text-[var(--thrifti-dark)] 2xl:text-2xl text-sm lg:text-xl",
      }}
      stickerText="WITH THRIFTI"
    />
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
      <div className="bg-[var(--thrifti-cream)] min-h-screen">

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-10 pt-4 lg:pt-8 pb-2 lg:pb-4 container mx-auto">
          {/* Category label — small red text above heading */}
          {categoryLabel && (
            <p
              className="text-[#F42824] text-3xl font-medium anek-devanagari-font underline"
            >
              {categoryLabel}
            </p>
          )}
          <h1
            className="vogue-font uppercase leading-tight text-3xl sm:text-4xl lg:text-5xl text-foreground"
          >
            {pageTitle}
          </h1>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 flex-wrap mt-3">
            <button className="flex items-center gap-1.5 mr-1 p-1" aria-label="Filter options">
              <SlidersHorizontal className="w-4 h-4 text-[var(--thrifti-dark)]" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors text-[var(--thrifti-red)] geist-mono-font"
              >
                <X className="w-4 h-4" /> Clear all
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-sm anek-devanagari-font text-foreground mt-6 ">
            {isLoading ? "Loading..." : `Results: ${totalProducts} item${totalProducts !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Product Grid ── */}
        <div className="px-4 sm:px-6 lg:px-10 lg:pb-12 pb-4 container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 mb-3 aspect-[3/4]" />
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-black uppercase mb-2 font-['Space_Grotesk',sans-serif] text-[var(--thrifti-dark)]">
                No products found
              </h2>
              <p className="text-gray-500 text-sm mb-6 font-['Space_Mono',monospace]">
                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Check back soon for new drops."}
              </p>
              <button onClick={clearAllFilters} className="thrifti-btn-dark text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4">
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
                      className={`w-9 h-9 text-sm font-bold border transition-colors font-['Space_Grotesk',sans-serif] ${p === page
                        ? "border-[var(--thrifti-dark)] bg-[var(--thrifti-dark)] text-white"
                        : "border-gray-300 bg-transparent text-gray-500"
                        }`}
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
