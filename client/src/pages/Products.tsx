import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { SlidersHorizontal, ChevronDown, Heart, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import type { ShopifyProduct } from "@shared/shopifyTypes";

const FASHION_PHOTO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/photo-sell-clean_0a7f2a46.png";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663413686037/RdJ3855myHy6XYmFtkiXgE/thrifti-logo_4dbb8d2e.svg";

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

// ── Product Card ─────────────────────────────────────────────────────────────
function ListingProductCard({ product, customerEmail }: { product: ShopifyProduct; customerEmail?: string }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useShopifyAuth();
  const [adding, setAdding] = useState(false);
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
  const image = product.images.nodes[0];
  const price = variant?.price ? `₹${Math.round(parseFloat(variant.price.amount)).toLocaleString("en-IN")}` : "";
  const compareAt = variant?.compareAtPrice ? `₹${Math.round(parseFloat(variant.compareAtPrice.amount)).toLocaleString("en-IN")}` : null;
  const tags = product.tags?.slice(0, 3).join(", ") || product.productType || "Thrifti";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant?.id) return;
    setAdding(true);
    try { await addToCart(variant.id, 1); } finally { setAdding(false); }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      <div className="group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden mb-3" style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE4" }}>
          {image ? (
            <img src={image.url} alt={image.altText ?? product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
          )}
          {compareAt && (
            <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 text-white" style={{ backgroundColor: "var(--thrifti-red)", fontFamily: "'Space Grotesk', sans-serif" }}>
              SALE
            </span>
          )}
        </div>

        {/* Info */}
        <div className="px-0.5">
          {/* Attributes + heart */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs text-gray-400 leading-snug flex-1 min-w-0 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {tags}
            </p>
            <button onClick={handleWishlist} className="flex-shrink-0 p-0.5 transition-transform hover:scale-110" aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
              <Heart className="w-4 h-4" style={{ color: wishlisted ? "var(--thrifti-red)" : "#9CA3AF", fill: wishlisted ? "var(--thrifti-red)" : "none" }} />
            </button>
          </div>

          {/* Title */}
          <p className="text-sm font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {product.title}
          </p>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>{price}</span>
            {compareAt && <span className="text-xs text-gray-400 line-through" style={{ fontFamily: "'Space Mono', monospace" }}>{compareAt}</span>}
          </div>

          {/* Add to cart — visible on hover */}
          <button
            onClick={handleAddToCart}
            disabled={adding || !variant?.id}
            className="mt-2 w-full py-2 text-xs font-black uppercase tracking-wider border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Filter Pill ───────────────────────────────────────────────────────────────
function FilterPill({ label, options, selected, onSelect }: {
  label: FilterKey; options: readonly string[]; selected: string[]; onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasSelection = selected.length > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${hasSelection ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"}`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {label}{hasSelection && <span className="ml-0.5 text-[10px]">({selected.length})</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] py-1">
            {options.map((opt) => (
              <button key={opt} onClick={() => { onSelect(opt); setOpen(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between ${selected.includes(opt) ? "font-bold text-gray-900" : "text-gray-600"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {opt}{selected.includes(opt) && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </>
      )}
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
  const ITEMS_PER_PAGE = 12;
  const BANNER_AFTER = 8;

  const { customer, isAuthenticated } = useShopifyAuth();

  const { data: productsData, isLoading } = trpc.products.list.useQuery({
    first: 50,
    query: searchQuery || undefined,
  });

  const allProducts = productsData?.products ?? [];
  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const paginatedProducts = allProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const productsBeforeBanner = paginatedProducts.slice(0, BANNER_AFTER);
  const productsAfterBanner = paginatedProducts.slice(BANNER_AFTER);

  const pageTitle = collection
    ? collection.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : searchQuery ? `"${searchQuery}"` : "All Products";
  const breadcrumb = collection ? "Collections" : "Shop";

  const toggleFilter = (key: FilterKey, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val] }));
    setPage(1);
  };
  const clearAllFilters = () => setFilters({ Brand: [], Size: [], Color: [], Condition: [], Price: [] });
  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);

  const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <StorefrontLayout>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>

        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-10 pt-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-1.5 mb-3">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Home</Link>
            <span className="text-xs text-gray-300">/</span>
            <Link href="/products" className="text-xs text-gray-400 hover:text-gray-600 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{breadcrumb}</Link>
            {(collection || searchQuery) && (
              <>
                <span className="text-xs text-gray-300">/</span>
                <span className="text-xs text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{pageTitle}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)", letterSpacing: "-0.02em" }}>
            {pageTitle}
          </h1>
        </div>

        {/* Sticky Filter Bar */}
        <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-gray-200 sticky top-[72px] z-30" style={{ backgroundColor: "var(--thrifti-cream)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 hidden sm:inline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Filter</span>
            </div>
            {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map((key) => (
              <FilterPill key={key} label={key} options={FILTER_OPTIONS[key]} selected={filters[key]} onSelect={(val) => toggleFilter(key, val)} />
            ))}
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="flex items-center gap-1 px-3 py-2 text-xs font-bold transition-colors" style={{ color: "var(--thrifti-red)", fontFamily: "'Space Grotesk', sans-serif" }}>
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: "'Space Mono', monospace" }}>
            {isLoading ? "Loading..." : `Results: ${totalProducts} item${totalProducts !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Product Grid */}
        <div className="px-4 sm:px-6 lg:px-10 py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded mb-3" style={{ aspectRatio: "3/4" }} />
                  <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>No products found</h2>
              <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "'Space Mono', monospace" }}>
                {searchQuery ? `No results for "${searchQuery}". Try a different search.` : "Check back soon for new drops."}
              </p>
              <Link href="/products" className="thrifti-btn-dark text-sm">Browse All Products</Link>
            </div>
          ) : (
            <>
              {/* First 8 products */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {productsBeforeBanner.map((product) => (
                  <ListingProductCard key={product.id} product={product} customerEmail={customer?.email} />
                ))}
              </div>

              {/* Mid-page banner */}
              {productsBeforeBanner.length >= BANNER_AFTER && (
                <div className="grid grid-cols-1 lg:grid-cols-2 mb-10 overflow-hidden">
                  <div className="flex flex-col justify-center px-8 sm:px-12 py-12 sm:py-16" style={{ backgroundColor: "var(--thrifti-red)" }}>
                    <p className="text-white/70 text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>Fresh arrivals</p>
                    <h2 className="text-white font-black leading-none mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em" }}>
                      NEW DROPS,<br />JUST IN
                    </h2>
                    <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-xs" style={{ fontFamily: "'Space Mono', monospace" }}>
                      Curated pieces from Bangalore's most stylish wardrobes. First come, first served.
                    </p>
                    <Link href="/collections" className="inline-flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-wider self-start transition-colors text-white" style={{ backgroundColor: "var(--thrifti-dark)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      CLAIM MINE
                    </Link>
                  </div>
                  <div className="relative overflow-hidden" style={{ minHeight: "280px" }}>
                    <img src={FASHION_PHOTO_URL} alt="New drops" className="w-full h-full object-cover" style={{ minHeight: "280px" }} />
                    <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
              )}

              {/* Remaining products */}
              {productsAfterBanner.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                  {productsAfterBanner.map((product) => (
                    <ListingProductCard key={product.id} product={product} customerEmail={customer?.email} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
                  <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Previous page">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => goToPage(p)} className={`w-9 h-9 text-sm font-bold border transition-colors ${p === page ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-600 hover:border-gray-900"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goToPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Next page">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="ml-3 text-xs text-gray-500" style={{ fontFamily: "'Space Mono', monospace" }}>Page {page} of {totalPages}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}
