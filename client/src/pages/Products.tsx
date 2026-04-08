import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { SlidersHorizontal, ChevronDown, Heart, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import type { ShopifyProduct } from "@shared/shopifyTypes";

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

// ── Product Card (Figma design) ───────────────────────────────────────────────
function ListingProductCard({ product, customerEmail }: { product: ShopifyProduct; customerEmail?: string }) {
  const { isAuthenticated } = useShopifyAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

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
  const price = variant?.price ? `₹${Math.round(parseFloat(variant.price.amount)).toLocaleString("en-IN")}` : "";
  // Build attribute line: productType + first tag (size/color)
  const attrParts = [product.productType, product.vendor].filter(Boolean);
  const attrLine = attrParts.join(", ") || "Thrifti";

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      <div
        className="cursor-pointer group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card wrapper — white bg + shadow on hover */}
        <div
          className="transition-all duration-200"
          style={{
            backgroundColor: hovered ? "#ffffff" : "transparent",
            boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.10)" : "none",
            padding: hovered ? "0" : "0",
          }}
        >
          {/* Image */}
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE4" }}
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
          </div>

          {/* Info block */}
          <div className="pt-2.5 pb-2 px-1">
            {/* Attributes + heart */}
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <p
                className="text-xs leading-snug flex-1 min-w-0 truncate"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#9CA3AF", fontSize: "11px" }}
              >
                {attrLine}
              </p>
              <button
                onClick={handleWishlist}
                className="flex-shrink-0 p-0.5 transition-transform hover:scale-110 -mt-0.5"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className="w-4 h-4"
                  style={{
                    color: wishlisted ? "var(--thrifti-red)" : "#9CA3AF",
                    fill: wishlisted ? "var(--thrifti-red)" : "none",
                    strokeWidth: 1.5,
                  }}
                />
              </button>
            </div>

            {/* Title */}
            <p
              className="text-sm font-bold leading-snug mb-1 line-clamp-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
            >
              {product.title}
            </p>

            {/* Price */}
            <p
              className="font-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)", fontSize: "15px" }}
            >
              {price}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Filter Pill (Figma: rounded-full, outlined, dropdown) ─────────────────────
function FilterPill({ label, options, selected, onSelect }: {
  label: FilterKey; options: readonly string[]; selected: string[]; onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasSelection = selected.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          borderColor: hasSelection ? "var(--thrifti-dark)" : "#D1D5DB",
          backgroundColor: hasSelection ? "var(--thrifti-dark)" : "transparent",
          color: hasSelection ? "#ffffff" : "var(--thrifti-dark)",
        }}
      >
        {label}
        {hasSelection && <span className="text-[10px]">({selected.length})</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 shadow-lg min-w-[160px] py-1"
          style={{ borderRadius: "8px" }}
        >
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

// ── Recently Viewed (localStorage-based) ─────────────────────────────────────
function RecentlyViewedSection({ currentProductId, customerEmail }: { currentProductId?: string; customerEmail?: string }) {
  const [recentHandles, setRecentHandles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[];
      setRecentHandles(stored.filter((h) => h !== currentProductId).slice(0, 4));
    } catch { /* ignore */ }
  }, [currentProductId]);

  const { data: productsData } = trpc.products.list.useQuery({ first: 20 }, { enabled: recentHandles.length > 0 });
  const recentProducts = (productsData?.products ?? []).filter((p) => recentHandles.includes(p.handle)).slice(0, 4);

  if (recentProducts.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10">
      <h2
        className="text-xl font-black mb-6"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
      >
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Products() {
  const [locationPath] = useLocation();
  const [searchParams, setSearchParams] = useState(() => parseSearchParams());

  useEffect(() => { setSearchParams(parseSearchParams()); }, [locationPath]);

  const { q: searchQuery, collection } = searchParams;

  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({ Brand: [], Size: [], Color: [], Condition: [], Price: [] });
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 16;

  const { customer, isAuthenticated } = useShopifyAuth();

  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    first: 50,
    query: searchQuery || undefined,
  });

  const allProducts = productsData?.products ?? [];
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const paginatedProducts = allProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Category label (above heading) — derive from collection handle
  const categoryLabel = collection
    ? collection.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : searchQuery ? "Search" : "All";

  const pageTitle = collection
    ? collection.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : searchQuery ? `"${searchQuery}"` : "All Products";

  const toggleFilter = (key: FilterKey, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val] }));
    setPage(1);
  };
  const clearAllFilters = () => setFilters({ Brand: [], Size: [], Color: [], Condition: [], Price: [] });
  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);

  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <StorefrontLayout showBanner={false}>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>

        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-10 pt-8 pb-4">
          {/* Category label (small, above heading) */}
          {(collection || searchQuery) && (
            <p
              className="text-xs mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#9CA3AF" }}
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
          <p
            className="text-xs mt-3 mb-2"
            style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}
          >
            {isLoading ? "Loading..." : `Results: ${totalProducts} item${totalProducts !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Product Grid */}
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
          ) : allProducts.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2
                className="text-2xl font-black uppercase mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
              >
                No products found
              </h2>
              <p
                className="text-gray-500 text-sm mb-6"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Check back soon for new drops."}
              </p>
              <Link href="/products" className="thrifti-btn-dark text-sm">Browse All Products</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
                {paginatedProducts.map((product) => (
                  <ListingProductCard key={product.id} product={product} customerEmail={customer?.email} />
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

        {/* Ticker Banner */}
        <AnimatedBanner />

        {/* Recently Viewed */}
        <RecentlyViewedSection customerEmail={customer?.email} />

      </div>
    </StorefrontLayout>
  );
}
