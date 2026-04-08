import { Link } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, Shield, ArrowLeft, Heart } from "lucide-react";
import StorefrontLayout from "@/components/StorefrontLayout";
import AnimatedBanner from "@/components/AnimatedBanner";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import { formatPrice } from "@shared/shopifyTypes";

// ── Mini product card for Recently Viewed ─────────────────────────────────────
function RecentlyViewedCard({ product }: { product: { id: string; handle: string; title: string; productType?: string; vendor?: string; featuredImage?: { url: string; altText?: string | null } | null; images: { nodes: { url: string; altText?: string | null }[] }; variants: { nodes: { price: { amount: string; currencyCode: string } }[] } } }) {
  const variant = product.variants.nodes[0];
  const image = product.featuredImage ?? product.images.nodes[0];
  const price = variant?.price ? `₹${Math.round(parseFloat(variant.price.amount)).toLocaleString("en-IN")}` : "";
  const attrLine = [product.productType, product.vendor].filter(Boolean).join(", ") || "Thrifti";

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
          <Heart className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF", strokeWidth: 1.5 }} />
        </div>
        <p className="text-sm font-bold leading-snug mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>{product.title}</p>
        <p className="font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)", fontSize: "14px" }}>{price}</p>
      </div>
    </Link>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────────────────
