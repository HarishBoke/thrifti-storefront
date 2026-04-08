import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ShoppingBag, Heart, Share2, Shield, Star, ChevronRight } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { formatPrice } from "@shared/shopifyTypes";
import { toast } from "sonner";

// Track recently viewed in localStorage
function trackRecentlyViewed(handle: string) {
  try {
    const stored = JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[];
    const updated = [handle, ...stored.filter((h) => h !== handle)].slice(0, 8);
    localStorage.setItem("thrifti_recently_viewed", JSON.stringify(updated));
  } catch { /* ignore */ }
}

// ── Product Card (mini, for "More from seller" / "Similar Items") ─────────────
function MiniProductCard({ product, customerEmail }: { product: { id: string; handle: string; title: string; productType?: string; vendor?: string; featuredImage?: { url: string; altText?: string | null } | null; images: { nodes: { url: string; altText?: string | null }[] }; variants: { nodes: { price: { amount: string; currencyCode: string } }[] } }; customerEmail?: string }) {
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
  const price = variant?.price ? `₹${Math.round(parseFloat(variant.price.amount)).toLocaleString("en-IN")}` : "";
  const attrLine = [product.productType, product.vendor].filter(Boolean).join(", ") || "Thrifti";

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated || !customerEmail) { window.location.href = "/login"; return; }
    if (wishlisted) {
      setWishlisted(false);
      await removeFromWishlist.mutateAsync({ customerEmail, productId: product.id });
    } else {
      setWishlisted(true);
      await addToWishlist.mutateAsync({ customerEmail, productId: product.id, productTitle: product.title, productHandle: product.handle, productImage: image?.url ?? null, productPrice: variant?.price?.amount ?? null });
    }
    utils.wishlist.list.invalidate({ customerEmail });
  };

  return (
    <Link href={`/products/${product.handle}`}>
      <div className="cursor-pointer group">
        <div className="relative overflow-hidden mb-2.5" style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE4" }}>
          {image ? (
            <img src={image.url} alt={image.altText ?? product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
          )}
        </div>
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <p className="text-xs leading-snug flex-1 min-w-0 truncate" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#9CA3AF", fontSize: "11px" }}>{attrLine}</p>
          <button onClick={handleWishlist} className="flex-shrink-0 p-0.5 -mt-0.5" aria-label="Wishlist">
            <Heart className="w-3.5 h-3.5" style={{ color: wishlisted ? "var(--thrifti-red)" : "#9CA3AF", fill: wishlisted ? "var(--thrifti-red)" : "none", strokeWidth: 1.5 }} />
          </button>
        </div>
        <p className="text-sm font-bold leading-snug mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>{product.title}</p>
        <p className="font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)", fontSize: "14px" }}>{price}</p>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { customer, isAuthenticated } = useShopifyAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const { data: product, isLoading, error } = trpc.products.byHandle.useQuery(
    { handle: handle! },
    { enabled: !!handle }
  );

  const { data: allProductsData } = trpc.products.list.useQuery({ first: 20 });
  const allProducts = allProductsData?.products ?? [];

  const { data: wishlistItems } = trpc.wishlist.list.useQuery(
    { customerEmail: customer?.email ?? "" },
    { enabled: !!customer?.email && isAuthenticated }
  );
  const addToWishlist = trpc.wishlist.add.useMutation();
  const removeFromWishlist = trpc.wishlist.remove.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (wishlistItems && product) setWishlisted(wishlistItems.some((w) => w.productId === product.id));
  }, [wishlistItems, product]);

  useEffect(() => {
    if (handle) trackRecentlyViewed(handle);
  }, [handle]);

  if (isLoading) {
    return (
      <StorefrontLayout showBanner={false}>
        <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>
          <div className="px-4 sm:px-6 lg:px-10 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
              <div className="flex gap-3">
                <div className="flex flex-col gap-2 w-16">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-16 h-16 bg-gray-200 animate-pulse" />)}
                </div>
                <div className="flex-1 bg-gray-200 animate-pulse" style={{ aspectRatio: "3/4" }} />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (error || !product) {
    return (
      <StorefrontLayout showBanner={false}>
        <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }} className="flex items-center justify-center">
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "var(--thrifti-dark)" }}>Product Not Found</h1>
            <p className="text-sm mb-6" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>This product may have been sold or removed.</p>
            <Link href="/products"><button className="thrifti-btn-dark text-sm">Browse All Products</button></Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const images = product.images.nodes;
  const currentImage = images[selectedImageIndex] ?? product.featuredImage;
  const variants = product.variants.nodes;

  const matchingVariant = variants.find((v) =>
    v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
  ) ?? variants[0];

  const activeVariantId = selectedVariantId ?? matchingVariant?.id ?? null;
  const activeVariant = variants.find((v) => v.id === activeVariantId) ?? matchingVariant;

  const price = activeVariant?.price ?? product.priceRange.minVariantPrice;
  const isAvailable = activeVariant?.availableForSale ?? product.availableForSale;

  const handleOptionSelect = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    const newVariant = variants.find((v) => v.selectedOptions.every((opt) => newOptions[opt.name] === opt.value));
    if (newVariant) setSelectedVariantId(newVariant.id);
  };

  const handleAddToCart = async () => {
    if (!activeVariantId) return;
    setAdding(true);
    try {
      await addToCart(activeVariantId, 1);
      toast.success(`${product.title} added to bag!`);
    } catch {
      toast.error("Failed to add to bag. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !customer?.email) { window.location.href = "/login"; return; }
    const image = product.featuredImage ?? product.images.nodes[0];
    if (wishlisted) {
      setWishlisted(false);
      await removeFromWishlist.mutateAsync({ customerEmail: customer.email, productId: product.id });
      toast.success("Removed from wishlist");
    } else {
      setWishlisted(true);
      await addToWishlist.mutateAsync({ customerEmail: customer.email, productId: product.id, productTitle: product.title, productHandle: product.handle, productImage: image?.url ?? null, productPrice: price?.amount ?? null });
      toast.success("Added to wishlist!");
    }
    utils.wishlist.list.invalidate({ customerEmail: customer.email });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  // Breadcrumb parts from product type
  const breadcrumbParts = [
    product.productType ? product.productType.split("/")[0] : null,
    product.productType ? product.productType.split("/")[1] : null,
    product.productType ? product.productType.split("/")[2] : null,
    product.title,
  ].filter(Boolean) as string[];

  // "More from this seller" — same vendor, different product
  const moreBySeller = allProducts.filter((p) => p.vendor === product.vendor && p.id !== product.id).slice(0, 4);
  // "Similar Items" — same productType, different product
  const similarItems = allProducts.filter((p) => p.productType === product.productType && p.id !== product.id).slice(0, 4);

  // Recently viewed
  const recentHandles = (() => {
    try { return (JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[]).filter((h) => h !== handle).slice(0, 4); } catch { return []; }
  })();
  const recentlyViewed = allProducts.filter((p) => recentHandles.includes(p.handle)).slice(0, 4);

  // Extract product attributes from tags/metafields
  const sizeTag = product.tags?.find((t) => /^\d+[wW]?$|^(XS|S|M|L|XL|XXL|XXXL|Free Size)$/i.test(t));
  const conditionTag = product.tags?.find((t) => /like new|good|fair|excellent/i.test(t));
  const locationTag = product.tags?.find((t) => /,\s*(UK|US|IN|EU)$/.test(t));
  const bustTag = product.tags?.find((t) => /^bust:/i.test(t));
  const lengthTag = product.tags?.find((t) => /^length:/i.test(t));
  const shoulderTag = product.tags?.find((t) => /^shoulder:/i.test(t));

  return (
    <StorefrontLayout showBanner={false}>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>

        {/* Breadcrumb */}
        <div className="px-4 sm:px-6 lg:px-10 pt-5 pb-3">
          <nav className="flex items-center gap-1 flex-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {["Women", ...breadcrumbParts].map((part, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span
                  className="text-xs"
                  style={{ color: i === arr.length - 1 ? "var(--thrifti-dark)" : "#9CA3AF", fontWeight: i === arr.length - 1 ? 500 : 400 }}
                >
                  {part}
                </span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </span>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">

            {/* ── Image Gallery ── */}
            <div className="flex gap-3">
              {/* Vertical thumbnail strip */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
                  {images.slice(0, 6).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className="w-[72px] h-[72px] overflow-hidden flex-shrink-0 transition-all"
                      style={{
                        border: i === selectedImageIndex ? "2px solid var(--thrifti-dark)" : "2px solid transparent",
                        backgroundColor: "#EDEAE4",
                      }}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img.url} alt={img.altText ?? `Image ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className="flex-1 overflow-hidden relative"
                style={{ aspectRatio: "3/4", backgroundColor: "#EDEAE4" }}
              >
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText ?? product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {!isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <span className="text-white font-black text-xl uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sold Out</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col">
              {/* Title */}
              <h1
                className="text-2xl sm:text-3xl font-black leading-tight mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: "var(--thrifti-dark)" }}
              >
                {product.title}
              </h1>

              {/* Price */}
              <p
                className="text-2xl font-black mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
              >
                {formatPrice(price.amount, price.currencyCode)}
              </p>

              {/* Attributes row: Size | Condition | Brand | Location */}
              <div className="grid grid-cols-4 gap-2 mb-5 pb-5 border-b border-gray-200">
                {[
                  { label: "Size", value: sizeTag ?? activeVariant?.selectedOptions?.find((o) => o.name === "Size")?.value ?? "—" },
                  { label: "Condition", value: conditionTag ?? "Like new" },
                  { label: "Brand", value: product.vendor ?? "Vintage" },
                  { label: "Location", value: locationTag ?? "India" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#9CA3AF" }}>{label}</p>
                    <p className="text-xs font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Variant options (if multiple) */}
              {product.options
                .filter((opt) => opt.values.length > 1 || opt.values[0] !== "Default Title")
                .map((option) => (
                  <div key={option.name} className="mb-4">
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#6B7280" }}>
                      {option.name}: <span className="font-normal normal-case tracking-normal">{selectedOptions[option.name] ?? option.values[0]}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected = (selectedOptions[option.name] ?? option.values[0]) === value;
                        const variantForValue = variants.find((v) => v.selectedOptions.some((o) => o.name === option.name && o.value === value));
                        const isOptionAvailable = variantForValue?.availableForSale ?? true;
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.name, value)}
                            disabled={!isOptionAvailable}
                            className="px-3 py-1.5 text-xs border transition-all"
                            style={{
                              fontFamily: "'Space Grotesk', sans-serif",
                              borderColor: isSelected ? "var(--thrifti-dark)" : "#D1D5DB",
                              backgroundColor: isSelected ? "var(--thrifti-dark)" : "transparent",
                              color: isSelected ? "#fff" : isOptionAvailable ? "var(--thrifti-dark)" : "#9CA3AF",
                              opacity: isOptionAvailable ? 1 : 0.5,
                              cursor: isOptionAvailable ? "pointer" : "not-allowed",
                              textDecoration: isOptionAvailable ? "none" : "line-through",
                            }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2 mb-4">
                {/* BUY NOW — full width, black */}
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || adding || cartLoading}
                  className="w-full py-3.5 font-black text-sm uppercase tracking-widest text-white transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--thrifti-dark)", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {adding ? "Adding..." : !isAvailable ? "Sold Out" : "BUY NOW"}
                </button>

                {/* ADD TO BAG + MAKE AN OFFER — side by side */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable || adding || cartLoading}
                    className="py-3 font-black text-xs uppercase tracking-wider border transition-colors disabled:opacity-50"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      borderColor: "var(--thrifti-dark)",
                      color: "var(--thrifti-dark)",
                      backgroundColor: "transparent",
                    }}
                  >
                    ADD TO BAG
                  </button>
                  <button
                    onClick={() => toast.info("Offer feature coming soon!")}
                    className="py-3 font-black text-xs uppercase tracking-wider border transition-colors"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      borderColor: "var(--thrifti-dark)",
                      color: "var(--thrifti-dark)",
                      backgroundColor: "transparent",
                    }}
                  >
                    MAKE AN OFFER
                  </button>
                </div>
              </div>

              {/* Buyer Protection */}
              <div className="flex items-center gap-2 py-3 border-t border-b border-gray-200 mb-5">
                <Shield className="w-4 h-4 flex-shrink-0" style={{ color: "#6B7280" }} />
                <p className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                  All purchases through Thrifti are covered by Buyer Protection.
                </p>
              </div>

              {/* Measurements */}
              {(bustTag || lengthTag || shoulderTag) && (
                <div className="mb-4">
                  <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>MEASUREMENTS</p>
                  <p className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                    {bustTag && <span className="mr-4">Bust {bustTag.replace(/^bust:/i, "").trim()}</span>}
                    {lengthTag && <span className="mr-4">Length {lengthTag.replace(/^length:/i, "").trim()}</span>}
                    {shoulderTag && <span>Shoulders {shoulderTag.replace(/^shoulder:/i, "").trim()}</span>}
                  </p>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>DESCRIPTION</p>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Seller card */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: "#D1D5DB" }}>
                    <div className="w-full h-full flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: "var(--thrifti-dark)" }}>
                      {(product.vendor ?? "T").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                      {product.vendor ?? "thrifti_seller"}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>4.9 (2,847)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleWishlist} className="p-1.5" aria-label="Wishlist">
                    <Heart className="w-4 h-4" style={{ color: wishlisted ? "var(--thrifti-red)" : "#9CA3AF", fill: wishlisted ? "var(--thrifti-red)" : "none", strokeWidth: 1.5 }} />
                  </button>
                  <button onClick={handleShare} className="p-1.5" aria-label="Share">
                    <Share2 className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                  </button>
                  <button
                    onClick={() => toast.info("Seller shop coming soon!")}
                    className="px-3 py-1.5 text-xs font-bold border"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", borderColor: "var(--thrifti-dark)", color: "var(--thrifti-dark)" }}
                  >
                    View Shop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More from this seller */}
        {moreBySeller.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10 border-t border-gray-200">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
              More from this seller
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {moreBySeller.map((p) => (
                <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />
              ))}
            </div>
          </div>
        )}

        {/* Looking for more [category] */}
        {similarItems.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10 border-t border-gray-200">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
              Looking for more {product.productType?.split("/").pop() ?? "items"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarItems.map((p) => (
                <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />
              ))}
            </div>
          </div>
        )}

        {/* Ticker Banner */}
        <AnimatedBanner />

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-10 py-10">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed.map((p) => (
                <MiniProductCard key={p.id} product={p} customerEmail={customer?.email} />
              ))}
            </div>
          </div>
        )}

      </div>
    </StorefrontLayout>
  );
}