export default function Cart() {
  const { cart, isLoading, updateQuantity, removeFromCart, goToCheckout } = useCart();
  const { customer } = useShopifyAuth();

  const lines = cart?.lines?.nodes ?? [];
  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;
  const totalQty = cart?.totalQuantity ?? 0;

  // Group lines by vendor (seller)
  const sellerGroups: Record<string, typeof lines> = {};
  for (const line of lines) {
        // vendor is not in CartLine type — derive from product title prefix or use default
        const seller = "Thrifti Seller";
    if (!sellerGroups[seller]) sellerGroups[seller] = [];
    sellerGroups[seller].push(line);
  }
  const sellerNames = Object.keys(sellerGroups);
  const hasMultipleSellers = sellerNames.length > 1;

  // Recently viewed
  const { data: allProductsData } = trpc.products.list.useQuery({ first: 20 });
  const allProducts = allProductsData?.products ?? [];
  const recentHandles = (() => {
    try { return JSON.parse(localStorage.getItem("thrifti_recently_viewed") ?? "[]") as string[]; } catch { return []; }
  })();
  const recentlyViewed = allProducts.filter((p) => recentHandles.includes(p.handle)).slice(0, 4);

  // Estimated tax (5%)
  const totalAmount = total ? parseFloat(total.amount) : 0;
  const taxEstimate = totalAmount * 0.05;
  const shippingAmount = totalAmount > 0 ? 99 : 0;
  const grandTotal = totalAmount + shippingAmount + taxEstimate;

  return (
    <StorefrontLayout showBanner={false}>
      <div style={{ backgroundColor: "var(--thrifti-cream)", minHeight: "100vh" }}>
        <div className="px-4 sm:px-6 lg:px-10 py-8">

          {/* Page Title */}
          <h1
            className="text-3xl sm:text-4xl font-black mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
          >
            Shopping Cart
          </h1>

          {lines.length === 0 ? (
            /* ── Empty State ── */
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                Your bag is empty
              </h2>
              <p className="text-sm mb-6" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                Add some items to get started
              </p>
              <Link href="/products">
                <button className="thrifti-btn-dark text-sm">Browse Products</button>
              </Link>
            </div>
          ) : (
            /* ── Two-column layout ── */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

              {/* LEFT: Cart Items */}
              <div>
                {/* Multiple sellers notice */}
                {hasMultipleSellers && (
                  <div className="mb-5 pb-4 border-b border-gray-200">
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                      MULTIPLE SELLERS
                    </p>
                    <p className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                      Items from {sellerNames.length} different sellers. Shipping calculated separately.
                    </p>
                  </div>
                )}

                {/* Seller groups */}
                {sellerNames.map((seller, si) => (
                  <div key={seller} className={si > 0 ? "mt-8" : ""}>
                    {/* Seller header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                        style={{ backgroundColor: "var(--thrifti-dark)" }}
                      >
                        {seller.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                        {seller}
                      </p>
                      <span className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#9CA3AF" }}>
                        | {sellerGroups[seller].length} Item{sellerGroups[seller].length > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-200">
                      {sellerGroups[seller].map((line) => {
                        const img = line.merchandise.product.featuredImage;
                        const itemPrice = parseFloat(line.merchandise.price.amount) * line.quantity;
                        return (
                          <div key={line.id} className="flex gap-4 py-5 border-b border-gray-200">
                            {/* Image */}
                            <div className="w-20 h-24 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#EDEAE4" }}>
                              {img ? (
                                <img src={img.url} alt={img.altText ?? line.merchandise.product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-gray-300" /></div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm leading-snug mb-0.5 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                                    {line.merchandise.product.title}
                                  </p>
                                  {line.merchandise.title !== "Default Title" && (
                                    <p className="text-xs mb-1" style={{ fontFamily: "'Space Mono', monospace", color: "#9CA3AF" }}>
                                      {line.merchandise.title}
                                    </p>
                                  )}
                                  <p className="font-black text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                                    {formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeFromCart(line.id)}
                                  disabled={isLoading}
                                  className="p-1 flex-shrink-0 hover:text-red-500 transition-colors disabled:opacity-50"
                                  aria-label="Remove item"
                                >
                                  <Heart className="w-4 h-4" style={{ color: "#9CA3AF", strokeWidth: 1.5 }} />
                                </button>
                              </div>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-3 mt-3">
                                <div className="flex items-center border border-gray-300">
                                  <button
                                    onClick={() => updateQuantity(line.id, line.quantity - 1)}
                                    disabled={isLoading}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-bold"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    aria-label="Decrease"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span
                                    className="w-8 h-8 flex items-center justify-center text-sm font-bold border-x border-gray-300"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                  >
                                    {line.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(line.id, line.quantity + 1)}
                                    disabled={isLoading}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm font-bold"
                                    aria-label="Increase"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(line.id)}
                                  disabled={isLoading}
                                  className="p-1.5 hover:text-red-500 transition-colors disabled:opacity-50"
                                  aria-label="Delete item"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>

                              <p className="text-xs mt-2" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                                Subtotal: ₹{Math.round(itemPrice).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link href="/products">
                    <button
                      className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>

              {/* RIGHT: Order Summary */}
              <div className="lg:sticky lg:top-24">
                <div className="bg-white border border-gray-200 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                      Order Summary
                    </h2>
                    <span className="text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#6B7280" }}>
                      {totalQty} Item{totalQty !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Line items */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>Item's total</span>
                      <span className="font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                        {subtotal ? formatPrice(subtotal.amount, subtotal.currencyCode) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>Shipping</span>
                      <span className="font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                        ₹{shippingAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>Tax (estimated)</span>
                      <span className="font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                        ₹{Math.round(taxEstimate).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between">
                      <span className="font-black text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>Total</span>
                      <span className="font-black text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                        ₹{Math.round(grandTotal).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Free shipping promo */}
                  {totalAmount < 2000 && (
                    <p className="text-xs mb-4" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                      Add ₹{Math.round(2000 - totalAmount).toLocaleString("en-IN")} more for free shipping!
                    </p>
                  )}

                  {/* CHECKOUT button */}
                  <button
                    onClick={goToCheckout}
                    disabled={isLoading || lines.length === 0}
                    className="w-full py-4 font-black text-sm uppercase tracking-widest text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "var(--thrifti-dark)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {isLoading ? "Updating..." : "CHECKOUT"}
                  </button>
                </div>

                {/* Secure Escrow */}
                <div className="flex items-start gap-3 mt-4 px-1">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#6B7280" }} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--thrifti-dark)" }}>
                      SECURE ESCROW
                    </p>
                    <p className="text-xs" style={{ fontFamily: "'Space Mono', monospace", color: "#6B7280" }}>
                      Payment held securely until delivery confirmation. Seller gets paid only after you confirm receipt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
                <RecentlyViewedCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
